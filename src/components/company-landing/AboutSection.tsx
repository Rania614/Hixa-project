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
  activeTab: number;
  setActiveTab: (tab: number) => void;
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
  activeTab,
  setActiveTab,
}) => {
  return (
    <section id="about" className="py-8 sm:py-12 md:py-16 lg:py-20 px-4 sm:px-6 md:px-8 bg-secondary/30">
      <div className="mx-auto w-full max-w-full sm:max-w-[95%] md:max-w-[90%] lg:max-w-[95%] xl:max-w-[1800px] 2xl:max-w-[2000px]">
        {/* Split Layout: 50% Left (Title & Description) | 50% Right (Cards with Scroll) */}
        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12 min-h-[500px] sm:min-h-[600px] lg:h-[600px] xl:h-[700px] relative">
          {/* Left Side: Title and Description */}
          <div className={`w-full lg:w-1/2 flex flex-col justify-center ${language === 'ar' ? 'text-right items-end lg:pr-0' : 'text-left items-start'} space-y-4 sm:space-y-6 lg:space-y-8 py-4 sm:py-6 lg:py-0`}>
            <div className={`space-y-3 sm:space-y-4 lg:space-y-6 w-full ${language === 'ar' ? 'pr-0' : ''}`}>
              <h2 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-gold transition-all duration-300 ${language === 'ar' ? 'w-full' : ''}`}>
                {aboutTitle}
              </h2>
              <div className={`w-16 sm:w-20 h-0.5 sm:h-1 bg-gold rounded-full ${language === 'ar' ? 'ml-auto' : ''}`}></div>
              <p className={`text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground leading-relaxed ${language === 'ar' ? 'max-w-full w-full' : 'max-w-xl'}`}>
                {aboutSubtitle}
              </p>
            </div>
            
            {/* Decorative Elements */}
            <div className="hidden lg:block relative mt-4 lg:mt-8">
              <div className="absolute -top-4 -left-4 w-20 lg:w-24 h-20 lg:h-24 border-2 border-gold/30 rounded-full opacity-50"></div>
              <div className="absolute -bottom-4 -right-4 w-12 lg:w-16 h-12 lg:h-16 border-2 border-gold/20 rotate-45 opacity-50"></div>
            </div>
          </div>

          {/* Navigation Scroll Snap Indicators - Center Between Sections (Desktop) */}
          {aboutValues.length > 0 && (() => {
            const totalTabs = Math.ceil(aboutValues.length / 3);
            const maxTabs = Math.min(totalTabs, 2);
            if (maxTabs > 1) {
              return (
                <div className={`hidden lg:flex flex-col justify-center items-center gap-4 absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 ${language === 'ar' ? 'rotate-180' : ''}`}>
                  {Array.from({ length: maxTabs }, (_, tabIndex) => (
                    <button
                      key={tabIndex}
                      onClick={() => setActiveTab(tabIndex)}
                      className={`transition-all duration-300 rounded-full ${
                        activeTab === tabIndex
                          ? 'w-1.5 h-16 bg-gold shadow-lg shadow-gold/50'
                          : 'w-1 h-12 bg-gold/30 hover:bg-gold/50 hover:h-14'
                      }`}
                      aria-label={language === 'en' ? `Page ${tabIndex + 1}` : `صفحة ${tabIndex + 1}`}
                    />
                  ))}
                </div>
              );
            }
            return null;
          })()}

          {/* Right Side: Tabs with Cards Container */}
          <div className="w-full lg:w-1/2 relative min-h-[400px] sm:min-h-[500px] lg:min-h-0 flex flex-col">
            {/* Navigation Scroll Snap Indicators - Mobile (Top of Cards) */}
            {aboutValues.length > 0 && (() => {
              const totalTabs = Math.ceil(aboutValues.length / 3);
              const maxTabs = Math.min(totalTabs, 2);
              if (maxTabs > 1) {
                return (
                  <div className="flex lg:hidden justify-center gap-3 mb-4 sm:mb-6">
                    {Array.from({ length: maxTabs }, (_, tabIndex) => (
                      <button
                        key={tabIndex}
                        onClick={() => setActiveTab(tabIndex)}
                        className={`transition-all duration-300 rounded-full ${
                          activeTab === tabIndex
                            ? 'h-1.5 w-16 bg-gold shadow-lg shadow-gold/50'
                            : 'h-1 w-12 bg-gold/30 hover:bg-gold/50 hover:w-14'
                        }`}
                        aria-label={language === 'en' ? `Page ${tabIndex + 1}` : `صفحة ${tabIndex + 1}`}
                      />
                    ))}
                  </div>
                );
              }
              return null;
            })()}

            {/* Cards Container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-3 sm:space-y-4 md:space-y-5 lg:space-y-6">
                {aboutValues.length > 0 ? (
                  (() => {
                    // Split values into groups of 3 (reversed order)
                    const cardsPerTab = 3;
                    const totalTabs = Math.ceil(aboutValues.length / 3);
                    
                    // Reverse the order: tab 0 shows first 3, tab 1 shows last 3
                    let startIndex, endIndex;
                    if (activeTab === 0) {
                      // First tab shows last 3 cards
                      const lastIndex = aboutValues.length;
                      endIndex = lastIndex;
                      startIndex = Math.max(0, lastIndex - cardsPerTab);
                    } else {
                      // Second tab shows first 3 cards
                      startIndex = 0;
                      endIndex = cardsPerTab;
                    }
                    
                    const currentTabValues = aboutValues.slice(startIndex, endIndex);

                    return currentTabValues.map((value: any, localIndex: number) => {
                      const globalIndex = startIndex + localIndex;
                      const valueTitle =
                        getFieldValue(value, "title", language) ||
                        value?.name ||
                        `Value ${globalIndex + 1}`;
                      const valueDescription =
                        getFieldValue(value, "description", language) ||
                        value?.text ||
                        "";

                      return (
                        <div 
                          key={globalIndex} 
                          className={`bg-card text-card-foreground border-2 border-gold/30 rounded-xl p-3 sm:p-4 md:p-5 lg:p-6 transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-2xl hover:shadow-gold/30 hover:border-gold/60 hover:bg-card/90 cursor-pointer group flex flex-col relative overflow-hidden mx-auto ${expandedCardIndex === globalIndex ? 'min-h-auto' : 'min-h-[150px] sm:min-h-[170px] md:min-h-[190px]'}`}
                          style={{ width: 'calc(100% - 12px)' }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault();
                            }
                          }}
                        >
                          {/* Background Decorative Pattern */}
                          <div className="absolute top-0 right-0 w-20 sm:w-24 h-20 sm:h-24 opacity-5 pointer-events-none">
                            <div className="w-full h-full border-2 border-gold rounded-full"></div>
                          </div>
                          <div className="absolute bottom-0 left-0 w-12 sm:w-16 h-12 sm:h-16 opacity-5 pointer-events-none">
                            <div className="w-full h-full border-2 border-gold rotate-45"></div>
                          </div>

                          {/* Numbered Circle and Title */}
                          <div className="flex items-start gap-2.5 sm:gap-3 mb-2.5 sm:mb-3 md:mb-4 flex-shrink-0 relative z-10">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 bg-gradient-to-br from-gold to-gold-dark rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-gold/50 transition-all duration-300 relative">
                              <span className="text-black font-bold text-sm sm:text-base md:text-lg z-10">{globalIndex + 1}</span>
                              <div className="absolute inset-0 bg-gold rounded-full opacity-20 group-hover:opacity-40 transition-opacity duration-300 animate-pulse"></div>
                            </div>
                            <h3 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold leading-tight pt-0.5 sm:pt-1 flex-grow text-card-foreground group-hover:text-gold transition-colors duration-300">
                              {valueTitle}
                            </h3>
                          </div>
                          
                          {/* Description - Limited to 2 lines with Read More */}
                          <div className="relative z-10 flex-grow">
                            <p className={`text-muted-foreground text-xs sm:text-sm md:text-base leading-relaxed ${expandedCardIndex === globalIndex ? '' : 'line-clamp-2'}`}>
                              {valueDescription}
                            </p>
                            {valueDescription && valueDescription.length > 100 && (
                              <button
                                className="mt-2 sm:mt-3 text-gold hover:text-gold-dark text-xs sm:text-sm font-semibold transition-colors duration-300 flex items-center gap-2 group-hover:gap-3"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedCardIndex(expandedCardIndex === globalIndex ? null : globalIndex);
                                }}
                              >
                                {expandedCardIndex === globalIndex
                                  ? (language === 'en' ? 'Read Less' : 'اقرأ أقل')
                                  : (language === 'en' ? 'Read More' : 'اقرأ المزيد')}
                                <svg 
                                  className={`w-3 h-3 sm:w-4 sm:h-4 transition-transform duration-300 ${expandedCardIndex === globalIndex ? 'rotate-180' : ''} ${language === 'ar' ? 'rotate-180' : ''}`}
                                  fill="none" 
                                  stroke="currentColor" 
                                  viewBox="0 0 24 24"
                                >
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                            )}
                          </div>

                          {/* Hover Effect Border */}
                          <div className="absolute inset-0 border-2 border-transparent group-hover:border-gold/50 rounded-xl transition-all duration-300 pointer-events-none"></div>
                        </div>
                      );
                    });
                  })()
                ) : (
                  aboutDescription && (
                    <div className="glass-card p-6 sm:p-8 rounded-xl w-full border-2 border-gold/30">
                      <p className={`text-muted-foreground text-base sm:text-lg leading-relaxed ${language === 'ar' ? 'text-right' : 'text-left'}`}>{aboutDescription}</p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles - Hidden */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px;
          display: none;
        }
        .custom-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          display: none;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          display: none;
        }
      `}</style>
    </section>
  );
};

