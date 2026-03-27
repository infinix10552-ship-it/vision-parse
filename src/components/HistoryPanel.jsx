import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, History, FileText, Image, Trash2, Clock } from 'lucide-react';
import { getHistory, clearHistory } from '../lib/api';
import { formatFileSize, formatRelativeTime } from '../lib/exportUtils';
import toast from 'react-hot-toast';

export default function HistoryPanel({ open, onClose }) {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getHistory();
      setHistory(res.data || []);
    } catch {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) load();
  }, [open, load]);

  const handleClear = async () => {
    try {
      await clearHistory();
      setHistory([]);
      toast.success('History cleared');
    } catch {
      toast.error('Failed to clear history');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(4px)',
              zIndex: 100,
            }}
          />

          {/* Panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 380,
              maxWidth: '95vw',
              background: 'rgba(10,10,22,0.98)',
              border: '1px solid var(--border)',
              borderRight: 'none',
              zIndex: 101,
              display: 'flex',
              flexDirection: 'column',
              backdropFilter: 'blur(24px)',
              boxShadow: '-4px 0 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '20px 20px 16px',
              borderBottom: '1px solid var(--border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <History size={18} color="var(--accent-primary)" />
                <span style={{ fontWeight: 700, fontSize: '16px' }}>Processing History</span>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {history.length > 0 && (
                  <button className="btn btn-danger btn-sm" onClick={handleClear}>
                    <Trash2 size={13} />
                    Clear
                  </button>
                )}
                <button className="btn btn-ghost btn-icon" onClick={onClose} aria-label="Close history">
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div style={{ flex: 1, overflow: 'auto', padding: '12px' }}>
              {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '8px' }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton" style={{ height: 72, borderRadius: '12px' }} />
                  ))}
                </div>
              ) : history.length === 0 ? (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '60%',
                  gap: '12px',
                  color: 'var(--text-muted)',
                }}>
                  <Clock size={32} />
                  <span style={{ fontSize: '14px' }}>No files processed yet</span>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {history.map((entry, idx) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      className="glass glass-hover"
                      style={{ padding: '12px 14px' }}
                    >
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                        <div style={{
                          width: 36,
                          height: 36,
                          borderRadius: '9px',
                          background: 'rgba(99,102,241,0.12)',
                          border: '1px solid rgba(99,102,241,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          {entry.mimeType === 'application/pdf' ? (
                            <FileText size={15} color="#6366f1" />
                          ) : (
                            <Image size={15} color="#6366f1" />
                          )}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '13px',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            marginBottom: '4px',
                          }}>
                            {entry.filename}
                          </div>
                          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <Stat label="Lines" value={entry.resultSummary?.lineCount} />
                            <Stat label="Words" value={entry.resultSummary?.wordCount} />
                            <Stat label="Pages" value={entry.resultSummary?.pageCount} />
                          </div>
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0, marginTop: '2px' }}>
                          {formatRelativeTime(entry.timestamp)}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

function Stat({ label, value }) {
  return (
    <span style={{
      fontSize: '11px',
      color: 'var(--text-muted)',
      display: 'flex',
      gap: '3px',
    }}>
      <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>{value ?? 0}</span>
      {label}
    </span>
  );
}
