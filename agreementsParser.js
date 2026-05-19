import { cleanText, normalizeCompanyName, pick, toNumber } from '../utils/normalizeHebrew.js';

export function parseAgreementsWorkbook(workbook) {
  const allRows = [];

  for (const [sheetName, rows] of Object.entries(workbook.sheets)) {
    for (const row of rows) {
      const product = cleanText(pick(row, ['מוצר', 'סוג מוצר', 'שם מוצר']));
      const company = normalizeCompanyName(pick(row, ['חברה', 'יצרן', 'חברת ביטוח', 'בית השקעות', 'חברה מנהלת']));
      const depositFee = toNumber(pick(row, ['דמי ניהול מהפקדה', 'דמי ניהול מפרמיה', 'דמי ניהול מפרמיה באחוזים']));
      const accumulationFee = toNumber(pick(row, ['דמי ניהול מצבירה', 'דמי ניהול מצבירה באחוזים']));

      if (!product && !company && depositFee === null && accumulationFee === null) continue;

      allRows.push({
        sourceSheet: sheetName,
        product,
        company,
        depositFee,
        accumulationFee,
        raw: row
      });
    }
  }

  return allRows;
}
