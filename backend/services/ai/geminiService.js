const { GoogleGenAI } = require('@google/genai');

const DEFAULT_PRIMARY_MODEL = 'gemini-3.8-flash';
const DEFAULT_FALLBACK_MODEL = 'gemini-3-flash-preview';
const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);
const RETRY_DELAYS_MS = [1000, 2000];
const MAX_ATTEMPTS = RETRY_DELAYS_MS.length + 1;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Redacts any potential API key or authorization token from error strings
 */
function sanitizeErrorMessage(rawMessage) {
  if (!rawMessage || typeof rawMessage !== 'string') return '';
  return rawMessage
    .replace(/key=[A-Za-z0-9_\-\.]{10,}/gi, 'key=[REDACTED]')
    .replace(/Bearer\s+[A-Za-z0-9_\-\.]{10,}/gi, 'Bearer [REDACTED]')
    .replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED]')
    .replace(/AQ\.[A-Za-z0-9_\-\.]{20,}/g, '[REDACTED]')
    .slice(0, 300);
}

/**
 * Normalizes model names by removing extra prefixes or whitespace
 */
function normalizeModelName(rawModel) {
  if (!rawModel) return '';
  const trimmed = String(rawModel).trim();
  if (!trimmed) return '';

  const withoutModelPrefix = trimmed.replace(/^model\s*=\s*/i, '').trim();
  const withoutModelsPrefix = withoutModelPrefix.replace(/^models\//i, '').trim();

  return withoutModelsPrefix;
}

/**
 * Returns a configured GoogleGenAI instance using GEMINI_API_KEY from the environment
 */
function getGeminiClient() {
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  if (!apiKey) {
    const error = new Error('Gemini API key is not configured on the backend. Please set GEMINI_API_KEY.');
    error.code = 'AI_MISSING_API_KEY';
    error.statusCode = 503;
    error.retryable = false;
    throw error;
  }

  return new GoogleGenAI({ apiKey });
}

function getPrimaryModelName() {
  const envModel = normalizeModelName(process.env.GEMINI_MODEL);
  return envModel || DEFAULT_PRIMARY_MODEL;
}

function getFallbackModelName() {
  const envFallback = normalizeModelName(process.env.GEMINI_FALLBACK_MODEL);
  return envFallback || DEFAULT_FALLBACK_MODEL;
}

function buildCandidateModels() {
  const primary = getPrimaryModelName();
  const fallback = getFallbackModelName();
  const candidateSet = new Set([primary, fallback, 'gemini-3-flash-preview', 'gemini-flash-latest'].filter(Boolean));
  return Array.from(candidateSet);
}

/**
 * Extracts and consolidates error details safely without leaking credentials
 */
function extractGoogleMessage(error) {
  const candidates = [];
  const sources = [
    error?.errorDetails,
    error?.response?.errorDetails,
    error?.error?.details,
    error?.details,
    error?.error?.message,
    error?.response?.data,
    error?.error,
    error?.message
  ];

  for (const src of sources) {
    if (!src) continue;
    if (typeof src === 'string') {
      candidates.push(src);
    } else if (Array.isArray(src)) {
      for (const item of src) {
        if (typeof item === 'string') candidates.push(item);
        else if (item && typeof item === 'object') {
          if (item.message) candidates.push(String(item.message));
          if (item.reason) candidates.push(String(item.reason));
          if (item.error) candidates.push(typeof item.error === 'string' ? item.error : JSON.stringify(item.error));
        }
      }
    } else if (typeof src === 'object') {
      if (src.message) candidates.push(String(src.message));
      if (src.status) candidates.push(String(src.status));
      if (src.reason) candidates.push(String(src.reason));
    }
  }

  const combined = candidates.filter(Boolean).join(' | ');
  return sanitizeErrorMessage(combined);
}

/**
 * Classifies an error into standard StudyNex categories with appropriate status code and retryability
 */
function classifyGeminiError(error) {
  if (error?.code === 'AI_MISSING_API_KEY') {
    return {
      statusCode: 503,
      code: 'AI_MISSING_API_KEY',
      message: 'Gemini API key is not configured on the backend. Please configure GEMINI_API_KEY.',
      retryable: false
    };
  }

  const rawStatus = Number(
    error?.status ??
    error?.statusCode ??
    error?.error?.code ??
    error?.response?.status ??
    0
  );

  const rawMessage = extractGoogleMessage(error);
  const statusFromText = Number((rawMessage.match(/\b(400|401|403|404|429|500|502|503|504)\b/) || [0])[1] || 0);
  const statusCode = rawStatus || statusFromText || 500;

  // 1. Authentication / Invalid API key
  const isAuthError =
    statusCode === 401 ||
    (statusCode === 400 && /(api[ _-]?key.*(invalid|not valid|expired|missing)|invalid.*api[ _-]?key|API_KEY_INVALID|ACCESS_TOKEN_TYPE_UNSUPPORTED|unauthenticated|unauthorized|invalid authentication)/i.test(rawMessage)) ||
    /(api[ _-]?key.*(invalid|not valid|expired|missing)|invalid.*api[ _-]?key|API_KEY_INVALID|ACCESS_TOKEN_TYPE_UNSUPPORTED|unauthenticated|unauthorized|invalid authentication credentials)/i.test(rawMessage);

  if (isAuthError) {
    return {
      statusCode: 401,
      code: 'AI_AUTH_ERROR',
      message: 'Gemini API authentication failed. The configured API key is invalid or unauthorized.',
      retryable: false
    };
  }

  // 2. Rate limit / Quota exceeded
  const isRateLimit =
    statusCode === 429 ||
    /RESOURCE_EXHAUSTED|quota.*exceeded|rate.*limit/i.test(rawMessage);

  if (isRateLimit) {
    return {
      statusCode: 429,
      code: 'AI_RATE_LIMIT',
      message: 'Gemini API rate limit or quota exceeded. Please try again shortly.',
      retryable: true
    };
  }

  // 3. Model not found or unsupported
  const isModelUnavailable =
    statusCode === 404 ||
    /models\/.*is not found|unsupported.*model|model.*not found/i.test(rawMessage);

  if (isModelUnavailable) {
    return {
      statusCode: 503,
      code: 'AI_MODEL_UNAVAILABLE',
      message: 'The configured Gemini model is unavailable or does not exist.',
      retryable: false
    };
  }

  // 4. Invalid input / Bad Request
  if (statusCode === 400 || statusCode === 422) {
    return {
      statusCode: 400,
      code: 'AI_INVALID_REQUEST',
      message: 'Invalid request payload or file format for AI processing.',
      retryable: false
    };
  }

  // 5. Network / Connection errors
  const isNetworkError =
    /fetch failed|ECONNREFUSED|ECONNRESET|ETIMEDOUT|ENOTFOUND|network/i.test(rawMessage);

  if (isNetworkError) {
    return {
      statusCode: 504,
      code: 'AI_NETWORK_ERROR',
      message: 'Network error connecting to Gemini API. Please check server connectivity.',
      retryable: true
    };
  }

  // 6. Transient / Upstream errors
  const isTransient = RETRYABLE_STATUS_CODES.has(statusCode) || /overloaded|temporarily unavailable/i.test(rawMessage);
  if (isTransient) {
    return {
      statusCode: 503,
      code: 'AI_TEMPORARILY_UNAVAILABLE',
      message: 'Gemini service is temporarily unavailable. Please try again.',
      retryable: true
    };
  }

  // 7. General fallback
  return {
    statusCode: statusCode >= 400 && statusCode < 600 ? statusCode : 500,
    code: error?.code || 'AI_PROCESSING_ERROR',
    message: rawMessage ? `AI processing failed: ${rawMessage.slice(0, 150)}` : 'AI processing failed. Please try again.',
    retryable: false
  };
}

/**
 * Standardizes AI error information for the API layer
 */
function getAIErrorInfo(error) {
  const classified = classifyGeminiError(error);
  return {
    code: classified.code,
    statusCode: classified.statusCode,
    message: classified.message,
    model: getPrimaryModelName(),
    retryable: classified.retryable
  };
}

/**
 * Executes a Gemini operation with retry logic for transient errors and fallback model failover
 */
async function executeWithRetry(operation) {
  const candidateModels = buildCandidateModels();
  let lastError = null;

  for (let mIdx = 0; mIdx < candidateModels.length; mIdx += 1) {
    const currentModel = candidateModels[mIdx];

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
      try {
        const client = getGeminiClient();
        return await operation(client, currentModel);
      } catch (err) {
        lastError = err;
        const info = classifyGeminiError(err);

        // If the error is non-retryable (e.g. auth failed, missing key, bad payload), fail fast
        if (!info.retryable) {
          // If model is not found and we have a fallback model, failover to fallback model
          if (info.code === 'AI_MODEL_UNAVAILABLE' && mIdx < candidateModels.length - 1) {
            console.warn(`[GeminiService] Model '${currentModel}' not found, failing over to '${candidateModels[mIdx + 1]}'`);
            break;
          }
          throw err;
        }

        // Retryable error on current attempt
        if (attempt < MAX_ATTEMPTS) {
          const waitMs = RETRY_DELAYS_MS[attempt - 1] + Math.random() * 250;
          console.warn('[GeminiService] Transient error, retrying...', {
            model: currentModel,
            attempt,
            waitMs: Math.round(waitMs),
            status: info.statusCode,
            code: info.code
          });
          await sleep(waitMs);
          continue;
        }

        // If exhausted attempts on primary model, try fallback model
        if (mIdx < candidateModels.length - 1) {
          console.warn(`[GeminiService] Primary model '${currentModel}' exhausted retries. Failing over to '${candidateModels[mIdx + 1]}'`);
          break;
        }
      }
    }
  }

  throw lastError;
}

/**
 * Converts a multer file buffer into the inlineData format required by @google/genai
 */
function fileToInlinePart(file) {
  if (!file || !file.buffer || !file.mimetype) {
    const err = new Error('Invalid file object provided to AI service.');
    err.code = 'AI_INVALID_FILE';
    err.statusCode = 400;
    throw err;
  }

  return {
    inlineData: {
      data: file.buffer.toString('base64'),
      mimeType: file.mimetype
    }
  };
}

/**
 * Sends a multimodal prompt (text + document/image files) to Gemini
 * @param {string} prompt
 * @param {Array<Object>|Object} files - Multer file object or array of objects
 * @returns {Promise<string>}
 */
async function generateContentMultimodal(prompt, files) {
  const fileArray = Array.isArray(files) ? files : (files ? [files] : []);
  const parts = [{ text: prompt }];

  for (const file of fileArray) {
    console.log(`[GeminiService] Processing file: ${file.originalname || 'unknown'} | type: ${file.mimetype} | size: ${file.size}`);
    parts.push(fileToInlinePart(file));
  }

  return await executeWithRetry(async (client, model) => {
    const response = await client.models.generateContent({
      model,
      contents: parts
    });
    return response.text || '';
  });
}

/**
 * Sends a text-only prompt to Gemini
 * @param {string} prompt
 * @param {boolean} jsonMode
 * @returns {Promise<string>}
 */
async function generateContent(prompt, jsonMode = false) {
  const config = jsonMode ? { responseMimeType: 'application/json' } : {};

  return await executeWithRetry(async (client, model) => {
    const response = await client.models.generateContent({
      model,
      contents: prompt,
      config
    });
    return response.text || '';
  });
}

module.exports = {
  generateContent,
  generateContentMultimodal,
  getAIErrorInfo,
  classifyGeminiError,
  normalizeModelName,
  sanitizeErrorMessage,
  getPrimaryModelName,
  getFallbackModelName
};
