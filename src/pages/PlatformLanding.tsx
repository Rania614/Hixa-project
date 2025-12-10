import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Chatbot } from '@/components/Chatbot';
import { Hero } from '@/components/Hero';
import { About } from '@/components/About';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Instagram, MessageCircle, Twitter, Send, X, Facebook, Linkedin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { http } from '@/services/http';
import { toast } from '@/components/ui/sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const Landing = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  const [subscribeHover, setSubscribeHover] = useState(false);
  const [getStartedHover, setGetStartedHover] = useState(false);
  const [subscribeFormHover, setSubscribeFormHover] = useState(false);
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

  const handleSubscribe = async (name: string, email: string, phone?: string) => {
    if (!email || !email.trim()) {
      toast.error(language === 'en' 
        ? 'Please enter a valid email address' 
        : 'يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      toast.error(language === 'en' 
        ? 'Please enter a valid email address' 
        : 'يرجى إدخال بريد إلكتروني صحيح');
      return;
    }

    setSubscribing(true);
    try {
      const payload: { 
        name?: string;
        email: string; 
        phone?: string;
      } = {
        email: email.trim()
      };
      
      // Add name if provided
      if (name && name.trim()) {
        payload.name = name.trim();
      }
      
      // Add phone if provided
      if (phone && phone.trim()) {
        const phonePattern = /^[\d\s\-\+\(\)]{8,}$/;
        if (phonePattern.test(phone.trim())) {
          payload.phone = phone.trim();
        }
      }

      const response = await http.post('/subscribers/subscribe', payload);
      
      // Check if backend response indicates email was sent
      const responseMessage = response?.data?.message || '';
      const emailSent = responseMessage.toLowerCase().includes('email') || 
                       responseMessage.toLowerCase().includes('sent') ||
                       responseMessage.toLowerCase().includes('إرسال');
      
      if (emailSent) {
        toast.success(
          language === 'en' 
            ? 'Thank you for subscribing! A confirmation email has been sent to your inbox.' 
            : 'شكراً لك على الاشتراك! تم إرسال إيميل تأكيد إلى بريدك الإلكتروني.'
        );
      } else {
        toast.success(language === 'en' ? 'Thank you for subscribing!' : 'شكراً لك على الاشتراك!');
      }
      
      setSubscribeModalOpen(false);
      setSubscribeName('');
      setSubscribeEmail('');
      setSubscribePhone('');
    } catch (error: any) {
      console.error('Error subscribing:', error);
      console.error('Error response:', error.response?.data);
      
      // Handle 409 Conflict (already subscribed)
      if (error.response?.status === 409) {
        // Check if backend message indicates email was sent
        const backendMessage = error.response?.data?.message || error.response?.data?.error || '';
        const emailSent = backendMessage.toLowerCase().includes('email') || 
                         backendMessage.toLowerCase().includes('sent') ||
                         backendMessage.toLowerCase().includes('إرسال');
        
        if (emailSent) {
          toast.success(
            language === 'en' 
              ? 'You are already subscribed! A confirmation email has been sent to your inbox.' 
              : 'أنت مشترك بالفعل! تم إرسال إيميل تأكيد إلى بريدك الإلكتروني.'
          );
        } else {
          toast.success(
            language === 'en' 
              ? 'You are already subscribed! Thank you for your interest.' 
              : 'أنت مشترك بالفعل! شكراً لاهتمامك.'
          );
        }
        setSubscribeModalOpen(false);
        setSubscribeName('');
        setSubscribeEmail('');
        setSubscribePhone('');
      } else {
        // For successful subscription (200/201), check if email was sent
        const backendMessage = error.response?.data?.message || error.response?.data?.error || '';
        const errorMessage = backendMessage || 
                            (language === 'en' 
                              ? 'Failed to subscribe. Please try again.' 
                              : 'فشل الاشتراك. يرجى المحاولة مرة أخرى.');
        toast.error(errorMessage);
      }
    } finally {
      setSubscribing(false);
    }
  };

  const handleSubscribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subscribeEmail.trim()) {
      handleSubscribe(subscribeName, subscribeEmail.trim(), subscribePhone.trim() || undefined);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section with Animated Geometric Shapes */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
        {/* Animated Geometric Background Shapes */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 bg-gold/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/3 w-32 h-32 border border-gold/20 rotate-45 animate-float" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/3 right-1/4 w-24 h-24 bg-gold/5 rotate-12 animate-float" style={{ animationDelay: '0.5s' }} />
          <div className="absolute bottom-1/3 left-1/4 w-40 h-40 border-2 border-gold/10 rounded-full animate-float" style={{ animationDelay: '3s' }} />
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="mb-8 animate-slide-up">
            <h1 className="text-6xl md:text-8xl font-bold mb-2">
              <span className="block text-gold">{language === 'en' ? 'HIXA' : 'هيكسا'}</span>
            </h1>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
            {language === 'en' ? 'High Xpert ARTBUILD' : 'لكل مشروع لا ينسى'}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
            {language === 'en' 
              ? 'Connecting clients with professional engineers to execute engineering projects seamlessly'
              : 'ربط العملاء مع المهندسين المحترفين لتنفيذ المشاريع الهندسية بسلاسة'}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center w-full sm:w-auto px-4 sm:px-0 animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <button 
              onMouseEnter={() => setSubscribeHover(true)}
              onMouseLeave={() => setSubscribeHover(false)}
              onClick={() => setSubscribeModalOpen(true)}
              disabled={subscribing}
              className="hexagon bg-transparent border-2 border-gold text-gold hover:bg-gold hover:text-black font-semibold px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{subscribing ? (language === 'en' ? 'Subscribing...' : 'جاري الاشتراك...') : (language === 'en' ? 'Subscribe' : 'اشترك')}</span>
            </button>
            <div className="dropdown-container relative w-full sm:w-auto">
              <button 
                onMouseEnter={() => setGetStartedHover(true)}
                onMouseLeave={() => {
                  setGetStartedHover(false);
                  // Delay closing dropdown to allow hover on menu items
                  setTimeout(() => {
                    if (!dropdownOpen) return;
                    const dropdown = document.querySelector('.dropdown-menu');
                    if (dropdown && !dropdown.matches(':hover')) {
                      setDropdownOpen(false);
                    }
                  }, 200);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  setDropdownOpen(!dropdownOpen);
                }}
                className="hexagon bg-gold hover:bg-gold-dark text-black font-semibold px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base flex items-center justify-center gap-2 relative w-full sm:w-auto"
              >
                <span>{getStartedHover ? (language === 'en' ? 'Coming Soon' : 'قريباً') : (language === 'en' ? 'Get Started' : 'ابدأ الآن')}</span>
                {dropdownOpen && (
                  <div 
                    className="dropdown-menu absolute top-full left-0 mt-2 w-48 bg-background/95 backdrop-blur-sm border border-gold/20 rounded-lg shadow-lg z-50 py-2 opacity-0 animate-in fade-in slide-in-from-top-2 duration-200"
                    onMouseEnter={() => setDropdownOpen(true)}
                    onMouseLeave={() => setDropdownOpen(false)}
                    style={{ opacity: 1 }}
                  >
                    <button
                      onClick={() => {
                        navigate('/client/dashboard');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors duration-200 opacity-60 hover:opacity-100"
                      title={language === 'en' ? 'Client Dashboard' : 'لوحة تحكم العميل'}
                    >
                      {language === 'en' ? 'Client Dashboard' : 'لوحة تحكم العميل'}
                    </button>
                    <button
                      onClick={() => {
                        navigate('/engineer/dashboard');
                        setDropdownOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-gold hover:bg-gold/10 transition-colors duration-200 opacity-60 hover:opacity-100"
                      title={language === 'en' ? 'Engineer Dashboard' : 'لوحة تحكم المهندس'}
                    >
                      {language === 'en' ? 'Engineer Dashboard' : 'لوحة تحكم المهندس'}
                    </button>
                  </div>
                )}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about">
        <About />
      </section>

      {/* Subscription Section */}
      <section id="subscription" className="py-20 bg-secondary/30">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">
              {language === 'en' ? 'Subscribe to Our Newsletter' : 'اشترك في نشرتنا الإخبارية'}
            </h2>
            <div className="text-xl text-muted-foreground mb-2 space-y-2">
              <p className={language === 'ar' ? 'text-right' : ''}>
                {language === 'en' 
                  ? 'Get engineering reports, tenders, project opportunities, and case studies delivered to your inbox.'
                  : 'احصل على تقارير هندسية، مناقصات، فرص مشاريع، ودراسات حالة مباشرة إلى بريدك.'}
              </p>
              <p className={language === 'ar' ? 'text-right' : ''}>
                {language === 'en' 
                  ? 'We send you: tech news, job opportunities, and engineering analyses.'
                  : ' أخبار تقنية، فرص عمل، وتحليلات هندسية.'}
              </p>
            </div>
            <form onSubmit={handleSubscribeSubmit} className="max-w-md mx-auto mb-6 space-y-4 mt-8">
              <div>
                <label htmlFor="subscription-name" className="block text-sm font-medium mb-2 text-foreground text-left">
                  {language === 'en' ? 'Name (Optional)' : 'الاسم (اختياري)'}
                </label>
                <Input
                  id="subscription-name"
                  type="text"
                  value={subscribeName}
                  onChange={(e) => setSubscribeName(e.target.value)}
                  placeholder={language === 'en' ? 'Your name' : 'اسمك'}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
              
              <div>
                <label htmlFor="subscription-email" className="block text-sm font-medium mb-2 text-foreground text-left">
                  {language === 'en' ? 'Email' : 'البريد الإلكتروني'} <span className="text-red-500">*</span>
                </label>
                <Input
                  id="subscription-email"
                  type="email"
                  value={subscribeEmail}
                  onChange={(e) => setSubscribeEmail(e.target.value)}
                  placeholder={language === 'en' ? 'your.email@example.com' : 'بريدك@example.com'}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                  required
                />
              </div>
              
              <div>
                <label htmlFor="subscription-phone" className="block text-sm font-medium mb-2 text-foreground text-left">
                  {language === 'en' ? 'Phone Number (Optional )' : 'رقم الهاتف (اختياري )'}
                </label>
                <Input
                  id="subscription-phone"
                  type="tel"
                  value={subscribePhone}
                  onChange={(e) => setSubscribePhone(e.target.value)}
                  placeholder={language === 'en' ? '+1234567890' : '+966501234567'}
                  className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
              
              <p className="text-sm text-muted-foreground text-left">
                {language === 'en' 
                  ? 'We send one email per month only – no spam.'
                  : 'نرسل بريدًا واحدًا شهريًا فقط – بدون سبام.'}
              </p>
              
              <button 
                type="submit"
                onMouseEnter={() => setSubscribeFormHover(true)}
                onMouseLeave={() => setSubscribeFormHover(false)}
                disabled={subscribing || !subscribeEmail.trim()}
                className="w-full rounded-lg bg-[#D4AC35] hover:bg-[#B8941F] text-[#071025] font-semibold px-8 py-3 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-md hover:shadow-lg"
              >
                {subscribing 
                  ? (language === 'en' ? 'Subscribing...' : 'جاري الاشتراك...') 
                  : (language === 'en' ? 'Join Engineers List' : 'انضم لقائمة المهندسين')}
              </button>
              
              <p className="text-xs text-muted-foreground text-left mt-2">
                {language === 'en' 
                  ? 'We will not share your data with any third party.'
                  : 'لن نشارك بياناتك مع أي طرف ثالث.'}
              </p>
            </form>
            
            {/* Social Media Icons */}
            <div className="mt-12">
              <p className="text-lg font-medium text-foreground mb-4">
                {language === 'en' ? 'Follow us for daily engineering content' : 'تابعنا للمحتوى الهندسي اليومي'}
              </p>
              <div className="flex justify-center gap-4 md:gap-6">
                <a 
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border-2 border-[#D4AC35] rounded-full flex items-center justify-center text-[#D4AC35] hover:bg-[#D4AC35] hover:text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#D4AC35] focus:ring-offset-2 focus:ring-offset-[#071025]"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
                <a 
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border-2 border-[#D4AC35] rounded-full flex items-center justify-center text-[#D4AC35] hover:bg-[#D4AC35] hover:text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#D4AC35] focus:ring-offset-2 focus:ring-offset-[#071025]"
                  aria-label="Twitter/X"
                >
                  <Twitter className="w-5 h-5" />
                </a>
                <a 
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border-2 border-[#D4AC35] rounded-full flex items-center justify-center text-[#D4AC35] hover:bg-[#D4AC35] hover:text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#D4AC35] focus:ring-offset-2 focus:ring-offset-[#071025]"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href={socialLinks.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border-2 border-[#D4AC35] rounded-full flex items-center justify-center text-[#D4AC35] hover:bg-[#D4AC35] hover:text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#D4AC35] focus:ring-offset-2 focus:ring-offset-[#071025]"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a 
                  href={socialLinks.telegram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border-2 border-[#D4AC35] rounded-full flex items-center justify-center text-[#D4AC35] hover:bg-[#D4AC35] hover:text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#D4AC35] focus:ring-offset-2 focus:ring-offset-[#071025]"
                  aria-label="Telegram"
                >
                  <Send className="w-5 h-5" />
                </a>
                <a 
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border-2 border-[#D4AC35] rounded-full flex items-center justify-center text-[#D4AC35] hover:bg-[#D4AC35] hover:text-white transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#D4AC35] focus:ring-offset-2 focus:ring-offset-[#071025]"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <Chatbot />

      {/* Subscribe Modal */}
      {subscribeModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSubscribeModalOpen(false);
              setSubscribeName('');
              setSubscribeEmail('');
              setSubscribePhone('');
            }
          }}
        >
          <Card className="w-full max-w-md glass-card relative border-2 border-gold/20 rounded-2xl">
            <Button
              onClick={() => {
                setSubscribeModalOpen(false);
                setSubscribeName('');
                setSubscribeEmail('');
                setSubscribePhone('');
              }}
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-2xl font-bold text-gold">
                {language === 'en' ? 'Subscribe' : 'اشترك'}
              </CardTitle>
              <div className="text-muted-foreground mt-2 space-y-1">
                <p className={language === 'ar' ? 'text-right' : ''}>
                  {language === 'en' 
                    ? 'Get engineering reports, tenders, project opportunities, and case studies delivered to your inbox.'
                    : 'احصل على تقارير هندسية، مناقصات، فرص مشاريع، ودراسات حالة مباشرة إلى بريدك.'}
                </p>
                <p className={language === 'ar' ? 'text-right' : ''}>
                  {language === 'en' 
                    ? 'We send you: ech news, job opportunities, and engineering analyses.'
                    : 'نرسل لك: أخبار تقنية، فرص عمل، وتحليلات هندسية.'}
                </p>
              </div>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubscribeSubmit} className="space-y-4">
                <div>
                  <label htmlFor="subscribe-name" className="block text-sm font-medium mb-2 text-foreground">
                    {language === 'en' ? 'Name (Optional)' : 'الاسم (اختياري)'}
                  </label>
                  <Input
                    id="subscribe-name"
                    type="text"
                    value={subscribeName}
                    onChange={(e) => setSubscribeName(e.target.value)}
                    placeholder={language === 'en' ? 'Your name' : 'اسمك'}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label htmlFor="subscribe-email" className="block text-sm font-medium mb-2 text-foreground">
                    {language === 'en' ? 'Email' : 'البريد الإلكتروني'} <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="subscribe-email"
                    type="email"
                    value={subscribeEmail}
                    onChange={(e) => setSubscribeEmail(e.target.value)}
                    placeholder={language === 'en' ? 'your.email@example.com' : 'بريدك@example.com'}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="subscribe-phone" className="block text-sm font-medium mb-2 text-foreground">
                    {language === 'en' ? 'Phone Number (Optional )' : 'رقم الهاتف (اختيار )'}
                  </label>
                  <Input
                    id="subscribe-phone"
                    type="tel"
                    value={subscribePhone}
                    onChange={(e) => setSubscribePhone(e.target.value)}
                    placeholder={language === 'en' ? '+1234567890' : '+966501234567'}
                    className="w-full px-4 py-3 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                  />
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {language === 'en' 
                    ? 'We send one email per month only – no spam.'
                    : 'نرسل بريدًا واحدًا شهريًا فقط – بدون سبام.'}
                </p>
                
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setSubscribeModalOpen(false);
                      setSubscribeName('');
                      setSubscribeEmail('');
                      setSubscribePhone('');
                    }}
                    className="flex-1"
                  >
                    {language === 'en' ? 'Cancel' : 'إلغاء'}
                  </Button>
                  <Button
                    type="submit"
                    disabled={subscribing || !subscribeEmail.trim()}
                    className="flex-1 rounded-lg bg-[#D4AC35] hover:bg-[#B8941F] text-[#071025] font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    {subscribing 
                      ? (language === 'en' ? 'Subscribing...' : 'جاري الاشتراك...') 
                      : (language === 'en' ? 'Join Engineers List' : 'انضم لقائمة المهندسين')}
                  </Button>
                </div>
                
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {language === 'en' 
                    ? 'We will not share your data with any third party.'
                    : 'لن نشارك بياناتك مع أي طرف ثالث.'}
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default Landing;
