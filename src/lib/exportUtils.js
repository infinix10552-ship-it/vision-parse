import { jsPDF } from 'jspdf';

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text) {
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(text);
  } else {
    const el = document.createElement('textarea');
    el.value = text;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
  }
}

/**
 * Download a text file
 */
export function downloadTxt(text, filename = 'extracted-text.txt') {
  const blob = new Blob([text], { type: 'text/plain' });
  downloadBlob(blob, filename);
}

/**
 * Download as JSON
 */
export function downloadJson(data, filename = 'ocr-result.json') {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  downloadBlob(blob, filename);
}

/**
 * Download as Markdown
 */
export function downloadMarkdown(paragraphs, filename = 'extracted-text.md') {
  const md = paragraphs.map((p) => p.text).join('\n\n');
  const blob = new Blob([md], { type: 'text/markdown' });
  downloadBlob(blob, filename);
}

/**
 * Download as PDF using jsPDF
 */
export function downloadPdf(text, filename = 'extracted-text.pdf') {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'a4',
  });

  const margin = 50;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;
  const lineHeight = 16;
  let y = margin;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(11);
  doc.setTextColor(30, 30, 30);

  const lines = doc.splitTextToSize(text, maxWidth);

  lines.forEach((line) => {
    if (y > doc.internal.pageSize.getHeight() - margin) {
      doc.addPage();
      y = margin;
    }
    doc.text(line, margin, y);
    y += lineHeight;
  });

  doc.save(filename);
}

/**
 * Convert OCR result to Markdown format
 */
export function toMarkdown(result) {
  if (!result) return '';
  const { paragraphs } = result;
  if (!paragraphs || !paragraphs.length) return result.rawText || '';
  return paragraphs.map((p) => p.text).join('\n\n');
}

/**
 * Convert result to structured JSON export format
 */
export function toJsonExport(result, filename) {
  return {
    exportedAt: new Date().toISOString(),
    sourceFile: filename,
    pageCount: result.pageCount || 1,
    lineCount: result.lines?.length || 0,
    wordCount: (result.rawText || '').split(/\s+/).filter(Boolean).length,
    paragraphs: result.paragraphs?.map((p) => ({ text: p.text })),
    rawText: result.rawText,
  };
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Format relative time
 */
export function formatRelativeTime(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  if (diff < 60000) return 'Just now';
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return `${Math.floor(diff / 86400000)}d ago`;
}

// Internal helper
function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
