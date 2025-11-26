import { useLandingStore } from '@/stores/landingStore';
import { useApp } from '@/context/AppContext';
import { useShallow } from 'zustand/react/shallow';
import { Button } from './ui/button';
import { ChevronRight } from 'lucide-react';

export const Jobs = () => {
  const { language } = useApp();
  const { jobs, loading } = useLandingStore(
    useShallow((state) => ({
      jobs: state.jobs,
      loading: state.loading,
    }))
  );
  
  // Render nothing if content is not loaded yet
  if (loading || !jobs || jobs.length === 0) {
    return null;
  }
  
  // Filter active jobs and handle both isActive and status fields
  const activeJobs = jobs.filter((job: any) => 
    (job.isActive !== false && job.active !== false) || job.status === 'active'
  );

  const getJobTitle = (job: any) => {
    if (job.title_en && language === 'en') return job.title_en;
    if (job.title_ar && language === 'ar') return job.title_ar;
    if (job.title?.[language]) return job.title[language];
    return job.title_en || job.title_ar || job.title?.en || 'Job';
  };

  const getJobDescription = (job: any) => {
    if (job.description_en && language === 'en') return job.description_en;
    if (job.description_ar && language === 'ar') return job.description_ar;
    if (job.description?.[language]) return job.description[language];
    return job.description_en || job.description_ar || job.description?.en || '';
  };

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
            {activeJobs.map((job: any) => {
              const jobId = job._id || job.id;
              const jobTitle = getJobTitle(job);
              const jobDescription = getJobDescription(job);
              const applicationLink = job.link || job.applicationLink;
              
              return (
                <div key={jobId} className="glass-card p-8 rounded-xl">
                  <h3 className="text-2xl font-bold mb-4">{jobTitle}</h3>
                  <p className="text-muted-foreground mb-4">
                    {jobDescription}
                  </p>
                  {applicationLink && (
                    <Button 
                      variant="link" 
                      className="p-0 text-gold hover:text-gold-dark"
                      onClick={() => handleApply(jobId, applicationLink)}
                    >
                      {language === 'en' ? 'Apply Now' : 'تقدم الآن'}
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
  );
};