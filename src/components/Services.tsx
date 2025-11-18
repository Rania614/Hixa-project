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
    <section id="services" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {language === 'en' ? 'Our Services' : 'خدماتنا'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {language === 'en' 
              ? 'Comprehensive digital solutions tailored to your needs'
              : 'حلول رقمية شاملة مصممة خصيصًا لاحتياجاتك'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {sortedServices.map((service, index) => {
            const Icon = iconMap[service.icon as keyof typeof iconMap];
            return (
              <Card
                key={service.id}
                className="glass-card hover:border-gold/50 transition-all duration-300 hover:scale-105 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex p-3 bg-gold/10 hexagon">
                    <HexagonIcon size="md" className="text-gold bg-transparent">
                      <Icon className="h-6 w-6 text-gold" />
                    </HexagonIcon>
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    {service.title[language]}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {service.description[language]}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
