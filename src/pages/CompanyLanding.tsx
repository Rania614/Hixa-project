import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X, Instagram, MessageCircle, Twitter, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";
import { Partners } from "@/components/Partners";
import { Services } from "@/components/Services";
import { FeaturedProjects } from "@/components/FeaturedProjects";
import { Jobs } from "@/components/Jobs";
import { SkeletonCard } from "@/components/SkeletonCard";
import { useLandingStore } from "@/stores/landingStore";
import { useShallow } from "zustand/react/shallow";
import { useApp } from "@/context/AppContext";

const CompanyLanding = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { language } = useApp();
  const { hero, about, services, projects, cta, loading } = useLandingStore(
    useShallow((state) => ({
      hero: state.hero,
      about: state.about,
      services: state.services,
      projects: state.projects,
      cta: state.cta,
      loading: state.loading,
    }))
  );
  const fetchLandingData = useLandingStore((state) => state.fetchLandingData);

  useEffect(() => {
    // Fetch real data from API immediately
    fetchLandingData();
  }, [fetchLandingData]);

  // Show skeleton loading while fetching data
  if (loading && !hero && !about) {
    return <SkeletonCard />;
  }

  const getFieldValue = (entity: any, field: string, lang: "en" | "ar" = "en") => {
    if (!entity) return undefined;

    const direct = entity[field];
    if (typeof direct === "string" && direct.trim()) return direct;
    if (direct && typeof direct === "object" && !Array.isArray(direct)) {
      const localized =
        direct[lang] ??
        direct[lang.toUpperCase()] ??
        (lang === "ar" ? direct.en ?? direct.EN : undefined) ??
        direct.default;
      if (typeof localized === "string" && localized.trim()) return localized;
    }

    const langKey = `${field}_${lang}`;
    if (typeof entity[langKey] === "string" && entity[langKey].trim()) {
      return entity[langKey];
    }

    if (lang !== "en") {
      const fallbackKey = `${field}_en`;
      if (typeof entity[fallbackKey] === "string" && entity[fallbackKey].trim()) {
        return entity[fallbackKey];
      }
    }

    return undefined;
  };

  const heroTitle =
    getFieldValue(hero, "title", language) ||
    getFieldValue(hero, "name", language) ||
    "High Xpert ARTBUILD";
  const heroSubtitle =
    getFieldValue(hero, "subtitle", language) ||
    getFieldValue(hero, "description", language) ||
    "Connecting expertise and High Xpert ART BUILD opportunities… with no spatial limits";
  const heroCta =
    getFieldValue(hero, "cta", language) ||
    getFieldValue(hero, "cta_button", language) ||
    getFieldValue(hero, "button", language) ||
    "Get Started";

  const aboutTitle = getFieldValue(about, "title", language) || "About HIXA";
  const aboutSubtitle =
    getFieldValue(about, "subtitle", language) ||
    getFieldValue(about, "description", language) ||
    "We deliver innovative solutions that drive business growth";
  const aboutDescription =
    getFieldValue(about, "description", language) ||
    getFieldValue(about, "details", language);

  // Handle services structure - can be array or object with items array
  const safeServices = Array.isArray(services) 
    ? services 
    : (services && typeof services === 'object' && 'items' in services && Array.isArray((services as any).items))
    ? (services as any).items
    : [];
  const safeProjects = Array.isArray(projects) ? projects : [];
  const aboutValues = Array.isArray(about?.values)
    ? about.values
    : [];
  const ctaContent = cta || hero?.ctaSection || hero;
  const ctaTitle =
    getFieldValue(ctaContent, "title", language) ||
    heroTitle ||
    "Ready to Start Your Project?";
  const ctaSubtitle =
    getFieldValue(ctaContent, "subtitle", language) ||
    heroSubtitle ||
    "Let's build something amazing together";
  const ctaButton =
    getFieldValue(ctaContent, "button", language) ||
    getFieldValue(ctaContent, "cta", language) ||
    heroCta ||
    "Get Started";

  const handleGetStarted = () => {
    navigate("/platform");
  };

  // Don't show loading - page renders immediately with fallback data
  // Data will update silently in background when API responds

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* HERO */}
      <section id="hero" className="relative h-screen w-full overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/heero.jpg')" }}>
          <div className="absolute inset-0 bg-black bg-opacity-70"></div>
        </div>

        <div className="relative z-10 h-full flex flex-col">
          {/* Top navbar */}
          <nav className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
            <div 
              className="flex items-center cursor-pointer"
              onClick={() => navigate('/')}
            >
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gold rounded-full"></div>
              <span className="ml-2 sm:ml-3 text-white font-bold text-lg sm:text-xl">ENGINEERING CORP</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <a href="#about" className="text-white hover:text-gold transition">About Us</a>
              <a href="#services" className="text-white hover:text-gold transition">Services</a>
              <a href="#projects" className="text-white hover:text-gold transition">Projects</a>
              <a href="#contact" className="text-white hover:text-gold transition">Contact</a>
            </div>

            <Button className="hidden md:block bg-gold hover:bg-gold-dark text-black font-semibold px-4 py-2 text-sm lg:px-6 lg:py-2">
              Get a Quote
            </Button>

            {/* Mobile menu button */}
            <button className="md:hidden text-white p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </nav>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-black bg-opacity-90 backdrop-blur-lg absolute top-16 left-0 right-0 z-20 py-4 px-6 flex flex-col space-y-4">
              <a href="#about" className="text-white hover:text-gold" onClick={() => setMobileMenuOpen(false)}>About Us</a>
              <a href="#services" className="text-white hover:text-gold" onClick={() => setMobileMenuOpen(false)}>Services</a>
              <a href="#projects" className="text-white hover:text-gold" onClick={() => setMobileMenuOpen(false)}>Projects</a>
              <a href="#contact" className="text-white hover:text-gold" onClick={() => setMobileMenuOpen(false)}>Contact</a>
              <Button className="bg-gold hover:bg-gold-dark text-black font-semibold w-full py-2" onClick={() => setMobileMenuOpen(false)}>Get a Quote</Button>
            </div>
          )}

          <div className="flex-grow flex flex-col items-center justify-center px-4 sm:px-6 text-center">
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold uppercase mb-6 sm:mb-8 text-gold transition-all duration-300">
              {heroTitle}
            </h1>
            <p className="text-white text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl max-w-3xl sm:max-w-4xl mx-auto opacity-90 transition-all duration-300 font-medium">
              {heroSubtitle}
            </p>

            <Button 
              className="mt-10 sm:mt-12 md:mt-16 hexagon bg-transparent border-2 border-gold text-gold hover:bg-gold hover:text-black font-bold px-12 py-6 text-xl sm:text-2xl rounded-lg transition-all duration-300"
              onClick={handleGetStarted}
            >
              {language === 'en' ? 'Join Platform' : 'انضم إلى المنصة'}
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-20 px-4 sm:px-6 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 transition-all duration-300">{aboutTitle}</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl sm:max-w-3xl mx-auto transition-all duration-300">
              {aboutSubtitle}
            </p>
          </div>
          {aboutValues.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {aboutValues.map((value: any, index: number) => {
                const valueTitle =
                  getFieldValue(value, "title", language) ||
                  value?.name ||
                  `Value ${index + 1}`;
                const valueDescription =
                  getFieldValue(value, "description", language) ||
                  value?.text ||
                  "";

                return (
                  <div 
                    key={index} 
                    className="bg-card text-card-foreground border border-border rounded-xl p-6 sm:p-8 transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl hover:shadow-gold/20 hover:bg-card/80 cursor-pointer group flex flex-col min-h-[220px] sm:min-h-[240px]"
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                      }
                    }}
                  >
                    {/* Numbered Circle and Title - Better Alignment */}
                    <div className="flex items-start gap-4 mb-4 sm:mb-5">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gold rounded-full flex items-center justify-center flex-shrink-0 group-hover:bg-gold-dark transition-colors duration-300">
                        <span className="text-primary-foreground font-bold text-lg sm:text-xl">{index + 1}</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold leading-tight pt-1 sm:pt-2 flex-grow">
                        {valueTitle}
                      </h3>
                    </div>
                    
                    {/* Description */}
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed flex-grow">
                      {valueDescription}
                    </p>
                  </div>
                );
              })}
            </div>
          ) : (
            aboutDescription && (
              <div className="glass-card p-6 sm:p-8 rounded-xl max-w-3xl mx-auto text-center">
                <p className="text-muted-foreground text-base sm:text-lg">{aboutDescription}</p>
              </div>
            )
          )}
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-16 sm:py-20 px-4 sm:px-6 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              {getFieldValue(services, "title", language) || 
               (language === 'en' ? 'Our Services' : 'خدماتنا')}
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl sm:max-w-3xl mx-auto">
              {getFieldValue(services, "subtitle", language) || 
               (language === 'en' 
                ? 'We provide cutting-edge solutions tailored to your business needs'
                : 'نوفر حلولاً متطورة مصممة خصيصاً لاحتياجات عملك')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {safeServices
              .slice()
              .sort((a: any, b: any) => (a?.order || 0) - (b?.order || 0))
              .map((service: any) => {
                const serviceTitle =
                  getFieldValue(service, "title", language) ||
                  service?.name ||
                  "Service";
                const serviceDescription =
                  getFieldValue(service, "description", language) ||
                  service?.details ||
                  "";
                // Check for code in multiple possible locations - code is not localized, it's a direct field
                const serviceCode = service?.code || 
                                   service?.serviceCode || 
                                   service?.codeValue || 
                                   "";
                
                // Debug: uncomment to check service data in browser console
                // console.log('Service:', { 
                //   id: service._id || service.id, 
                //   title: serviceTitle,
                //   code: serviceCode, 
                //   codeRaw: service?.code,
                //   allKeys: Object.keys(service)
                // });
                
                // Use code if available and not empty, otherwise use first letter of title
                const serviceDisplay = (serviceCode && String(serviceCode).trim() !== "") 
                  ? String(serviceCode).trim() 
                  : (serviceTitle?.charAt(0) || "S");
                const serviceLink = service?.link || service?.url || service?.href;

                // Truncate description to 2 lines
                const truncateDescription = (text: string, maxLength: number = 120) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };

                const shortDescription = truncateDescription(serviceDescription);

                const handleServiceClick = () => {
                  if (serviceLink) {
                    if (serviceLink.startsWith('http://') || serviceLink.startsWith('https://')) {
                      window.open(serviceLink, '_blank', 'noopener,noreferrer');
                    } else {
                      navigate(serviceLink);
                    }
                  }
                };

                return (
              <div 
                key={service._id || service.id} 
                className="bg-card text-card-foreground rounded-xl border border-border p-6 sm:p-8 transition-all duration-300 ease-in-out hover:scale-[1.03] hover:shadow-xl hover:shadow-gold/20 hover:bg-card/80 cursor-pointer group flex flex-col"
                onClick={handleServiceClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleServiceClick();
                  }
                }}
              >
                {/* Hexagonal Icon/Code at Top Center */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gold/10 group-hover:bg-gold/20 hexagon flex items-center justify-center transition-colors duration-300">
                    <span className="text-gold group-hover:text-gold-dark font-bold text-lg sm:text-xl transition-colors duration-300">
                      {serviceDisplay}
                    </span>
                  </div>
                </div>

                {/* Service Title */}
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-center text-card-foreground leading-tight">
                  {serviceTitle}
                </h3>

                {/* Short Description (Max 2 lines) */}
                <p className="text-muted-foreground text-sm sm:text-base leading-relaxed line-clamp-2 text-center flex-grow">
                  {shortDescription}
                </p>
              </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-16 sm:py-20 px-4 sm:px-6 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Featured Projects</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl sm:max-w-3xl mx-auto">
              Explore our latest successful projects and innovations
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {safeProjects
              .slice()
              .sort((a: any, b: any) => (a?.order || 0) - (b?.order || 0))
              .map((project: any) => {
                const projectTitle =
                  getFieldValue(project, "title", language) ||
                  project?.name ||
                  "Project";
                const projectDescription =
                  getFieldValue(project, "description", language) ||
                  project?.details ||
                  "";
                const projectImage = project?.image || project?.imageUrl || project?.photo || project?.thumbnail;
                const projectLink = project?.link || project?.url || project?.href;

                const handleCardClick = () => {
                  if (projectLink) {
                    // Check if it's an external link (starts with http:// or https://)
                    if (projectLink.startsWith('http://') || projectLink.startsWith('https://')) {
                      window.open(projectLink, '_blank', 'noopener,noreferrer');
                    } else {
                      // Internal link - navigate using React Router
                      navigate(projectLink);
                    }
                  }
                };

                // Truncate description to 2 lines
                const truncateDescription = (text: string, maxLength: number = 120) => {
                  if (text.length <= maxLength) return text;
                  return text.substring(0, maxLength).trim() + '...';
                };

                const shortDescription = truncateDescription(projectDescription);

                return (
              <div 
                key={project._id || project.id || `project-${projectTitle}`} 
                className="bg-card text-card-foreground rounded-xl overflow-hidden border border-border transition-all duration-300 ease-in-out hover:scale-[1.02] hover:shadow-xl hover:shadow-gold/20 cursor-pointer group flex flex-col"
                onClick={handleCardClick}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick();
                  }
                }}
              >
                {/* 16:9 Image at the top */}
                <div className="relative w-full aspect-video overflow-hidden bg-muted">
                  {projectImage ? (
                    <img 
                      src={projectImage} 
                      alt={projectTitle}
                      className="w-full h-full object-cover transition-transform duration-300 ease-in-out group-hover:scale-105"
                      onError={(e) => {
                        // Show placeholder on error
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gold/20 to-gold/10 flex items-center justify-center">
                      <div className="w-16 h-16 bg-gold/20 rounded-lg" />
                    </div>
                  )}
                  {/* Fallback placeholder if image fails */}
                  {projectImage && (
                    <div className="hidden w-full h-full bg-gradient-to-br from-gold/20 to-gold/10 group-hover:flex items-center justify-center absolute inset-0">
                      <div className="w-16 h-16 bg-gold/20 rounded-lg" />
                    </div>
                  )}
                </div>
                
                {/* Content Section */}
                <div className="p-4 sm:p-6 flex flex-col flex-grow">
                  {/* Bold Project Title */}
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-card-foreground leading-tight">
                    {projectTitle}
                  </h3>
                  
                  {/* Short Two-line Description */}
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-4 sm:mb-6 line-clamp-2 flex-grow">
                    {shortDescription}
                  </p>
                  
                  {/* View Details Button */}
                  <div className="mt-auto">
                    <span className={`inline-flex items-center text-sm font-medium text-muted-foreground group-hover:text-gold transition-colors duration-300 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                      {language === 'en' ? 'View details' : 'عرض التفاصيل'}
                      <svg 
                        className={`w-4 h-4 transition-transform duration-300 ${language === 'en' ? 'ml-2 group-hover:translate-x-1' : 'mr-2 group-hover:-translate-x-1'} ${language === 'ar' ? 'rotate-180' : ''}`}
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </div>
              </div>
                );
              })}
          </div>
        </div>
      </section>

      {/* Partners */}
      <Partners />

      {/* Jobs */}
      <Jobs />

      {/* Contact Section */}
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
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12">
                <div className="glass-card p-6 rounded-xl text-center hover:scale-105 transition-transform">
                  <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📧</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{language === 'en' ? 'Email' : 'البريد الإلكتروني'}</h3>
                  <p className="text-muted-foreground">info@hixa.com</p>
                </div>
                
                <div className="glass-card p-6 rounded-xl text-center hover:scale-105 transition-transform">
                  <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📞</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{language === 'en' ? 'Phone' : 'الهاتف'}</h3>
                  <p className="text-muted-foreground">+966 50 123 4567</p>
                </div>
                
                <div className="glass-card p-6 rounded-xl text-center hover:scale-105 transition-transform">
                  <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl">📍</span>
                  </div>
                  <h3 className="font-bold text-lg mb-2">{language === 'en' ? 'Location' : 'الموقع'}</h3>
                  <p className="text-muted-foreground">Riyadh, Saudi Arabia</p>
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
                </div>
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

export default CompanyLanding;