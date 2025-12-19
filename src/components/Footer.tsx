import { useApp } from '@/context/AppContext';
import { Instagram, MessageCircle, Twitter, Send, Facebook, Linkedin } from 'lucide-react';

export const Footer = () => {
  const { content, language } = useApp();
  
  const socialLinks = {
    instagram: 'https://www.instagram.com/hixa_groups?utm_source=qr&igsh=MWo1MG03Z3c0NmF4cQ==',
    whatsapp: 'https://chat.whatsapp.com/LQrlGeLPOFjGlhN7d1Tl52',
    twitter: 'https://x.com/HIXAGroup',
    telegram: 'https://t.me/projectsco',
    facebook: 'https://www.facebook.com/share/1FpuCgzK8y/',
    linkedin: 'https://www.linkedin.com/company/hixagroup'
  };

  return (
    <footer className="bg-[#0B0B0EB2] text-white py-12 px-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <img 
              src="/images/updateLogo.png " 
              alt="HIXA Logo" 
              className="h-8 md:h-10 w-auto"
            />
            HIXA
          </h2>
          <p className="text-[#cfcfd6] text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-8">
            {language === 'en'
              ? 'Professional engineering services platform connecting experts with clients for innovative solutions.'
              : 'منصة خدمات هندسية احترافية تربط الخبراء بالعملاء لتقديم حلول مبتكرة.'}
          </p>
          
          <nav className="mb-10" aria-label="Footer navigation">
            <ul className="flex flex-wrap justify-center gap-6 md:gap-8 lg:gap-12">
              <li><a href="/" className="text-white text-base md:text-lg font-medium hover:text-[#D4AC35] transition-colors duration-200 focus:outline focus:outline-2 focus:outline-[#D4AC35] focus:rounded">{language === 'en' ? 'Home' : 'الرئيسية'}</a></li>
              <li><a href="#about" className="text-white text-base md:text-lg font-medium hover:text-[#D4AC35] transition-colors duration-200 focus:outline focus:outline-2 focus:outline-[#D4AC35] focus:rounded">{language === 'en' ? 'About Us' : 'عنا'}</a></li>
              <li><a href="#services" className="text-white text-base md:text-lg font-medium hover:text-[#D4AC35] transition-colors duration-200 focus:outline focus:outline-2 focus:outline-[#D4AC35] focus:rounded">{language === 'en' ? 'Services' : 'الخدمات'}</a></li>
              <li><a href="#contact" className="text-white text-base md:text-lg font-medium hover:text-[#D4AC35] transition-colors duration-200 focus:outline focus:outline-2 focus:outline-[#D4AC35] focus:rounded">{language === 'en' ? 'Contact Us' : 'اتصل بنا'}</a></li>
            </ul>
          </nav>
          
          <div className="flex justify-center gap-4 md:gap-6 mb-12">
            <a 
              href={socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border-2 border-[#D4AC35] rounded-full flex items-center justify-center text-[#D4AC35] hover:bg-[#D4AC35] hover:text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#D4AC35] focus:ring-offset-2 focus:ring-offset-[#071025]"
              aria-label="Facebook"
            >
              <Facebook className="w-5 h-5" />
            </a>
            <a 
              href={socialLinks.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border-2 border-[#D4AC35] rounded-full flex items-center justify-center text-[#D4AC35] hover:bg-[#D4AC35] hover:text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#D4AC35] focus:ring-offset-2 focus:ring-offset-[#071025]"
              aria-label="Telegram"
            >
              <Send className="w-5 h-5" />
            </a>
            <a 
              href={socialLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border-2 border-[#D4AC35] rounded-full flex items-center justify-center text-[#D4AC35] hover:bg-[#D4AC35] hover:text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#D4AC35] focus:ring-offset-2 focus:ring-offset-[#071025]"
              aria-label="WhatsApp"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
            <a 
              href={socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border-2 border-[#D4AC35] rounded-full flex items-center justify-center text-[#D4AC35] hover:bg-[#D4AC35] hover:text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#D4AC35] focus:ring-offset-2 focus:ring-offset-[#071025]"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a 
              href={socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border-2 border-[#D4AC35] rounded-full flex items-center justify-center text-[#D4AC35] hover:bg-[#D4AC35] hover:text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#D4AC35] focus:ring-offset-2 focus:ring-offset-[#071025]"
              aria-label="Twitter/X"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a 
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 border-2 border-[#D4AC35] rounded-full flex items-center justify-center text-[#D4AC35] hover:bg-[#D4AC35] hover:text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#D4AC35] focus:ring-offset-2 focus:ring-offset-[#071025]"
              aria-label="LinkedIn"
            >
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
        </div>
        
        
      </div>
    </footer>
  );
};
