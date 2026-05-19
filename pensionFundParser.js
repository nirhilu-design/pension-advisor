import { cleanText, normalizeCompanyName, pick, toNumber } from '../utils/normalizeHebrew.js';

const PENSION_SHEET_NAME = 'קרן פנסיה';

export function parsePensionFundSheet(workbook) {
  const rows = workbook.sheets[PENSION_SHEET_NAME] ?? [];

  return rows.map((row, index) => {
    const fundName = cleanText(pick(row, ['שם קרן הפנסיה', 'שם הקרן', 'שם מוצר']));
    const manufacturerRaw = pick(row, ['קרן פנסיה', 'יצרן', 'חברה מנהלת', 'שם חברה']);
    const agreementValidation = pick(row, ['סטטוס.1', 'סטטוס בדיקה', 'סטטוס הסכם', 'סטטוס']);

    return {
      sourceSheet: PENSION_SHEET_NAME,
      sourceRowNumber: index + 2,
      employeeId: cleanText(pick(row, ['קוד מזהה של העובד', 'מס סידורי אצל המעסיק', 'מספר עובד'])),
      policyNumber: cleanText(pick(row, ['מספר פוליסה', 'קוד מזהה פוליסה'])),
      manufacturer: normalizeCompanyName(manufacturerRaw) || 'לא ידוע',
      fundName,
      pensionType: classifyPensionType(fundName),
      actualDepositFee: toNumber(pick(row, ['דמי ניהול מפרמיה באחוזים'])),
      actualAccumulationFee: toNumber(pick(row, ['דמי ניהול מצבירה באחוזים'])),
      agreementDepositFee: toNumber(pick(row, ['דמי ניהול מפרמיה באחוזים בהסכם'])),
      agreementAccumulationFee: toNumber(pick(row, ['דמי ניהול מצבירה באחוזים בהסכם'])),
      agreementValidationStatus: cleanText(agreementValidation),
      redemptionValue: toNumber(pick(row, ['סה"כ ערכי פידיון', 'סה״כ ערכי פידיון', 'סהכ ערכי פידיון'])),
      isAgentInPolicy: cleanText(pick(row, ['האם מנהל ההסדר סוכן בפוליסה', 'האם מנהל ההסדר  סוכן בפוליסה'])),
      raw: row
    };
  });
}

export function classifyPensionType(fundName) {
  const text = cleanText(fundName);
  if (/מקיפה/.test(text)) return 'comprehensive';
  if (/משלימה|כללית/.test(text)) return 'supplementary';
  return 'unclassified';
}
