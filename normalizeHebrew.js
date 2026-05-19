export function cleanText(value) {
  return String(value ?? '')
    .replace(/\u200f|\u200e/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function normalizeKey(value) {
  return cleanText(value)
    .replace(/["'׳״]/g, '')
    .replace(/\s+/g, '')
    .toLowerCase();
}

export function normalizeCompanyName(value) {
  const text = cleanText(value);
  return text
    .replace(/בעמ|בע"מ|חברה לביטוח|פנסיה וגמל|גמל ופנסיה/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function pick(row, candidates) {
  const normalized = Object.fromEntries(Object.keys(row).map(k => [normalizeKey(k), k]));
  for (const candidate of candidates) {
    const actualKey = normalized[normalizeKey(candidate)];
    if (actualKey !== undefined) return row[actualKey];
  }
  return '';
}

export function toNumber(value) {
  const text = cleanText(value).replace(/,/g, '').replace(/%/g, '');
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}
