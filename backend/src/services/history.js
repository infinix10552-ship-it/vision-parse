const { v4: uuidv4 } = require('uuid');

// In-memory session store — replace with Redis/DB in production
const sessions = new Map();

class HistoryService {
  addEntry(entry) {
    const id = uuidv4();
    const record = {
      id,
      filename: entry.filename,
      mimeType: entry.mimeType,
      fileSize: entry.fileSize,
      timestamp: new Date().toISOString(),
      resultSummary: {
        lineCount: entry.result?.lines?.length || 0,
        wordCount: (entry.result?.rawText || '').split(/\s+/).filter(Boolean).length,
        pageCount: entry.result?.pageCount || 1,
      },
    };
    sessions.set(id, record);

    // Keep only the last 50 entries
    if (sessions.size > 50) {
      const firstKey = sessions.keys().next().value;
      sessions.delete(firstKey);
    }

    return record;
  }

  getHistory() {
    return Array.from(sessions.values()).reverse();
  }

  clearHistory() {
    sessions.clear();
  }
}

module.exports = new HistoryService();
