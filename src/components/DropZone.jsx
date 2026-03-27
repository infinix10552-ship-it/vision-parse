import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion } from 'framer-motion';
import { Upload, Image, FileText, X, ScanLine, Zap } from 'lucide-react';
import { formatFileSize } from '../lib/exportUtils';

const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'application/pdf': ['.pdf'],
};

export default function DropZone({ file, onFileSelect, onClear, loading }) {
  const onDrop = useCallback(
    (accepted) => {
      if (accepted.length > 0) {
        onFileSelect(accepted[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: ACCEPTED_TYPES,
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024,
    disabled: loading,
  });

  if (file) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass"
        style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '10px',
            background: 'rgba(99,102,241,0.15)',
            border: '1px solid rgba(99,102,241,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            {file.type === 'application/pdf' ? (
              <FileText size={18} color="#6366f1" />
            ) : (
              <Image size={18} color="#6366f1" />
            )}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--text-primary)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {file.name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {formatFileSize(file.size)} · {file.type}
            </div>
          </div>
        </div>
        <button
          className="btn btn-ghost btn-icon"
          onClick={onClear}
          disabled={loading}
          aria-label="Remove file"
        >
          <X size={16} />
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <div
        {...getRootProps()}
        className={`drop-zone ${isDragActive ? 'dragging' : ''}`}
        style={{
          padding: '48px 32px',
          textAlign: 'center',
          cursor: loading ? 'not-allowed' : 'pointer',
          opacity: loading ? 0.5 : 1,
          background: isDragReject
            ? 'rgba(239,68,68,0.05)'
            : isDragActive
            ? 'rgba(99,102,241,0.08)'
            : undefined,
          borderColor: isDragReject ? 'var(--error)' : undefined,
        }}
        role="button"
        aria-label="Upload file dropzone"
        tabIndex={0}
      >
        <input {...getInputProps()} />

        <motion.div
          animate={isDragActive ? { scale: 1.08 } : { scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        >
          {/* Icon */}
          <div style={{
            width: 72,
            height: 72,
            borderRadius: '20px',
            background: isDragActive
              ? 'rgba(99,102,241,0.2)'
              : 'rgba(255,255,255,0.04)',
            border: `1px solid ${isDragActive ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.08)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            transition: 'all 0.2s',
          }}>
            {isDragActive ? (
              <ScanLine size={28} color="#6366f1" />
            ) : (
              <Upload size={28} color="var(--text-muted)" />
            )}
          </div>

          <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
            {isDragActive ? 'Drop to start OCR' : 'Drop your file here'}
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
            {isDragReject
              ? 'File type not supported'
              : 'or click to browse · JPG, PNG, WEBP, PDF up to 10MB'}
          </p>

          {/* Format chips */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' }}>
            {['JPG', 'PNG', 'WEBP', 'PDF'].map((fmt) => (
              <span
                key={fmt}
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '6px',
                  padding: '4px 10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--text-muted)',
                  letterSpacing: '0.5px',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {fmt}
              </span>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Feature chips below dropzone */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        marginTop: '16px',
        flexWrap: 'wrap',
      }}>
        {[
          { icon: <Zap size={12} />, label: 'Azure AI Vision' },
          { icon: <ScanLine size={12} />, label: 'Multi-page PDF' },
          { icon: <Image size={12} />, label: 'Handwritten Text' },
        ].map(({ icon, label }) => (
          <div key={label} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}>
            {icon}
            {label}
          </div>
        ))}
      </div>
    </motion.div>
  );
}
