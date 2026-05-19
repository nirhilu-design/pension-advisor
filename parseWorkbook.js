import * as XLSX from 'xlsx';

export async function parseWorkbookFile(file) {
  if (!file) throw new Error('לא נבחר קובץ');
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true, raw: false });

  const sheets = {};
  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    sheets[sheetName] = XLSX.utils.sheet_to_json(sheet, {
      defval: '',
      raw: false,
      blankrows: false
    });
  }

  return { sheetNames: workbook.SheetNames, sheets };
}
