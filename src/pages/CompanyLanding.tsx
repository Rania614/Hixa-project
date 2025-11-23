import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useApp } from '@/context/AppContext';

const CompanyLanding = () => {
  const navigate = useNavigate();
  const { language, content } = useApp();

  const handleGetStarted = () => {
    navigate('/platform');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* New Hero Section */}
      <section id="hero" className="relative h-screen w-full overflow-hidden">
        {/* Background image with dark overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/src/assets/images/heero.jpg')" }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-70"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Top navbar - simplified version for hero section */}
          <nav className="container mx-auto px-6 py-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-gold rounded-full"></div>
              <span className="ml-3 text-white font-bold text-xl">ENGINEERING CORP</span>
            </div>
            
            <div className="hidden md:flex items-center space-x-8">
              <a href="#business" className="text-white hover:text-gold transition-colors">{language === 'en' ? 'Business' : 'الأعمال'}</a>
              <a href="#services" className="text-white hover:text-gold transition-colors">{language === 'en' ? 'Services' : 'الخدمات'}</a>
              <a href="#company" className="text-white hover:text-gold transition-colors">{language === 'en' ? 'Company' : 'الشركة'}</a>
              <a href="#about" className="text-white hover:text-gold transition-colors">{language === 'en' ? 'About Us' : 'عنا'}</a>
            </div>
            
            <Button className="bg-gold hover:bg-gold-dark text-black font-semibold px-6 py-2 hidden md:block">
              {language === 'en' ? 'Get a Quote' : 'احصل على عرض سعر'}
            </Button>
            
            {/* Mobile menu button */}
            <button className="md:hidden text-white">
              <Menu className="h-6 w-6" />
            </button>
          </nav>
          
         <div className="flex-grow flex flex-col items-center justify-center px-6 text-center">
  <div className="animate-fade-in">
    <h1 className="text-5xl md:text-7xl font-bold uppercase mb-6">
      <span className="block text-gold">HIXA</span>
    </h1>
    
    <p className="text-white text-2xl md:text-3xl font-semibold mb-4">
      {language === 'en' ? 'Built to remember.' : 'مبني لتُتذكر.'}
    </p>
    
    <p className="text-white text-xl max-w-3xl mx-auto opacity-90">
      {language === 'en' 
        ? 'Transforming ideas into experiences that leave a lasting impact.' 
        : 'نحول الأفكار إلى تجارب تترك أثراً دائماً.'}
    </p>
    
    {/* Bilingual CTA Buttons */}
    <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
      <button 
        className="bg-transparent border-2 border-gold text-gold hover:bg-gold hover:text-black font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gold focus:ring-opacity-50"
        onClick={() => navigate('/platform')}
      >
        {language === 'en' ? 'Join the Platform' : 'انضم للمنصة'}
      </button>
    </div>
    
    {/* Caption */}
    <p className="text-muted-foreground text-sm mt-6 max-w-2xl mx-auto">
      {language === 'en' 
        ? 'A platform that connects clients with engineers to execute engineering projects professionally.' 
        : 'منصة تربط العملاء بالمهندسين لتنفيذ المشاريع الهندسية باحترافية.'}
    </p>
  </div>
</div>
      
        </div>
      </section>
      
      {/* Rest of the page content */}
      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{language === 'en' ? 'About Our Company' : 'عن شركتنا'}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {language === 'en' 
                ? 'We\'re revolutionizing how engineering projects are executed and managed.' 
                : 'نحن نحدث ثورة في كيفية تنفيذ وإدارة المشاريع الهندسية.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-xl">
              <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center mb-6">
                <span className="text-primary-foreground font-bold">1</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">{language === 'en' ? 'Our Mission' : 'مهمتنا'}</h3>
              <p className="text-muted-foreground">
                {language === 'en' 
                  ? 'To connect exceptional engineering talent with groundbreaking projects, fostering innovation and excellence in every collaboration.' 
                  : 'ربط المواهب الهندسية الاستثنائية بالمشاريع الرائدة، وتعزيز الابتكار والتميز في كل تعاون.'}
              </p>
            </div>
            <div className="glass-card p-8 rounded-xl">
              <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center mb-6">
                <span className="text-primary-foreground font-bold">2</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">{language === 'en' ? 'Our Vision' : 'رؤيتنا'}</h3>
              <p className="text-muted-foreground">
                {language === 'en' 
                  ? 'To become the world\'s leading platform for engineering collaboration, where innovation meets execution seamlessly.' 
                  : 'أن نصبح المنصة الرائدة عالمياً للتعاون الهندسي، حيث يلتقي الابتكار بالتنفيذ بسلاسة.'}
              </p>
            </div>
            <div className="glass-card p-8 rounded-xl">
              <div className="w-12 h-12 bg-gold rounded-full flex items-center justify-center mb-6">
                <span className="text-primary-foreground font-bold">3</span>
              </div>
              <h3 className="text-2xl font-bold mb-4">{language === 'en' ? 'Our Values' : 'قيمنا'}</h3>
              <p className="text-muted-foreground">
                {language === 'en' 
                  ? 'Excellence, integrity, collaboration, and innovation drive everything we do to ensure success for our partners and clients.' 
                  : 'التميز، النزاهة، التعاون، والابتكار تقود كل ما نقوم به لضمان النجاح لشركائنا وعملائنا.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{language === 'en' ? 'Our Services' : 'خدماتنا'}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {language === 'en' 
                ? 'Comprehensive solutions tailored to your engineering needs.' 
                : 'حلول شاملة مصممة خصيصاً لاحتياجاتكم الهندسية.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-gold/20 to-gold/10 flex items-center justify-center">
                <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-2xl">D</span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">{language === 'en' ? 'Design & Architecture' : 'التصميم والهندسة المعمارية'}</h3>
                <p className="text-muted-foreground mb-6">
                  {language === 'en' 
                    ? 'Innovative architectural and engineering design solutions for complex projects.' 
                    : 'حلول تصميم هندسية ومعمارية مبتكرة للمشاريع المعقدة.'}
                </p>
                <Button variant="link" className="p-0 text-gold hover:text-gold-dark">
                  {language === 'en' ? 'Learn more' : 'اعرف المزيد'}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-cyan/20 to-cyan/10 flex items-center justify-center">
                <div className="w-16 h-16 bg-cyan rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-2xl">P</span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">{language === 'en' ? 'Project Management' : 'إدارة المشاريع'}</h3>
                <p className="text-muted-foreground mb-6">
                  {language === 'en' 
                    ? 'End-to-end project management ensuring timely delivery and quality outcomes.' 
                    : 'إدارة المشاريع من البداية للنهاية لضمان التسليم في الوقت المحدد والنتائج عالية الجودة.'}
                </p>
                <Button variant="link" className="p-0 text-gold hover:text-gold-dark">
                  {language === 'en' ? 'Learn more' : 'اعرف المزيد'}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-gold/20 to-cyan/10 flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-gold to-cyan rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-2xl">C</span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">{language === 'en' ? 'Consulting' : 'الاستشارات'}</h3>
                <p className="text-muted-foreground mb-6">
                  {language === 'en' 
                    ? 'Expert consulting services to optimize your engineering processes and solutions.' 
                    : 'خدمات استشارية متخصصة لتحسين عملياتكم وحلولكم الهندسية.'}
                </p>
                <Button variant="link" className="p-0 text-gold hover:text-gold-dark">
                  {language === 'en' ? 'Learn more' : 'اعرف المزيد'}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section id="partners" className="py-20 px-6 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{language === 'en' ? 'Our Partners' : 'شركاؤنا'}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {language === 'en' 
                ? 'We collaborate with industry leaders to deliver exceptional results.' 
                : 'نتعاون مع قادة الصناعة لتقديم نتائج استثنائية.'}
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
            <div className="flex items-center justify-center p-6 bg-card rounded-lg border border-border">
              <div className="text-2xl font-bold text-gold">{language === 'en' ? 'Partner 1' : 'الشريك 1'}</div>
            </div>
            <div className="flex items-center justify-center p-6 bg-card rounded-lg border border-border">
              <div className="text-2xl font-bold text-gold">{language === 'en' ? 'Partner 2' : 'الشريك 2'}</div>
            </div>
            <div className="flex items-center justify-center p-6 bg-card rounded-lg border border-border">
              <div className="text-2xl font-bold text-gold">{language === 'en' ? 'Partner 3' : 'الشريك 3'}</div>
            </div>
            <div className="flex items-center justify-center p-6 bg-card rounded-lg border border-border">
              <div className="text-2xl font-bold text-gold">{language === 'en' ? 'Partner 4' : 'الشريك 4'}</div>
            </div>
            <div className="flex items-center justify-center p-6 bg-card rounded-lg border border-border">
              <div className="text-2xl font-bold text-gold">{language === 'en' ? 'Partner 5' : 'الشريك 5'}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{language === 'en' ? 'Our Projects' : 'مشاريعنا'}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {language === 'en' 
                ? 'Explore our portfolio of successful engineering projects.' 
                : 'استكشف محفظتنا من المشاريع الهندسية الناجحة.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-gold/20 to-gold/10 flex items-center justify-center">
                <div className="w-16 h-16 bg-gold rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-2xl">P1</span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">{language === 'en' ? 'Project Alpha' : 'مشروع ألفا'}</h3>
                <p className="text-muted-foreground mb-6">
                  {language === 'en' 
                    ? 'A cutting-edge infrastructure project that transformed the urban landscape.' 
                    : 'مشروع بنية تحتية متطور غير المشهد الحضري.'}
                </p>
              </div>
            </div>
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-cyan/20 to-cyan/10 flex items-center justify-center">
                <div className="w-16 h-16 bg-cyan rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-2xl">P2</span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">{language === 'en' ? 'Project Beta' : 'مشروع بيتا'}</h3>
                <p className="text-muted-foreground mb-6">
                  {language === 'en' 
                    ? 'An innovative commercial complex that sets new standards in sustainable design.' 
                    : 'مجمع تجاري مبتكر يضع معايير جديدة في التصميم المستدام.'}
                </p>
              </div>
            </div>
            <div className="glass-card rounded-xl overflow-hidden">
              <div className="h-48 bg-gradient-to-r from-gold/20 to-cyan/10 flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-gold to-cyan rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-2xl">P3</span>
                </div>
              </div>
              <div className="p-8">
                <h3 className="text-2xl font-bold mb-4">{language === 'en' ? 'Project Gamma' : 'مشروع غاما'}</h3>
                <p className="text-muted-foreground mb-6">
                  {language === 'en' 
                    ? 'A residential development that combines luxury with environmental responsibility.' 
                    : 'تطوير سكني يجمع بين الفخامة والمسؤولية البيئية.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section id="jobs" className="py-20 px-6 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{language === 'en' ? 'Join Our Team' : 'انضم إلى فريقنا'}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {language === 'en' 
                ? 'We are always looking for talented professionals to join our growing team.' 
                : 'نحن نبحث دائماً عن محترفين موهوبين للانضمام إلى فريقنا المتنامي.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-4">{language === 'en' ? 'Senior Engineer' : 'مهندس رئيسي'}</h3>
              <p className="text-muted-foreground mb-4">
                {language === 'en' 
                  ? '5+ years of experience in structural engineering required.' 
                  : 'مطلوب 5+ سنوات خبرة في الهندسة الإنشائية.'}
              </p>
              <Button variant="link" className="p-0 text-gold hover:text-gold-dark">
                {language === 'en' ? 'Apply Now' : 'تقدم الآن'}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="glass-card p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-4">{language === 'en' ? 'Project Manager' : 'مدير مشاريع'}</h3>
              <p className="text-muted-foreground mb-4">
                {language === 'en' 
                  ? 'Experience in managing large-scale construction projects.' 
                  : 'خبرة في إدارة مشاريع البناء واسعة النطاق.'}
              </p>
              <Button variant="link" className="p-0 text-gold hover:text-gold-dark">
                {language === 'en' ? 'Apply Now' : 'تقدم الآن'}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="glass-card p-8 rounded-xl">
              <h3 className="text-2xl font-bold mb-4">{language === 'en' ? 'Design Architect' : 'مهندس تصميم'}</h3>
              <p className="text-muted-foreground mb-4">
                {language === 'en' 
                  ? 'Creative mind with expertise in modern architectural design.' 
                  : 'عقل إبداعي مع خبرة في التصميم المعماري الحديث.'}
              </p>
              <Button variant="link" className="p-0 text-gold hover:text-gold-dark">
                {language === 'en' ? 'Apply Now' : 'تقدم الآن'}
                <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 px-6 bg-secondary/30">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">{language === 'en' ? 'Ready to Get Started?' : 'مستعد للبدء؟'}</h2>
            <p className="text-xl text-muted-foreground mb-8">
              {language === 'en' 
                ? 'Join thousands of engineering teams already using HIXA Platform.' 
                : 'انضم إلى آلاف فرق الهندسة التي تستخدم منصة HIXA بالفعل.'}
            </p>
            <Button
              onClick={handleGetStarted}
              className="bg-gradient-to-r from-gold-light to-gold hover:from-gold hover:to-gold-dark text-primary-foreground font-semibold px-8 py-6 text-lg"
            >
              {language === 'en' ? 'Get Started Now' : 'ابدأ الآن'}
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default CompanyLanding;