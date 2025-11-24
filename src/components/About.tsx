import { useApp } from '@/context/AppContext';
import { Card, CardContent } from './ui/card';
import { HexagonIcon } from './ui/hexagon-icon';

export const About = () => {
  const { content, language } = useApp();

  // Create an array of cards for mapping
  const aboutCards = [
    { id: '1', title: content.about.card1.title, text: content.about.card1.text },
    { id: '2', title: content.about.card2.title, text: content.about.card2.text },
    { id: '3', title: content.about.card3.title, text: content.about.card3.text },
  ];

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
          {aboutCards.map((card, index) => (
            <Card
              key={card.id}
              className="glass-card hover:border-gold/50 transition-all duration-300 group animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <CardContent className="p-8 text-center">
                <div className="mb-4 inline-flex p-4 bg-gold/10 group-hover:bg-gold/20 transition-colors hexagon">
                  <HexagonIcon size="lg" className="text-gold bg-transparent">
                    <div className="w-8 h-8 flex items-center justify-center text-gold font-bold text-xl">
                      {index + 1}
                    </div>
                  </HexagonIcon>
                </div>
                <h3 className="text-2xl font-bold mb-3">
                  {card.title[language]}
                </h3>
                <p className="text-muted-foreground">
                  {card.text[language]}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};