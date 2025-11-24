import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Phone, X, User, Handshake, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const PlatformHero = () => {
  const { content, language, addSubscriber } = useApp();
  const navigate = useNavigate();
  const [showSubscribeModal, setShowSubscribeModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [contactMethod, setContactMethod] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Close dropdown when clicking outside
  const handleClickOutside = (e: MouseEvent) => {
    if (showDropdown && !(e.target as Element).closest('.dropdown-container')) {
      setShowDropdown(false);
    }
  };

  // Add event listener for closing dropdown
  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showDropdown]);

  const handleClientLogin = () => {
    // Navigate to the client authentication page
    navigate('/auth/client');
    setShowDropdown(false);
  };

  const handlePartnerLogin = () => {
    // Navigate to the partner authentication page
    navigate('/auth/partner');
    setShowDropdown(false);
  };

  const handleJoinPlatform = () => {
    setShowSubscribeModal(true);
  };

  const handleSubscribe = () => {
    setShowSubscribeModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Save subscriber data
      if (contactMethod === 'email' && email) {
        await addSubscriber({ email });
      } else if (contactMethod === 'phone' && phone) {
        await addSubscriber({ phone });
      }
      
      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset form after 2 seconds
      setTimeout(() => {
        setIsSuccess(false);
        setShowSubscribeModal(false);
        setEmail('');
        setPhone('');
      }, 2000);
    } catch (error) {
      console.error('Failed to add subscriber:', error);
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gold/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-gold/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/3 w-32 h-32 border border-gold/20 rotate-45 animate-float" style={{ animationDelay: '1s' }} />
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up">
          {content.platformContent.heading[language]}
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {language === 'en' 
            ? 'Your Gateway to Knowledge and Innovation' 
            : 'بوابتك إلى المعرفة والابتكار'}
        </p>
        <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.4s' }}>
          {language === 'en'
            ? 'Browse freely, explore valuable content, and join our community for exclusive updates.'
            : 'تصفح بحرية، واستكشف المحتوى القيم، والانضمام إلى مجتمعنا للحصول على التحديثات الحصرية.'}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: '0.6s' }}>
          {/* Dropdown for Join Platform button */}
          <div className="dropdown-container relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="justify-center whitespace-nowrap hexagon text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary hover:bg-primary/90 h-10 py-2 bg-gradient-to-r from-gold-light to-gold hover:from-gold hover:to-gold-dark text-primary-foreground font-semibold px-8 py-4 text-lg flex items-center gap-2"
            >
              {language === 'en' ? 'Join Platform' : 'انضم إلى المنصة'}
              <ChevronDown className={`h-4 w-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            {showDropdown && (
              <div className="absolute top-full right-0 mt-2 w-64 bg-card border border-border rounded-lg shadow-lg z-50 animate-fade-in">
                <div className="p-2">
                  <button
                    onClick={handleClientLogin}
                    className="whitespace-nowrap hexagon text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-10 px-4 py-2 w-full justify-start font-medium mb-1 flex items-center gap-2 text-foreground hover:bg-gold/10"
                  >
                    <User className="h-4 w-4" />
                    {language === 'en' ? 'Enter as Client' : 'ادخل كعميل'}
                  </button>
                  <button
                    onClick={handlePartnerLogin}
                    className="whitespace-nowrap hexagon text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:text-accent-foreground h-10 px-4 py-2 w-full justify-start font-medium flex items-center gap-2 text-foreground hover:bg-gold/10"
                  >
                    <Handshake className="h-4 w-4" />
                    {language === 'en' ? 'Enter as Partner' : 'ادخل كشريك'}
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <Button
            onClick={handleSubscribe}
            variant="outline"
            className="border-gold text-gold hover:bg-gold hover:text-black font-semibold px-8 py-4 text-lg"
          >
            {language === 'en' ? 'Subscribe' : 'اشتراك'}
          </Button>
        </div>
      </div>

      {/* Subscribe Modal */}
      {showSubscribeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-md glass-card relative">
            <Button
              onClick={() => setShowSubscribeModal(false)}
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">
                {language === 'en' ? 'Join the Platform Community' : 'انضم إلى مجتمع المنصة'}
              </CardTitle>
              <CardDescription>
                {language === 'en' 
                  ? 'Subscribe to stay updated with announcements, releases, and exclusive opportunities' 
                  : 'اشترك لتبقى على اطلاع بأحدث الإعلانات والإصدارات والفرص الحصرية'}
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              {isSuccess ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎉</div>
                  <h3 className="text-xl font-bold mb-2">
                    {language === 'en' ? 'Thank you!' : 'شكراً لك!'}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'en' 
                      ? 'You are now subscribed' 
                      : 'لقد اشتركت الآن'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="flex gap-2 mb-4">
                    <Button
                      type="button"
                      variant={contactMethod === 'email' ? 'default' : 'outline'}
                      className={contactMethod === 'email' ? 'bg-gold hover:bg-gold-dark' : ''}
                      onClick={() => setContactMethod('email')}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      {language === 'en' ? 'Email' : 'البريد الإلكتروني'}
                    </Button>
                    <Button
                      type="button"
                      variant={contactMethod === 'phone' ? 'default' : 'outline'}
                      className={contactMethod === 'phone' ? 'bg-gold hover:bg-gold-dark' : ''}
                      onClick={() => setContactMethod('phone')}
                    >
                      <Phone className="h-4 w-4 mr-2" />
                      {language === 'en' ? 'Phone' : 'الهاتف'}
                    </Button>
                  </div>
                  
                  {contactMethod === 'email' ? (
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-2">
                        {language === 'en' ? 'Email Address' : 'عنوان البريد الإلكتروني'}
                      </label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder={language === 'en' ? 'you@example.com' : 'you@example.com'}
                        className="bg-secondary/50"
                        required
                      />
                    </div>
                  ) : (
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-2">
                        {language === 'en' ? 'Phone Number' : 'رقم الهاتف'}
                      </label>
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder={language === 'en' ? '+1 (555) 123-4567' : '+1 (555) 123-4567'}
                        className="bg-secondary/50"
                        required
                      />
                    </div>
                  )}
                  
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-gold-light to-gold hover:from-gold hover:to-gold-dark text-primary-foreground font-semibold"
                    disabled={isSubmitting}
                  >
                    {isSubmitting 
                      ? (language === 'en' ? 'Submitting...' : 'إرسال...') 
                      : (language === 'en' ? 'Join Now' : 'انضم الآن')}
                  </Button>
                </form>
              )}
            </CardContent>
            
            <CardFooter className="text-center text-sm text-muted-foreground">
              {language === 'en' 
                ? 'No commitment required. Browse freely anytime.' 
                : 'لا يوجد التزام. تصفح بحرية في أي وقت.'}
            </CardFooter>
          </Card>
        </div>
      )}
    </section>
  );
};