import { useApp } from '@/context/AppContext';
import { Card, CardContent } from './ui/card';
import { HexagonIcon } from './ui/hexagon-icon';

export const Partners = () => {
  const { content, language } = useApp();
  const activePartners = content.partners.filter(partner => partner.active);

  return (
    <section id="partners" className="py-24 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {language === 'en' ? 'Our Partners' : 'شركاؤنا'}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {language === 'en' 
              ? 'Trusted by industry leaders and innovative companies' 
              : 'موثوق به من قبل رواد الصناعة والشركات المبتكرة'}
          </p>
        </div>

        {activePartners.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {activePartners
              .sort((a, b) => a.order - b.order)
              .map((partner, index) => (
                <Card
                  key={partner.id}
                  className="glass-card hover:border-gold/50 transition-all duration-300 group animate-slide-up flex items-center justify-center p-8 h-32"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-0 flex items-center justify-center w-full">
                    {partner.logo ? (
                      <img
                        src={partner.logo}
                        alt={partner.name[language]}
                        className="max-h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="text-center">
                        <HexagonIcon size="lg" className="text-gold mx-auto mb-2">
                          <div className="w-8 h-8 flex items-center justify-center text-xs font-bold">
                            {partner.name[language].charAt(0)}
                          </div>
                        </HexagonIcon>
                        <span className="text-sm font-medium">{partner.name[language]}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'No partners available at the moment.' 
                : 'لا توجد شراكات متاحة في الوقت الحالي.'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};