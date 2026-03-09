import React from "react";
import { insforge } from "@/lib/insforge";
import { LinkRecord } from "@/types/link";

// Fallback links if DB is empty or unavailable
const FALLBACK_LINKS = [
  {
    id: "1",
    title: "פרק 47 בפודקאסט - לחיות בתפקיד הראשי",
    description: "עם יעלי קוגן - פרק מיוחד על הטיול המסוכן מטהרן לישראל, אהבה, אמונה וחוויות המטבח הפרסי.",
    url: "https://creators.spotify.com/pod/show/koganyaeli/episodes/47-e2sd48n",
    icon: "https://upload.wikimedia.org/wikipedia/commons/1/19/Spotify_logo_without_text.svg",
    type: "Spotify",
    display_order: 1,
  },
  {
    id: "2",
    title: "ראיון בהידברות - נתנו לנו מכות רצח",
    description: "ראיון רציני על מסע רוחני, סבל פיזי והבריחה מטהרן. סיפור אישי ומרגש על אמונה והישרדות.",
    url: "https://www.hidabroot.org/video/224331",
    icon: "https://www.hidabroot.org/images/logo_og.png",
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
];

async function fetchLinks(): Promise<LinkRecord[]> {
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

export default async function PodcastsSection() {
  const links = await fetchLinks();

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
              className="bg-[#f9f7f4] border-r-4 border-primary-light p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 flex flex-col justify-between"
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
                <span className="mr-2">←</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
