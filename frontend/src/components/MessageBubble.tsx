'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ChatMessage } from '@/types';
import ReportModal from './ReportModal';

interface MessageBubbleProps {
  message: ChatMessage;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const [showReport, setShowReport] = useState(false);
  const isUser = message.role === 'user';

  return (
    <>
      <div className={`message-wrapper ${message.role}`}>
        <div className="message-inner">
          {/* Avatar */}
          <div className={`avatar ${message.role}`}>
            {isUser ? '👤' : '⬡'}
          </div>

          {/* Body */}
          <div className="message-body">
            <div className="message-role">
              {isUser ? 'You' : 'Qwen AI'}
            </div>

            <div className="message-content">
              {message.isStreaming && !message.content ? (
                <span className="cursor" />
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              )}
              {message.isStreaming && message.content && (
                <span className="cursor" />
              )}
            </div>

            {/* Report action */}
            {message.isReport && message.reportHtml && (
              <button className="report-btn" onClick={() => setShowReport(true)}>
                📊 View Report
              </button>
            )}
          </div>
        </div>
      </div>

      {showReport && message.reportHtml && (
        <ReportModal
          html={message.reportHtml}
          onClose={() => setShowReport(false)}
        />
      )}
    </>
  );
}
