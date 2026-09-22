const { GoogleGenerativeAI } = require('@google/generative-ai');

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    const error = new Error('Gemini is not configured on the backend.');
    error.code = 'AI_CONFIGURATION_ERROR';
    error.statusCode = 503;
    throw error;
  }

  return new GoogleGenerativeAI(apiKey);
}

function getModelName() {
  const modelName = process.env.GEMINI_MODEL;
  if (!modelName) {
    const error = new Error('GEMINI_MODEL is not configured on the backend.');
    error.code = 'AI_CONFIGURATION_ERROR';
    error.statusCode = 503;
    throw error;
  }

  return modelName;
}

/**
 * Converts a multer file buffer into the format required by Gemini
 */
function fileToGenerativePart(file) {
  return {
    inlineData: {
      data: file.buffer.toString('base64'),
      mimeType: file.mimetype
    },
  };
}

/**
 * Sends a multimodal prompt to Gemini
 * @param {string} prompt 
 * @param {Array<Object>|Object} files - Multer file object or array of objects
 * @returns {Promise<string>}
 */
async function generateContentMultimodal(prompt, files) {
  const modelName = getModelName();
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ model: modelName });
  
  const parts = [prompt];
  
  // Normalize to array
  const fileArray = Array.isArray(files) ? files : (files ? [files] : []);
  
  for (const file of fileArray) {
    if (!file.buffer || !file.mimetype) {
      console.error('[GeminiService] Invalid file object provided:', {
        hasBuffer: !!file.buffer,
        mimetype: file.mimetype,
        size: file.size
      });
      throw new Error('Invalid file object provided to AI service.');
    }
    console.log(`[GeminiService] Processing file: ${file.originalname || 'unknown'} | type: ${file.mimetype} | size: ${file.size}`);
    parts.push(fileToGenerativePart(file));
  }
  
  const result = await model.generateContent(parts);
  return result.response.text();
}

/**
 * Sends a text-only prompt to Gemini
 * @param {string} prompt 
 * @param {boolean} jsonMode 
 * @returns {Promise<string>}
 */
async function generateContent(prompt, jsonMode = false) {
  const modelName = getModelName();
  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({ 
    model: modelName,
    generationConfig: jsonMode ? { responseMimeType: "application/json" } : {}
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

function getAIErrorInfo(error) {
  return {
    code: error?.code || 'AI_PROVIDER_ERROR',
    statusCode: Number(error?.statusCode || error?.status || error?.response?.status) || 502,
    message: String(error?.message || 'Gemini request failed').slice(0, 300),
    model: process.env.GEMINI_MODEL || 'unconfigured'
  };
}

module.exports = {
  generateContent,
  generateContentMultimodal,
  getAIErrorInfo
};
