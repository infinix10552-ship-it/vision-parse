import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Copy, Download, Check, FileText, Code2, AlignLeft,
  ChevronDown, FileJson, FileType, File
} from 'lucide-react';
import {
  copyToClipboard,
  downloadTxt,
  downloadJson,
  downloadMarkdown,
  downloadPdf,
  toJsonExport,
} from '../lib/exportUtils';
import { enhanceText } from '../lib/api';
import toast from 'react-hot-toast';
import { Sparkles, Wand2, ListCheck } from 'lucide-react';

const TAB_RAW = 'raw';
const TAB_PARAGRAPHS = 'paragraphs';
const TAB_LINES = 'lines';

export default function ResultsPanel({ data, onTextChange, hoveredLine, onLineHover }) {
  const [activeTab, setActiveTab] = useState(TAB_PARAGRAPHS);
  const [copied, setCopied] = useState(false);
  const [editedText, setEditedText] = useState(null);
  const [exportOpen, setExportOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  const { result, filename } = data;
  const displayText = editedText !== null ? editedText : result.rawText;

  const handleAI = useCallback(async (action) => {
    setAiLoading(true);
    const toastId = toast.loading(`AI is ${action === 'clean' ? 'polishing' : action === 'summarize' ? 'summarizing' : 'formatting'}...`);
    try {
      const res = await enhanceText(displayText, action);
      if (res.success) {
        setEditedText(res.data.enhanced);
        setActiveTab(TAB_RAW);
        toast.success('Enhanced with AI!', { id: toastId });
      } else {
        toast.error(res.error || 'AI enhancement failed', { id: toastId });
      }
    } catch {
      toast.error('AI Service currently unavailable', { id: toastId });
    } finally {
      setAiLoading(false);
    }
  }, [displayText]);

  const handleCopy = useCallback(async () => {
    try {
      await copyToClipboard(displayText);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed');
    }
  }, [displayText]);

  const handleExport = useCallback((format) => {
    setExportOpen(false);
    const base = filename.replace(/\.[^.]+$/, '');
    switch (format) {
      case 'txt':
        downloadTxt(displayText, `${base}.txt`);
        toast.success('Downloaded as TXT');
        break;
      case 'pdf':
        downloadPdf(displayText, `${base}.pdf`);
        toast.success('Downloaded as PDF');
        break;
      case 'json':
        downloadJson(toJsonExport(result, filename), `${base}.json`);
        toast.success('Downloaded as JSON');
        break;
      case 'md':
        downloadMarkdown(result.paragraphs || [], `${base}.md`);
        toast.success('Downloaded as Markdown');
        break;
      default:
        break;
    }
  }, [displayText, filename, result]);

  const tabs = [
    { id: TAB_PARAGRAPHS, label: 'Paragraphs', icon: <AlignLeft size={13} /> },
    { id: TAB_LINES, label: 'Lines', icon: <FileType size={13} /> },
    { id: TAB_RAW, label: 'Raw Text', icon: <Code2 size={13} /> },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={14} color="var(--accent-primary)" />
          <span style={{ fontSize: '13px', fontWeight: 600 }}>
            {result.lines?.length || 0} lines · {(result.rawText || '').split(/\s+/).filter(Boolean).length} words
          </span>
          {result.demo && (
            <span className="badge badge-demo" style={{ fontSize: '10px' }}>Demo</span>
          )}
        </div>

        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', position: 'relative' }}>
          <button className="btn btn-ghost btn-icon" onClick={handleCopy} title="Copy to clipboard">
            {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
          </button>

          {/* Export dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => setExportOpen((v) => !v)}
              id="export-btn"
            >
              <Download size={13} />
              Export
              <ChevronDown size={12} style={{ transform: exportOpen ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
            </button>

            <AnimatePresence>
              {exportOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 8px)',
                    right: 0,
                    background: 'rgba(12,12,28,0.98)',
                    border: '1px solid var(--border)',
                    borderRadius: '12px',
                    padding: '6px',
                    minWidth: '160px',
                    zIndex: 20,
                    backdropFilter: 'blur(20px)',
                    boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
                  }}
                  onMouseLeave={() => setExportOpen(false)}
                >
                  {[
                    { format: 'txt', icon: <File size={13} />, label: 'Plain Text (.txt)' },
                    { format: 'pdf', icon: <FileText size={13} />, label: 'PDF Document (.pdf)' },
                    { format: 'json', icon: <FileJson size={13} />, label: 'JSON Data (.json)' },
                    { format: 'md', icon: <Code2 size={13} />, label: 'Markdown (.md)' },
                  ].map(({ format, icon, label }) => (
                    <button
                      key={format}
                      className="btn btn-ghost"
                      onClick={() => handleExport(format)}
                      style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        fontSize: '13px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        gap: '10px',
                      }}
                    >
                      {icon}
                      {label}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', flexShrink: 0 }}>
        <div className="tab-list">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className="tab-trigger"
              data-active={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{ display: 'flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* AI Actions bar */}
      <div style={{
        padding: '6px 14px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        gap: '8px',
        background: 'rgba(99, 102, 241, 0.03)',
        overflowX: 'auto',
        scrollbarWidth: 'none',
        flexShrink: 0,
      }}>
        <span style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          fontSize: '11px',
          color: 'var(--accent-primary)',
          fontWeight: 600,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          marginRight: '4px',
          whiteSpace: 'nowrap',
        }}>
          <Sparkles size={11} /> AI Toolset
        </span>
        {[
          { icon: <Wand2 size={12} />, label: 'Clean OCR', action: 'clean' },
          { icon: <Sparkles size={12} />, label: 'Summarize', action: 'summarize' },
          { icon: <ListCheck size={12} />, label: 'Format Bullets', action: 'bullets' },
        ].map((btn) => (
          <button
            key={btn.action}
            className="btn btn-ghost btn-sm"
            onClick={() => handleAI(btn.action)}
            disabled={aiLoading}
            style={{ fontSize: '11px', padding: '4px 8px', borderRadius: '6px', opacity: aiLoading ? 0.6 : 1 }}
          >
            {btn.icon}
            {btn.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            style={{ height: '100%', overflow: 'auto', padding: '16px' }}
          >
            {activeTab === TAB_RAW && (
              <textarea
                className="input textarea"
                value={displayText}
                onChange={(e) => {
                  setEditedText(e.target.value);
                  onTextChange?.(e.target.value);
                }}
                style={{
                  minHeight: 'calc(100% - 0px)',
                  height: '100%',
                  resize: 'none',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                }}
                placeholder="Extracted text will appear here..."
                spellCheck
              />
            )}

            {activeTab === TAB_PARAGRAPHS && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {(result.paragraphs || []).length === 0 ? (
                  <EmptyState />
                ) : (
                  result.paragraphs.map((p, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.06)',
                        borderRadius: '10px',
                        padding: '12px 16px',
                      }}
                    >
                      <div style={{
                        fontSize: '10px',
                        color: 'var(--text-muted)',
                        fontWeight: 600,
                        marginBottom: '6px',
                        fontFamily: 'var(--font-mono)',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}>
                        ¶ {idx + 1}
                      </div>
                      <p style={{
                        fontSize: '14px',
                        lineHeight: 1.75,
                        color: 'var(--text-primary)',
                      }}>
                        {p.text}
                      </p>
                    </motion.div>
                  ))
                )}
              </div>
            )}

            {activeTab === TAB_LINES && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {(result.lines || []).length === 0 ? (
                  <EmptyState />
                ) : (
                  result.lines.map((line, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.015 }}
                      onMouseEnter={() => onLineHover?.(idx)}
                      onMouseLeave={() => onLineHover?.(null)}
                      style={{
                        display: 'flex',
                        gap: '12px',
                        padding: '7px 10px',
                        borderRadius: '8px',
                        cursor: 'default',
                        transition: 'background 0.15s',
                        background: hoveredLine === idx
                          ? 'rgba(99,102,241,0.12)'
                          : 'transparent',
                        border: hoveredLine === idx
                          ? '1px solid rgba(99,102,241,0.2)'
                          : '1px solid transparent',
                      }}
                    >
                      <span style={{
                        flexShrink: 0,
                        width: 28,
                        textAlign: 'right',
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--text-muted)',
                        paddingTop: '2px',
                      }}>
                        {idx + 1}
                      </span>
                      <span style={{ fontSize: '13.5px', color: 'var(--text-primary)', lineHeight: 1.6 }}>
                        {line.text}
                      </span>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '14px' }}>
      No content to display.
    </div>
  );
}
