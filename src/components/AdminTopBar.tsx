import { useApp } from '@/context/AppContext';
import { LanguageToggle } from './LanguageToggle';

export const AdminTopBar = () => {
  const { language } = useApp();

  return (
    <header className="h-16 border-b border-border bg-card/50 backdrop-blur-lg flex items-center justify-between px-6">
      <div>
        <h1 className="text-2xl font-bold">
          {language === 'en' ? 'Admin Dashboard' : 'لوحة التحكم'}
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        <LanguageToggle />
      </div>
    </header>
  );
};
