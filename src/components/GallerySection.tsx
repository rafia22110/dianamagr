import { ImageRecord } from "@/types/image";

const PLACEHOLDER_ITEMS = [0, 1, 2, 3, 4, 5];

export default function GallerySection({ images }: { images: ImageRecord[] }) {
  return (
    <div className="max-w-7xl mx-auto overflow-hidden">
      <div className="text-center mb-16">
        <h2 className="text-4xl font-serif text-primary font-bold mb-4">גלריית תמונות - מסע חיים</h2>
        <p className="text-gray-600 text-lg">מטהרן לישראל - סיפור של תקווה ואמונה</p>
        <div className="h-1 w-20 bg-primary-light mx-auto mt-4 rounded-full"></div>
      </div>

      <div className="relative group">
        <div className="flex overflow-x-auto pb-12 gap-6 snap-x snap-mandatory no-scrollbar cursor-grab active:cursor-grabbing scroll-smooth px-4 lg:px-0">
          {images.length > 0 ? (
            images.map((img) => (
              <div
                key={img.id}
                className="flex-none w-[300px] md:w-[450px] aspect-[4/3] relative rounded-3xl overflow-hidden snap-center shadow-xl group/item"
              >
                <img
                  src={img.url}
                  alt={img.alt_text || "דיאנה רחמני"}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/item:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-8">
                  <p className="text-white text-xl font-bold">{img.alt_text || "מסע חיים"}</p>
                </div>
              </div>
            ))
          ) : (
            PLACEHOLDER_ITEMS.map((_, i) => (
              <div
                key={i}
                className="flex-none w-[300px] md:w-[450px] aspect-[4/3] bg-gradient-to-br from-[#f0e6d2] to-[#d4c3a3] rounded-3xl flex items-center justify-center snap-center"
              >
                <div className="text-primary/40 text-center p-6">
                   <p className="text-4xl mb-2">📸</p>
                   <p className="font-bold">העלו תמונות בפאנל הניהול</p>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Simple Side Gradients for indication */}
        <div className="absolute top-0 left-0 h-full w-20 bg-gradient-to-r from-white to-transparent pointer-events-none hidden lg:block"></div>
        <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-white to-transparent pointer-events-none hidden lg:block"></div>
      </div>
      
      <div className="text-center mt-10">
         <p className="text-primary-light animate-pulse font-bold">← גללו לצפייה במסע ←</p>
      </div>
    </div>
  );
}
