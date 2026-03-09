import React from "react";

export default function AboutSection() {
  return (
    <section id="about" className="py-24 px-6 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10">
        <h2 className="text-4xl text-center text-primary mb-12 font-bold font-serif">
          מי אני – דיאנה רחמני
          <div className="h-1.5 w-24 bg-primary-light mx-auto mt-4 rounded-full"></div>
        </h2>
        <div className="bg-white p-12 rounded-3xl shadow-2xl text-xl leading-loose border border-gray-100">
          <p className="mb-8">
            <strong className="text-primary text-2xl">נולדתי בטהרן</strong>, בבית חולים יהודי, וגדלתי בשכונת מהלה, שם שררו יחסים טובים בין יהודים למוסלמים.
            בילדותי למדתי בבית הספר היהודי &quot;אליאנס אתהאד&quot;, ומאמא למדתי את האהבה למטבח הפרסי.
          </p>
          <div className="bg-primary/5 p-6 rounded-2xl mb-8 italic border-r-4 border-primary">
            &quot;המסע שהיה אמור להימשך יומיים נמשך כמעט חצי שנה. דרך הרים, גשרים וסיכונים אינסופיים – הגענו הביתה, לישראל.&quot;
          </div>
          <p>
            ב<strong className="text-primary">&quot;מאסטר שף&quot;</strong> הפכתי לכוכבת אהובה, אבל בלב עדיין נמצאת אשה שמאוהבת במטבח פרסי, בסיפורים ובאמונה.
            אני סבתא לתשעה נכדים, חולמת להעניק לעולם טעם עתיק, אמת, תקווה, והרבה מאוד אוכל.
          </p>
        </div>
      </div>
    </section>
  );
}
