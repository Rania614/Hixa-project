import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroSectionProps {
  heroTitle: string;
  heroSubtitle: string;
  language: "en" | "ar";
  onGetStarted: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  heroTitle,
  heroSubtitle,
  language,
  onGetStarted,
}) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <section id="hero" className="relative h-screen w-full overflow-hidden">
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/images/W.jpeg')" }}>
        <div className="absolute inset-0 bg-black bg-opacity-50"></div>
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
            onClick={onGetStarted}
          >
            {language === 'en' ? 'Join Platform' : 'انضم إلى المنصة'}
          </Button>
        </div>
      </div>
    </section>
  );
};

