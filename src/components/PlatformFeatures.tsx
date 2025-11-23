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
        {/* Platform Header with Badge and Slogan */}
        <div className="text-center mb-16">
          {/* Platform-specific Badge */}
          <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 bg-gold/20 border border-gold/40 rounded-full">
            <div className="w-2 h-2 bg-gold rounded-full animate-pulse" />
            <span className="text-sm font-semibold text-gold">
              {content.platformContent.platformLabel[language]}
            </span>
          </div>
          
          {/* Platform Heading */}
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gold">
            {content.platformContent.heading[language]}
          </h2>
          
          {/* Platform Slogan */}
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-6 font-semibold">
            {content.platformContent.slogan[language]}
          </p>
          
          {/* Partners - Clients Label */}
          <p className="text-sm text-gold/80 font-semibold tracking-wide">
            {content.platformContent.partnersClientsLabel[language]}
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {content.platformFeatures.map((feature, index) => {
            const Icon = iconMap[feature.icon as keyof typeof iconMap];
            return (
              <Card
                key={feature.id}
                className="glass-card hover:border-gold/50 transition-all duration-300 animate-slide-up border border-gold/20"
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
