import { useApp } from '@/context/AppContext';
import { Layers, Lock, Sparkles, Gauge } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { HexagonIcon } from './ui/hexagon-icon';

const iconMap = {
  Layers,
  Lock,
  Sparkles,
  Gauge,
};

export const PlatformFeatures = () => {
  const { content, language } = useApp();

  return (
    <section id="features" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {language === 'en' ? 'Platform Features' : 'ميزات المنصة'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {language === 'en'
              ? 'Enterprise-grade features for modern businesses'
              : 'ميزات على مستوى المؤسسات للأعمال الحديثة'}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.platformFeatures.map((feature, index) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap];
            return (
              <Card
                key={feature.id}
                className="glass-card hover:border-gold/50 transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4 inline-flex p-4 bg-gold/10 hexagon">
                    <HexagonIcon size="lg" className="text-gold bg-transparent">
                      <Icon className="h-8 w-8 text-gold" />
                    </HexagonIcon>
                  </div>
                  <h3 className="text-xl font-bold mb-2">
                    {feature.title[language]}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {feature.description[language]}
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
