import { useApp } from '@/context/AppContext';
import { Instagram, MessageCircle, Twitter, Send, Facebook, Linkedin } from 'lucide-react';

export const Footer = () => {
  const { language } = useApp();
  
  const socialLinks = {
    instagram: 'https://www.instagram.com/hixa_groups?utm_source=qr&igsh=MWo1MG03Z3c0NmF4cQ==',
    whatsapp: 'https://chat.whatsapp.com/LQrlGeLPOFjGlhN7d1Tl52',
    twitter: 'https://x.com/HIXAGroup',
    telegram: 'https://t.me/projectsco',
    facebook: 'https://www.facebook.com/share/1FpuCgzK8y/',
    linkedin: 'https://www.linkedin.com/company/hixagroup'
  };

  return (
    <footer className="bg-[#1a1a1a] text-[#888] py-10 px-6 md:px-12 border-t border-gray-800" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
        
        {/* الجزء الأول: اللوجو واسم الشركة */}
        <div className="flex items-center gap-3 min-w-fit">
          <img 
            src="/images/updateLogo.png" 
            alt="HIXA Logo" 
            className="h-8 w-auto grayscale opacity-80" 
          />
          <h2 className="text-white text-xl font-bold tracking-tight">
            HIXA
          </h2>
        </div>

        {/* الخط الفاصل الرأسي (يختفي في الموبايل) */}
        <div className="hidden md:block w-[1px] h-12 bg-gray-700 mx-2"></div>

        {/* الجزء الثاني: الروابط وحقوق النشر */}
        <div className="flex-1 flex flex-col items-center md:items-start gap-2">
          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap justify-center md:justify-start gap-6 text-sm font-medium">
              <li><a href="/" className="hover:text-white transition-colors">{language === 'en' ? 'Home' : 'الرئيسية'}</a></li>
              <li><a href="#about" className="hover:text-white transition-colors">{language === 'en' ? 'About' : 'عنا'}</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">{language === 'en' ? 'Services' : 'الخدمات'}</a></li>
              <li><a href="#contact" className="hover:text-white transition-colors">{language === 'en' ? 'Contact' : 'اتصل بنا'}</a></li>
            </ul>
          </nav>
          <p className="text-[11px] text-gray-500 uppercase tracking-widest">
            © 2026 HIXA. All rights reserved.
          </p>
        </div>

        {/* الجزء الثالث: أيقوناتك الأصلية والدعم */}
        <div className="flex flex-col items-center md:items-end gap-3">
          <div className="flex gap-4">
            <a href={socialLinks.facebook} className="hover:text-white transition-colors opacity-70 hover:opacity-100"><Facebook size={18} /></a>
            <a href={socialLinks.linkedin} className="hover:text-white transition-colors opacity-70 hover:opacity-100"><Linkedin size={18} /></a>
            <a href={socialLinks.telegram} className="hover:text-white transition-colors opacity-70 hover:opacity-100"><Send size={18} /></a>
            <a href={socialLinks.instagram} className="hover:text-white transition-colors opacity-70 hover:opacity-100"><Instagram size={18} /></a>
            <a href={socialLinks.twitter} className="hover:text-white transition-colors opacity-70 hover:opacity-100"><Twitter size={18} /></a>
            <a href={socialLinks.whatsapp} className="hover:text-white transition-colors opacity-70 hover:opacity-100"><MessageCircle size={18} /></a>
          </div>
          {/* <div className="text-sm">
            <span className="text-gray-600">Support: </span>
            <a href="mailto:support@hixa.com" className="hover:text-white transition-colors font-light">support@hixa.com</a>
          </div> */}
        </div>

      </div>
    </footer>
  );
};