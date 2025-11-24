import { useApp } from '@/context/AppContext';

export const Partners = () => {
  const { content, language } = useApp();
  const activePartners = content.partners.filter(partner => partner.active);

  return (
    <section id="partners" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{language === 'en' ? 'Partners' : 'الشركاء'}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {language === 'en' 
                ? 'We collaborate with industry leaders to deliver exceptional results.' 
                : 'نتعاون مع قادة الصناعة لتقديم نتائج استثنائية.'}
            </p>
          </div>
          <div className="flex justify-center items-center flex-wrap gap-12">
            {activePartners.map((partner) => (
              <div key={partner.id} className="flex-shrink-0">
                <div className="hexagon w-32 h-32">
                  <img 
                    src={partner.logo} 
                    alt={partner.name[language]} 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
  );
};