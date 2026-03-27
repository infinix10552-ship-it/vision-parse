import { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize2, Eye, EyeOff } from 'lucide-react';

/**
 * ImagePreview — shows the uploaded image with hover-based bounding box overlays.
 * Lines with bounding polygons are rendered as SVG rectangles.
 */
export default function ImagePreview({ file, lines = [], hoveredLine, onLineHover }) {
  const [scale, setScale] = useState(1);
  const [showBoxes, setShowBoxes] = useState(true);
  const [imageDims, setImageDims] = useState({ w: 1, h: 1 });
  const [containerDims, setContainerDims] = useState({ w: 1, h: 1 });
  const imgRef = useRef(null);
  const containerRef = useRef(null);
  const [objectUrl, setObjectUrl] = useState(null);

  useEffect(() => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const handleImageLoad = useCallback(() => {
    if (imgRef.current) {
      setImageDims({ w: imgRef.current.naturalWidth, h: imgRef.current.naturalHeight });
    }
    if (containerRef.current) {
      setContainerDims({ w: containerRef.current.clientWidth, h: containerRef.current.clientHeight });
    }
  }, []);

  useEffect(() => {
    const obs = new ResizeObserver(() => {
      if (containerRef.current) {
        setContainerDims({ w: containerRef.current.clientWidth, h: containerRef.current.clientHeight });
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  if (!file || file.type === 'application/pdf') {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        minHeight: 320,
        color: 'var(--text-muted)',
        fontSize: '14px',
        flexDirection: 'column',
        gap: '8px',
      }}>
        <div style={{ fontSize: '48px' }}>📄</div>
        <span>PDF Preview not supported</span>
        <span style={{ fontSize: '12px' }}>Text extraction still works</span>
      </div>
    );
  }

  // Map OCR polygon coordinates to rendered image pixels
  const scaleX = containerDims.w / imageDims.w;
  const scaleY =
    containerDims.h > 0
      ? Math.min(scaleX, containerDims.h / imageDims.h)
      : scaleX;

  const renderedW = imageDims.w * scaleX;
  const renderedH = imageDims.h * scaleX;
  const offsetX = (containerDims.w - renderedW) / 2;
  const offsetY = Math.max((containerDims.h - renderedH) / 2, 0);

  const polygonToRect = (poly) => {
    if (!poly || poly.length < 8) return null;
    // poly is [x0,y0, x1,y1, x2,y2, x3,y3]
    const xs = [poly[0], poly[2], poly[4], poly[6]];
    const ys = [poly[1], poly[3], poly[5], poly[7]];
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const maxX = Math.max(...xs);
    const maxY = Math.max(...ys);
    return {
      x: offsetX + minX * scaleX,
      y: offsetY + minY * scaleX,
      w: (maxX - minX) * scaleX,
      h: (maxY - minY) * scaleX,
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 14px',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          Preview · {imageDims.w > 1 ? `${imageDims.w}×${imageDims.h}` : '—'}
        </span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setShowBoxes((v) => !v)}
            title={showBoxes ? 'Hide text regions' : 'Show text regions'}
          >
            {showBoxes ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button className="btn btn-ghost btn-icon" onClick={() => setScale((s) => Math.min(s + 0.25, 3))} title="Zoom in">
            <ZoomIn size={14} />
          </button>
          <button className="btn btn-ghost btn-icon" onClick={() => setScale((s) => Math.max(s - 0.25, 0.5))} title="Zoom out">
            <ZoomOut size={14} />
          </button>
          <button className="btn btn-ghost btn-icon" onClick={() => setScale(1)} title="Reset zoom">
            <Maximize2 size={14} />
          </button>
        </div>
      </div>

      {/* Image container */}
      <div
        ref={containerRef}
        style={{
          flex: 1,
          overflow: 'auto',
          position: 'relative',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'center',
        }}
      >
        <div style={{
          position: 'relative',
          display: 'inline-block',
          transform: `scale(${scale})`,
          transformOrigin: 'top center',
          transition: 'transform 0.2s',
          width: '100%',
        }}>
          {objectUrl && (
            <img
              ref={imgRef}
              src={objectUrl}
              alt="Uploaded document"
              onLoad={handleImageLoad}
              style={{
                width: '100%',
                height: 'auto',
                display: 'block',
                userSelect: 'none',
              }}
              draggable={false}
            />
          )}

          {/* Bounding box SVG overlay */}
          {showBoxes && imageDims.w > 1 && (
            <svg
              style={{
                position: 'absolute',
                top: 0,
                left: offsetX,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
              viewBox={`0 0 ${imageDims.w} ${imageDims.h}`}
              preserveAspectRatio="xMidYMid meet"
            >
              {lines.map((line, idx) => {
                const poly = line.boundingBox;
                if (!poly || poly.length < 8) return null;
                const xs = [poly[0], poly[2], poly[4], poly[6]];
                const ys = [poly[1], poly[3], poly[5], poly[7]];
                const minX = Math.min(...xs);
                const minY = Math.min(...ys);
                const maxX = Math.max(...xs);
                const maxY = Math.max(...ys);
                const isHovered = hoveredLine === idx;
                return (
                  <rect
                    key={idx}
                    x={minX}
                    y={minY}
                    width={maxX - minX}
                    height={maxY - minY}
                    fill={isHovered ? 'rgba(99,102,241,0.25)' : 'rgba(99,102,241,0.08)'}
                    stroke={isHovered ? '#6366f1' : 'rgba(99,102,241,0.4)'}
                    strokeWidth={isHovered ? 1.5 : 1}
                    rx={2}
                    style={{ transition: 'all 0.15s', pointerEvents: 'none' }}
                  />
                );
              })}
            </svg>
          )}
        </div>
      </div>
    </div>
  );
}
