import ExcelJS from 'exceljs';
import path    from 'path';

export async function parseExcelFile(filePath, originalName) {
  const ext      = path.extname(originalName).toLowerCase();
  const workbook = new ExcelJS.Workbook();

  if (ext === '.csv' || ext === '.tsv') {
    const worksheet = await workbook.csv.readFile(filePath, {
      parserOptions: { delimiter: ext === '.tsv' ? '\t' : ',' },
    });
    const sheets = [worksheetToSheet(worksheet)];
    return { fileName: originalName, sheets, summary: buildSummary(sheets) };
  }

  await workbook.xlsx.readFile(filePath);

  const sheets = workbook.worksheets.map(worksheetToSheet);
  return { fileName: originalName, sheets, summary: buildSummary(sheets) };
}

function worksheetToSheet(worksheet) {
  const headers = [];
  const rows    = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      row.values.forEach((val, i) => { if (i > 0) headers.push(String(val ?? '')); });
    } else {
      const obj = {};
      headers.forEach((h, i) => {
        const cell = row.values[i + 1];
        obj[h] = cell instanceof Date ? cell.toISOString() : (cell ?? null);
      });
      rows.push(obj);
    }
  });

  return {
    sheetName: worksheet.name,
    headers,
    rows,
    totalRows: rows.length,
    preview:   rows.slice(0, 5),
  };
}

function buildSummary(sheets) {
  return sheets
    .map((s) => `Sheet "${s.sheetName}": ${s.totalRows} rows — ${s.headers.join(', ')}`)
    .join('\n');
}

export function sheetsToMarkdown(parsed, maxRows = 300) {
  return parsed.sheets.map(({ sheetName, headers, rows, totalRows }) => {
    if (!headers.length) return `### ${sheetName}\n_(empty)_`;

    const head    = headers.join(' | ');
    const divider = headers.map(() => '---').join(' | ');
    const body    = rows.slice(0, maxRows)
      .map((r) => headers.map((h) => String(r[h] ?? '')).join(' | '))
      .join('\n');
    const note = totalRows > maxRows
      ? `\n> ⚠ Showing first ${maxRows} of ${totalRows} rows.\n`
      : '';

    return `### Sheet: ${sheetName} (${totalRows} rows)\n\n${head}\n${divider}\n${body}${note}`;
  }).join('\n\n---\n\n');
}
