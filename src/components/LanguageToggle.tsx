import { Globe } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { HexagonIcon } from '@/components/ui/hexagon-icon';

export const LanguageToggle = () => {
  const { language, setLanguage } = useApp();

  const toggleLanguage = () => {
    const newLang = language === 'en' ? 'ar' : 'en';
    setLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleLanguage}
      className="hover:bg-accent/20 transition-colors"
    >
      <HexagonIcon size="sm">
        <Globe className="h-5 w-5" />
      </HexagonIcon>
      <span className="sr-only">{language === 'en' ? 'Switch to Arabic' : 'التبديل إلى الإنجليزية'}</span>
    </Button>
  );
};
