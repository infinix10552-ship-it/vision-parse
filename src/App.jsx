import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, RefreshCw, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { Toaster } from 'react-hot-toast';

import Navbar from './components/Navbar';
import DropZone from './components/DropZone';
import ImagePreview from './components/ImagePreview';
import ResultsPanel from './components/ResultsPanel';
import ProcessingOverlay from './components/ProcessingOverlay';
import HistoryPanel from './components/HistoryPanel';
import { extractText, getStatus } from './lib/api';
import { useEffect } from 'react';

// Status badge shown in the hero
function StatusBadge({ mode }) {
  if (!mode) return null;
  if (mode === 'live') {
    return <span className="badge badge-success">🔴 Live · Azure AI Vision</span>;
  }
  return <span className="badge badge-demo">🟡 Demo Mode · Configure Azure keys</span>;
}

// Stat chip
function StatChip({ label, value }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '2px',
      padding: '12px 20px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: '12px',
    }}>
      <span style={{ fontSize: '22px', fontWeight: 800, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        {value}
      </span>
      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </span>
    </div>
  );
}

export default function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState(null); // { data }
  const [hoveredLine, setHoveredLine] = useState(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [apiMode, setApiMode] = useState(null);

  useEffect(() => {
    getStatus().then((res) => setApiMode(res.data?.mode)).catch(() => {});
  }, []);

  const handleFileSelect = useCallback((selected) => {
    setFile(selected);
    setResult(null);
  }, []);

  const handleClear = useCallback(() => {
    setFile(null);
    setResult(null);
    setUploadProgress(0);
  }, []);

  const handleExtract = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setUploadProgress(0);
    try {
      const res = await extractText(file, setUploadProgress);
      if (res.success) {
        setResult(res.data);
        toast.success('Text extracted successfully!', { icon: '✨' });
      } else {
        toast.error(res.error || 'Extraction failed');
      }
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        (err?.code === 'ECONNREFUSED' ? 'Backend server is not running. Start it with: npm run dev in /backend' : err.message) ||
        'Failed to contact server';
      toast.error(msg, { duration: 5000 });
    } finally {
      setLoading(false);
    }
  }, [file]);

  const hasResult = !!result;

  return (
    <div className="mesh-bg noise" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15,15,30,0.95)',
            color: '#f0f0ff',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            fontSize: '14px',
          },
        }}
      />

      <Navbar onHistory={() => setHistoryOpen(true)} />

      <HistoryPanel open={historyOpen} onClose={() => setHistoryOpen(false)} />

      <AnimatePresence>{loading && <ProcessingOverlay filename={file?.name} progress={uploadProgress} />}</AnimatePresence>

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Hero section (shown before result) */}
        <AnimatePresence mode="wait">
          {!hasResult ? (
            <motion.section
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px 24px',
              }}
            >
              <div style={{ width: '100%', maxWidth: '680px' }}>
                {/* Headline */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  style={{ textAlign: 'center', marginBottom: '40px' }}
                >
                  {/* Status */}
                  <div style={{ marginBottom: '16px' }}>
                    <StatusBadge mode={apiMode} />
                  </div>

                  <h1 style={{
                    fontSize: 'clamp(32px, 5vw, 56px)',
                    fontWeight: 900,
                    lineHeight: 1.1,
                    letterSpacing: '-1.5px',
                    marginBottom: '16px',
                  }}>
                    Extract text from{' '}
                    <span className="gradient-text">any document</span>
                  </h1>

                  <p style={{
                    fontSize: '17px',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.65,
                    maxWidth: '480px',
                    margin: '0 auto 32px',
                  }}>
                    Upload images or PDFs and get structured, editable text instantly using Azure AI Vision OCR.
                  </p>

                  {/* Stats */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginBottom: '40px' }}>
                    <StatChip label="Accuracy" value="99%" />
                    <StatChip label="Languages" value="50+" />
                    <StatChip label="Speed" value="<3s" />
                  </div>
                </motion.div>

                {/* Upload card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="glass"
                  style={{ padding: '24px', marginBottom: '16px' }}
                >
                  <DropZone
                    file={file}
                    onFileSelect={handleFileSelect}
                    onClear={handleClear}
                    loading={loading}
                  />
                </motion.div>

                {/* Extract button */}
                <AnimatePresence>
                  {file && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      style={{ display: 'flex', gap: '10px' }}
                    >
                      <button
                        className="btn btn-primary btn-lg"
                        style={{ flex: 1 }}
                        onClick={handleExtract}
                        disabled={loading}
                        id="extract-btn"
                      >
                        <ScanLine size={18} />
                        Extract Text
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.section>
          ) : (
            /* Results view */
            <motion.section
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '16px 24px 24px', maxWidth: '1600px', width: '100%', margin: '0 auto' }}
            >
              {/* Results toolbar */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '16px',
                flexWrap: 'wrap',
                gap: '10px',
              }}>
                <button className="btn btn-ghost btn-sm" onClick={handleClear} style={{ color: 'var(--text-secondary)' }}>
                  <ArrowLeft size={14} />
                  New document
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {result.demo && (
                    <span className="badge badge-demo">Demo mode</span>
                  )}
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={handleExtract}
                    disabled={loading}
                  >
                    <RefreshCw size={13} />
                    Re-analyze
                  </button>
                </div>
              </div>

              {/* Split-screen layout */}
              <div style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: 'minmax(300px, 1fr) minmax(340px, 1fr)',
                gap: '16px',
                minHeight: 0,
              }}>
                {/* Left: Image preview */}
                <div
                  className="glass"
                  style={{ overflow: 'hidden', minHeight: '500px', display: 'flex', flexDirection: 'column' }}
                >
                  <ImagePreview
                    file={file}
                    lines={result.result?.lines || []}
                    hoveredLine={hoveredLine}
                    onLineHover={setHoveredLine}
                  />
                </div>

                {/* Right: Results panel */}
                <div
                  className="glass"
                  style={{ overflow: 'hidden', minHeight: '500px', display: 'flex', flexDirection: 'column' }}
                >
                  <ResultsPanel
                    data={result}
                    hoveredLine={hoveredLine}
                    onLineHover={setHoveredLine}
                  />
                </div>
              </div>

              {/* Summary bar */}
              <div style={{
                marginTop: '16px',
                display: 'flex',
                gap: '16px',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}>
                {[
                  { label: 'Lines', value: result.result?.lines?.length || 0 },
                  { label: 'Paragraphs', value: result.result?.paragraphs?.length || 0 },
                  { label: 'Words', value: (result.result?.rawText || '').split(/\s+/).filter(Boolean).length },
                  { label: 'Pages', value: result.result?.pageCount || 1 },
                ].map((s) => (
                  <div key={s.label} style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', gap: '5px' }}>
                    <span style={{ fontWeight: 700, color: 'var(--accent-primary)' }}>{s.value}</span>
                    {s.label}
                  </div>
                ))}
                <span style={{ marginLeft: 'auto', fontSize: '12px', color: 'var(--text-muted)' }}>
                  Processed {new Date(result.processedAt).toLocaleString()}
                </span>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
