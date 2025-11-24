import { useApp } from '@/context/AppContext';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { HexagonIcon } from './ui/hexagon-icon';
import { ChevronRight } from 'lucide-react';

export const Jobs = () => {
  const { content, language } = useApp();
  const activeJobs = content.jobs.filter(job => job.status === 'active');

  const handleApply = (jobId: string, applicationLink?: string) => {
    if (applicationLink) {
      window.open(applicationLink, '_blank');
    } else {
      // Default behavior if no link is provided
      console.log(`Apply for job ${jobId}`);
      // You can implement default application logic here
    }
  };

  return (
     <section id="jobs" className="py-20 px-6 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{language === 'en' ? 'Jobs' : 'الوظائف'}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {language === 'en' 
                ? 'Join our team of talented professionals.' 
                : 'انضم إلى فريقنا من المحترفين الموهوبين.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {activeJobs.map((job) => (
              <div key={job.id} className="glass-card p-8 rounded-xl">
                <h3 className="text-2xl font-bold mb-4">{job.title[language]}</h3>
                <p className="text-muted-foreground mb-4">
                  {job.description[language]}
                </p>
                <Button 
                  variant="link" 
                  className="p-0 text-gold hover:text-gold-dark"
                  onClick={() => handleApply(job.id, job.applicationLink)}
                >
                  {language === 'en' ? 'Apply Now' : 'تقدم الآن'}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

  );
};