'use client';

import { useEffect, useRef } from 'react';
import Sidebar from '@/components/Sidebar';
import MessageBubble from '@/components/MessageBubble';
import InputBar from '@/components/InputBar';
import { useChat } from '@/hooks/useChat';

const SUGGESTIONS = [
  'Summarize the key trends in my data',
  'What are the top performing categories?',
  'Generate an interactive HTML dashboard',
  'Flag any anomalies or unusual patterns',
];

export default function HomePage() {
  const {
    messages,
    isLoading,
    error,
    systemPrompt,
    setSystemPrompt,
    uploadedFile,
    setUploadedFile,
    sendMessage,
    generateReport,
    clearChat,
    stopStreaming,
  } = useChat();

  const bottomRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new content
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const isEmpty = messages.length === 0;

  return (
    <div className="app-shell">
      <Sidebar
        systemPrompt={systemPrompt}
        onSystemPromptChange={setSystemPrompt}
        uploadedFile={uploadedFile}
        onFileUploaded={setUploadedFile}
        onFileClear={() => setUploadedFile(null)}
        onNewChat={clearChat}
      />

      <div className="chat-main">
        {/* Header */}
        <div className="chat-header">
          <div>
            <div className="chat-header-title">
              {uploadedFile ? `📊 ${uploadedFile.originalName}` : 'New conversation'}
            </div>
            <div className="chat-header-sub">
              {uploadedFile
                ? `${uploadedFile.sheets[0]?.totalRows ?? 0} rows · ${uploadedFile.sheets[0]?.headers.length ?? 0} columns`
                : 'Upload a file to start analyzing your data'}
            </div>
          </div>
          {!isEmpty && (
            <button className="clear-btn" onClick={clearChat}>Clear chat</button>
          )}
        </div>

        {/* Messages or empty state */}
        {isEmpty ? (
          <div className="empty-state">
            <div className="empty-icon">⬡</div>
            <div className="empty-title"> Intelligence</div>
            <div className="empty-sub">
              Upload an Excel or CSV file in the sidebar, then ask questions or generate a full interactive report.
            </div>
            {uploadedFile && (
              <div className="suggestion-chips" style={{ marginTop: 16 }}>
                {SUGGESTIONS.map((s) => (
                  <button key={s} className="chip" onClick={() => sendMessage(s)}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="messages-container">
            {messages.map((msg) => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
            {error && (
              <div style={{ maxWidth: 780, margin: '0 auto', padding: '0 24px' }}>
                <div className="error-toast">⚠ {error}</div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Input bar */}
        <InputBar
          onSend={sendMessage}
          onGenerateReport={generateReport}
          onStop={stopStreaming}
          isLoading={isLoading}
          hasFile={!!uploadedFile}
        />
      </div>
    </div>
  );
}
