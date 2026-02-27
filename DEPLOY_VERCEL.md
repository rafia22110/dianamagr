# פריסה ל-Vercel – תצוגה מקדימה

## שלב 1: התחברות ל-Vercel

בטרמינל:

```bash
npx vercel login
```

עקבי אחרי ההנחיות (אימייל או GitHub).

## שלב 2: פריסה

```bash
cd c:\Users\argan\Downloads\diana001\diana-insforge
npx vercel
```

- אם נשאל "Set up and deploy?" – בחרי **Y**
- בחרי את הפרויקט (או צרי חדש)
- בסוף יופיע **Preview URL** – זה הלינק לתצוגה מקדימה

## שלב 3: משתני סביבה (חשוב)

ב-[vercel.com](https://vercel.com) → הפרויקט → **Settings** → **Environment Variables**:

| שם | ערך |
|----|-----|
| `NEXT_PUBLIC_INSFORGE_URL` | `https://jxc5fi6w.us-east.insforge.app` |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | המפתח שלך מ-InsForge |

אחרי ההוספה – **Redeploy** (לחיצה על Deployments → ⋮ → Redeploy).

## פריסה ישירה (אופציונלי)

```bash
npx vercel --prod
```

זה יפרס לגרסת production.
