import { motion } from 'framer-motion';
import { Scan, Loader2 } from 'lucide-react';

export default function ProcessingOverlay({ filename, progress }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(8,8,18,0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: 360, padding: '24px' }}>
        {/* Icon */}
        <div style={{
          width: 80,
          height: 80,
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(139,92,246,0.2) 100%)',
          border: '1px solid rgba(99,102,241,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          animation: 'glowPulse 2s ease infinite',
        }}>
          <Scan size={36} color="#6366f1" />
        </div>

        <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
          Analyzing Document
        </h3>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          {filename}
        </p>

        {/* Progress bar */}
        <div style={{
          background: 'rgba(255,255,255,0.06)',
          borderRadius: '999px',
          height: 6,
          overflow: 'hidden',
          marginBottom: '12px',
        }}>
          <motion.div
            initial={{ width: '0%' }}
            animate={{ width: progress ? `${progress}%` : '75%' }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            style={{
              height: '100%',
              borderRadius: '999px',
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
            }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <Loader2 size={14} color="var(--text-muted)" style={{ animation: 'spin 1s linear infinite' }} />
          <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            {progress ? `Uploading... ${progress}%` : 'Running OCR · Azure AI Vision'}
          </span>
        </div>

        {/* Animated dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '5px', marginTop: '20px' }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: '#6366f1',
                animation: `dotPulse 1.4s ease infinite`,
                animationDelay: `${i * 0.16}s`,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
