import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Chatbot } from '@/components/Chatbot';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Instagram, MessageCircle, Twitter, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  const [subscribeHover, setSubscribeHover] = useState(false);
  const [getStartedHover, setGetStartedHover] = useState(false);
  const [subscribeFormHover, setSubscribeFormHover] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const socialLinks = {
    instagram: 'https://www.instagram.com/hixa_groups?utm_source=qr&igsh=MWo1MG03Z3c0NmF4cQ==',
    whatsapp: 'https://chat.whatsapp.com/LQrlGeLPOFjGlhN7d1Tl52',
    twitter: 'https://x.com/HIXAGroup',
    telegram: 'https://t.me/projectsco'
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section with Animated Geometric Shapes */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated Geometric Background Shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-gold/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 border border-gold/20 rotate-45 animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-gold/5 rotate-12 animate-float" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-1/3 left-1/4 w-40 h-40 border-2 border-gold/10 rounded-full animate-float" style={{ animationDelay: '3s' }} />
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-6xl md:text-8xl font-bold mb-2">
              <span className="block text-gold">{language === 'en' ? 'HIXA' : 'هيكسا'}</span>
            </h1>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
            {language === 'en' ? 'High Xpert ARTBUILD' : 'لكل مشروع لا ينسى'}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {language === 'en' 
              ? 'Connecting clients with professional engineers to execute engineering projects seamlessly'
              : 'ربط العملاء مع المهندسين المحترفين لتنفيذ المشاريع الهندسية بسلاسة'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center w-full sm:w-auto px-4 sm:px-0 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <button 
              onMouseEnter={() => setSubscribeHover(true)}
              onMouseLeave={() => setSubscribeHover(false)}
              onClick={(e) => e.preventDefault()}
              className="hexagon bg-transparent border-2 border-gold text-gold hover:bg-gold hover:text-black font-semibold px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base flex items-center justify-center gap-2 cursor-not-allowed w-full sm:w-auto"
            >
              <span>{subscribeHover ? (language === 'en' ? 'Coming Soon' : 'قريباً') : (language === 'en' ? 'Subscribe' : 'اشترك')}</span>
            </button>
            <div className="dropdown-container relative w-full sm:w-auto">
              <button 
                onMouseEnter={() => setGetStartedHover(true)}
                onMouseLeave={() => {
                  setGetStartedHover(false);
                  // Delay closing dropdown to allow hover on menu items
                  setTimeout(() => {
                    if (!dropdownOpen) return;
                    const dropdown = document.querySelector('.dropdown-menu');
                    if (dropdown && !dropdown.matches(':hover')) {
                      setDropdownOpen(false);
                    }
                  }, 200);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  setDropdownOpen(!dropdownOpen);
                }}
                className="hexagon bg-gold hover:bg-gold-dark text-black font-semibold px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base flex items-center justify-center gap-2 relative w-full sm:w-auto"
              >
                <span>{getStartedHover ? (language === 'en' ? 'Coming Soon' : 'قريباً') : (language === 'en' ? 'Get Started' : 'ابدأ الآن')}</span>
                {dropdownOpen && (
                  <div 
                    className="dropdown-menu absolute top-full left-0 mt-2 w-48 bg-background/95 backdrop-blur-sm border border-gold/20 rounded-lg shadow-lg z-50 py-2 opacity-0 animate-in fade-in slide-in-from-top-2 duration-200"
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                    style={{ opacity: 1 }}
                  >
                    <button
                      onClick={() => {
                        navigate('/client/dashboard');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors duration-200 opacity-60 hover:opacity-100"
                      title={language === 'en' ? 'Client Dashboard' : 'لوحة تحكم العميل'}
                    >
                      {language === 'en' ? 'Client Dashboard' : 'لوحة تحكم العميل'}
                    </button>
                    <button
                      onClick={() => {
                        navigate('/engineer/dashboard');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors duration-200 opacity-60 hover:opacity-100"
                      title={language === 'en' ? 'Engineer Dashboard' : 'لوحة تحكم المهندس'}
                    >
                      {language === 'en' ? 'Engineer Dashboard' : 'لوحة تحكم المهندس'}
                    </button>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about">
        <About />
      </section>

      {/* Subscription Section */}
      <section id="subscription" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">
              {language === 'en' ? 'Subscribe to Our Newsletter' : 'اشترك في نشرتنا الإخبارية'}
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              {language === 'en' 
                ? 'Stay updated with the latest engineering solutions and project opportunities' 
                : 'ابق على اطلاع بأحدث الحلول الهندسية وفرص المشاريع'}
            </p>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const contact = formData.get('contact') as string;
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                const phonePattern = /^[\d\s\-\+\(\)]{8,}$/;
                
                if (!emailPattern.test(contact) && !phonePattern.test(contact)) {
                  alert(language === 'en' 
                    ? 'Please enter a valid email or phone number' 
                    : 'يرجى إدخال بريد إلكتروني أو رقم هاتف صحيح');
                  return;
                }
                
                // TODO: Add subscription API call
                console.log('Subscribe:', contact);
                alert(language === 'en' ? 'Thank you for subscribing!' : 'شكراً لك على الاشتراك!');
                (e.target as HTMLFormElement).reset();
              }}
              className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto mb-8"
            >
              <input
                type="text"
                name="contact"
                placeholder={language === 'en' ? 'Enter your email or phone number' : 'أدخل بريدك الإلكتروني أو رقم هاتفك'}
                required
                className="flex-1 px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                onInput={(e) => {
                  const value = (e.target as HTMLInputElement).value;
                  // Remove validation message if user is typing
                  (e.target as HTMLInputElement).setCustomValidity('');
                }}
                onInvalid={(e) => {
                  const value = (e.target as HTMLInputElement).value;
                  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                  const phonePattern = /^[\d\s\-\+\(\)]{8,}$/;
                  
                  if (!emailPattern.test(value) && !phonePattern.test(value)) {
                    (e.target as HTMLInputElement).setCustomValidity(
                      language === 'en' 
                        ? 'Please enter a valid email or phone number' 
                        : 'يرجى إدخال بريد إلكتروني أو رقم هاتف صحيح'
                    );
                  }
                }}
              />
              <button 
                type="submit"
                onMouseEnter={() => setSubscribeFormHover(true)}
                onMouseLeave={() => setSubscribeFormHover(false)}
                onClick={(e) => {
                  e.preventDefault();
                }}
                className="hexagon bg-gold hover:bg-gold-dark text-black font-semibold px-8 py-3 cursor-not-allowed"
              >
                {subscribeFormHover ? (language === 'en' ? 'Coming Soon' : 'قريباً') : (language === 'en' ? 'Subscribe' : 'اشترك')}
              </button>
            </form>
            
            {/* Social Media Icons */}
            <div className="mt-8">
              <p className="text-lg font-medium text-foreground mb-4">
                {language === 'en' ? 'Follow us on our platforms' : 'تابعنا على منصاتنا'}
              </p>
              <div className="flex justify-center gap-4 md:gap-6">
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
                  href={socialLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border-2 border-[#D4AC35] rounded-full flex items-center justify-center text-[#D4AC35] hover:bg-[#D4AC35] hover:text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#D4AC35] focus:ring-offset-2 focus:ring-offset-[#071025]"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
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
                  href={socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border-2 border-[#D4AC35] rounded-full flex items-center justify-center text-[#D4AC35] hover:bg-[#D4AC35] hover:text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#D4AC35] focus:ring-offset-2 focus:ring-offset-[#071025]"
                  aria-label="Telegram"
                >
                  <Send className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <Chatbot />
    </div>
  );
};

export default Landing;
