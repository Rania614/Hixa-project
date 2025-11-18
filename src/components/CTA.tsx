import { useApp } from '@/context/AppContext';
import { Button } from './ui/button';
import { ArrowRight } from 'lucide-react';
import { HexagonIcon } from './ui/hexagon-icon';

export const CTA = () => {
  const { content, language, setIsAuthenticated } = useApp();

  const handleGetStarted = () => {
    setIsAuthenticated(true);
  };

  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-gold/10 via-transparent to-gold/10" />
      
      <div className="container mx-auto px-6 text-center relative z-10">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          {content.cta.title[language]}
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {content.cta.subtitle[language]}
        </p>
        <Button
          onClick={handleGetStarted}
          size="lg"
          className="bg-gradient-to-r from-gold-light to-gold hover:from-gold hover:to-gold-dark text-primary-foreground font-semibold px-8 py-6 text-lg group"
        >
          {content.cta.button[language]}
          <HexagonIcon size="sm" className="ml-2">
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </HexagonIcon>
        </Button>
      </div>
    </section>
  );
};
