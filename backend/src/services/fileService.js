import path from 'path';
import { mkdirSync } from 'fs';
import { access, unlink } from 'fs/promises';
import { fileURLToPath } from 'url';
import { AppError } from '../errors/AppError.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOAD_DIR = path.resolve(__dirname, '../../uploads');

mkdirSync(UPLOAD_DIR, { recursive: true });

export function resolveUploadPath(fileId) {
  const safe = path.basename(fileId);
  if (!safe || safe === '.' || safe === '..') throw AppError.badRequest('Invalid file ID.');
  return path.join(UPLOAD_DIR, safe);
}

export async function fileExists(filePath) {
  try { await access(filePath); return true; }
  catch { return false; }
}

export async function deleteUploadedFile(fileId) {
  const filePath = resolveUploadPath(fileId);
  if (!(await fileExists(filePath))) return false;
  await unlink(filePath);
  return true;
}
