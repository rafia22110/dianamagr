import React from "react";
import Link from "next/link";

interface HeroSectionProps {
  heroBg: string;
}

export default function HeroSection({ heroBg }: HeroSectionProps) {
  return (
    <section id="home" className="relative h-[80vh] min-h-[600px] flex items-center justify-center text-center text-white overflow-hidden">
      {/* Hero Background with Overlay */}
      <div
        className="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
        style={{ backgroundImage: `url('${heroBg}')` }}
      >
        <div className="absolute inset-0 hero-gradient"></div>
      </div>

      <div className="relative z-10 max-w-4xl px-6">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 font-serif drop-shadow-2xl">דיאנה רחמני</h1>
        <p className="text-2xl md:text-3xl mb-8 font-light tracking-wide drop-shadow-lg">מטבח פרסי, תקווה ובריחה מטהרן</p>
        <div className="bg-black/20 backdrop-blur-sm p-8 rounded-2xl border border-white/10 shadow-2xl">
          <p className="text-xl leading-relaxed">
            כוכבת &quot;מאסטר שף&quot;, מחברת ספר &quot;הבריחה מטהרן&quot;, ומחברת סיפורי חיים, מטבח ואמונה.
            <br />
            <span className="text-primary-light font-bold mt-4 block">הצטרפו למסע של טעמים, הישרדות והשראה.</span>
          </p>
        </div>
        <div className="mt-10 flex gap-4 justify-center">
          <Link href="#lectures" className="bg-primary-light hover:bg-white hover:text-primary text-white font-bold py-4 px-10 rounded-full shadow-xl transition-all transform hover:scale-105">
            הזמנת הרצאה
          </Link>
          <Link href="#book" className="bg-white/20 hover:bg-white/30 text-white font-bold py-4 px-10 rounded-full border border-white/30 backdrop-blur-md transition-all">
            על הספר
          </Link>
        </div>
      </div>

      {/* Wave SVG Decoration */}
      <div className="absolute bottom-0 left-0 w-full overflow-hidden leading-[0]">
        <svg className="relative block w-full h-[60px]" viewBox="0 0 1200 120" preserveAspectRatio="none">
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z" fill="#f9f7f4"></path>
        </svg>
      </div>
    </section>
  );
}
