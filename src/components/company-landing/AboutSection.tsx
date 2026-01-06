import React from "react";

interface AboutSectionProps {
  aboutTitle: string;
  aboutSubtitle: string;
  aboutDescription?: string;
  aboutValues: any[];
  language: "en" | "ar";
  getFieldValue: (entity: any, field: string, lang: "en" | "ar") => string | undefined;
  expandedCardIndex: number | null;
  setExpandedCardIndex: (index: number | null) => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({
  aboutTitle,
  aboutSubtitle,
  aboutDescription,
  aboutValues,
  language,
  getFieldValue,
  expandedCardIndex,
  setExpandedCardIndex,
}) => {
  const isAr = language === "ar";

  return (
    // الخلفية بيج فاتح (تعطي مساحة البياض والثقة)
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
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          dir={isAr ? "rtl" : "ltr"}
        >
          {aboutValues.map((value: any, index: number) => {
            const valueTitle = getFieldValue(value, "title", language) || value?.name || `Value ${index + 1}`;
            const valueDescription = getFieldValue(value, "description", language) || value?.text || "";
            const isExpanded = expandedCardIndex === index;

            return (
              <div
                key={index}
                className="group relative bg-[#111111] border border-gray-800 rounded-2xl p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-gold/10 hover:-translate-y-2 flex flex-col h-full"
              >
                {/* Number Circle and Title */}
                <div className="flex items-center gap-4 mb-6 relative">
                  <div className="w-12 h-12 rounded-full bg-gold flex items-center justify-center flex-shrink-0 shadow-[0_0_20px_rgba(212,175,55,0.2)] group-hover:scale-110 transition-transform duration-300">
                    <span className="text-black font-black text-xl">{index + 1}</span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-gold transition-colors duration-300">
                    {valueTitle}
                  </h3>
                </div>

                {/* Description Text */}
                <div className="flex-grow">
                  <p className={`text-gray-400 text-sm sm:text-base leading-relaxed transition-all duration-300 ${!isExpanded ? 'line-clamp-3' : ''}`}>
                    {valueDescription}
                  </p>
                </div>

                {/* Read More Button */}
                {valueDescription && valueDescription.length > 80 && (
                  <button
                    onClick={() => setExpandedCardIndex(isExpanded ? null : index)}
                    className="mt-6 text-gold text-sm font-bold flex items-center gap-2 hover:gap-3 transition-all duration-300 group/btn"
                  >
                    <span>{isExpanded ? (isAr ? 'عرض أقل' : 'Read Less') : (isAr ? 'اقرأ المزيد' : 'Read More')}</span>
                    <svg 
                      className={`w-4 h-4 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''} ${isAr && !isExpanded ? 'rotate-180' : ''}`} 
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
                
                {/* Hover Glow Effect */}
                <div className="absolute inset-0 border border-gold/0 group-hover:border-gold/30 rounded-2xl transition-all duration-500 pointer-events-none"></div>
              </div>
            );
          })}
        </div>

        {/* Fallback for empty values */}
        {aboutValues.length === 0 && aboutDescription && (
          <div className="text-center p-12 bg-white/50 backdrop-blur-sm border border-gray-200 rounded-3xl mt-12">
            <p className="text-gray-600 italic text-lg">{aboutDescription}</p>
          </div>
        )}
      </div>
    </section>
  );
};