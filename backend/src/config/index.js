require('dotenv').config();

const config = {
  azure: {
    endpoint: process.env.AZURE_VISION_ENDPOINT,
    key: process.env.AZURE_VISION_KEY,
  },
  server: {
    port: parseInt(process.env.PORT || '3001', 10),
    nodeEnv: process.env.NODE_ENV || 'development',
  },
  cors: {
    allowedOrigins: (process.env.ALLOWED_ORIGINS || 'http://localhost:5173').split(','),
  },
};

const logger = require('../utils/logger');

function validateConfig() {
  const missing = [];
  if (!config.azure.endpoint) missing.push('AZURE_VISION_ENDPOINT');
  if (!config.azure.key) missing.push('AZURE_VISION_KEY');
  
  if (missing.length > 0) {
    logger.warn(`[Config] Missing environment variables: ${missing.join(', ')}. Azure OCR will not function.`);
  }
}

validateConfig();

module.exports = config;
