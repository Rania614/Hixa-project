import React from "react";
import { Instagram, MessageCircle, Twitter, Send, Facebook, Linkedin } from "lucide-react";

interface ContactSectionProps {
  language: "en" | "ar";
}

export const ContactSection: React.FC<ContactSectionProps> = ({ language }) => {
  return (
    <section id="contact" className="relative py-20 sm:py-24 px-4 sm:px-6 overflow-hidden">
      {/* Engineering Background Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {/* Grid Pattern */}
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(212, 172, 53, 0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(212, 172, 53, 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}></div>
        
        {/* Geometric Shapes */}
        <div className="absolute top-10 left-10 w-32 h-32 border-2 border-[#D4AC35] rotate-45 opacity-20"></div>
        <div className="absolute top-20 right-20 w-24 h-24 border-2 border-[#D4AC35] rounded-full opacity-20"></div>
        <div className="absolute bottom-20 left-1/4 w-40 h-40 border-2 border-[#D4AC35] opacity-20" style={{ clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)' }}></div>
        <div className="absolute bottom-10 right-10 w-28 h-28 border-2 border-[#D4AC35] rotate-12 opacity-20"></div>
        
        {/* Engineering Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-10" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="engineering-pattern" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="100" y2="100" stroke="#D4AC35" strokeWidth="1"/>
              <line x1="100" y1="0" x2="0" y2="100" stroke="#D4AC35" strokeWidth="1"/>
              <circle cx="50" cy="50" r="3" fill="#D4AC35"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#engineering-pattern)"/>
        </svg>
        
        {/* Blueprint-style lines */}
        <div className="absolute top-1/4 left-0 w-full h-px bg-[#D4AC35] opacity-10"></div>
        <div className="absolute top-1/2 left-0 w-full h-px bg-[#D4AC35] opacity-10"></div>
        <div className="absolute top-3/4 left-0 w-full h-px bg-[#D4AC35] opacity-10"></div>
      </div>
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-gold to-gold-light bg-clip-text text-transparent">
              {language === 'en' ? 'Let\'s Work Together' : 'دعنا نعمل معاً'}
            </h2>
            <p className="text-xl sm:text-2xl text-muted-foreground max-w-3xl mx-auto">
              {language === 'en' 
                ? 'Ready to start your next engineering project? Get in touch with us today.' 
                : 'هل أنت مستعد لبدء مشروعك الهندسي القادم؟ تواصل معنا اليوم.'}
            </p>
          </div>

          {/* Contact Cards Row */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-wrap justify-center gap-6 mb-12">
              <div className="glass-card p-6 rounded-xl text-center hover:scale-105 transition-transform">
                <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📞</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{language === 'en' ? 'Phone' : 'الهاتف'}</h3>
                <p className="text-muted-foreground">+966504131885</p>
              </div>
              
              <div className="glass-card p-6 rounded-xl text-center hover:scale-105 transition-transform">
                <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">📍</span>
                </div>
                <h3 className="font-bold text-lg mb-2">{language === 'en' ? 'Location' : 'الموقع'}</h3>
                <p className="text-muted-foreground">Saudi Arabia</p>
              </div>
            </div>

            {/* Social Media */}
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground mb-6">
                {language === 'en' ? 'Follow us on our platforms' : 'تابعنا على منصاتنا'}
              </p>
              <div className="flex justify-center gap-4 md:gap-6">
                <a 
                  href="https://www.instagram.com/hixa_groups?utm_source=qr&igsh=MWo1MG03Z3c0NmF4cQ=="
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border-2 border-[#D4AC35] rounded-full flex items-center justify-center text-[#D4AC35] hover:bg-[#D4AC35] hover:text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#D4AC35] focus:ring-offset-2 focus:ring-offset-[#071025]"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="https://chat.whatsapp.com/LQrlGeLPOFjGlhN7d1Tl52"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border-2 border-[#D4AC35] rounded-full flex items-center justify-center text-[#D4AC35] hover:bg-[#D4AC35] hover:text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#D4AC35] focus:ring-offset-2 focus:ring-offset-[#071025]"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a 
                  href="https://x.com/HIXAGroup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border-2 border-[#D4AC35] rounded-full flex items-center justify-center text-[#D4AC35] hover:bg-[#D4AC35] hover:text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#D4AC35] focus:ring-offset-2 focus:ring-offset-[#071025]"
                  aria-label="Twitter/X"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href="https://t.me/projectsco"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border-2 border-[#D4AC35] rounded-full flex items-center justify-center text-[#D4AC35] hover:bg-[#D4AC35] hover:text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#D4AC35] focus:ring-offset-2 focus:ring-offset-[#071025]"
                  aria-label="Telegram"
                >
                  <Send className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.facebook.com/HIXAGroup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border-2 border-[#D4AC35] rounded-full flex items-center justify-center text-[#D4AC35] hover:bg-[#D4AC35] hover:text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#D4AC35] focus:ring-offset-2 focus:ring-offset-[#071025]"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.linkedin.com/company/hixagroup"
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
        </div>
      </div>
    </section>
  );
};

