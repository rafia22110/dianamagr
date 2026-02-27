export interface ImageRecord {
  id: string;
  filename: string;
  original_name: string;
  category: string;
  tags?: string[] | string;
  alt_text?: string;
  storage_path?: string;
  url?: string;
  upload_date?: string;
}

export const CATEGORIES: Record<string, string> = {
  hero: 'תמונת רקע ראשית',
  gallery: 'גלריית תמונות',
  book: 'כריכת ספר',
  profile: 'תמונת פרופיל',
  cooking: 'מטבח ובישול',
  event: 'אירועים והרצאות',
};

export const AVAILABLE_TAGS = [
  'דיאנה רחמני',
  'מאסטר שף',
  'מטבח פרסי',
  'בריחה מטהרן',
  'איראן',
  'ישראל',
  'הרצאות',
  'סדנאות בישול',
  'מתכונים',
  'משפחה',
  'תקווה',
  'אמונה',
];
