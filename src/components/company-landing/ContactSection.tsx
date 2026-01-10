import React from "react";
import { Instagram, MessageCircle, Twitter, Send, Facebook, Linkedin, Phone, MapPin } from "lucide-react";

interface ContactSectionProps {
  language: "en" | "ar";
  cta?: {
    title_en?: string;
    title_ar?: string;
    subtitle_en?: string;
    subtitle_ar?: string;
    buttonText_en?: string;
    buttonText_ar?: string;
    buttonLink?: string;
    location_en?: string;
    location_ar?: string;
    phone?: string;
    social?: Array<{ name?: string; url?: string; icon?: string }>;
  } | null;
}

// Icon mapping for social media
// Supported icon names: instagram, whatsapp, twitter, telegram, facebook, linkedin
const iconMap: { [key: string]: React.ComponentType<any> } = {
  instagram: Instagram,
  whatsapp: MessageCircle,
  twitter: Twitter,
  telegram: Send,
  facebook: Facebook,
  linkedin: Linkedin,
  // Alternative names
  'whats-app': MessageCircle,
  'whats app': MessageCircle,
  'ig': Instagram,
  'fb': Facebook,
  'li': Linkedin,
  'x': Twitter,
};

export const ContactSection: React.FC<ContactSectionProps> = ({ language, cta }) => {
  const isAr = language === 'ar';

  // Get field value helper
  const getFieldValue = (field: any, lang: string) => {
    if (typeof field === 'string') return field;
    if (typeof field === 'object' && field) {
      return field[lang] || field['en'] || '';
    }
    return '';
  };

  // Get CTA data with fallbacks - use correct language
  const title = isAr 
    ? (cta?.title_ar || cta?.title_en || 'نصنع مستقبلاً هندسياً مختلفاً')
    : (cta?.title_en || cta?.title_ar || 'Engineering a Different Future');
  const subtitle = isAr 
    ? (cta?.subtitle_ar || cta?.subtitle_en || 'سواء كنت تبحث عن استشارة أو ترغب في بدء مشروع جديد، فريقنا مستعد للإجابة.')
    : (cta?.subtitle_en || cta?.subtitle_ar || 'Whether you are looking for a consultation or want to start a new project, our team is ready.');
  const buttonText = isAr 
    ? (cta?.buttonText_ar || cta?.buttonText_en || 'ابدأ مشروعك الآن')
    : (cta?.buttonText_en || cta?.buttonText_ar || 'Start Your Project');
  const buttonLink = cta?.buttonLink || 'https://chat.whatsapp.com/LQrlGeLPOFjGlhN7d1Tl52';
  const location = isAr 
    ? (cta?.location_ar || cta?.location_en || 'المملكة العربية السعودية')
    : (cta?.location_en || cta?.location_ar || 'Saudi Arabia');
  const phoneNumber = cta?.phone || '+966 50 413 1885';

  // Build social links from CTA data or use defaults
  const socialLinks = React.useMemo(() => {
    console.log('🔍 ContactSection - CTA data:', cta);
    console.log('🔍 ContactSection - CTA social:', cta?.social);
    console.log('🔍 ContactSection - Is social array?', Array.isArray(cta?.social));
    console.log('🔍 ContactSection - Social length:', Array.isArray(cta?.social) ? cta.social.length : 0);
    
    if (Array.isArray(cta?.social) && cta.social.length > 0) {
      const filtered = cta.social.filter(s => s.url && s.url.trim() !== '');
      console.log('🔍 ContactSection - Filtered social links:', filtered);
      
      const mapped = filtered.map(s => {
        // Try icon field first, then name field, normalize to lowercase and trim
        const iconName = (s.icon || s.name || 'whatsapp').toLowerCase().trim().replace(/\s+/g, '-');
        const IconComponent = iconMap[iconName] || MessageCircle; // Default to WhatsApp icon
        console.log('🔍 ContactSection - Mapping:', { iconName, hasIcon: !!iconMap[iconName], url: s.url });
        return {
          icon: IconComponent,
          href: s.url || '#',
          name: s.name || iconName,
        };
      });
      
      console.log('🔍 ContactSection - Final mapped links:', mapped);
      return mapped;
    }
    
    console.log('⚠️ ContactSection - No social links in CTA, using defaults');
    // Default social links (only shown if no social links in CTA data)
    return [
      { icon: Instagram, href: "https://www.instagram.com/hixa_groups", name: 'Instagram' },
      { icon: MessageCircle, href: "https://chat.whatsapp.com/LQrlGeLPOFjGlhN7d1Tl52", name: 'WhatsApp' },
      { icon: Twitter, href: "https://x.com/HIXAGroup", name: 'Twitter' },
      { icon: Send, href: "https://t.me/projectsco", name: 'Telegram' },
      { icon: Facebook, href: "https://www.facebook.com/HIXAGroup", name: 'Facebook' },
      { icon: Linkedin, href: "https://www.linkedin.com/company/hixagroup", name: 'LinkedIn' }
    ];
  }, [cta?.social]);

  return (
    // الخلفية الخارجية: بيج فاتح ليعطي مساحة بياض وثقة للموقع
    <section id="contact" className="py-20 bg-[#FDFBF7] overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        
        {/* الحاوية الرئيسية بظل ناعم جداً لتبدو طافية فوق الخلفية البيج */}
        <div className="flex flex-col lg:flex-row items-stretch rounded-[40px] overflow-hidden shadow-[0_30px_60px_rgba(0,0,0,0.06)] border border-gray-100">
          
          {/* الجزء الأسود الفخم (اليسار/اليمين حسب اللغة) */}
          <div className="lg:w-2/5 bg-[#0A0A0A] p-12 md:p-16 flex flex-col justify-between relative overflow-hidden">
            {/* زخرفة هندسية ذهبية في الخلفية */}
            <div className={`absolute top-0 ${isAr ? 'left-0 rotate-180' : 'right-0'} opacity-10 translate-x-1/4 -translate-y-1/4 pointer-events-none`}>
              <svg width="300" height="300" viewBox="0 0 100 100" fill="none" stroke="#D4AF37" strokeWidth="0.5">
                <path d="M25 5L75 5L100 50L75 95L25 95L0 50Z" />
              </svg>
            </div>

            <div className="relative z-10">
              <h2 className="text-gold text-4xl md:text-5xl font-bold leading-tight mb-8">
                {title}
              </h2>
              <p className="text-gray-400 text-lg opacity-90 mb-12 leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* أيقونات السوشيال ميديا */}
            <div className="flex flex-wrap gap-4 mt-auto relative z-10">
              {socialLinks.map((social, index) => (
                <a 
                  key={index} 
                  href={social.href} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gold hover:bg-gold hover:text-black transition-all duration-300"
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* الجزء البلاتيني المطفأ */}
          <div className="lg:w-3/5 bg-[#E2E2E2] p-12 md:p-16 flex flex-col justify-center relative">
            {/* ملمس هندسي نقطي خفيف لإعطاء طابع هندسي */}
            <div className="absolute inset-0 opacity-[0.08] pointer-events-none" 
                 style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")` }}>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
              
              {/* كارت الهاتف - تم إصلاح اتجاه الرقم هنا */}
              <div className="group cursor-pointer">
                <div className="flex justify-between items-center mb-4">
                  <div className="p-3 bg-black rounded-xl text-gold group-hover:bg-gold group-hover:text-black transition-all duration-300 shadow-lg">
                    <Phone size={24} />
                  </div>
                </div>
                <h4 className="text-black/40 text-sm font-bold uppercase tracking-widest mb-1">
                   {isAr ? 'اتصل بنا' : 'Call Us'}
                </h4>
                {/* استخدام dir="ltr" لضمان ترتيب الأرقام و inline-block للمحاذاة */}
                <a 
                  href={`tel:${phoneNumber.replace(/\s/g, '')}`}
                  className={`text-[#1A1A1A] text-2xl font-bold group-hover:text-gold transition-colors tabular-nums inline-block ${isAr ? 'text-right' : 'text-left'}`}
                  dir="ltr"
                >
                  {phoneNumber}
                </a>
              </div>

              {/* كارت الموقع */}
              <div className="group cursor-pointer">
                <div className="flex justify-between items-center mb-4">
                  <div className="p-3 bg-black rounded-xl text-gold group-hover:bg-gold group-hover:text-black transition-all duration-300 shadow-lg">
                    <MapPin size={24} />
                  </div>
                </div>
                <h4 className="text-black/40 text-sm font-bold uppercase tracking-widest mb-1">
                   {isAr ? 'زورونا' : 'Visit Us'}
                </h4>
                <p className="text-[#1A1A1A] text-2xl font-bold group-hover:text-gold transition-colors">
                  {location}
                </p>
              </div>

            </div>

            {/* زر الأكشن الرئيسي */}
            <div className="mt-16 relative z-10">
               <a 
                href={buttonLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-4 bg-[#0A0A0A] text-gold px-10 py-5 rounded-full font-bold text-xl hover:bg-gold hover:text-black hover:shadow-[0_20px_40px_rgba(0,0,0,0.2)] transition-all duration-500"
               >
                 {buttonText}
                 <MessageCircle size={24} />
               </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};