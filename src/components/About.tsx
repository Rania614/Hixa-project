import { useApp } from '@/context/AppContext';
import { Card, CardContent } from './ui/card';
import { HexagonIcon } from './ui/hexagon-icon';

export const About = () => {
  const { content, language } = useApp();

  // Safe access to about data with fallbacks
  const about = content?.about || {};
  const aboutTitle = about.title?.[language] || about.title?.en || (language === 'en' ? 'About HIXA' : 'عن HIXA');
  const aboutSubtitle = about.subtitle?.[language] || about.subtitle?.en || (language === 'en' ? 'We deliver innovative solutions' : 'نقدم حلولاً مبتكرة');

  // Create an array of cards for mapping with safe access
  const aboutCards = [
    { 
      id: '1', 
      title: about.card1?.title || { en: 'Innovation', ar: 'الابتكار' }, 
      text: about.card1?.text || { en: 'We innovate to solve complex challenges', ar: 'نبتكر لحل التحديات المعقدة' } 
    },
    { 
      id: '2', 
      title: about.card2?.title || { en: 'Excellence', ar: 'التميز' }, 
      text: about.card2?.text || { en: 'We strive for excellence in everything we do', ar: 'نسعى للتميز في كل ما نقوم به' } 
    },
    { 
      id: '3', 
      title: about.card3?.title || { en: 'Partnership', ar: 'الشراكة' }, 
      text: about.card3?.text || { en: 'We build lasting partnerships with our clients', ar: 'نبني شراكات دائمة مع عملائنا' } 
    },
  ];

  return (
    <section id="about" className="py-24 relative">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {aboutTitle}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {aboutSubtitle}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {aboutCards.map((card, index) => {
            const cardTitle = typeof card.title === 'object' ? (card.title[language] || card.title.en || '') : card.title || '';
            const cardText = typeof card.text === 'object' ? (card.text[language] || card.text.en || '') : card.text || '';
            
            return (
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
                    {cardTitle}
                  </h3>
                  <p className="text-muted-foreground">
                    {cardText}
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