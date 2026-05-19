import { normalizeCompanyName } from '../utils/normalizeHebrew.js';

const HIGH_BALANCE_THRESHOLD = 500000;

export function buildPensionSummary({ pensionRows, agreements }) {
  const agreementIndex = buildAgreementIndex(agreements);

  const buckets = {
    comprehensive: new Map(),
    supplementary: new Map(),
    unclassified: new Map()
  };

  for (const row of pensionRows) {
    const tableKey = row.pensionType || 'unclassified';
    const target = buckets[tableKey] ?? buckets.unclassified;
    const manufacturer = row.manufacturer || 'לא ידוע';
    const record = getOrCreate(target, manufacturer);

    const hasAgreement = hasMatchingAgreement(row, agreementIndex) || hasAgreementValues(row);
    const validation = classifyValidation(row);
    const highBalanceMismatch = isHighBalanceMismatch(row);

    if (hasAgreement) {
      if (validation === 'invalid') record.withAgreement.invalid += 1;
      else if (highBalanceMismatch) record.withAgreement.validHighBalanceMismatch += 1;
      else record.withAgreement.valid += 1;
    } else {
      if (validation === 'invalid') record.withoutAgreement.invalid += 1;
      else if (highBalanceMismatch) record.withoutAgreement.validHighBalanceMismatch += 1;
      else record.withoutAgreement.valid += 1;
    }

    if (/^לא$|אין|חסר/i.test(row.isAgentInPolicy || '')) {
      record.missingAgent += 1;
    }
  }

  return {
    comprehensive: sortRows([...buckets.comprehensive.values()]),
    supplementary: sortRows([...buckets.supplementary.values()]),
    unclassified: sortRows([...buckets.unclassified.values()])
  };
}

function buildAgreementIndex(agreements) {
  const set = new Set();
  for (const agreement of agreements) {
    if (!agreement.company) continue;
    set.add(normalizeCompanyName(agreement.company));
  }
  return set;
}

function hasMatchingAgreement(row, agreementIndex) {
  return agreementIndex.has(normalizeCompanyName(row.manufacturer));
}

function hasAgreementValues(row) {
  return row.agreementDepositFee !== null || row.agreementAccumulationFee !== null;
}

function classifyValidation(row) {
  const status = String(row.agreementValidationStatus || '').trim();
  if (/לא\s*תקין/.test(status)) return 'invalid';
  if (/תקין/.test(status)) return 'valid';

  const checks = [];
  if (row.actualDepositFee !== null && row.agreementDepositFee !== null) {
    checks.push(row.actualDepositFee <= row.agreementDepositFee);
  }
  if (row.actualAccumulationFee !== null && row.agreementAccumulationFee !== null) {
    checks.push(row.actualAccumulationFee <= row.agreementAccumulationFee);
  }
  if (checks.length === 0) return 'valid';
  return checks.every(Boolean) ? 'valid' : 'invalid';
}

function isHighBalanceMismatch(row) {
  return row.redemptionValue !== null && row.redemptionValue >= HIGH_BALANCE_THRESHOLD;
}

function getOrCreate(map, manufacturer) {
  if (!map.has(manufacturer)) {
    map.set(manufacturer, {
      manufacturer,
      withAgreement: { valid: 0, validHighBalanceMismatch: 0, invalid: 0 },
      withoutAgreement: { valid: 0, validHighBalanceMismatch: 0, invalid: 0 },
      missingAgent: 0
    });
  }
  return map.get(manufacturer);
}

function sortRows(rows) {
  return rows.sort((a, b) => a.manufacturer.localeCompare(b.manufacturer, 'he'));
}
