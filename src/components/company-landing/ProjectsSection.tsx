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
  // Truncate description to 2 lines
  const truncateDescription = (text: string, maxLength: number = 120) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  return (
    <section id="projects" className="py-16 sm:py-20 px-4 sm:px-6 bg-secondary/30">
      <div className="container mx-auto">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Featured Projects</h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl sm:max-w-3xl mx-auto">
            Explore our latest successful projects and innovations
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects
            .slice()
            .sort((a: any, b: any) => (a?.order || 0) - (b?.order || 0))
            .map((project: any) => {
              const projectTitle =
                getFieldValue(project, "title", language) ||
                project?.name ||
                "Project";
              const projectDescription =
                getFieldValue(project, "description", language) ||
                project?.details ||
                "";
              const projectImage = project?.image || project?.imageUrl || project?.photo || project?.thumbnail;

              const handleCardClick = () => {
                onProjectClick(project);
              };

              const handleViewDetailsClick = (e: React.MouseEvent) => {
                e.stopPropagation();
                onProjectClick(project);
              };

              const shortDescription = truncateDescription(projectDescription);

              return (
                <div 
                  key={project._id || project.id || `project-${projectTitle}`} 
                  className="bg-card text-card-foreground rounded-xl overflow-hidden border border-border transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl hover:shadow-gold/20 cursor-pointer group flex flex-col"
                  onClick={handleCardClick}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleCardClick();
                    }
                  }}
                >
                  {/* 16:9 Image at the top */}
                  <div className="relative w-full aspect-video overflow-hidden bg-muted">
                    {projectImage ? (
                      <img 
                        src={projectImage} 
                        alt={projectTitle}
                        className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center">
                        <div className="w-16 h-16 bg-gold/20 rounded-lg" />
                      </div>
                    )}
                  </div>
                  
                  {/* Content Section */}
                  <div className="p-4 sm:p-6 flex flex-col flex-grow">
                    {/* Bold Project Title */}
                    <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-card-foreground leading-tight">
                      {projectTitle}
                    </h3>
                    
                    {/* Short Two-line Description */}
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 line-clamp-2 flex-grow">
                      {shortDescription}
                    </p>
                    
                    {/* View Details Button */}
                    <div className="mt-auto">
                      <button
                        onClick={handleViewDetailsClick}
                        className={`inline-flex items-center text-sm font-medium text-muted-foreground group-hover:text-gold transition-colors duration-300 ${language === 'ar' ? 'flex-row-reverse' : ''}`}
                      >
                        {language === 'en' ? 'View details' : 'عرض التفاصيل'}
                        <svg 
                          className={`w-4 h-4 transition-transform duration-300 ${language === 'en' ? 'ml-2 group-hover:translate-x-1' : 'mr-2 group-hover:-translate-x-1'} ${language === 'ar' ? 'rotate-180' : ''}`}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </section>
  );
};

