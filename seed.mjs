process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
const API = 'https://ane7v4ce.us-east.insforge.app';
const KEY = 'ik_bf44df2031c6d8808e0d4cff27b52575';
const H = { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' };

const FALLBACK_LINKS = [
    {
        title: "ראיון מקיף במאקו - ערוץ 12",
        description: "ראיון מרתק ומרגש במאקו על הסיפור האישי, הבריחה מטהרן והמטבח הפרסי.",
        url: "https://www.mako.co.il/news-channel12?subChannelId=16bfc571bc8ae710VgnVCM100000700a10acRCRD&vcmid=794cf527e9daf710VgnVCM100000700a10acRCRD",
        icon: "/icons/youtube.svg",
        type: "Video",
        display_order: 1,
    },
    {
        title: "השרון פוסט - כתבה מקיפה",
        description: "כתבה מיוחדת בהשרון פוסט על דיאנה רחמני והדרך שעברה מאיראן לישראל.",
        url: "https://hasharon-post.co.il/hpnews/114182",
        type: "Article",
        display_order: 2,
    },
    {
        title: "ראיון בהידברות - נתנו לנו מכות רצח",
        description: "ראיון רציני על מסע רוחני, סבל פיזי והבריחה מטהרן. סיפור אישי ומרגש על אמונה והישרדות.",
        url: "https://www.hidabroot.org/video/224331",
        icon: "/icons/hidabroot.png",
        type: "Video",
        display_order: 3,
    },
    {
        title: "נטו בת ים - המטבח הפרסי של דיאנה",
        description: "סיקור מיוחד במגזין נטו בת ים על האוכל, התבלינים וסיפור החיים המרתק.",
        url: "https://www.netobatyam.co.il/magazine/7461/",
        type: "Article",
        display_order: 4,
    },
    {
        title: "הפודקאסט - לחיות בתפקיד הראשי",
        description: "עם יעלי קוגן - פרק מיוחד על הטיול המסוכן מטהרן לישראל, אהבה, אמונה וחוויות המטבח הפרסי.",
        url: "https://open.spotify.com/episode/49M9k3NEB8H5otsGJpZkoo?si=jluQMnXvSuiKE4gsMfA07w&t=37",
        icon: "/icons/spotify.svg",
        type: "Spotify",
        display_order: 5,
    },
    {
        title: "הבלוג של פנינה - ביקורת ספרים",
        description: "סקירה מיוחדת ומעמיקה על הספר 'הבריחה מטהרן' בבלוג הספרות של פנינה.",
        url: "https://pninaweb.blogspot.com/2026/01/blog-post_80.html",
        type: "Article",
        display_order: 6,
    },
    {
        title: "ביקורת ספר - מלממה",
        description: "ביקורת וסקירה על הספר המרתק הבריחה מטהרן.",
        url: "https://malamma.wordpress.com/2025/12/31/%d7%94%d7%91%d7%a8%d7%99%d7%97%d7%94-%d7%9e%d7%98%d7%94%d7%a8%d7%9f-%d7%9e%d7%90%d7%aa-%d7%93%d7%99%d7%90%d7%a0%d7%94-%d7%a8%d7%97%d7%9e%d7%a0%d7%99-%d7%a4%d7%a8%d7%99-%d7%a1%d7%a0%d7%99/",
        type: "Article",
        display_order: 7,
    },
    {
        title: "סרטון מרגש באינסטגרם",
        description: "טעימה קטנה מהמטבח הפרסי ומסיפור החיים המרגש - סרטון קצר.",
        url: "https://www.instagram.com/reels/DMZlpIYoXDu/",
        icon: "/icons/instagram.png",
        type: "Instagram",
        display_order: 8,
    },
    {
        title: "ראיון בפייסבוק Watch",
        description: "ראיון מיוחד שעלה בפייסבוק - צפו בדיאנה מספרת את סיפורה.",
        url: "https://fb.watch/lpEYMaXokZ/?mibextid=YCRy0i",
        icon: "/icons/facebook.svg",
        type: "Facebook",
        display_order: 9,
    },
    {
        title: "המטבח הפרסי - סרטון פייסבוק",
        description: "קליפ קצר בו דיאנה מדברת על המטבח הפרסי ועל הקשר העמוק שלו לתרבות ולחיים בישראל.",
        url: "https://www.facebook.com/watch/?v=834984291584661&extid=WA-UNK-UNK-UNK-AN_GK0T-GK1C&mibextid=YCRy0i&ref=sharing",
        icon: "/icons/facebook.svg",
        type: "Facebook",
        display_order: 10,
    }
];

async function seed() {
    try {
        const tableRes = await fetch(`${API}/api/database/tables`, { headers: H });
        const tables = await tableRes.json();
        const hasLinks = Array.isArray(tables) && tables.some(t => (t.name || t) === 'links');

        if (!hasLinks) {
            console.log('Creating links table...');
            await fetch(`${API}/api/database/tables`, {
                method: 'POST', headers: H,
                body: JSON.stringify({
                    name: 'links',
                    columns: [
                        { name: 'id', type: 'uuid', primaryKey: true, defaultValue: 'gen_random_uuid()' },
                        { name: 'title', type: 'text', notNull: true },
                        { name: 'description', type: 'text' },
                        { name: 'url', type: 'text', notNull: true },
                        { name: 'icon', type: 'text' },
                        { name: 'type', type: 'text' },
                        { name: 'display_order', type: 'integer', defaultValue: '0' }
                    ]
                })
            });
        }

        console.log('Fetching links...');
        const searchParams = new URLSearchParams({ select: '*' });
        const linksRes = await fetch(`${API}/api/database/tables/links/records?${searchParams}`, { headers: H });
        const existing = await linksRes.json();

        if (!existing || !existing.data || existing.data.length === 0) {
            console.log('No links found. Seeding...');
            const insertRes = await fetch(`${API}/api/database/tables/links/records`, {
                method: 'POST',
                headers: H,
                body: JSON.stringify(FALLBACK_LINKS)
            });
            console.log('Seeded links:', insertRes.status);
        } else {
            console.log(`Already has ${existing.data.length} links.`);
        }
    } catch (e) {
        console.error('Error', e);
    }
}

seed();
