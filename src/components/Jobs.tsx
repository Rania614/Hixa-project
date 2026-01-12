import { useLandingStore } from '@/stores/landingStore';
import { useApp } from '@/context/AppContext';
import { useShallow } from 'zustand/react/shallow';
import { Button } from './ui/button';
import { ChevronRight, ChevronLeft, Briefcase } from 'lucide-react';
import { useState } from 'react';

export const Jobs = () => {
  const { language } = useApp();
  const isAr = language === 'ar';
  
  const { jobs, loading } = useLandingStore(
    useShallow((state) => ({
      jobs: state.jobs,
      loading: state.loading,
    }))
  );

  // حالة للتحكم في توسيع الوصف لكل وظيفة بشكل مستقل
  const [expandedJobs, setExpandedJobs] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedJobs(prev => ({ ...prev, [id]: !prev[id] }));
  };
  
  if (loading || !jobs || jobs.length === 0) return null;
  
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
    }
  };

  return (
    <section id="jobs" className="py-16 sm:py-24 px-4 sm:px-6 bg-[#FDFBF7] overflow-hidden">
      <div className="container mx-auto max-w-7xl">
        
        {/* Header Section */}
        <div className="text-center mb-16 sm:mb-20 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1a1a1a]">
            {isAr ? 'الوظائف المتاحة' : 'Current Openings'}
          </h2>
          <div className="w-24 h-1.5 bg-gold mx-auto rounded-full"></div>
          <p className="max-w-3xl mx-auto text-base sm:text-lg text-gray-600 leading-relaxed">
            {isAr 
              ? 'انضم إلى فريقنا من المحترفين الموهوبين وساهم في بناء المستقبل.' 
              : 'Join our team of talented professionals and help us build the future.'}
          </p>
        </div>

        {/* Jobs Grid */}
        <div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start" 
          dir={isAr ? 'rtl' : 'ltr'}
        >
          {activeJobs.map((job: any) => {
            const jobId = job._id || job.id;
            const jobTitle = getJobTitle(job);
            const jobDescription = getJobDescription(job);
            const applicationLink = job.link || job.applicationLink;
            const isExpanded = !!expandedJobs[jobId];
            
            return (
              <div 
                key={jobId} 
                className={`group relative bg-[#111111] border border-gray-800 rounded-[2rem] p-8 transition-all duration-500 hover:shadow-2xl hover:shadow-gold/10 flex flex-col
                  ${isExpanded ? 'h-auto' : 'min-h-[300px] h-full'}`}
              >
                {/* Job Icon & Title */}
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-gold/10 flex items-center justify-center shrink-0 group-hover:bg-gold transition-colors duration-300">
                    <Briefcase className="text-gold group-hover:text-black w-6 h-6" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-white leading-tight group-hover:text-gold transition-colors">
                    {jobTitle}
                  </h3>
                </div>

                {/* Description Text */}
                <div className="flex-grow">
                  <p className={`text-gray-400 text-sm sm:text-base leading-relaxed mb-4 transition-all duration-500
                    ${!isExpanded ? 'line-clamp-3' : 'line-clamp-none'}`}>
                    {jobDescription}
                  </p>
                  
                  {jobDescription.length > 100 && (
                    <button 
                      onClick={() => toggleExpand(jobId)}
                      className="text-gold/80 hover:text-gold text-xs font-bold uppercase tracking-widest mb-6 transition-all border-b border-gold/20 hover:border-gold pb-0.5"
                    >
                      {isExpanded ? (isAr ? 'عرض أقل' : 'Show Less') : (isAr ? 'إقرأ المزيد' : 'Read More')}
                    </button>
                  )}
                </div>

                {/* Action Button */}
                <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                  {applicationLink ? (
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-gold hover:text-white transition-all duration-300 font-bold flex items-center gap-2 group/btn"
                      onClick={() => handleApply(jobId, applicationLink)}
                    >
                      <span className="text-sm uppercase tracking-wider">{isAr ? 'تقدم الآن' : 'Apply Now'}</span>
                      {isAr ? 
                        <ChevronLeft className="w-4 h-4 transition-transform group-hover/btn:-translate-x-2" /> : 
                        <ChevronRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-2" />
                      }
                    </Button>
                  ) : (
                    <span className="text-gray-600 text-xs italic">{isAr ? 'التقديم مغلق حالياً' : 'Applications closed'}</span>
                  )}
                  
                
                </div>

                {/* Hover Glow */}
                <div className="absolute inset-0 border border-gold/0 group-hover:border-gold/20 rounded-[2rem] pointer-events-none transition-all duration-500" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};