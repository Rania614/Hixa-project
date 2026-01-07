import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Chatbot } from '@/components/Chatbot';
import { About } from '@/components/About';
import { FeaturedProjects } from '@/components/FeaturedProjects';
import { useEffect, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Instagram, MessageCircle, Twitter, X, Linkedin, Handshake, User, ChevronDown, Send, Facebook } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { http } from '@/services/http';
import { toast } from '@/components/ui/sonner';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Landing = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [subscribeName, setSubscribeName] = useState('');
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [subscribePhone, setSubscribePhone] = useState('');
  
  const socialLinks = {
    instagram: 'https://www.instagram.com/hixa_groups?utm_source=qr&igsh=MWo1MG03Z3c0NmF4cQ==',
    whatsapp: 'https://chat.whatsapp.com/LQrlGeLPOFjGlhN7d1Tl52',
    twitter: 'https://x.com/HIXAGroup',
    linkedin: 'https://www.linkedin.com/company/hixa-group',
    telegram: 'https://t.me/projectsco',
    facebook: 'https://www.facebook.com/share/1FpuCgzK8y/'
  };

  const handleSubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail.trim()) {
      toast.error(language === 'en' ? 'Please provide an email' : 'يرجى إدخال البريد الإلكتروني');
      return;
    }
    setSubscribing(true);
    try {
      await http.post('/subscribers/subscribe', { name: subscribeName, email: subscribeEmail });
      toast.success(language === 'en' ? 'Subscribed!' : 'تم الاشتراك بنجاح!');
      setSubscribeModalOpen(false);
    } catch (error) {
      toast.error('Error');
    } finally {
      setSubscribing(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!(event.target as HTMLElement).closest('.hero-dropdown-container')) setDropdownOpen(false);
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* 1. Hero Section (DARK) */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 bg-[#050505] text-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-gold/10 rounded-full blur-3xl animate-float" />
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-6xl md:text-8xl font-bold mb-4 animate-slide-up">
            <span className="text-gold uppercase tracking-tighter">{language === 'en' ? 'HIXA' : 'هيكسا'}</span>
          </h1>
          <h2 className="text-4xl md:text-6xl font-bold mb-8 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {language === 'en' ? 'High Xpert ARTBUILD' : 'لكل مشروع لا ينسى'}
          </h2>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-12 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {language === 'en' 
              ? 'Premium engineering solutions connecting visionaries with expert creators.'
              : 'حلول هندسية متميزة تربط أصحاب الرؤى مع الخبراء المبدعين.'}
          </p>

          <div className="flex flex-wrap gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <button 
              onClick={() => setSubscribeModalOpen(true)}
              className="hexagon border-2 border-gold text-gold hover:bg-gold hover:text-black font-bold px-10 py-4 transition-all"
            >
              {language === 'en' ? 'SUBSCRIBE' : 'اشترك الآن'}
            </button>

            <div className="hero-dropdown-container relative">
              <button 
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="hexagon bg-gold text-black font-bold px-10 py-4 flex items-center gap-2"
              >
                <span>{language === 'en' ? 'GET STARTED' : 'ابدأ الآن'}</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full mt-3 w-64 bg-[#121212] border border-gold/20 rounded-xl shadow-2xl z-50 p-2 overflow-hidden animate-in fade-in zoom-in-95">
                  <button onClick={() => navigate('/auth/partner')} className="w-full text-left px-4 py-4 text-white hover:bg-gold hover:text-black rounded-lg transition-all flex items-center gap-3">
                    <Handshake size={18} /> {language === 'en' ? 'Join as Partner' : 'انضم كشريك'}
                  </button>
                  <button onClick={() => navigate('/client/login')} className="w-full text-left px-4 py-4 text-white hover:bg-gold hover:text-black rounded-lg transition-all flex items-center gap-3">
                    <User size={18} /> {language === 'en' ? 'Client Access' : 'دخول العملاء'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 2. About Section (LIGHT BEIGE) */}
      <section id="about" className="bg-[#FDF9F0] py-20 text-black">
        <div className="container mx-auto px-6 prose-headings:text-black prose-p:text-black">
          <About />
        </div>
      </section>

      {/* 3. Featured Projects (DARK) */}
      <section id="featured-projects" className="bg-[#050505] py-20">
        <FeaturedProjects />
      </section>

      {/* 4. Subscription Section (LIGHT BEIGE) */}
      <section id="subscription" className="py-24 bg-[#FDF9F0] text-black">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-black text-white p-12 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold/20 rounded-full blur-3xl -mr-10 -mt-10" />
            
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-bold mb-4 leading-tight">
                  {language === 'en' ? 'Stay in the Loop' : 'كن على اطلاع دائم'}
                </h2>
                <p className="text-gray-400">
                  {language === 'en' 
                    ? 'Get exclusive updates on our latest projects and architectural innovations.' 
                    : 'احصل على تحديثات حصرية حول أحدث مشاريعنا وابتكاراتنا المعمارية.'}
                </p>
              </div>

              <form onSubmit={handleSubscribeSubmit} className="space-y-4">
                <Input
                  value={subscribeName}
                  onChange={(e) => setSubscribeName(e.target.value)}
                  placeholder={language === 'en' ? 'Name' : 'الاسم'}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 h-14 rounded-2xl"
                />
                <Input
                  type="email"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  placeholder={language === 'en' ? 'Email Address' : 'البريد الإلكتروني'}
                  className="bg-white/10 border-white/20 text-white placeholder:text-gray-500 h-14 rounded-2xl"
                />
                <button 
                  type="submit"
                  disabled={subscribing}
                  className="w-full bg-gold hover:bg-white text-black font-black h-14 rounded-2xl transition-all shadow-lg"
                >
                  {subscribing ? '...' : (language === 'en' ? 'SUBSCRIBE NOW' : 'اشترك الآن')}
                </button>
              </form>
            </div>
          </div>

          {/* All Social Icons Returned */}
          <div className="flex flex-wrap justify-center gap-8 mt-16">
            <a href={socialLinks.linkedin} target="_blank" className="text-black hover:text-gold transition-all transform hover:scale-125"><Linkedin size={28} /></a>
            <a href={socialLinks.twitter} target="_blank" className="text-black hover:text-gold transition-all transform hover:scale-125"><Twitter size={28} /></a>
            <a href={socialLinks.instagram} target="_blank" className="text-black hover:text-gold transition-all transform hover:scale-125"><Instagram size={28} /></a>
            <a href={socialLinks.facebook} target="_blank" className="text-black hover:text-gold transition-all transform hover:scale-125"><Facebook size={28} /></a>
            <a href={socialLinks.whatsapp} target="_blank" className="text-black hover:text-gold transition-all transform hover:scale-125"><MessageCircle size={28} /></a>
            <a href={socialLinks.telegram} target="_blank" className="text-black hover:text-gold transition-all transform hover:scale-125"><Send size={28} /></a>
          </div>
        </div>
      </section>

      <Footer />
      <Chatbot />

      {/* Subscribe Modal */}
      {subscribeModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
          <Card className="w-full max-w-md bg-[#0A0A0A] border border-gold/30 text-white rounded-[2.5rem]">
            <div className="p-10 relative">
              <button onClick={() => setSubscribeModalOpen(false)} className="absolute top-6 right-6 text-gray-500 hover:text-white"><X size={24} /></button>
              <div className="text-center mb-8">
                <CardTitle className="text-3xl font-black text-gold tracking-widest mb-2 uppercase">HIXA INSIDER</CardTitle>
                <p className="text-gray-400 text-sm">{language === 'en' ? 'Join our elite newsletter' : 'انضم لنشرتنا البريدية المتميزة'}</p>
              </div>
              <form onSubmit={handleSubscribeSubmit} className="space-y-4">
                <Input value={subscribeName} onChange={(e) => setSubscribeName(e.target.value)} className="bg-white/5 border-white/10 h-12 rounded-xl" placeholder="Full Name" />
                <Input value={subscribeEmail} onChange={(e) => setSubscribeEmail(e.target.value)} className="bg-white/5 border-white/10 h-12 rounded-xl" placeholder="Email Address" />
                <Button type="submit" className="w-full bg-gold text-black hover:bg-white font-bold h-12 rounded-xl mt-4">
                   {subscribing ? '...' : 'CONFIRM SUBSCRIPTION'}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Landing;