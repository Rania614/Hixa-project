import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Chatbot } from '@/components/Chatbot';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Instagram, MessageCircle, Twitter, Send } from 'lucide-react';
import { User, ChevronDown } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const { language } = useApp();
  const [showDropdown, setShowDropdown] = useState(false);
  
  const socialLinks = {
    instagram: 'https://www.instagram.com/hixa_groups?utm_source=qr&igsh=MWo1MG03Z3c0NmF4cQ==',
    whatsapp: 'https://chat.whatsapp.com/LQrlGeLPOFjGlhN7d1Tl52',
    twitter: 'https://x.com/SOARdecor?t=0NFoc2u5IhVp5CGhoBgETg&s=09',
    telegram: 'https://t.me/projectsco'
  };

  const handleSubscribe = () => {
    // Scroll to subscription section or navigate to it
    const subscriptionSection = document.getElementById('subscription');
    if (subscriptionSection) {
      subscriptionSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showDropdown && !(e.target as Element).closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showDropdown]);

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
              <span className="block text-gold">HIXA</span>
            </h1>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
            Engineering Solutions
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            Connecting clients with professional engineers to execute engineering projects seamlessly
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <button 
              onClick={handleSubscribe}
              className="hexagon bg-transparent border-2 border-gold text-gold hover:bg-gold hover:text-black font-semibold px-6 py-3 text-base flex items-center gap-2"
            >
              <span>{language === 'en' ? 'Subscribe' : 'اشترك'}</span>
            </button>
            <div className="dropdown-container relative">
              <button 
                onClick={() => setShowDropdown(!showDropdown)}
                className="hexagon bg-gold hover:bg-gold-dark text-black font-semibold px-6 py-3 text-base flex items-center gap-2"
              >
                <span>{language === 'en' ? 'Get Started' : 'ابدأ الآن'}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showDropdown && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50 animate-fade-in">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        navigate('/auth/client');
                        setShowDropdown(false);
                      }}
                      className="whitespace-nowrap hexagon text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-10 px-4 py-2 w-full justify-start font-medium flex items-center gap-2 text-foreground hover:bg-gold/10"
                    >
                      <User className="h-4 w-4" />
                      {language === 'en' ? 'Log In' : 'تسجيل الدخول'}
                    </button>
                  </div>
                </div>
              )}
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
                const email = formData.get('email') as string;
                // TODO: Add subscription API call
                console.log('Subscribe:', email);
                alert(language === 'en' ? 'Thank you for subscribing!' : 'شكراً لك على الاشتراك!');
              }}
              className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto mb-8"
            >
              <input
                type="email"
                name="email"
                placeholder={language === 'en' ? 'Enter your email' : 'أدخل بريدك الإلكتروني'}
                required
                className="flex-1 px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
              />
              <button 
                type="submit"
                className="hexagon bg-gold hover:bg-gold-dark text-black font-semibold px-8 py-3"
              >
                {language === 'en' ? 'Subscribe' : 'اشترك'}
              </button>
            </form>
            
            {/* Social Media Icons */}
            <div className="flex justify-center gap-4 md:gap-6">
              <a 
                href={socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border-2 border-gold rounded-full flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href={socialLinks.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border-2 border-gold rounded-full flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
              <a 
                href={socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border-2 border-gold rounded-full flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
                aria-label="Twitter/X"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a 
                href={socialLinks.telegram}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border-2 border-gold rounded-full flex items-center justify-center text-gold hover:bg-gold hover:text-black transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-offset-2"
                aria-label="Telegram"
              >
                <Send className="w-5 h-5" />
              </a>
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