import { useApp } from '@/context/AppContext';
import { LanguageToggle } from './LanguageToggle';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import { HexagonIcon } from './ui/hexagon-icon';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { content, language, setIsAuthenticated } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/admin/login');
  };

  const navLinks = [
    { id: 'hero', label: { en: 'Home', ar: 'الرئيسية' } },
    { id: 'about', label: { en: 'About', ar: 'عن الشركة' } },
    { id: 'services', label: { en: 'Services', ar: 'الخدمات' } },
    { id: 'projects', label: { en: 'Projects', ar: 'المشاريع' } },
    { id: 'features', label: { en: 'Features', ar: 'الميزات' } },
    { id: 'contact', label: { en: 'Contact', ar: 'اتصل بنا' } },
  ];

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setMobileMenuOpen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2 text-2xl font-bold text-gradient cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={() => navigate('/')}
          >
            <img
              src={content.header.logoImage}
              alt={`${content.header.logo} logo`}
              className="w-16 h-16 "
              loading="lazy"
            />
            {content.header.logo}
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className="text-foreground hover:text-gold transition-colors font-medium relative group"
              >
                {link.label[language]}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gold transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </nav>
          
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <Button
              onClick={handleGetStarted}
              className="hidden sm:flex bg-gradient-to-r from-gold-light to-gold hover:from-gold hover:to-gold-dark text-primary-foreground font-semibold px-6"
            >
              {content.hero.cta[language]}
            </Button>
            
            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-foreground hover:text-gold transition-colors p-2 hexagon"
            >
              <HexagonIcon size="md">
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </HexagonIcon>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <nav className="md:hidden pt-4 pb-2 animate-fade-in">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <button
                  key={link.id}
                  onClick={() => scrollToSection(link.id)}
                  className="text-foreground hover:text-gold transition-colors font-medium py-2 text-left"
                >
                  {link.label[language]}
                </button>
              ))}
              <Button
                onClick={handleGetStarted}
                className="mt-2 bg-gradient-to-r from-gold-light to-gold hover:from-gold hover:to-gold-dark text-primary-foreground font-semibold"
              >
                {content.hero.cta[language]}
              </Button>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};
