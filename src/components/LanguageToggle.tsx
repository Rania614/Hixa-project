import { useState, useEffect, useRef } from 'react';
import { Globe, ChevronUp, Check } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { HexagonIcon } from '@/components/ui/hexagon-icon';

const languages = [
  {
    code: 'ar',
    label: 'العربية',
    labelEn: 'Arabic',
    flag: '🇸🇦', // Saudi Arabia flag
    codeDisplay: 'AR'
  },
  {
    code: 'en',
    label: 'English',
    labelEn: 'English',
    flag: '🇬🇧', // UK flag
    codeDisplay: 'EN'
  }
];

export const LanguageToggle = () => {
  const { language, setLanguage } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLanguage = languages.find(lang => lang.code === language) || languages[0];

  const handleLanguageChange = (langCode: string) => {
    if (langCode !== language) {
      setLanguage(langCode);
      document.documentElement.dir = langCode === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = langCode;
    }
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 h-auto bg-hexa-card hover:bg-hexa-secondary/20 border border-hexa-border rounded-lg transition-colors"
      >
        <ChevronUp className={`h-3.5 w-3.5 transition-transform text-hexa-text-light ${isOpen ? '' : 'rotate-180'}`} />
        <span className="font-medium text-sm text-hexa-text-dark">{currentLanguage.codeDisplay}</span>
        <Globe className="h-4 w-4 text-hexa-secondary" />
      </Button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-hexa-card border border-hexa-border rounded-lg shadow-lg z-50 overflow-hidden">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full flex items-center justify-between px-4 py-3 hover:bg-hexa-secondary/20 transition-colors ${
                language === lang.code ? 'bg-hexa-secondary/10' : ''
              }`}
            >
              <div className="flex items-center gap-3 flex-1">
                {language === lang.code ? (
                  <div className="w-5 h-5 rounded-full bg-hexa-secondary flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-black" />
                  </div>
                ) : (
                  <div className="w-5 h-5 flex-shrink-0" />
                )}
                <span className={`text-sm ${language === lang.code ? 'text-hexa-secondary font-medium' : 'text-hexa-text-dark'}`}>
                  {lang.label} ({lang.codeDisplay})
                </span>
              </div>
              <span className="text-lg flex-shrink-0">{lang.flag}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
