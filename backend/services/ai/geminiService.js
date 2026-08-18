const { GoogleGenerativeAI } = require('@google/generative-ai');

// Ensure you have GEMINI_API_KEY in .env
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || 'dummy_key_to_prevent_crash');

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
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the backend .env file.');
  }
  
  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
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
  
  try {
    const result = await model.generateContent(parts);
    return result.response.text();
  } catch (err) {
    console.error('[GeminiService] Native API Error during generateContent:', err.message);
    throw err; // bubble up to extractionService catch block
  }
}

/**
 * Sends a text-only prompt to Gemini
 * @param {string} prompt 
 * @param {boolean} jsonMode 
 * @returns {Promise<string>}
 */
async function generateContent(prompt, jsonMode = false) {
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the backend .env file.');
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const model = genAI.getGenerativeModel({ 
    model: modelName,
    generationConfig: jsonMode ? { responseMimeType: "application/json" } : {}
  });

  const result = await model.generateContent(prompt);
  return result.response.text();
}

module.exports = {
  generateContent,
  generateContentMultimodal
};
