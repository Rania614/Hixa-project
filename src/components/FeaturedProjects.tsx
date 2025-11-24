import { useApp } from '@/context/AppContext';
import { Card, CardContent } from './ui/card';

export const FeaturedProjects = () => {
  const { content, language } = useApp();
  // Filter projects that are active or don't have an active property (default to true)
  const activeProjects = content.projects.filter(project => project.active !== false);
  const sortedProjects = [...activeProjects].sort((a, b) => a.order - b.order);

  // Define background colors for the project cards
  const getProjectBackground = (index: number) => {
    const backgrounds = [
      'from-gold/20 to-gold/10',
      'from-cyan/20 to-cyan/10',
      'from-gold/20 to-cyan/10'
    ];
    const colors = [
      'bg-gold',
      'bg-cyan',
      'bg-gradient-to-r from-gold to-cyan'
    ];
    return {
      background: backgrounds[index % backgrounds.length],
      color: colors[index % colors.length]
    };
  };

  return (
    <section id="projects" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{language === 'en' ? 'Projects' : 'المشاريع'}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {language === 'en' 
                ? 'Explore our portfolio of successful projects.' 
                : 'استكشف محفظتنا من المشاريع الناجحة.'}
            </p>
          </div>
          <div className="relative">
            <div className="flex overflow-x-auto gap-8 pb-4 scrollbar-hide">
              {sortedProjects.map((project, index) => {
                const { background, color } = getProjectBackground(index);
                return (
                  <div key={project.id} className="flex-shrink-0 w-80 md:w-96">
                    <div className="glass-card rounded-xl overflow-hidden h-full">
                      <div className={`h-48 bg-gradient-to-r ${background} flex items-center justify-center`}>
                        <div className={`w-16 h-16 ${color} rounded-full flex items-center justify-center`}>
                          <span className="text-primary-foreground font-bold text-2xl">
                            P{index + 1}
                          </span>
                        </div>
                      </div>
                      <div className="p-8">
                        <h3 className="text-2xl font-bold mb-4">{project.title[language]}</h3>
                        <p className="text-muted-foreground mb-6">
                          {project.description[language]}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {/* Gradient overlays for scroll indication */}
            <div className="absolute top-0 left-0 bottom-4 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
            <div className="absolute top-0 right-0 bottom-4 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
          </div>
        </div>
      </section>
  );
};