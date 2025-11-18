import { useApp } from '@/context/AppContext';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';

export const Hero = () => {
  const { content, language, setIsAuthenticated } = useApp();

  const handleGetStarted = () => {
    setIsAuthenticated(true);
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Geometric background shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gold/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 border border-gold/20 rotate-45 animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
          {content.hero.title[language]}
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {content.hero.subtitle[language]}
        </p>
        <Button
          onClick={handleGetStarted}
          size="lg"
          className="bg-gradient-to-r from-gold-light to-gold hover:from-gold hover:to-gold-dark text-primary-foreground font-semibold px-8 py-6 text-lg group animate-slide-up"
          style={{ animationDelay: '0.4s' }}
        >
          {content.hero.cta[language]}
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
        </Button>
      </div>
    </section>
  );
};
