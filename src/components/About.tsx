import { useApp } from '@/context/AppContext';
import { Zap, Shield, Rocket } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { HexagonIcon } from './ui/hexagon-icon';

const iconMap = {
  Zap,
  Shield,
  Rocket,
};

export const About = () => {
  const { content, language } = useApp();

  return (
    <section id="about" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {content.about.title[language]}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {content.about.subtitle[language]}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {content.about.values.map((value, index) => {
            const Icon = iconMap[value.icon as keyof typeof iconMap];
            return (
              <Card
                key={value.id}
                className="glass-card hover:border-gold/50 transition-all duration-300 group animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-8 text-center">
                  <div className="mb-4 inline-flex p-4 bg-gold/10 group-hover:bg-gold/20 transition-colors hexagon">
                    <HexagonIcon size="lg" className="text-gold bg-transparent">
                      <Icon className="h-8 w-8 text-gold" />
                    </HexagonIcon>
                  </div>
                  <h3 className="text-2xl font-bold mb-3">
                    {value.title[language]}
                  </h3>
                  <p className="text-muted-foreground">
                    {value.description[language]}
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
