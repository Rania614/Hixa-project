import { useApp } from '@/context/AppContext';
import { Twitter, Linkedin, Github } from 'lucide-react';
import { HexagonIcon } from './ui/hexagon-icon';

const socialIconMap = {
  Twitter,
  LinkedIn: Linkedin,
  GitHub: Github,
};

export const Footer = () => {
  const { content, language } = useApp();

  return (
    <footer id="contact" className="border-t border-border/50 py-12 bg-secondary/30">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          <div>
            <div className="text-2xl font-bold text-gradient mb-4">
              {content.header.logo}
            </div>
            <p className="text-muted-foreground">
              {language === 'en'
                ? 'Building digital excellence, one project at a time.'
                : 'بناء التميز الرقمي، مشروعًا تلو الآخر.'}
            </p>
          </div>

          <div className="flex flex-col md:items-end gap-4">
            <div className="flex gap-6">
              {content.footer.links.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  className="text-muted-foreground hover:text-gold transition-colors"
                >
                  {link.label[language]}
                </a>
              ))}
            </div>

            <div className="flex gap-4">
              {content.footer.socials.map((social) => {
                const Icon = socialIconMap[social.platform as keyof typeof socialIconMap];
                return (
                  <a
                    key={social.id}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-muted hover:bg-gold/20 hover:text-gold transition-colors hexagon"
                  >
                    <HexagonIcon size="sm" className="text-current">
                      <Icon className="h-5 w-5" />
                    </HexagonIcon>
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-border/50 pt-8 text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} HIXA. {language === 'en' ? 'All rights reserved.' : 'جميع الحقوق محفوظة.'}</p>
        </div>
      </div>
    </footer>
  );
};
