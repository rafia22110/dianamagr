# הגדרת InsForge לאתר דיאנה רחמני

## 1. יצירת טבלת images

בדשבורד InsForge, עבור ל-**Database** והרץ את ה-SQL הבא:

```sql
CREATE TABLE public.images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  category TEXT NOT NULL,
  tags JSONB DEFAULT '[]',
  alt_text TEXT,
  storage_path TEXT,
  url TEXT,
  upload_date TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.images ENABLE ROW LEVEL SECURITY;

-- קריאה ציבורית (לצפייה באתר)
CREATE POLICY "images_select_anon" ON public.images
  FOR SELECT USING (true);

-- הוספה/עדכון/מחיקה למשתמשים מאומתים
CREATE POLICY "images_all_authenticated" ON public.images
  FOR ALL USING (auth.role() = 'authenticated');
```

## 2. יצירת Bucket לאחסון תמונות

בדשבורד InsForge, עבור ל-**Storage** → **Create Bucket**:

- **שם:** `diana-images`
- **סוג:** Public
- **גודל מקסימלי:** 5MB (או 10MB)

## 3. הרשמה והתחברות

1. הירשמי ב-InsForge (אימייל + סיסמה) או היכנסי לדשבורד
2. המשתמש שנרשם יכול להתחבר לפאנל הניהול ב-`/admin`
3. בפאנל - העלאת תמונות, מחיקה, העתקת נתיב

## 4. משתני סביבה

הקובץ `.env.local` כבר מכיל:
- `NEXT_PUBLIC_INSFORGE_URL`
- `NEXT_PUBLIC_INSFORGE_ANON_KEY`

אם צריך לעדכן - ערכי את `.env.local` לפי Settings → Connect בדשבורד InsForge.
