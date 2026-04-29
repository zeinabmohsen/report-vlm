import { config } from '../config/env.js';
import { AppError } from '../errors/AppError.js';

export function buildPayload(messages, { generateReport, stream }) {
  return {
    model:       config.qwen.model,
    max_tokens:  generateReport ? 8192 : 2048,
    temperature: generateReport ? 0.2  : 0.7,
    stream,
    messages,
  };
}

export async function fetchQwen(payload) {
  const url        = `${config.qwen.baseUrl}/chat/completions`;
  const timeoutMs  = payload.max_tokens >= 8192 ? 300_000 : 60_000;
  const controller = new AbortController();
  const timer      = setTimeout(() => controller.abort(), timeoutMs);

  let res;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.qwen.apiKey}`,
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err) {
    const isTimeout = err?.name === 'AbortError';
    const cause     = err?.cause?.message ?? err?.message ?? 'unknown';
    throw AppError.badGateway(
      isTimeout
        ? `Qwen API timed out after ${timeoutMs / 1000}s`
        : `Cannot reach Qwen API: ${cause}`
    );
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new AppError(res.status, `Qwen API error ${res.status}: ${body}`);
  }

  return res;
}
