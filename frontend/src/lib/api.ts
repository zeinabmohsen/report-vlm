import type { UploadedFile, SendMessagePayload, HealthResponse } from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

// ── Upload file ───────────────────────────────────────────────────────────────
export async function uploadFile(file: File): Promise<UploadedFile> {
  const form = new FormData();
  form.append('file', file);

  const res = await fetch(`${BASE}/api/upload`, {
    method: 'POST',
    body: form,
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Upload failed');
  return data as UploadedFile;
}

// ── Delete file ───────────────────────────────────────────────────────────────
export async function deleteFile(fileId: string): Promise<void> {
  await fetch(`${BASE}/api/upload/${fileId}`, { method: 'DELETE' });
}

// ── Stream chat ───────────────────────────────────────────────────────────────
export async function streamChat(
  payload: SendMessagePayload,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: string) => void
): Promise<void> {
  try {
    const res = await fetch(`${BASE}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, stream: true }),
    });

    if (!res.ok) {
      const data = await res.json();
      onError(data.error || `Server error ${res.status}`);
      return;
    }

    const reader = res.body?.getReader();
    const decoder = new TextDecoder();
    if (!reader) { onDone(); return; }

    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed === 'data: [DONE]') continue;
        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            const delta = json?.choices?.[0]?.delta?.content;
            if (delta) onChunk(delta);
          } catch {
            // skip malformed chunk
          }
        }
      }
    }
    onDone();
  } catch (err) {
    onError(err instanceof Error ? err.message : 'Network error');
  }
}

// ── Non-stream chat (for report generation) ───────────────────────────────────
export async function sendChat(payload: SendMessagePayload): Promise<string> {
  const res = await fetch(`${BASE}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, stream: false }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Chat failed');
  return data?.choices?.[0]?.message?.content ?? '';
}

// ── Health ────────────────────────────────────────────────────────────────────
export async function checkHealth(): Promise<HealthResponse> {
  const res = await fetch(`${BASE}/api/health`);
  return res.json() as Promise<HealthResponse>;
}
