import { useApp } from '@/context/AppContext';
import { Code, Smartphone, Palette, Target } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { HexagonIcon } from './ui/hexagon-icon';

const iconMap = {
  Code,
  Smartphone,
  Palette,
  Target,
};

export const Services = () => {
  const { content, language } = useApp();
  const sortedServices = [...content.services].sort((a, b) => a.order - b.order);

  return (
     <section id="services" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{language === 'en' ? 'Services' : 'الخدمات'}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {language === 'en' 
                ? 'Professional services tailored to your engineering needs.' 
                : 'خدمات احترافية مصممة خصيصاً لاحتياجاتكم الهندسية.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-gold/20 to-gold/10 flex items-center justify-center">
                <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-2xl">D</span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">{content.services[0].title[language]}</h3>
                <p className="text-muted-foreground mb-6">
                  {content.services[0].description[language]}
                </p>
              </div>
            </div>
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-cyan/20 to-cyan/10 flex items-center justify-center">
                <div className="w-16 h-16 bg-cyan rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-2xl">P</span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">{content.services[1].title[language]}</h3>
                <p className="text-muted-foreground mb-6">
                  {content.services[1].description[language]}
                </p>
              </div>
            </div>
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-gold/20 to-cyan/10 flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-gold to-cyan rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-2xl">C</span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">{content.services[2].title[language]}</h3>
                <p className="text-muted-foreground mb-6">
                  {content.services[2].description[language]}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
  );
};
