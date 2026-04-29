import path from 'path';
import { AppError }                        from '../../errors/AppError.js';
import { REPORT_SYSTEM_SUFFIX }            from '../../constants/prompts.js';
import { resolveUploadPath, fileExists }   from '../../services/fileService.js';
import { buildPayload, fetchQwen }         from '../../services/qwenService.js';
import { parseExcelFile, sheetsToMarkdown } from '../../utils/excelParser.js';

const VALID_ROLES = new Set(['user', 'assistant', 'system']);

export async function handleChat(req, res) {
  const {
    messages,
    systemPrompt = 'You are a helpful business intelligence assistant.',
    fileId,
    generateReport = false,
    stream = true,
  } = req.body;

  if (!Array.isArray(messages) || messages.length === 0)
    throw AppError.badRequest('messages must be a non-empty array.');

  for (const msg of messages) {
    if (!VALID_ROLES.has(msg.role))
      throw AppError.badRequest(`Invalid message role: "${msg.role}".`);
    if (typeof msg.content !== 'string')
      throw AppError.badRequest('Each message must have a string content.');
  }

  let fullSystem = systemPrompt;
  if (generateReport) fullSystem += '\n\n' + REPORT_SYSTEM_SUFFIX;

  let dataContext = '';
  if (fileId) {
    const filePath = resolveUploadPath(fileId);
    if (!(await fileExists(filePath)))
      throw AppError.notFound(`File "${fileId}" not found on server.`);

    const ext    = path.extname(fileId);
    const parsed = await parseExcelFile(filePath, `data${ext}`);
    const md     = sheetsToMarkdown(parsed, 300);
    dataContext  = `\n\n---\n**Uploaded File Data:**\n\n${md}\n---\n`;
  }

  const enrichedMessages = messages.map((m, i) =>
    i === messages.length - 1 && m.role === 'user' && dataContext
      ? { ...m, content: m.content + dataContext }
      : m
  );

  const payload = buildPayload(
    [{ role: 'system', content: fullSystem }, ...enrichedMessages],
    { generateReport, stream }
  );

  console.log(`[chat] model=${payload.model}  stream=${stream}  report=${generateReport}`);

  const upstream = await fetchQwen(payload);

  if (stream) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders();

    const reader  = upstream.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) { res.write('data: [DONE]\n\n'); return res.end(); }

    req.on('close', () => reader.cancel());

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
    return res.end();
  }

  return res.json(await upstream.json());
}
