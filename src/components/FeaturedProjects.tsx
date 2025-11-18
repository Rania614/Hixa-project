import { useApp } from '@/context/AppContext';
import { Card, CardContent } from './ui/card';

export const FeaturedProjects = () => {
  const { content, language } = useApp();
  const sortedProjects = [...content.projects].sort((a, b) => a.order - b.order);

  return (
    <section id="projects" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {language === 'en' ? 'Featured Projects' : 'المشاريع المميزة'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {language === 'en'
              ? 'Discover our latest work and success stories'
              : 'اكتشف أحدث أعمالنا وقصص نجاحنا'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sortedProjects.map((project, index) => (
            <Card
              key={project.id}
              className="glass-card overflow-hidden group hover:border-gold/50 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="relative h-48 bg-muted overflow-hidden">
                <img
                  src={project.image}
                  alt={project.title[language]}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              </div>
              <CardContent className="p-6">
                <h3 className="text-2xl font-bold mb-2">
                  {project.title[language]}
                </h3>
                <p className="text-muted-foreground">
                  {project.description[language]}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
