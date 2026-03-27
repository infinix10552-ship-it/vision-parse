const axios = require('axios');
const config = require('../config');

/**
 * Azure Computer Vision OCR service
 * Uses the v3.2 Read API for maximum compatibility (supports PDF + Images)
 */
class AzureOCRService {
  constructor() {
    this.endpoint = config.azure.endpoint
      ? config.azure.endpoint.replace(/\/$/, '')
      : null;
    this.key = config.azure.key;
    this.apiVersion = 'v3.2';
  }

  isConfigured() {
    if (!this.endpoint || !this.key) return false;
    const isPlaceholder = 
      this.endpoint.includes('your-resource') || 
      this.key.includes('your-azure-vision-api-key') ||
      this.key === 'your-api-key';
    return !isPlaceholder;
  }

  /**
   * Main entry point
   */
  async extractText(fileBuffer, mimeType) {
    if (!this.isConfigured()) {
      throw new Error('Azure Vision API is not configured.');
    }

    try {
      // Step 1: Submit the document
      const operationLocation = await this.submitReadRequest(fileBuffer, mimeType);
      
      // Step 2: Poll for results
      const result = await this.pollForResult(operationLocation);
      
      // Step 3: Parse and return
      return this.parseResult(result);
    } catch (error) {
      if (error.response) {
        console.error('[Azure OCR Error]', error.response.status, error.response.data);
      }
      throw error;
    }
  }

  async submitReadRequest(fileBuffer, mimeType) {
    const url = `${this.endpoint}/vision/${this.apiVersion}/read/analyze`;
    console.log(`[Azure OCR] Submitting to: ${url} (${mimeType})`);

    const response = await axios.post(url, fileBuffer, {
      headers: {
        'Ocp-Apim-Subscription-Key': this.key,
        'Content-Type': mimeType,
      },
      timeout: 30000,
    });

    // The Read API returns a 202 status and a URL in the Operation-Location header
    const operationLocation = response.headers['operation-location'];
    if (!operationLocation) {
      throw new Error('Failed to get operation location from Azure.');
    }
    return operationLocation;
  }

  async pollForResult(operationLocation) {
    console.log(`[Azure OCR] Polling result: ${operationLocation}`);
    
    let attempts = 0;
    const maxAttempts = 30; // 30 seconds max
    
    while (attempts < maxAttempts) {
      const response = await axios.get(operationLocation, {
        headers: { 'Ocp-Apim-Subscription-Key': this.key },
      });

      const { status } = response.data;
      console.log(`[Azure OCR] Status: ${status}`);

      if (status === 'succeeded') {
        return response.data;
      }
      
      if (status === 'failed') {
        throw new Error('Azure OCR analysis failed.');
      }

      // Wait 1 second before polling again
      await new Promise((resolve) => setTimeout(resolve, 1000));
      attempts++;
    }

    throw new Error('OCR analysis timed out after 30 seconds.');
  }

  /**
   * Parse v3.2 Read API response format
   */
  parseResult(data) {
    const readResults = data?.analyzeResult?.readResults;
    if (!readResults || !readResults.length) {
      return { lines: [], paragraphs: [], words: [], rawText: '', pageCount: 0 };
    }

    const lines = [];
    const words = [];
    
    readResults.forEach((page, pageIndex) => {
      if (page.lines) {
        page.lines.forEach((line) => {
          const parsedLines = {
            text: line.text,
            boundingBox: line.boundingBox || [],
            pageIndex,
            words: (line.words || []).map(w => ({
              text: w.text,
              confidence: w.confidence || 1,
              boundingBox: w.boundingBox || []
            }))
          };
          lines.push(parsedLines);
          parsedLines.words.forEach(w => words.push(w));
        });
      }
    });

    // Heuristic: group lines into paragraphs based on spacing
    const paragraphs = this.groupLinesIntoParagraphs(lines);
    const rawText = lines.map(l => l.text).join('\n');

    return { 
      lines, 
      paragraphs, 
      words, 
      rawText, 
      pageCount: readResults.length 
    };
  }

  groupLinesIntoParagraphs(lines) {
    if (!lines.length) return [];
    const paragraphs = [];
    let currentParagraph = [lines[0]];

    for (let i = 1; i < lines.length; i++) {
      const prev = lines[i - 1];
      const curr = lines[i];
      // Vertical gap check (v3.2 bounding box is [x1,y1, x2,y2, x3,y3, x4,y4])
      const prevY = prev.boundingBox[7] || 0;
      const currY = curr.boundingBox[1] || 0;
      const gap = currY - prevY;

      if (gap > 20) {
        paragraphs.push({ text: currentParagraph.map(l => l.text).join(' '), lines: currentParagraph });
        currentParagraph = [curr];
      } else {
        currentParagraph.push(curr);
      }
    }

    if (currentParagraph.length) {
      paragraphs.push({ text: currentParagraph.map(l => l.text).join(' '), lines: currentParagraph });
    }
    return paragraphs;
  }

  getMockResult() {
    return {
      lines: [
        { text: 'Sample Invoice #INV-2024-0042', boundingBox: [50, 50, 400, 50, 400, 80, 50, 80], words: [], pageIndex: 0 },
        { text: 'Date: March 27, 2026', boundingBox: [50, 100, 300, 100, 300, 130, 50, 130], words: [], pageIndex: 0 },
        { text: 'Bill To: Acme Corporation', boundingBox: [50, 160, 350, 160, 350, 190, 50, 190], words: [], pageIndex: 0 },
        { text: 'Total Due: $4,200.00', boundingBox: [400, 420, 600, 420, 600, 455, 400, 455], words: [], pageIndex: 0 },
      ],
      paragraphs: [
        { text: 'Sample Invoice #INV-2024-0042\nDate: March 27, 2026', lines: [] },
        { text: 'Bill To: Acme Corporation\nTotal Due: $4,200.00', lines: [] },
      ],
      rawText: 'Sample Invoice #INV-2024-0042\nDate: March 27, 2026\nBill To: Acme Corporation\nTotal Due: $4,200.00',
      pageCount: 1,
      demo: true,
    };
  }
}

module.exports = new AzureOCRService();
