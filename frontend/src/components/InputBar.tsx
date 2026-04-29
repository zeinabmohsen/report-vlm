'use client';

import { useState, useRef, KeyboardEvent } from 'react';

interface InputBarProps {
  onSend: (text: string) => void;
  onGenerateReport: (text: string) => void;
  onStop: () => void;
  isLoading: boolean;
  hasFile: boolean;
}

const SUGGESTIONS = [
  'Summarize the key trends in this data',
  'What are the top 5 performing items?',
  'Generate an interactive HTML dashboard',
  'Identify any anomalies or outliers',
];

export default function InputBar({
  onSend,
  onGenerateReport,
  onStop,
  isLoading,
  hasFile,
}: InputBarProps) {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 200) + 'px';
  };

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleReport = () => {
    const trimmed = text.trim() || 'Generate a full interactive HTML report and dashboard for this data.';
    if (isLoading) return;
    onGenerateReport(trimmed);
    setText('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="input-bar-wrap">
      <div className="input-bar">
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => { setText(e.target.value); autoResize(); }}
          onKeyDown={onKeyDown}
          placeholder={
            hasFile
              ? 'Ask about your data, or click 📊 to generate a report…'
              : 'Ask anything, or upload a file to analyze data…'
          }
          rows={1}
          disabled={isLoading}
        />
        <div className="input-actions">
          {/* Report generation button */}
          <button
            className="report-gen-btn"
            onClick={handleReport}
            disabled={isLoading}
            title="Generate HTML report"
          >
            📊
          </button>
          {/* Send / Stop button */}
          {isLoading ? (
            <button className="send-btn" onClick={onStop} title="Stop generation">
              ■
            </button>
          ) : (
            <button
              className="send-btn"
              onClick={handleSend}
              disabled={!text.trim()}
              title="Send (Enter)"
            >
              ↑
            </button>
          )}
        </div>
      </div>

      <div className="input-hint">
        <span>↑ Send · Shift+Enter new line · 📊 Generate HTML report</span>
        {!hasFile && (
          <span style={{ marginLeft: 'auto', opacity: 0.6 }}>Upload a file in the sidebar</span>
        )}
      </div>

      {/* Suggestion chips — only when chat is empty */}
      {hasFile && (
        <div className="suggestion-chips" style={{ maxWidth: 780, margin: '8px auto 0' }}>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              className="chip"
              onClick={() => { setText(s); textareaRef.current?.focus(); }}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
