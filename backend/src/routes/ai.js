const express = require('express');
const router = express.Router();

/**
 * POST /api/ocr/enhance
 * Uses a mock AI prompt to 'clean' or 'summarize' text
 * In a real app, this would call OpenAI/Anthropic
 */
router.post('/enhance', async (req, res, next) => {
  try {
    const { text, action } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, error: 'No text provided.' });
    }

    console.log(`[AI] Enhancing text with action: ${action}`);
    await new Promise((r) => setTimeout(r, 1200)); // Simulate AI latency

    let enhanced = text;

    switch (action) {
      case 'clean':
        // Mock cleaning: fix line breaks, remove OCR noise like | or _
        enhanced = text
          .replace(/[|]/g, 'I')
          .replace(/[_]{2,}/g, '')
          .replace(/\s{2,}/g, ' ')
          .trim();
        break;
      case 'summarize':
        enhanced = `### Summary\n\nThis document appears to be a ${text.toLowerCase().includes('invoice') ? 'financial invoice' : 'business document'} containing ${text.split(/\s+/).length} words. Primary entities detected: ${text.split(/\s+/).slice(0, 5).join(', ')}...`;
        break;
      case 'bullets':
        enhanced = text
          .split('\n')
          .filter((l) => l.trim().length > 10)
          .map((l) => `• ${l.trim()}`)
          .join('\n');
        break;
      default:
        break;
    }

    return res.json({
      success: true,
      data: { enhanced },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
