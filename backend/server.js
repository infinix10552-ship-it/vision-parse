const path = require('path');
const logger = require('./src/utils/logger');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const compression = require('compression');
const config = require('./src/config');
const ocrRoutes = require('./src/routes/ocr');
const aiRoutes = require('./src/routes/ai');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();

// Security headers with CSP for production
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        imgSrc: ["'self'", 'data:', 'blob:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

// Compression for Gzip
app.use(compression());

// CORS configuration from environment
app.use(
  cors({
    origin: config.cors.allowedOrigins,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma'],
  })
);

// Morgan HTTP request logging (JSON for production, pretty for dev)
if (config.server.nodeEnv === 'production') {
  app.use(morgan('combined'));
} else {
  app.use(morgan('dev'));
}

// Rate limiting — 60 requests/minute per IP
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100, // increased slightly for production
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Too many requests. Please slow down.' },
  })
);

// Body parsing with limits
app.use(express.json({ limit: '5mb' }));

// Health probe
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    env: config.server.nodeEnv,
  });
});

// API routes
app.use('/api/ocr', ocrRoutes);
app.use('/api/ai', aiRoutes);

// SERVE FRONTEND (Production only)
// Build output is expected to be in "backend/public" or "backend/dist"
if (config.server.nodeEnv === 'production' || process.env.SERVE_FRONTEND === 'true') {
  const publicPath = path.join(__dirname, 'public');
  app.use(express.static(publicPath));
  
  // SPA fallback for all other routes
  app.get('/:path*', (req, res) => {
    // If it's an API route that reached here, it's a 404
    if (req.path.startsWith('/api/')) {
        return res.status(404).json({ success: false, error: `Route ${req.method} ${req.path} not found.` });
    }
    // Otherwise serve frontend
    res.sendFile(path.join(publicPath, 'index.html'), (err) => {
      if (err) {
        res.status(404).json({ success: false, error: 'Frontend not built. Please run build script.' });
      }
    });
  });
} else {
    // Root info for dev
    app.get('/', (req, res) => {
        res.send(`
          <body style="font-family: sans-serif; background: #080812; color: #f0f0ff; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
            <div style="text-align: center; border: 1px solid rgba(255,255,255,0.1); padding: 40px; border-radius: 20px; background: rgba(255,255,255,0.03);">
              <h1 style="margin: 0 0 10px 0;">VisionParse API</h1>
              <p style="color: #94949f;">The server is running correctly. Connect via the frontend at <a href="http://localhost:5173" style="color: #6366f1;">localhost:5173</a></p>
              <div style="margin-top: 20px; font-size: 12px; color: #5a5a6e;">Status: Live · Azure OCR Configured</div>
            </div>
          </body>
        `);
      });
}

// Global 404 handler for API routes if they didn't match earlier
app.use('/api', (req, res) => {
  res.status(404).json({ success: false, error: `API route ${req.method} ${req.originalUrl} not found.` });
});

// Global error handler
app.use(errorHandler);

const PORT = config.server.port;
app.listen(PORT, () => {
  logger.info(`🔍 VisionParse API running on port ${PORT}`);
  logger.info(`📋 Mode: ${config.server.nodeEnv}`);
});

module.exports = app;
