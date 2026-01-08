import React, { useState } from "react";

interface AboutSectionProps {
  aboutTitle: string;
  aboutSubtitle: string;
  aboutDescription?: string;
  aboutValues: any[];
  language: "en" | "ar";
  getFieldValue: (entity: any, field: string, lang: "en" | "ar") => string | undefined;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  aboutTitle,
  aboutSubtitle,
  aboutDescription,
  aboutValues,
  language,
  getFieldValue,
}) => {
  const isAr = language === "ar";

  // حالة مستقلة لكل كارت
  const [expandedStates, setExpandedStates] = useState<Record<number, boolean>>({});

  const toggleCard = (index: number) => {
    setExpandedStates((prev) => ({
      ...prev,
      [index]: !prev[index], 
    }));
  };

  return (
    <section id="about" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#FDFBF7] text-[#1a1a1a] overflow-hidden">
      <div className="mx-auto max-w-7xl">
        
        {/* Header Section */}
        <div className="text-center mb-16 sm:mb-20 space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1a1a1a] mb-4">
            {aboutTitle}
          </h2>
          <div className="w-24 h-1.5 bg-gold mx-auto rounded-full"></div>
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-gray-600 leading-relaxed px-4">
            {aboutSubtitle}
          </p>
        </div>

        {/* Values Grid */}
        {/* items-start هي المسؤولة عن منع الكروت الأخرى من التمدد إجبارياً */}
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start" 
          dir={isAr ? "rtl" : "ltr"}
        >
          {aboutValues.map((value: any, index: number) => {
            const valueTitle = getFieldValue(value, "title", language) || value?.name || `Value ${index + 1}`;
            const valueDescription = getFieldValue(value, "description", language) || value?.text || "";
            const isExpanded = !!expandedStates[index];

            return (
              <div
                key={index}
                className={`group relative bg-[#111111] border border-gray-800 rounded-[2rem] p-8 transition-all duration-500 hover:shadow-2xl flex flex-col 
                  ${isExpanded ? 'h-fit ring-2 ring-gold/20' : 'h-auto min-h-[280px]'}`}
              >
                {/* Number and Title */}
                <div className="flex items-center gap-4 mb-6 relative">
                  <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-black font-black text-xl">{index + 1}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-gold transition-colors">
                    {valueTitle}
                  </h3>
                </div>

                {/* Description Text */}
                <div className="flex-grow">
                  <p className={`text-gray-400 text-sm sm:text-base leading-relaxed transition-all duration-500
                    ${!isExpanded ? 'line-clamp-3' : 'line-clamp-none'}`}>
                    {valueDescription}
                  </p>
                </div>

                {/* Toggle Button */}
                {valueDescription && valueDescription.length > 80 && (
                  <button
                    onClick={() => toggleCard(index)}
                    className="mt-6 text-gold text-sm font-bold flex items-center gap-2 hover:text-white transition-all w-fit"
                  >
                    <span>{isExpanded ? (isAr ? 'عرض أقل' : 'Show Less') : (isAr ? 'اقرأ المزيد' : 'Read More')}</span>
                    <svg 
                      className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} 
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
                
                {/* Glow Overlay */}
                <div className="absolute inset-0 border border-gold/0 group-hover:border-gold/10 rounded-[2rem] pointer-events-none"></div>
              </div>
            );
          })}
        </div>

        {/* Fallback */}
        {aboutValues.length === 0 && aboutDescription && (
          <div className="text-center p-12 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-3xl mt-12">
            <p className="text-gray-600 italic text-lg">{aboutDescription}</p>
          </div>
        )}
      </div>
    </section>
  );
};