import { useLandingStore } from '@/stores/landingStore';
import { useApp } from '@/context/AppContext';
import { useShallow } from 'zustand/react/shallow';

export const Partners = () => {
  const { language } = useApp();
  const { partners, loading } = useLandingStore(
    useShallow((state) => ({
      partners: state.partners,
      loading: state.loading,
    }))
  );
  
  // Render nothing if content is not loaded yet
  if (loading || !partners || partners.length === 0) {
    return null;
  }
  
  // Filter active partners and handle both name_en/name_ar and name: { en, ar } structures
  const activePartners = partners.filter((partner: any) => partner.isActive !== false && partner.active !== false);

  const getPartnerName = (partner: any) => {
    if (partner.name_en && language === 'en') return partner.name_en;
    if (partner.name_ar && language === 'ar') return partner.name_ar;
    if (partner.name?.[language]) return partner.name[language];
    return partner.name_en || partner.name_ar || partner.name?.en || 'Partner';
  };

  const getValidLogoUrl = (logo: string | undefined | null) => {
    if (!logo || logo.trim() === '') return '/placeholder.svg';
    
    const trimmedLogo = logo.trim();
    
    // FIRST: Check if it looks like a placeholder or invalid value (before any other checks)
    const invalidPatterns = [
      'existing-logo',
      'placeholder',
      'example.com',
    ];
    
    const isInvalid = invalidPatterns.some(pattern => 
      trimmedLogo.toLowerCase().includes(pattern.toLowerCase())
    );
    
    if (isInvalid) {
      return '/placeholder.svg';
    }
    
    // Check if it's a valid URL (starts with http:// or https://)
    if (trimmedLogo.startsWith('http://') || trimmedLogo.startsWith('https://')) {
      return trimmedLogo;
    }
    
    // Check if it's a data URL (base64)
    if (trimmedLogo.startsWith('data:')) {
      return trimmedLogo;
    }
    
    // If it's a relative path starting with /, use it
    if (trimmedLogo.startsWith('/')) {
      return trimmedLogo;
    }
    
    // If it's just a filename without path (like "existing-logo.png"), it's invalid
    // This catches any string that doesn't start with http://, https://, /, or data:
    // It's likely just a filename, not a valid URL
    return '/placeholder.svg';
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    e.currentTarget.src = '/placeholder.svg';
  };

  return (
    <section id="partners" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{language === 'en' ? 'Partners' : 'الشركاء'}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {language === 'en' 
                ? 'We collaborate with industry leaders to deliver exceptional results.' 
                : 'نتعاون مع قادة الصناعة لتقديم نتائج استثنائية.'}
            </p>
          </div>
          <div className="relative overflow-hidden">
            {/* Smooth Sliding Container */}
            <div 
              className="flex gap-8 lg:gap-12"
              style={{
                animation: `scroll-partners ${Math.max(activePartners.length * 2, 20)}s linear infinite`,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.animationPlayState = 'paused';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.animationPlayState = 'running';
              }}
            >
              {/* First set of partners */}
              {activePartners.map((partner: any) => {
                const partnerId = partner._id || partner.id;
                const partnerName = getPartnerName(partner);
                const logoUrl = getValidLogoUrl(partner.logo);
                
                return (
                  <div key={partnerId} className="flex-shrink-0">
                    <div className="hexagon w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 bg-card p-4 sm:p-5 lg:p-6 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-card/80 hover:shadow-lg hover:shadow-gold/20 group overflow-hidden">
                      <img 
                        src={logoUrl} 
                        alt={partnerName} 
                        className="w-full h-full object-contain hexagon"
                        onError={handleImageError}
                      />
                    </div>
                  </div>
                );
              })}
              {/* Duplicate set for seamless loop */}
              {activePartners.map((partner: any) => {
                const partnerId = `duplicate-${partner._id || partner.id}`;
                const partnerName = getPartnerName(partner);
                const logoUrl = getValidLogoUrl(partner.logo);
                
                return (
                  <div key={partnerId} className="flex-shrink-0">
                    <div className="hexagon w-32 h-32 sm:w-36 sm:h-36 lg:w-40 lg:h-40 bg-card p-4 sm:p-5 lg:p-6 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:bg-card/80 hover:shadow-lg hover:shadow-gold/20 group overflow-hidden">
                      <img 
                        src={logoUrl} 
                        alt={partnerName} 
                        className="w-full h-full object-contain hexagon"
                        onError={handleImageError}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
        </div>
      </section>
  );
};