import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
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

  const safeServices = Array.isArray(services) ? services : [];
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
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold uppercase mb-4 sm:mb-6 text-gold transition-all duration-300">
              {heroTitle}
            </h1>
            <p className="text-white text-lg sm:text-xl md:text-2xl lg:text-3xl max-w-2xl sm:max-w-3xl mx-auto opacity-90 transition-all duration-300">
              {heroSubtitle}
            </p>
            
            {/* Static Sub-section - Engineering Identity */}
            <div className="mt-8 sm:mt-10 md:mt-12 max-w-3xl mx-auto px-4 space-y-3 sm:space-y-4 transition-all duration-300">
              <p className="text-white text-sm sm:text-base md:text-lg lg:text-xl font-normal text-center leading-relaxed opacity-90">
                {language === 'en' 
                  ? 'Transforming ideas into experiences that leave a lasting impact.' 
                  : 'تحويل الأفكار إلى تجارب تترك أثراً دائماً.'}
              </p>
            </div>

            <Button 
              className="mt-8 sm:mt-10 hexagon bg-transparent border-2 border-gold text-gold hover:bg-gold hover:text-black font-bold px-12 py-6 text-xl rounded-lg transition-all duration-300"
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
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
                  <div key={index} className="glass-card p-6 sm:p-8 rounded-xl">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gold rounded-full flex items-center justify-center mb-4 sm:mb-6">
                      <span className="text-primary-foreground font-bold">{index + 1}</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{valueTitle}</h3>
                    <p className="text-muted-foreground text-sm sm:text-base">{valueDescription}</p>
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
      <section id="services" className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Our Services</h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl sm:max-w-3xl mx-auto">
              We provide cutting-edge solutions tailored to your business needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                const serviceInitial = serviceTitle?.charAt(0) || "S";

                return (
              <div key={service._id || service.id} className="glass-card rounded-xl overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-gold/20 to-gold/10 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center">
                    <span className="text-primary-foreground font-bold text-2xl">
                            {serviceInitial}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                      <h3 className="text-xl font-bold mb-3">{serviceTitle}</h3>
                  <p className="text-muted-foreground mb-4">
                        {serviceDescription}
                  </p>
                </div>
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

                return (
              <div key={project._id || project.id || `project-${projectTitle}`} className="glass-card rounded-xl overflow-hidden">
                <div className="h-48 bg-gradient-to-r from-cyan/20 to-cyan/10 flex items-center justify-center">
                  <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16" />
                </div>
                <div className="p-6">
                      <h3 className="text-xl font-bold mb-3">{projectTitle}</h3>
                  <p className="text-muted-foreground mb-4">
                        {projectDescription}
                  </p>
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

      {/* CTA Section */}
      <section id="contact" className="py-16 sm:py-20 px-4 sm:px-6 bg-secondary/30 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold mb-4">{ctaTitle}</h2>
        <p className="text-lg sm:text-xl text-muted-foreground mb-6">
          {ctaSubtitle}
        </p>
        <Button 
          onClick={handleGetStarted} 
          className="bg-gradient-to-r from-gold-light to-gold hover:from-gold hover:to-gold-dark text-primary-foreground font-semibold px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg"
        >
          {language === 'en' ? 'Join Platform' : 'انضم إلى المنصة'}
        </Button>
      </section>

      <Footer />
      <Chatbot />
    </div>
  );
};

export default CompanyLanding;