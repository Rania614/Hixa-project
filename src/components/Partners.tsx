import { useLandingStore } from '@/stores/landingStore';
import { useApp } from '@/context/AppContext';
import { useShallow } from 'zustand/react/shallow';
import React, { useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CompanyRegistrationModal } from '@/components/company-landing/modals/CompanyRegistrationModal';

export const Partners = () => {
  const { language } = useApp();
  const isAr = language === 'ar';
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  
  const { partners, loading } = useLandingStore(
    useShallow((state) => ({
      partners: state.partners,
      loading: state.loading,
    }))
  );
  
  if (loading || !partners || partners.length === 0) return null;
  
  const activePartners = partners.filter((partner: any) => partner.isActive !== false && partner.active !== false);

  const getPartnerName = (partner: any) => {
    if (isAr) return partner.name_ar || partner.name?.ar;
    return partner.name_en || partner.name?.en;
  };

  const handlePartnerClick = (link: string | undefined | null) => {
    if (link && link.trim() !== '' && link !== 'https://example.com') {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    // الخلفية أصبحت بيج فاتح جداً ومطفأ (درجة دافئة)
    <section id="partners" className="py-24 bg-[#F5F2ED] overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-6">
        
        <div className="text-center mb-16">
          <h2 className="text-4xl font-arabic font-bold text-[#1A1A1A] mb-4">
            {isAr ? 'شركاؤنا' : 'Our Partners'}
          </h2>
          <div className="w-20 h-1 bg-gold mx-auto mb-6"></div>
          
          {/* Join Hixa Button */}
          {/* <Button
            onClick={() => setIsRegistrationModalOpen(true)}
            className="bg-gold hover:bg-gold-dark text-black font-semibold px-8 py-6 text-lg"
          >
            {isAr ? 'انضم إلى Hixa' : 'Join Hixa'}
          </Button> */}
        </div>

        <div className="relative">
          {/* تدرج جانبي متوافق مع اللون البيج */}
          <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#F5F2ED] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-[#F5F2ED] to-transparent z-10 pointer-events-none"></div>

          <div 
            className="flex gap-8 animate-scroll-partners hover:pause-animation"
            style={{ width: 'max-content' }}
          >
            {[...activePartners, ...activePartners]
              .filter((partner: any) => {
                // Filter out partners without valid logo URLs to avoid 404 errors
                const logoUrl = partner.logoUrl || partner.logo;
                return logoUrl && logoUrl.trim() !== '' && 
                       (logoUrl.startsWith('http') || logoUrl.startsWith('data:') || logoUrl.startsWith('/'));
              })
              .map((partner: any, index: number) => {
              const partnerName = getPartnerName(partner);
              const logoUrl = partner.logoUrl || partner.logo;
              const hasLink = partner.link && partner.link !== 'https://example.com';
              
              return (
                <div 
                  key={`${partner._id}-${index}`}
                  onClick={() => handlePartnerClick(partner.link)}
                  className="w-[320px] group cursor-pointer"
                >
                  {/* الكارد أبيض دافئ بلمسة زجاجية */}
                  <div className="relative h-52 bg-white/60 backdrop-blur-md border border-[#E8E1D5] rounded-[32px] p-6 flex flex-col items-center justify-center transition-all duration-500 group-hover:bg-white/90 group-hover:shadow-[0_20px_50px_rgba(232,225,213,0.5)] overflow-hidden">
                    
                    {/* اللوجو الكبير (الألوان الأصلية) */}
                    <div className="h-28 w-full flex items-center justify-center transition-all duration-500 group-hover:scale-90 group-hover:opacity-10">
                      <img 
                        src={logoUrl} 
                        alt={partnerName} 
                        className="max-h-full max-w-[85%] object-contain transition-all duration-700" 
                        onError={(e) => { 
                          // Hide broken images silently to prevent 404 errors in console
                          const target = e.currentTarget;
                          target.style.display = 'none';
                          target.onerror = null; // Prevent infinite loop
                          // Optionally show placeholder
                          if (target.parentElement) {
                            target.parentElement.innerHTML = '<div class="text-muted-foreground text-sm">Logo unavailable</div>';
                          }
                        }}
                      />
                    </div>

                    {/* الهوفر الداكن الشفاف */}
                    <div className="absolute inset-0 bg-[#1A1A1A]/50 backdrop-blur-[2px] flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-400 p-4">
                      <p className="text-gold font-arabic font-bold text-2xl mb-2 text-center drop-shadow-lg">
                        {partnerName}
                      </p>
                      
                      {hasLink && (
                        <div className="flex items-center gap-2 text-white font-medium text-xs uppercase tracking-wider bg-gold/30 px-4 py-1.5 rounded-full border border-gold/40">
                          <span>{isAr ? 'زيارة الموقع' : 'Visit Website'}</span>
                          <ExternalLink size={14} className="text-gold" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scroll-partners {
          0% { transform: translateX(0); }
          100% { transform: translateX(${isAr ? '50%' : '-50%'}); }
        }
        .animate-scroll-partners {
          animation: scroll-partners 35s linear infinite;
        }
        .hover:pause-animation:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* Company Registration Modal */}
      <CompanyRegistrationModal
        open={isRegistrationModalOpen}
        onClose={() => setIsRegistrationModalOpen(false)}
        language={language}
      />
    </section>
  );
};