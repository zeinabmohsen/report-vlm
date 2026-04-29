'use client';

import { useRef, useState, useEffect, DragEvent } from 'react';
import { uploadFile, deleteFile, checkHealth } from '@/lib/api';
import type { UploadedFile } from '@/types';
import ThemeToggle from './ThemeToggle';

interface SidebarProps {
  systemPrompt: string;
  onSystemPromptChange: (v: string) => void;
  uploadedFile: UploadedFile | null;
  onFileUploaded: (f: UploadedFile) => void;
  onFileClear: () => void;
  onNewChat: () => void;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function Sidebar({
  systemPrompt, onSystemPromptChange,
  uploadedFile, onFileUploaded, onFileClear,
  onNewChat,
}: SidebarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [health, setHealth] = useState<'loading' | 'ok' | 'error'>('loading');
  const [modelName, setModelName] = useState('');

  useEffect(() => {
    checkHealth()
      .then((h) => { setHealth('ok'); setModelName(h.model); })
      .catch(() => setHealth('error'));
  }, []);

  useEffect(() => {
    // poll health every 8 seconds
    let mounted = true;
    const doCheck = () => {
      checkHealth()
        .then((h) => { if (mounted) { setHealth('ok'); setModelName(h.model); } })
        .catch(() => { if (mounted) setHealth('error'); });
    };
    doCheck();
    const id = setInterval(doCheck, 8000);
    return () => { mounted = false; clearInterval(id); };
  }, []);

  const handleFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    setUploadError('');
    setUploading(true);
    try {
      if (uploadedFile) await deleteFile(uploadedFile.fileId).catch(() => {});
      const result = await uploadFile(file);
      onFileUploaded(result);
    } catch (e) {
      setUploadError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleClear = async () => {
    if (uploadedFile) await deleteFile(uploadedFile.fileId).catch(() => {});
    onFileClear();
  };

  return (
    <aside className="sidebar">
      {/* Logo + New chat */}
      <div className="sidebar-header">
        <div className="logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div className="logo-mark">⬡</div>
            <div className={`health-dot ${health === 'ok' ? 'ok' : health === 'error' ? 'error' : ''}`} style={{ width: 10, height: 10, borderRadius: 6 }} />
          </div>
          <span className="logo-text"> Intelligence</span>
          <ThemeToggle />
        </div>
        <button className="new-chat-btn" onClick={onNewChat}>
          <span>✦</span> New conversation
        </button>
      </div>

      {/* Scrollable content */}
      <div className="sidebar-section">
        {/* System prompt */}
        <div className="sidebar-label">System prompt</div>
        <textarea
          className="system-prompt-area"
          value={systemPrompt}
          onChange={(e) => onSystemPromptChange(e.target.value)}
          rows={4}
          placeholder="Define the AI's behavior…"
        />

        {/* File upload */}
        <div className="sidebar-label" style={{ marginTop: 8 }}>Data file</div>

        {!uploadedFile ? (
          <>
            <div
              className={`upload-zone${dragging ? ' drag-over' : ''}`}
              onDrop={onDrop}
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="upload-zone-icon">
                {uploading ? '⟳' : '⬆'}
              </div>
              <div>{uploading ? 'Uploading…' : 'Drop .xlsx / .csv'}</div>
              <div style={{ fontSize: 11, marginTop: 3, opacity: 0.7 }}>or click to browse</div>
            </div>
            {uploadError && (
              <div style={{ fontSize: 11, color: '#f87171', padding: '4px 4px 0' }}>
                {uploadError}
              </div>
            )}
          </>
        ) : (
          <div className="file-pill">
            <div className="file-pill-icon">📊</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="file-pill-name">{uploadedFile.originalName}</div>
              <div className="file-pill-meta">
                {formatBytes(uploadedFile.size)} · {uploadedFile.sheets[0]?.totalRows ?? 0} rows
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-3)', marginTop: 3 }}>
                {uploadedFile.sheets.map((s) => s.sheetName).join(', ')}
              </div>
            </div>
            <button className="file-pill-remove" onClick={handleClear} title="Remove file">✕</button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls,.csv,.tsv"
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {/* Health */}
      <div className="health-badge">
        <div className={`health-dot ${health === 'ok' ? 'ok' : health === 'error' ? 'error' : ''}`} />
        <span style={{ fontSize: 11 }}>
          {health === 'loading' && 'Connecting…'}
          {health === 'ok' && modelName}
          {health === 'error' && 'Backend unreachable'}
        </span>
      </div>
    </aside>
  );
}
