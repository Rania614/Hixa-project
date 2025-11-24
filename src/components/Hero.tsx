import { useApp } from '@/context/AppContext';
import { Button } from './ui/button';
import { ArrowRight, User, Handshake } from 'lucide-react';
import { useState } from 'react';
import { AuthModal } from '@/components/auth/AuthModal';

export const Hero = () => {
  const { content, language } = useApp();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authRole, setAuthRole] = useState<'client' | 'partner' | null>(null);

  const handleClientLogin = () => {
    setAuthRole('client');
    setShowAuthModal(true);
  };

  const handlePartnerLogin = () => {
    setAuthRole('partner');
    setShowAuthModal(true);
  };

  const handleAuthSuccess = () => {
    // Authentication successful - could redirect to dashboard
    console.log('Authentication successful for role:', authRole);
  };

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Geometric background shapes */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gold/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 border border-gold/20 rotate-45 animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        {/* HIXA Logo Text */}
        <div className="mb-8 animate-slide-up">
          <h1 className="text-6xl md:text-8xl font-bold mb-2">
            <span className="block text-gold">{content.platformContent.heading[language]}</span>
          </h1>
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
          {content.hero.title[language]}
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {content.hero.subtitle[language]}
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <Button
            onClick={handleClientLogin}
            className="bg-transparent border-2 border-gold text-gold hover:bg-gold hover:text-black font-semibold px-6 py-3 text-base flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            {language === 'en' ? 'Enter as Client' : 'ادخل كعميل'}
          </Button>
          <Button
            onClick={handlePartnerLogin}
            className="bg-gold hover:bg-gold-dark text-black font-semibold px-6 py-3 text-base flex items-center gap-2"
          >
            <Handshake className="h-4 w-4" />
            {language === 'en' ? 'Enter as Partner' : 'ادخل كشريك'}
          </Button>
        </div>
      </div>
      
      <AuthModal 
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={handleAuthSuccess}
        role={authRole}
      />
    </section>
  );
};