'use client';

import { useState, useCallback, useRef } from 'react';
import { streamChat } from '@/lib/api';
import type { ChatMessage, UploadedFile } from '@/types';

let msgCounter = 0;
const uid = () => `msg-${++msgCounter}-${Date.now()}`;

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [systemPrompt, setSystemPrompt] = useState(
    'You are a helpful business intelligence analyst. When asked, analyze data thoroughly and provide clear, actionable insights.'
  );
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
  const abortRef = useRef(false);

  const addMessage = useCallback((msg: Omit<ChatMessage, 'id' | 'timestamp'>): ChatMessage => {
    const full: ChatMessage = { ...msg, id: uid(), timestamp: new Date() };
    setMessages((prev) => [...prev, full]);
    return full;
  }, []);

  const updateLastAssistant = useCallback((updater: (prev: string) => string) => {
    setMessages((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i >= 0; i--) {
        if (copy[i].role === 'assistant') {
          copy[i] = { ...copy[i], content: updater(copy[i].content) };
          return copy;
        }
      }
      return copy;
    });
  }, []);

  const finalizeLastAssistant = useCallback((extra?: Partial<ChatMessage>) => {
    setMessages((prev) => {
      const copy = [...prev];
      for (let i = copy.length - 1; i >= 0; i--) {
        if (copy[i].role === 'assistant') {
          copy[i] = { ...copy[i], isStreaming: false, ...extra };
          return copy;
        }
      }
      return copy;
    });
  }, []);

  // ── Send a normal chat message ────────────────────────────────────────────
  const sendMessage = useCallback(
    async (userText: string) => {
      if (!userText.trim() || isLoading) return;
      setError(null);
      abortRef.current = false;

      const userMsg = addMessage({ role: 'user', content: userText });

      // Build history for API (exclude streaming placeholders)
      const history = [...messages, userMsg]
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));

      // Placeholder assistant message
      addMessage({ role: 'assistant', content: '', isStreaming: true });
      setIsLoading(true);

      await streamChat(
        {
          messages: history,
          systemPrompt,
          fileId: uploadedFile?.fileId,
          generateReport: false,
        },
        (chunk) => {
          if (!abortRef.current) updateLastAssistant((p) => p + chunk);
        },
        () => {
          finalizeLastAssistant();
          setIsLoading(false);
        },
        (err) => {
          setError(err);
          finalizeLastAssistant();
          setIsLoading(false);
        }
      );
    },
    [messages, isLoading, systemPrompt, uploadedFile, addMessage, updateLastAssistant, finalizeLastAssistant]
  );

  // ── Generate HTML report (streamed) ──────────────────────────────────────
  const generateReport = useCallback(
    async (userText: string) => {
      if (isLoading) return;
      setError(null);
      abortRef.current = false;

      const userMsg = addMessage({ role: 'user', content: userText });
      const history = [...messages, userMsg]
        .filter((m) => m.role !== 'system')
        .map((m) => ({ role: m.role, content: m.content }));

      addMessage({ role: 'assistant', content: '', isStreaming: true });
      setIsLoading(true);

      // Accumulate full streamed text so we can extract HTML at the end
      let accumulated = '';

      await streamChat(
        {
          messages: history,
          systemPrompt,
          fileId: uploadedFile?.fileId,
          generateReport: true,
          stream: true,
        },
        (chunk) => {
          if (!abortRef.current) {
            accumulated += chunk;
            updateLastAssistant((p) => p + chunk);
          }
        },
        () => {
          // Extract clean HTML from accumulated text
          let html = accumulated
            .replace(/^```html\s*/i, '')
            .replace(/```\s*$/i, '')
            .trim();
          if (!html.toLowerCase().startsWith('<!doctype') && !html.startsWith('<html')) {
            const match = html.match(/<!DOCTYPE[\s\S]*/i) || html.match(/<html[\s\S]*/i);
            html = match ? match[0] : html;
          }
          const isHtml = html.toLowerCase().startsWith('<!doctype') || html.startsWith('<html');
          finalizeLastAssistant(
            isHtml
              ? {
                  isReport: true,
                  reportHtml: html,
                  content: '📊 Interactive HTML report generated. Click **View Report** to open it.',
                }
              : {}
          );
          setIsLoading(false);
        },
        (err) => {
          setError(err);
          finalizeLastAssistant({ content: `⚠ ${err}` });
          setIsLoading(false);
        }
      );
    },
    [messages, isLoading, systemPrompt, uploadedFile, addMessage, updateLastAssistant, finalizeLastAssistant]
  );

  const clearChat = useCallback(() => {
    setMessages([]);
    setError(null);
  }, []);

  const stopStreaming = useCallback(() => {
    abortRef.current = true;
    finalizeLastAssistant();
    setIsLoading(false);
  }, [finalizeLastAssistant]);

  return {
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
  };
}
