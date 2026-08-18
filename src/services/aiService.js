import { getCurrentIdentity } from './identity';

const envUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_URL = envUrl.endsWith('/api') ? envUrl : `${envUrl.replace(/\/+$/, '')}/api`;

const getHeaders = () => {
  return {
    'x-user-id': getCurrentIdentity()
  };
};

class AIService {
  constructor() {
    this.provider = 'gemini';
  }

  /**
   * Parse an uploaded document or image via backend endpoint
   * @param {File} file 
   * @returns {Promise<Object>} Structured extraction data
   */
  async parseDocument(file) {
    const formData = new FormData();
    formData.append('documents', file);

    const res = await fetch(`${API_URL}/ai/extract`, {
      method: 'POST',
      headers: getHeaders(),
      body: formData
    });
    
    if (!res.ok) {
      throw new Error('Failed to parse document');
    }
    return res.json();
  }

  /**
   * Process a natural language command and decide on a structured action
   * @param {string} command Text command
   * @param {Object} context Current StudyNex context
   * @returns {Promise<Object>} Output message and proposed structured action
   */
  async processCommand(command, context) {
    const res = await fetch(`${API_URL}/ai/command`, {
      method: 'POST',
      headers: { ...getHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ command, context })
    });

    if (!res.ok) {
      throw new Error('Failed to process command');
    }
    return res.json();
  }
}

export const ai = new AIService();
