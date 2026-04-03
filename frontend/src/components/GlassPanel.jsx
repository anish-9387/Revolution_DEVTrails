import { useRef } from 'react';

const GlassPanel = ({ children, className = '' }) => {
  const panelRef = useRef(null);

  const handleMouseMove = (e) => {
    const panel = panelRef.current;
    if (!panel) return;

    const rect = panel.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    panel.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-5px)`;
  };

  const handleMouseLeave = () => {
    const panel = panelRef.current;
    if (!panel) return;

    panel.style.transform = `perspective(1000px) rotateX(0) rotateY(0) translateY(0)`;
    setTimeout(() => {
      if (panel) panel.style.transition = 'transform 0.3s ease, box-shadow 0.3s ease';
    }, 10);
  };

  const handleMouseEnter = () => {
    const panel = panelRef.current;
    if (!panel) return;
    panel.style.transition = 'none';
  };

  return (
    <div
      ref={panelRef}
      className={`glass-panel ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
    >
      {children}
    </div>
  );
};

export default GlassPanel;
