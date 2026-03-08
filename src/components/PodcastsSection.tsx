import { insforge } from "@/lib/insforge";

// Fallback links if DB is empty or unavailable
const FALLBACK_LINKS = [
  {
    id: "1",
    title: "ראיון מקיף במאקו - ערוץ 12",
    description: "ראיון מרתק ומרגש במאקו על הסיפור האישי, הבריחה מטהרן והמטבח הפרסי.",
    url: "https://www.mako.co.il/news-channel12?subChannelId=16bfc571bc8ae710VgnVCM100000700a10acRCRD&vcmid=794cf527e9daf710VgnVCM100000700a10acRCRD",
    icon: "/icons/youtube.svg",
    type: "Video",
    display_order: 1,
  },
  {
    id: "2",
    title: "ראיון בהידברות - נתנו לנו מכות רצח",
    description: "ראיון רציני על מסע רוחני, סבל פיזי והבריחה מטהרן. סיפור אישי ומרגש על אמונה והישרדות.",
    url: "https://www.hidabroot.org/video/224331",
    icon: "/icons/hidabroot.png",
    type: "Video",
    display_order: 2,
  },
  {
    id: "3",
    title: "דוקותיים – כאן דיגיטל",
    description: "דיאנה מספרת על בריחת היהודים, והזיקה העמוקה בין המטבח הפרסי למקורות התרבות שלה.",
    url: "https://www.youtube.com/watch?v=fOxlMPdyIo4",
    icon: "https://upload.wikimedia.org/wikipedia/commons/0/09/YouTube_full-color_icon_%282017%29.svg",
    type: "YouTube",
    display_order: 3,
  },
  {
    id: "4",
    title: "נטו בת ים - המטבח הפרסי של דיאנה",
    description: "סיקור מיוחד במגזין נטו בת ים על האוכל, התבלינים וסיפור החיים המרתק.",
    url: "https://www.netobatyam.co.il/magazine/7461/",
    type: "Article",
    display_order: 4,
  },
  {
    id: "5",
    title: "הפודקאסט - לחיות בתפקיד הראשי",
    description: "עם יעלי קוגן - פרק מיוחד על הטיול המסוכן מטהרן לישראל, אהבה, אמונה וחוויות המטבח הפרסי.",
    url: "https://open.spotify.com/episode/49M9k3NEB8H5otsGJpZkoo?si=jluQMnXvSuiKE4gsMfA07w&t=37",
    icon: "/icons/spotify.svg",
    type: "Spotify",
    display_order: 5,
  },
  {
    id: "6",
    title: "הבלוג של פנינה - ביקורת ספרים",
    description: "סקירה מיוחדת ומעמיקה על הספר 'הבריחה מטהרן' בבלוג הספרות של פנינה.",
    url: "https://pninaweb.blogspot.com/2026/01/blog-post_80.html",
    type: "Article",
    display_order: 6,
  },
  {
    id: "7",
    title: "ביקורת ספר - מלממה",
    description: "ביקורת וסקירה על הספר המרתק הבריחה מטהרן.",
    url: "https://malamma.wordpress.com/2025/12/31/%d7%94%d7%91%d7%a8%d7%99%d7%97%d7%94-%d7%9e%d7%98%d7%94%d7%a8%d7%9f-%d7%9e%d7%90%d7%aa-%d7%93%d7%99%d7%90%d7%a0%d7%94-%d7%a8%d7%97%d7%9e%d7%a0%d7%99-%d7%a4%d7%a8%d7%99-%d7%a1%d7%a0%d7%99/",
    type: "Article",
    display_order: 7,
  },
  {
    id: "8",
    title: "סרטון מרגש באינסטגרם",
    description: "טעימה קטנה מהמטבח הפרסי ומסיפור החיים המרגש - סרטון קצר.",
    url: "https://www.instagram.com/reels/DMZlpIYoXDu/",
    icon: "/icons/instagram.png",
    type: "Instagram",
    display_order: 8,
  },
  {
    id: "9",
    title: "ראיון בפייסבוק Watch",
    description: "ראיון מיוחד שעלה בפייסבוק - צפו בדיאנה מספרת את סיפורה.",
    url: "https://fb.watch/lpEYMaXokZ/?mibextid=YCRy0i",
    icon: "/icons/facebook.svg",
    type: "Facebook",
    display_order: 9,
  },
  {
    id: "10",
    title: "המטבח הפרסי - סרטון פייסבוק",
    description: "קליפ קצר בו דיאנה מדברת על המטבח הפרסי ועל הקשר העמוק שלו לתרבות ולחיים בישראל.",
    url: "https://www.facebook.com/watch/?v=834984291584661&extid=WA-UNK-UNK-UNK-AN_GK0T-GK1C&mibextid=YCRy0i&ref=sharing",
    icon: "/icons/facebook.svg",
    type: "Facebook",
    display_order: 10,
  }
];

export type LinkRecord = {
  id: string;
  title: string;
  description?: string;
  url: string;
  icon?: string;
  type?: string;
  display_order?: number;
};

export async function fetchLinks(): Promise<LinkRecord[]> {
  try {
    const { data, error } = await insforge.database
      .from("links")
      .select("*")
      .order("display_order", { ascending: true });

    if (error || !data || data.length === 0) return FALLBACK_LINKS;
    return data as LinkRecord[];
  } catch {
    return FALLBACK_LINKS;
  }
}

export default function PodcastsSection({ links }: { links: LinkRecord[] }) {
  return (
    <section id="podcasts" className="py-20 px-6 bg-white">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl text-center text-primary font-bold mb-4 font-serif">
          הסיפור שלי: ראיונות ופודקאסטים
        </h2>
        <p className="text-center text-gray-600 mb-12 text-lg">
          שיחות מעמיקות על הבריחה, החיים באיראן והמטבח הפרסי
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {links.map((item) => (
            <div
              key={item.id}
              className="bg-[#f9f7f4] border-s-4 border-primary-light p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 flex flex-col justify-between"
            >
              <div>
                {item.icon && (
                  <img
                    src={item.icon}
                    alt={item.type || ""}
                    className="w-10 h-10 mb-4 opacity-80"
                  />
                )}
                <h3 className="text-2xl font-bold text-primary mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-700 leading-relaxed mb-6">
                  {item.description}
                </p>
              </div>
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary font-bold hover:underline"
              >
                {item.type === "Spotify" ? "האזינו ב-Spotify" : "צפו עכשיו"}
                <span className="ms-2">←</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
