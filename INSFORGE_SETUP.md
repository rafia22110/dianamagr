# הגדרת InsForge

פרויקט זה משתמש ב-InsForge כ-Backend (בסיס נתונים, אימות משתמשים ואחסון קבצים).

## משתני סביבה

יש להגדיר את המשתנים הבאים בקובץ `.env.local` או בהגדרות ה-Vercel:

```env
NEXT_PUBLIC_INSFORGE_URL=your_insforge_project_url
NEXT_PUBLIC_INSFORGE_ANON_KEY=your_anon_key
INSFORGE_API_KEY=your_admin_api_key (נדרש רק להרצת סקריפט ההקמה)
```

## הקמת מסד הנתונים והאחסון

כדי ליצור את הטבלאות הנדרשות (`images`, `subscriptions`, `workshops`, `registrations`, `orders`) ואת ה-Bucket לאחסון תמונות (`diana-images`), הרץ את הפקודה הבאה:

```bash
node scripts/setup-insforge.mjs
```

**הערה:** וודא שמשתנה הסביבה `INSFORGE_API_KEY` מוגדר לפני ההרצה.

## מבנה טבלאות

הסקריפט יוצר את המבנים הבאים:
- `images`: ניהול תמונות האתר (גלריה, Hero, ספר).
- `subscriptions`: רשימת תפוצה לניוזלטר.
- `workshops`: ניהול סדנאות והרצאות (Admin).
- `registrations`: הרשמות משתמשים לסדנאות.
- `orders`: מעקב אחרי רכישות ספרים.
