import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
});

/**
 * Upload a file for OCR processing
 * @param {File} file
 * @param {Function} onProgress
 * @returns {Promise<Object>} result data
 */
export async function extractText(file, onProgress) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/ocr/extract', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    },
  });

  return response.data;
}

/**
 * Get processing history
 */
export async function getHistory() {
  const response = await api.get('/ocr/history');
  return response.data;
}

/**
 * Clear history
 */
export async function clearHistory() {
  const response = await api.delete('/ocr/history');
  return response.data;
}

/**
 * Enhance text using AI (summarize/clean/bullets)
 */
export async function enhanceText(text, action) {
  const response = await api.post('/ai/enhance', { text, action });
  return response.data;
}

/**
 * Check API status and mode
 */
export async function getStatus() {
  const response = await api.get('/ocr/status');
  return response.data;
}

export default api;
