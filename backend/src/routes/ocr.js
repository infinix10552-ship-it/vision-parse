const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/upload');
const ocrService = require('../services/azureOCR');
const historyService = require('../services/history');

/**
 * POST /api/ocr/extract
 * Accepts multipart file upload, runs OCR, returns structured result
 */
router.post('/extract', upload.single('file'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded.' });
    }

    const { originalname, mimetype, size, buffer } = req.file;

    let result;

    if (ocrService.isConfigured()) {
      result = await ocrService.extractText(buffer, mimetype);
    } else {
      // Demo mode — return mock data so the UI is fully functional without Azure keys
      console.log('[OCR] Running in DEMO mode (Azure not configured).');
      await new Promise((r) => setTimeout(r, 800)); // Simulate latency
      result = ocrService.getMockResult();
    }

    // Log to history
    const historyEntry = historyService.addEntry({
      filename: originalname,
      mimeType: mimetype,
      fileSize: size,
      result,
    });

    return res.json({
      success: true,
      data: {
        id: historyEntry.id,
        filename: originalname,
        mimeType: mimetype,
        fileSize: size,
        result,
        processedAt: historyEntry.timestamp,
        demo: result.demo || false,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/ocr/history
 * Returns list of recently processed files
 */
router.get('/history', (req, res) => {
  const history = historyService.getHistory();
  res.json({ success: true, data: history });
});

/**
 * DELETE /api/ocr/history
 * Clears the history
 */
router.delete('/history', (req, res) => {
  historyService.clearHistory();
  res.json({ success: true, message: 'History cleared.' });
});

/**
 * GET /api/ocr/status
 * Health check + config status
 */
router.get('/status', (req, res) => {
  res.json({
    success: true,
    data: {
      configured: ocrService.isConfigured(),
      mode: ocrService.isConfigured() ? 'live' : 'demo',
    },
  });
});

module.exports = router;
