import { useApp } from '@/context/AppContext';
import { LanguageToggle } from './LanguageToggle';
import { Button } from './ui/button';
import { Menu, X, User, Handshake, ChevronDown, UserPlus } from 'lucide-react';
import { useState, useEffect } from 'react';
import { HexagonIcon } from './ui/hexagon-icon';
import { useNavigate } from 'react-router-dom';

export const Header = () => {
  const { content, language, setIsAuthenticated } = useApp();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showPlatformDropdown, setShowPlatformDropdown] = useState(false);
  const navigate = useNavigate();

  const handleGetStarted = () => {
    // Navigate to the platform landing page
    navigate('/platform');
  };

  const handleClientLogin = () => {
    // Navigate to admin login page
    navigate('/admin/login');
    setShowDropdown(false);
  };

  const handlePartnerLogin = () => {
    // Navigate to admin login page
    navigate('/admin/login');
    setShowDropdown(false);
  };

  const handleSignUp = () => {
    // Navigate to sign up page (client registration)
    navigate('/auth/client?mode=register');
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    if (showDropdown && !(e.target as Element).closest('.dropdown-container')) {
      setShowDropdown(false);
    }
  };

  // Add event listener for closing dropdown
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDropdown]);

  // Check if we're on the platform page
  const isPlatformPage = window.location.pathname === '/platform';
  
  // Filter out certain links for the platform page
  const navLinks = [
    { id: 'hero', label: { en: 'Home', ar: 'الرئيسية' } },
    { id: 'about', label: { en: 'About', ar: 'عن الشركة' } },
    { id: 'services', label: { en: 'Services', ar: 'الخدمات' } },
    { id: 'projects', label: { en: 'Projects', ar: 'المشاريع' } },
    { id: 'partners', label: { en: 'Partners', ar: 'الشركاء' } },
    { id: 'jobs', label: { en: 'Jobs', ar: 'الوظائف' } },
    { id: 'contact', label: { en: 'Contact', ar: 'اتصل بنا' } },
  ].filter(link => {
    // On platform page, hide services, projects, partners, and jobs
    if (isPlatformPage) {
      return !['services', 'projects', 'partners', 'jobs'].includes(link.id);
    }
    // On other pages, show all links
    return true;
  });

  const scrollToSection = (sectionId: string) => {
    // Check if we're on the platform page or the company landing page
    const isPlatformPage = window.location.pathname === '/platform';
    const isCompanyLandingPage = window.location.pathname === '/';
    
    if (isPlatformPage) {
      // Scroll to section on platform page
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
    } else if (isCompanyLandingPage) {
      // Scroll to section on company landing page
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
    } else {
      // Navigate to company landing page with hash
      navigate(`/#${sectionId}`);
      setMobileMenuOpen(false);
    }
  };

  // Render nothing if content is not loaded yet
  if (!content) {
    return null;
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div
            className="flex items-center gap-2 text-2xl font-bold text-gradient cursor-pointer transition-transform duration-300 hover:scale-105"
            onClick={() => navigate('/')}
          >
            <img
              src={content.header?.logoImage}
              alt="Company logo"
              className="w-16 h-16"
              loading="lazy"
            />
            {content.header?.logo && (
              <span>{content.header.logo}</span>
            )}
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
            {/* On platform page, button with dropdown for login */}
            {isPlatformPage ? (
              <div className="dropdown-container relative hidden sm:flex">
                <button
                  onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
                  className="justify-center whitespace-nowrap hexagon text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary hover:bg-primary/90 h-10 py-2 bg-gradient-to-r from-gold-light to-gold hover:from-gold hover:to-gold-dark text-primary-foreground font-semibold px-6 flex items-center gap-2"
                >
                  {content.hero?.cta?.[language] || (language === 'en' ? 'Get Started' : 'ابدأ الآن')}
                  <ChevronDown className={`h-4 w-4 transition-transform ${showPlatformDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showPlatformDropdown && (
                  <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50 animate-fade-in">
                    <div className="p-2">
                      {/* Client Dashboard Button - Commented out */}
                      {/* <button
                        onClick={() => {
                          navigate('/client/dashboard');
                          setShowPlatformDropdown(false);
                        }}
                        className="whitespace-nowrap hexagon text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-10 px-4 py-2 w-full justify-start font-medium flex items-center gap-2 text-foreground hover:bg-gold/10 opacity-60 hover:opacity-100"
                      >
                        <User className="h-4 w-4" />
                        {language === 'en' ? 'Client Dashboard' : 'لوحة تحكم العميل'}
                      </button> */}
                      {/* Engineer Dashboard Button - Commented out */}
                      {/* <button
                        onClick={() => {
                          navigate('/engineer/dashboard');
                          setShowPlatformDropdown(false);
                        }}
                        className="whitespace-nowrap hexagon text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-10 px-4 py-2 w-full justify-start font-medium flex items-center gap-2 text-foreground hover:bg-gold/10 opacity-60 hover:opacity-100"
                      >
                        <Handshake className="h-4 w-4" />
                        {language === 'en' ? 'Engineer Dashboard' : 'لوحة تحكم المهندس'}
                      </button> */}
                      <p className="text-sm text-muted-foreground text-center py-4 px-2">
                        {language === 'en' ? 'Coming Soon' : 'قريباً'}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Button
                onClick={handleGetStarted}
                className="hidden sm:flex bg-gradient-to-r from-gold-light to-gold hover:from-gold hover:to-gold-dark text-primary-foreground font-semibold px-6"
              >
                {language === 'en' ? 'Join Platform' : 'انضم إلى المنصة'}
              </Button>
            )}
            
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
              {/* On platform page, button with dropdown for login */}
              {isPlatformPage ? (
                <div className="dropdown-container w-full">
                  <button
                    onClick={() => setShowPlatformDropdown(!showPlatformDropdown)}
                    className="justify-center whitespace-nowrap hexagon text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary hover:bg-primary/90 h-10 py-2 bg-gradient-to-r from-gold-light to-gold hover:from-gold hover:to-gold-dark text-primary-foreground font-semibold w-full flex items-center justify-between mt-2"
                  >
                    {content.hero?.cta?.[language] || (language === 'en' ? 'Get Started' : 'ابدأ الآن')}
                    <ChevronDown className={`h-4 w-4 transition-transform ${showPlatformDropdown ? 'rotate-180' : ''}`} />
                  </button>
                            
                  {showPlatformDropdown && (
                    <div className="mt-2 bg-card border border-border rounded-lg shadow-lg animate-fade-in">
                      <div className="p-2">
                        {/* Client Dashboard Button - Commented out */}
                        {/* <button
                          onClick={() => {
                            navigate('/client/dashboard');
                            setShowPlatformDropdown(false);
                          }}
                          className="whitespace-nowrap hexagon text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-10 px-4 py-2 w-full justify-start font-medium flex items-center gap-2 text-foreground hover:bg-gold/10 opacity-60 hover:opacity-100"
                        >
                          <User className="h-4 w-4" />
                          {language === 'en' ? 'Client Dashboard' : 'لوحة تحكم العميل'}
                        </button> */}
                        {/* Engineer Dashboard Button - Commented out */}
                        {/* <button
                          onClick={() => {
                            navigate('/engineer/dashboard');
                            setShowPlatformDropdown(false);
                          }}
                          className="whitespace-nowrap hexagon text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-10 px-4 py-2 w-full justify-start font-medium flex items-center gap-2 text-foreground hover:bg-gold/10 opacity-60 hover:opacity-100"
                        >
                          <Handshake className="h-4 w-4" />
                          {language === 'en' ? 'Engineer Dashboard' : 'لوحة تحكم المهندس'}
                        </button> */}
                        <p className="text-sm text-muted-foreground text-center py-4 px-2">
                          {language === 'en' ? 'Coming Soon' : 'قريباً'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Button
                  onClick={handleGetStarted}
                  className="mt-2 bg-gradient-to-r from-gold-light to-gold hover:from-gold hover:to-gold-dark text-primary-foreground font-semibold"
                >
                  {language === 'en' ? 'Join Platform' : 'انضم إلى المنصة'}
                </Button>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};