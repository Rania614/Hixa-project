import React from "react";
import { Instagram, MessageCircle, Twitter, Send, Facebook, Linkedin, Phone, MapPin, ArrowUpLeft, ArrowUpRight } from "lucide-react";

interface ContactSectionProps {
  language: "en" | "ar";
}

export const ContactSection: React.FC<ContactSectionProps> = ({ language }) => {
  const isAr = language === 'ar';

  const socialLinks = [
    { icon: Instagram, href: "https://www.instagram.com/hixa_groups" },
    { icon: MessageCircle, href: "https://chat.whatsapp.com/LQrlGeLPOFjGlhN7d1Tl52" },
    { icon: Twitter, href: "https://x.com/HIXAGroup" },
    { icon: Send, href: "https://t.me/projectsco" },
    { icon: Facebook, href: "https://www.facebook.com/HIXAGroup" },
    { icon: Linkedin, href: "https://www.linkedin.com/company/hixagroup" }
  ];

  return (
    <section id="contact" className="py-20 bg-background overflow-hidden" dir={isAr ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4">
        {/* الحاوية الرئيسية بلون بلاتينيوم مطفي جداً */}
        <div className="flex flex-col lg:flex-row items-stretch bg-platinum-100/10 rounded-[40px] overflow-hidden shadow-2xl border border-platinum-100/5">
          
          {/* الجزء الغامق - يسار */}
          <div className="lg:w-2/5 bg-[#0A0A0A] p-12 md:p-16 flex flex-col justify-between relative">
            <div className="absolute top-0 right-0 opacity-10 translate-x-1/4 -translate-y-1/4 pointer-events-none">
              <svg width="300" height="300" viewBox="0 0 100 100" fill="none" stroke="#D4AF37" strokeWidth="0.5">
                <path d="M25 5L75 5L100 50L75 95L25 95L0 50Z" />
              </svg>
            </div>

            <div>
              <h2 className="text-gold font-arabic text-4xl md:text-5xl font-bold leading-tight mb-8">
                {isAr ? 'نصنع مستقبلاً هندسياً مختلفاً' : 'Engineering a Different Future'}
              </h2>
              <p className="text-platinum-200 text-lg font-arabic opacity-70 mb-12">
                {isAr 
                  ? 'سواء كنت تبحث عن استشارة أو ترغب في بدء مشروع جديد، فريقنا مستعد للإجابة.' 
                  : 'Whether you are looking for a consultation or want to start a new project, our team is ready.'}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 mt-auto">
              {socialLinks.map((social, index) => (
                <a 
                  key={index} 
                  href={social.href} 
                  className="w-12 h-12 flex items-center justify-center rounded-full bg-platinum-50/5 border border-platinum-100/10 text-gold hover:bg-gold hover:text-black transition-all duration-300"
                >
                  <social.icon size={20} />
                </a>
              ))}
            </div>
          </div>

          {/* الجزء البلاتيني المطفأ - يمين */}
          <div className="lg:w-3/5 bg-platinum-100 p-12 md:p-16 flex flex-col justify-center relative">
            {/* إضافة ملمس خفيف جداً لجعل اللون المطفأ يبدو هندسياً */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23000' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='1'/%3E%3C/g%3E%3C/svg%3E")` }}></div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 relative z-10">
              
              {/* كارت الهاتف */}
              <div className="group cursor-pointer">
                <div className="flex justify-between items-center mb-4">
                  <div className="p-3 bg-black rounded-xl text-gold group-hover:bg-gold group-hover:text-black transition-all duration-300">
                    <Phone size={24} />
                  </div>
                  {isAr ? <ArrowUpLeft className="text-black/10 group-hover:text-gold" /> : <ArrowUpRight className="text-black/10 group-hover:text-gold" />}
                </div>
                <h4 className="text-black/50 font-arabic text-sm font-bold uppercase tracking-widest mb-1">
                   {isAr ? 'اتصل بنا' : 'Call Us'}
                </h4>
                <p className="text-black/80 text-2xl font-sans font-bold group-hover:text-black transition-colors">+966 50 413 1885</p>
              </div>

              {/* كارت الموقع */}
              <div className="group cursor-pointer">
                <div className="flex justify-between items-center mb-4">
                  <div className="p-3 bg-black rounded-xl text-gold group-hover:bg-gold group-hover:text-black transition-all duration-300">
                    <MapPin size={24} />
                  </div>
                  {isAr ? <ArrowUpLeft className="text-black/10 group-hover:text-gold" /> : <ArrowUpRight className="text-black/10 group-hover:text-gold" />}
                </div>
                <h4 className="text-black/50 font-arabic text-sm font-bold uppercase tracking-widest mb-1">
                   {isAr ? 'زورونا' : 'Visit Us'}
                </h4>
                <p className="text-black/80 text-2xl font-arabic font-bold group-hover:text-black transition-colors">
                  {isAr ? 'المملكة العربية السعودية' : 'Saudi Arabia'}
                </p>
              </div>

            </div>

            <div className="mt-16 relative z-10">
               <a 
                href="https://chat.whatsapp.com/LQrlGeLPOFjGlhN7d1Tl52"
                className="inline-flex items-center gap-4 bg-black text-gold px-10 py-5 rounded-full font-arabic font-bold text-xl hover:bg-gold hover:text-black hover:shadow-xl transition-all duration-500"
               >
                 {isAr ? 'ابدأ مشروعك الآن' : 'Start Your Project'}
                 <MessageCircle size={24} />
               </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};