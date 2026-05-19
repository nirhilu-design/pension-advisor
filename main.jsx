import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { parseWorkbookFile } from './lib/parseWorkbook.js';
import { parsePensionFundSheet } from './parsers/pensionFundParser.js';
import { parseAgreementsWorkbook } from './parsers/agreementsParser.js';
import { buildPensionSummary } from './analysis/buildPensionSummary.js';
import './styles.css';

function App() {
  const [dataWorkbook, setDataWorkbook] = useState(null);
  const [agreementWorkbook, setAgreementWorkbook] = useState(null);
  const [summary, setSummary] = useState(null);
  const [debug, setDebug] = useState(null);

  async function handleDataFile(file) {
    const workbook = await parseWorkbookFile(file);
    setDataWorkbook(workbook);
    setDebug(prev => ({ ...prev, dataSheets: Object.keys(workbook.sheets) }));
  }

  async function handleAgreementFile(file) {
    const workbook = await parseWorkbookFile(file);
    setAgreementWorkbook(workbook);
    setDebug(prev => ({ ...prev, agreementSheets: Object.keys(workbook.sheets) }));
  }

  function runPensionAnalysis() {
    if (!dataWorkbook) return;
    const pensionRows = parsePensionFundSheet(dataWorkbook);
    const agreements = agreementWorkbook ? parseAgreementsWorkbook(agreementWorkbook) : [];
    const result = buildPensionSummary({ pensionRows, agreements });
    setSummary(result);
    setDebug(prev => ({ ...prev, pensionRows: pensionRows.length, agreements: agreements.length }));
  }

  return (
    <main className="page">
      <section className="hero">
        <div>
          <div className="eyebrow">שלב 1 · קליטת נתונים</div>
          <h1>מערכת לניתוח דוח יועץ פנסיוני</h1>
          <p>טעינת דוח נתונים ודוח הסכמים, Parser לקרן פנסיה, ושיקוף ראשוני בטבלאות WEB.</p>
        </div>
      </section>

      <section className="panel grid2">
        <label className="uploadBox">
          <span>דוח נתונים / מנהלי הסדר</span>
          <input type="file" accept=".xlsx,.xls" onChange={e => handleDataFile(e.target.files?.[0])} />
        </label>
        <label className="uploadBox">
          <span>דוח הסכמים</span>
          <input type="file" accept=".xlsx,.xls" onChange={e => handleAgreementFile(e.target.files?.[0])} />
        </label>
      </section>

      <section className="actions">
        <button disabled={!dataWorkbook} onClick={runPensionAnalysis}>הפק טבלאות קרן פנסיה</button>
      </section>

      {debug && <pre className="debug">{JSON.stringify(debug, null, 2)}</pre>}

      {summary && (
        <section className="tables">
          <SummaryTable title="קרן פנסיה מקיפה" rows={summary.comprehensive} />
          <SummaryTable title="קרן פנסיה משלימה / כללית" rows={summary.supplementary} />
          {summary.unclassified.length > 0 && <SummaryTable title="קרן פנסיה — לא מסווג" rows={summary.unclassified} />}
        </section>
      )}
    </main>
  );
}

function SummaryTable({ title, rows }) {
  return (
    <div className="tableCard">
      <h2>{title}</h2>
      <table>
        <thead>
          <tr>
            <th>יצרן</th>
            <th>קיים הסכם - תקין</th>
            <th>קיים הסכם - תקין אך לא תואם צבירות</th>
            <th>קיים הסכם - לא תקין</th>
            <th>אין הסכם - תקין</th>
            <th>אין הסכם - תקין אך לא תואם צבירות</th>
            <th>אין הסכם - לא תקין</th>
            <th>חסרי נתון סוכן</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(row => (
            <tr key={row.manufacturer}>
              <td>{row.manufacturer}</td>
              <td>{row.withAgreement.valid}</td>
              <td>{row.withAgreement.validHighBalanceMismatch}</td>
              <td>{row.withAgreement.invalid}</td>
              <td>{row.withoutAgreement.valid}</td>
              <td>{row.withoutAgreement.validHighBalanceMismatch}</td>
              <td>{row.withoutAgreement.invalid}</td>
              <td>{row.missingAgent}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

createRoot(document.getElementById('root')).render(<App />);
