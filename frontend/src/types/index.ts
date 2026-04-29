// ── Chat types ────────────────────────────────────────────────────────────────

export type MessageRole = 'user' | 'assistant' | 'system';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  isReport?: boolean;   // message contains a full HTML report
  reportHtml?: string;
}

// ── Upload types ──────────────────────────────────────────────────────────────

export interface SheetPreview {
  sheetName: string;
  totalRows: number;
  headers: string[];
  preview: Record<string, string | number | boolean | null>[];
}

export interface UploadedFile {
  fileId: string;
  originalName: string;
  size: number;
  sheets: SheetPreview[];
  summary: string;
}

// ── API request/response types ────────────────────────────────────────────────

export interface SendMessagePayload {
  messages: { role: MessageRole; content: string }[];
  systemPrompt?: string;
  fileId?: string;
  generateReport?: boolean;
  stream?: boolean;
}

export interface HealthResponse {
  status: string;
  model: string;
  endpoint: string;
  timestamp: string;
}
