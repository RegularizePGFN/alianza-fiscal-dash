import React, { useLayoutEffect, useRef, useState } from 'react';

/**
 * Renderiza o template do PDF (794 × 1123 px, A4) escalado responsivamente
 * para caber 100% na largura disponível, sem cortar conteúdo em nenhum nível
 * de zoom da página.
 */
const ResponsivePdfPreview: React.FC<{ children: React.ReactNode; maxWidth?: number }> = ({
  children,
  maxWidth,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const PAGE_W = 794;
  const PAGE_H = 1123;
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const update = () => {
      const w = containerRef.current?.clientWidth || PAGE_W;
      const next = Math.min(1, w / PAGE_W);
      setScale(next);
    };
    update();
    const ro = new ResizeObserver(update);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener('resize', update);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="w-full mx-auto"
      style={{ maxWidth: `${maxWidth ?? PAGE_W}px` }}
    >
      <div style={{ width: '100%', height: `${PAGE_H * scale}px`, position: 'relative' }}>
        <div
          style={{
            width: `${PAGE_W}px`,
            height: `${PAGE_H}px`,
            transform: `scale(${scale})`,
            transformOrigin: 'top left',
            position: 'absolute',
            top: 0,
            left: 0,
            background: '#fff',
            boxShadow:
              '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)',
            borderRadius: '6px',
            overflow: 'hidden',
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default ResponsivePdfPreview;
