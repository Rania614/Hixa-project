import { useApp } from '@/context/AppContext';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { HexagonIcon } from './ui/hexagon-icon';

export const Jobs = () => {
  const { content, language } = useApp();
  const activeJobs = content.jobs.filter(job => job.status === 'active');

  return (
    <section id="jobs" className="py-24">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {language === 'en' ? 'Join Our Team' : 'انضم إلى فريقنا'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {language === 'en' 
              ? 'Explore career opportunities with our innovative company' 
              : 'استكشف فرص العمل مع شركتنا المبتكرة'}
          </p>
        </div>

        {activeJobs.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeJobs.map((job, index) => (
              <Card
                key={job.id}
                className="glass-card hover:border-gold/50 transition-all duration-300 group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="mb-4">
                    <HexagonIcon size="md" className="text-gold mb-3">
                      <div className="w-6 h-6 flex items-center justify-center text-xs font-bold">
                        {job.title[language].charAt(0)}
                      </div>
                    </HexagonIcon>
                    <h3 className="text-xl font-bold mb-2">
                      {job.title[language]}
                    </h3>
                    <p className="text-muted-foreground">
                      {job.description[language]}
                    </p>
                  </div>
                  <Button className="w-full bg-gradient-to-r from-gold-light to-gold hover:from-gold hover:to-gold-dark text-primary-foreground font-semibold">
                    {language === 'en' ? 'Apply Now' : 'تقدم الآن'}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'No job openings available at the moment. Check back later!' 
                : 'لا توجد وظائف شاغرة في الوقت الحالي. تحقق لاحقًا!'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};