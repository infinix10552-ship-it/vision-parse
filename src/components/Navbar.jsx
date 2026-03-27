import { motion } from 'framer-motion';
import { Scan, Zap, ChevronRight } from 'lucide-react';

export default function Navbar({ onHistory }) {
  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        background: 'rgba(8, 8, 18, 0.7)',
      }}
    >
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 24px',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: 36,
            height: 36,
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(99,102,241,0.4)',
          }}>
            <Scan size={18} color="white" />
          </div>
          <span style={{ fontWeight: 800, fontSize: '18px', letterSpacing: '-0.3px' }}>
            Vision<span className="gradient-text">Parse</span>
          </span>
        </div>

        {/* Center badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="badge badge-info hide-mobile">
            <Zap size={10} />
            Azure AI Vision
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onHistory}
            aria-label="View processing history"
          >
            History
          </button>
          <a
            href="https://docs.microsoft.com/en-us/azure/cognitive-services/computer-vision/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-ghost btn-sm hide-mobile"
            style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
          >
            Docs <ChevronRight size={12} />
          </a>
        </div>
      </div>
    </motion.header>
  );
}
