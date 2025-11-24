import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useApp } from '@/context/AppContext';
import { Chatbot } from '@/components/Chatbot';
import { Partners } from '@/components/Partners';
import { Services} from '@/components/Services';
import { FeaturedProjects} from '@/components/FeaturedProjects';
import { Jobs} from '@/components/Jobs';

const CompanyLanding = () => {
  const navigate = useNavigate();
  const { language, content } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGetStarted = () => {
    navigate('/platform');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* New Hero Section */}
      <section id="hero" className="relative h-screen w-full overflow-hidden">
        {/* Background image with dark overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/images/heero.jpg')" }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-70"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Top navbar - simplified version for hero section */}
          <nav className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gold rounded-full"></div>
              <span className="ml-2 sm:ml-3 text-white font-bold text-lg sm:text-xl">ENGINEERING CORP</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <a href="#business" className="text-white hover:text-gold transition-colors text-sm lg:text-base">{language === 'en' ? content.navigation?.business?.en || 'Business' : content.navigation?.business?.ar || 'الأعمال'}</a>
              <a href="#services" className="text-white hover:text-gold transition-colors text-sm lg:text-base">{language === 'en' ? content.navigation?.services?.en || 'Services' : content.navigation?.services?.ar || 'الخدمات'}</a>
              <a href="#company" className="text-white hover:text-gold transition-colors text-sm lg:text-base">{language === 'en' ? content.navigation?.company?.en || 'Company' : content.navigation?.company?.ar || 'الشركة'}</a>
              <a href="#about" className="text-white hover:text-gold transition-colors text-sm lg:text-base">{language === 'en' ? content.navigation?.about?.en || 'About Us' : content.navigation?.about?.ar || 'عنا'}</a>
            </div>
            
            <Button className="hidden md:block bg-gold hover:bg-gold-dark text-black font-semibold px-4 py-2 text-sm lg:px-6 lg:py-2 lg:text-base">
              {language === 'en' ? content.navigation?.quote?.en || 'Get a Quote' : content.navigation?.quote?.ar || 'احصل على عرض سعر'}
            </Button>
            
            {/* Mobile menu button */}
            <button 
              className="md:hidden text-white p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </nav>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-black bg-opacity-90 backdrop-blur-lg absolute top-16 left-0 right-0 z-20 py-4 px-6">
              <div className="flex flex-col space-y-4">
                <a 
                  href="#business" 
                  className="text-white hover:text-gold transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {language === 'en' ? content.navigation?.business?.en || 'Business' : content.navigation?.business?.ar || 'الأعمال'}
                </a>
                <a 
                  href="#services" 
                  className="text-white hover:text-gold transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {language === 'en' ? content.navigation?.services?.en || 'Services' : content.navigation?.services?.ar || 'الخدمات'}
                </a>
                <a 
                  href="#company" 
                  className="text-white hover:text-gold transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {language === 'en' ? content.navigation?.company?.en || 'Company' : content.navigation?.company?.ar || 'الشركة'}
                </a>
                <a 
                  href="#about" 
                  className="text-white hover:text-gold transition-colors py-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {language === 'en' ? content.navigation?.about?.en || 'About Us' : content.navigation?.about?.ar || 'عنا'}
                </a>
                <Button 
                  className="bg-gold hover:bg-gold-dark text-black font-semibold w-full py-2"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    // Handle mobile quote button click
                  }}
                >
                  {language === 'en' ? content.navigation?.quote?.en || 'Get a Quote' : content.navigation?.quote?.ar || 'احصل على عرض سعر'}
                </Button>
              </div>
            </div>
          )}
          
         <div className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 text-center">
  <div className="animate-fade-in">
    <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase mb-4 sm:mb-6">
      <span className="block text-gold">{content.platformContent.heading[language]}</span>
    </h1>
    
    <p className="text-white text-xl sm:text-2xl md:text-3xl font-semibold mb-4">
      {content.platformContent.slogan[language]}
    </p>
    
    <p className="text-white text-base sm:text-lg md:text-xl max-w-2xl sm:max-w-3xl mx-auto opacity-90">
      {language === 'en' 
        ? content.hero.caption?.en || 'Transforming ideas into experiences that leave a lasting impact.' 
        : content.hero.caption?.ar || 'نحول الأفكار إلى تجارب تترك أثراً دائماً.'}
    </p>
    
    {/* Bilingual CTA Buttons */}
    <div className="flex flex-col sm:flex-row gap-4 mt-6 sm:mt-8 justify-center">
      <button 
        className="bg-transparent border-2 border-gold text-gold hover:bg-gold hover:text-black font-bold py-3 px-6 sm:py-4 sm:px-8 rounded-xl text-base sm:text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-opacity-50"
        onClick={() => navigate('/platform')}
      >
        {language === 'en' ? content.hero.button?.en || 'Join the Platform' : content.hero.button?.ar || 'انضم للمنصة'}
      </button>
    </div>
    
    {/* Caption */}
    <p className="text-muted-foreground text-xs sm:text-sm mt-4 sm:mt-6 max-w-xl sm:max-w-2xl mx-auto">
      {language === 'en' 
        ? content.hero.captionBelow?.en || 'A platform that connects clients with engineers to execute engineering projects professionally.' 
        : content.hero.captionBelow?.ar || 'منصة تربط العملاء بالمهندسين لتنفيذ المشاريع الهندسية باحترافية.'}
    </p>
  </div>
</div>
      
        </div>
      </section>
      
      {/* Rest of the page content */}
      {/* About Section */}
      <section id="about" className="py-16 sm:py-20 px-4 sm:px-6 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{content.about.title[language]}</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl sm:max-w-3xl mx-auto">
              {content.about.subtitle[language]}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Mission Card */}
            <div className="glass-card p-6 sm:p-8 rounded-xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gold rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <span className="text-primary-foreground font-bold">1</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{content.about.card1.title[language]}</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                {content.about.card1.text[language]}
              </p>
            </div>
            
            {/* Vision Card */}
            <div className="glass-card p-6 sm:p-8 rounded-xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gold rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <span className="text-primary-foreground font-bold">2</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{content.about.card2.title[language]}</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                {content.about.card2.text[language]}
              </p>
            </div>
            
            {/* Values Card */}
            <div className="glass-card p-6 sm:p-8 rounded-xl">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gold rounded-full flex items-center justify-center mb-4 sm:mb-6">
                <span className="text-primary-foreground font-bold">3</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{content.about.card3.title[language]}</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                {content.about.card3.text[language]}
              </p>
            </div>
          </div>
        </div>
      </section>
      <Services />
      <FeaturedProjects />
      <Partners/>
      <Jobs />
      {/* Contact Section */}
      <section id="contact" className="py-16 sm:py-20 px-4 sm:px-6 bg-secondary/30">
        <div className="container mx-auto">
          <div className="max-w-2xl sm:max-w-3xl lg:max-w-4xl mx-auto text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">{content.cta.title[language]}</h2>
            <p className="text-lg sm:text-xl text-muted-foreground mb-6 sm:mb-8">
              {content.cta.subtitle[language]}
            </p>
            <Button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-gold-light to-gold hover:from-gold hover:to-gold-dark text-primary-foreground font-semibold px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg"
            >
              {content.cta.button[language]}
            </Button>
          </div>
        </div>
      </section>
      <Footer />
      <Chatbot />
    </div>
  );
};

export default CompanyLanding;