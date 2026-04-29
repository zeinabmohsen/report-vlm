import { deleteUploadedFile } from '../services/fileService.js';
import { parseExcelFile } from '../utils/excelParser.js';

export async function handleUpload(req, res) {
  if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

  const parsed = await parseExcelFile(req.file.path, req.file.originalname);

  return res.status(201).json({
    success:      true,
    fileId:       req.file.filename,
    originalName: req.file.originalname,
    size:         req.file.size,
    sheets:       parsed.sheets.map(({ sheetName, totalRows, headers, preview }) => ({
      sheetName, totalRows, headers, preview,
    })),
    summary: parsed.summary,
  });
}

export async function handleDeleteUpload(req, res) {
  const deleted = await deleteUploadedFile(req.params.fileId);
  return deleted
    ? res.json({ success: true })
    : res.status(404).json({ error: 'File not found.' });
}
