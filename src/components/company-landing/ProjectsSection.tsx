import React from "react";

interface ProjectsSectionProps {
  projects: any[];
  language: "en" | "ar";
  getFieldValue: (entity: any, field: string, lang: "en" | "ar") => string | undefined;
  onProjectClick: (project: any) => void;
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({
  projects,
  language,
  getFieldValue,
  onProjectClick,
}) => {
  const isAr = language === "ar";

  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <section id="projects" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#FDFBF7] overflow-hidden">
      {/* تم توسيع الحاوية جداً هنا لتسمح للكاردات الـ 3 بأن تكون أعرض */}
      <div className="mx-auto max-w-[1440px]"> 
        
        {/* Header Section */}
        <div className="text-center mb-16 sm:mb-20 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1a1a1a]">
            {isAr ? "مشاريعنا المميزة" : "Featured Projects"}
          </h2>
          <div className="w-24 h-1.5 bg-gold mx-auto rounded-full"></div>
          <p className="max-w-2xl mx-auto text-base sm:text-lg text-gray-600 leading-relaxed">
            {isAr 
              ? "استكشف أحدث مشاريعنا الناجحة والابتكارات التي نفخر بها" 
              : "Explore our latest successful projects and innovations"}
          </p>
        </div>

        {/* Projects Grid - 3 Columns with wider container */}
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-10 items-start" 
          dir={isAr ? "rtl" : "ltr"}
        >
          {projects
            .slice()
            .sort((a: any, b: any) => (a?.order || 0) - (b?.order || 0))
            .map((project: any) => {
              const projectTitle = getFieldValue(project, "title", language) || project?.name || "Project";
              const projectDescription = getFieldValue(project, "description", language) || project?.details || "";
              const projectImage = project?.image || project?.imageUrl || project?.photo || project?.thumbnail;
              const shortDescription = truncateDescription(projectDescription);

              return (
                <div 
                  key={project._id || project.id || `project-${projectTitle}`} 
                  className="group relative bg-[#111111] border border-gray-800 rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-gold/10 hover:-translate-y-2 flex flex-col h-full cursor-pointer"
                  onClick={() => onProjectClick(project)}
                >
                  {/* Image Container */}
                  <div className="relative w-full aspect-video overflow-hidden">
                    {projectImage ? (
                      <img 
                        src={projectImage} 
                        alt={projectTitle}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                        <div className="w-12 h-12 bg-gold/10 rounded-full animate-pulse" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-60" />
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-6 sm:p-8 flex flex-col flex-grow">
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 text-white group-hover:text-gold transition-colors duration-300 leading-tight">
                      {projectTitle}
                    </h3>
                    
                    <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-6 line-clamp-2 flex-grow">
                      {shortDescription}
                    </p>
                    
                    {/* View Details Button */}
                    <div className="mt-auto pt-4 border-t border-white/5">
                      <button
                        className="inline-flex items-center text-sm font-bold text-gold group-hover:text-white transition-all duration-300 gap-2"
                      >
                        <span className="uppercase tracking-widest text-[10px]">
                          {isAr ? 'عرض التفاصيل' : 'View details'}
                        </span>
                        <svg 
                          className={`w-4 h-4 transition-transform duration-300 ${isAr ? 'rotate-180 group-hover:-translate-x-2' : 'group-hover:translate-x-2'}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Hover Glow */}
                  <div className="absolute inset-0 border border-gold/0 group-hover:border-gold/20 rounded-[2rem] pointer-events-none transition-all duration-500"></div>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
};