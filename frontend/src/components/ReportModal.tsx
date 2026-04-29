'use client';

import { useEffect } from 'react';

interface ReportModalProps {
  html: string;
  onClose: () => void;
}

export default function ReportModal({ html, onClose }: ReportModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const download = () => {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="report-modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="report-modal-toolbar">
        <span className="report-modal-title">📊 Generated Report</span>
        <div className="report-modal-actions">
          <button className="download-btn" onClick={download}>⬇ Download .html</button>
          <button className="close-modal-btn" onClick={onClose}>✕ Close</button>
        </div>
      </div>

      <div className="report-modal-iframe">
        <iframe
          srcDoc={html}
          title="Business Report"
          sandbox="allow-scripts allow-same-origin"
        />
      </div>
    </div>
  );
}
