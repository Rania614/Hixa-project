import { useApp } from '@/context/AppContext';
import { Mail, Phone, Linkedin, Youtube, Twitter } from 'lucide-react';
import { HexagonIcon } from './ui/hexagon-icon';
import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

const socialIconMap = {
  LinkedIn: Linkedin,
  YouTube: Youtube,
  Twitter: Twitter,
};

export const Footer = () => {
  const { content, language } = useApp();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter subscription
    console.log('Subscribed with email:', email);
    setEmail('');
  };

  // Engineer Resources links
  const engineerResources = [
    { id: '1', label: { en: 'Support Center', ar: 'مركز الدعم' }, url: '#' },
    { id: '2', label: { en: 'Technical Documents', ar: 'الوثائق التقنية' }, url: '#' },
    { id: '3', label: { en: 'Blog', ar: 'المدونة' }, url: '#' },
    { id: '4', label: { en: 'Case Studies', ar: 'دراسات الحالة' }, url: '#' },
  ];

  // Quick Links
  const quickLinks = [
    { id: '1', label: { en: 'Home', ar: 'الرئيسية' }, url: '/' },
    { id: '2', label: { en: 'Services', ar: 'الخدمات' }, url: '#services' },
    { id: '3', label: { en: 'FAQ', ar: 'الأسئلة الشائعة' }, url: '#' },
    { id: '4', label: { en: 'Privacy Policy', ar: 'سياسة الخصوصية' }, url: '#' },
  ];

  return (
    <footer className="border-t border-border/50 py-12 bg-secondary/30" dir="rtl">
      <div className="container mx-auto px-6">
        {/* Main Footer Content - 4 Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Column 1: Logo, Description, Contact Info */}
          <div className="lg:order-4">
            <div className="text-2xl font-bold text-gradient mb-4">
              {content.header.logo}
            </div>
            <p className="text-muted-foreground mb-6">
              {language === 'en'
                ? 'Professional engineering services platform connecting experts with clients for innovative solutions.'
                : 'منصة خدمات هندسية احترافية تربط الخبراء بالعملاء لتقديم حلول مبتكرة.'}
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <HexagonIcon size="sm" className="text-cyan">
                  <Mail className="h-4 w-4" />
                </HexagonIcon>
                <a href="mailto:info@hixa.com" className="text-muted-foreground hover:text-cyan transition-colors">
                  info@hixa.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <HexagonIcon size="sm" className="text-cyan">
                  <Phone className="h-4 w-4" />
                </HexagonIcon>
                <a href="tel:+1234567890" className="text-muted-foreground hover:text-cyan transition-colors">
                  +1 (234) 567-890
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:order-3">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              {language === 'en' ? 'Quick Links' : 'روابط سريعة'}
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.id}>
                  <a
                    href={link.url}
                    className="text-muted-foreground hover:text-cyan transition-colors"
                  >
                    {link.label[language]}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Engineer Resources */}
          <div className="lg:order-2">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              {language === 'en' ? 'Engineer Resources' : 'موارد المهندسين'}
            </h3>
            <ul className="space-y-3">
              {engineerResources.map((resource) => (
                <li key={resource.id}>
                  <a
                    href={resource.url}
                    className="text-muted-foreground hover:text-cyan transition-colors"
                  >
                    {resource.label[language]}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter Signup */}
          <div className="lg:order-1">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              {language === 'en' ? 'Newsletter' : 'النشرة الإخبارية'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {language === 'en' 
                ? 'Subscribe to get the latest updates and news.' 
                : 'اشترك لتستلم آخر التحديثات والأخبار.'}
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input
                type="email"
                placeholder={language === 'en' ? 'Your email address' : 'عنوان بريدك الإلكتروني'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-background border-border"
                required
              />
              <Button 
                type="submit" 
                variant="cyan"
                className="w-full"
              >
                {language === 'en' ? 'Subscribe' : 'اشتراك'}
              </Button>
            </form>
          </div>
        </div>

        {/* Social Media Icons */}
        <div className="flex justify-center gap-6 mb-8">
          {Object.entries(socialIconMap).map(([platform, Icon]) => (
            <a
              key={platform}
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 bg-muted hover:bg-cyan hover:text-white transition-colors hexagon"
            >
              <HexagonIcon size="sm" className="text-current">
                <Icon className="h-5 w-5" />
              </HexagonIcon>
            </a>
          ))}
        </div>

        {/* Sub-Footer with Copyright */}
        <div className="border-t border-border/50 pt-8 text-center text-muted-foreground text-sm">
          <p>© {new Date().getFullYear()} HIXA. {language === 'en' ? 'All rights reserved.' : 'جميع الحقوق محفوظة.'}</p>
        </div>
      </div>
    </footer>
  );
};