# מערכת לניתוח דוח יועץ פנסיוני - Starter

שלד React + Vite לטעינת שני קבצי Excel:

1. דוח נתונים / מנהלי הסדר
2. דוח הסכמים

בשלב הנוכחי יש Parser ראשוני למוצר קרן פנסיה בלבד, עם שתי טבלאות:

- קרן פנסיה מקיפה
- קרן פנסיה משלימה / כללית

## התקנה מקומית

```bash
npm install
npm run dev
```

## דיפלוי ל-Cloudflare Pages

- Build command: `npm run build`
- Output directory: `dist`
- Framework preset: `Vite`

## מבנה לוגי

- `src/lib/parseWorkbook.js` - קריאת Excel בדפדפן
- `src/parsers/pensionFundParser.js` - Parser לגיליון קרן פנסיה
- `src/parsers/agreementsParser.js` - Parser ראשוני לדוח הסכמים
- `src/analysis/buildPensionSummary.js` - בניית טבלאות הסיכום
- `src/utils/normalizeHebrew.js` - ניקוי טקסט, שמות חברות, מספרים ושמות עמודות

## הערות להמשך

צריך להרחיב את `agreementsParser` לפי המבנה הסופי של דוח ההסכמים, במיוחד אם הכותרות אינן בשורה הראשונה.
