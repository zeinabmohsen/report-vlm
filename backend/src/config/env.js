import 'dotenv/config';

function get(name, fallback) {
  const val = process.env[name];
  if (!val) {
    if (fallback === undefined) throw new Error(`Missing required env var: ${name}`);
    console.warn(`[config] ${name} not set — using default: ${fallback}`);
    return fallback;
  }
  return val;
}

export const config = Object.freeze({
  port: parseInt(process.env.PORT || '4000', 10),
  frontendUrl: get('FRONTEND_URL', 'http://localhost:3000'),
  qwen: Object.freeze({
    baseUrl: get('QWEN_BASE_URL', 'http://localhost:8000/v1'),
    model:   get('QWEN_MODEL',    'Qwen2.5-VL-7B-Instruct'),
    apiKey:  process.env.QWEN_API_KEY || 'not-required',
  }),
  upload: Object.freeze({
    maxFileSizeMb:     parseInt(process.env.MAX_FILE_SIZE_MB || '10', 10),
    allowedExtensions: ['.xlsx', '.xls', '.csv', '.tsv'],
  }),
});
