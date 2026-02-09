import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Chatbot } from '@/components/Chatbot';
import { FeaturedProjects } from '@/components/FeaturedProjects';
import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  ChevronDown, ArrowRight, X, 
  Box, PencilRuler, Layers, Plus, Mail, User, Handshake
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { http } from '@/services/http';
import { toast } from '@/components/ui/sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const Landing = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  const isAr = language === 'ar';
  
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [subscribePhone, setSubscribePhone] = useState('');
  const [subscribeName, setSubscribeName] = useState('');
  const [subscribeEmail, setSubscribeEmail] = useState('');
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [heroImage, setHeroImage] = useState<string>('');

  // تحميل صورة الهيرو من المحتوى (الداشبورد) — خلفية الهيرو تتغير في الصفحة الرئيسية فقط
  useEffect(() => {
    let cancelled = false;
    http.get('/content')
      .then((res) => {
        if (cancelled) return;
        const hero = res.data?.hero ?? res.data?.data?.hero ?? res.data;
        const img = hero?.image;
        if (img && typeof img === 'string' && img.trim()) setHeroImage(img.trim());
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, []);

  const handleSubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!subscribePhone.trim() || !subscribeEmail.trim()) {
      return toast.error(isAr ? 'رقم الجوال والبريد الإلكتروني مطلوبان' : 'Phone number and email are required');
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(subscribeEmail.trim())) {
      return toast.error(isAr ? 'البريد الإلكتروني غير صحيح' : 'Invalid email format');
    }
    
    setSubscribing(true);
    try {
      const response = await http.post('/subscribers/subscribe', { 
        name: subscribeName.trim() || undefined, 
        phone: subscribePhone.trim(),
        email: subscribeEmail.trim().toLowerCase()
      });
      
      console.log('✅ Subscription successful:', response.data);
      
      toast.success(isAr ? 'تم الاشتراك بنجاح!' : 'Subscribed successfully!');
      
      // Reset form
      setSubscribeName('');
      setSubscribePhone('');
      setSubscribeEmail('');
      
      // Close modal after a short delay
      setTimeout(() => {
        setSubscribeModalOpen(false);
      }, 1500);
    } catch (error: any) { 
      console.error('❌ Subscription error:', error);
      
      // Handle different error cases
      let errorMessage = isAr ? 'حدث خطأ ما. يرجى المحاولة مرة أخرى' : 'Error occurred. Please try again';
      
      if (error.response?.status === 409) {
        errorMessage = isAr ? 'هذا البريد الإلكتروني مشترك بالفعل' : 'This email is already subscribed';
      } else if (error.response?.status === 400) {
        errorMessage = error.response?.data?.message || 
                      (isAr ? 'بيانات غير صالحة. يرجى التحقق من الحقول' : 'Invalid data. Please check the fields');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally { 
      setSubscribing(false); 
    }
  };

  const communityCategories = [
    {
      title: isAr ? "المطورين والعملاء" : "DEVELOPERS",
      desc: isAr ? "أصحاب المشاريع، شركات التطوير، والمستثمرون." : "Project owners, developers, and investors.",
      icon: <Layers size={24} />,
      features: isAr ? ["إدارة مشاريع كاملة", "لوحة تحكم للملاك", "تقييم جدوى"] : ["Full Project Management", "Owner Dashboard", "Feasibility Study"]
    },
    {
      title: isAr ? "الخبراء والمستقلين" : "EXPERTS",
      desc: isAr ? "مهندسون، محللو BIM، ومديرو مشاريع محترفون." : "Engineers, BIM analysts, and professional PMs.",
      icon: <PencilRuler size={24} />,
      features: isAr ? ["اعتماد HIXA الرسمي", "مشاريع On-Demand", "شهادات خبرة"] : ["HIXA Certification", "On-Demand Projects", "Experience Certificates"]
    },
    {
      title: isAr ? "الشركاء والشركات" : "PARTNERS",
      desc: isAr ? "مقاولون، موردون، ومكاتب هندسية متكاملة." : "Contractors, suppliers, and engineering firms.",
      icon: <Box size={24} />,
      features: isAr ? ["مناقصات حصرية", "سوق تجاري للمواد", "شراكات دولية"] : ["Exclusive Tenders", "Materials Marketplace", "Global Partnerships"]
    }
  ];

  const faqs = [
    {
      q: isAr ? "كيف يمكنني الانضمام كشريك في HIXA؟" : "How can I join as a HIXA partner?",
      a: isAr 
        ? "يمكنك التسجيل عبر بوابة الشركاء وتقديم مستندات شركتك. سيقوم فريقنا بمراجعة الطلب وتفعيل الحساب خلال 48 ساعة عمل." 
        : "You can register through the partner portal and submit your company documents. Our team will review and activate your account within 48 business hours."
    },
    {
      q: isAr ? "ما هي المعايير المطلوبة لاعتماد الخبراء؟" : "What are the criteria for expert certification?",
      a: isAr 
        ? "نحن نبحث عن مهندسين ذوي خبرة مثبتة في مشاريع BIM أو إدارة المشاريع الرقمية، مع اجتياز تقييم HIXA الفني لضمان أعلى جودة." 
        : "We look for engineers with proven experience in BIM projects or digital project management, along with passing the HIXA technical assessment."
    },
    {
      q: isAr ? "هل توفر المنصة أدوات لإدارة المشاريع؟" : "Does the platform provide project management tools?",
      a: isAr 
        ? "نعم، توفر HIXA لوحة تحكم متكاملة تتيح للملاك والمطورين متابعة سير العمل، والجدول الزمني لحظة بلحظة وبكل شفافية." 
        : "Yes, HIXA provides an integrated dashboard that allows owners and developers to track workflow, and timelines in real-time with full transparency."
    }
  ];

  return (
    <div className={`min-h-screen bg-[#0A0A0A] text-white selection:bg-yellow-500 selection:text-black ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0" 
           style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      <Header />

      {/* --- Section 1: Hero --- */}
      {/* تم إضافة id="hero" للربط مع الهيدر — خلفية هذه الصفحة ثابتة (لا تتغير من الداشبورد) */}
      <section id="hero" className="relative min-h-screen flex items-center pt-20 overflow-visible">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="inline-block border border-yellow-500/50 px-4 py-1 rounded-full bg-yellow-500/5">
              <span className="text-yellow-500 text-[10px] font-bold uppercase tracking-[0.5em]">
                {isAr ? 'منصة البناء الرقمية' : 'Digital Construction Hub'}
              </span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-black leading-[1.1] tracking-tighter uppercase">
              {isAr ? (
                <>نخلق الفرص، نختصر المسافات،<br /> ونحوّل المشاريع إلى <span className="text-yellow-500">أصول مربحة.</span></>
              ) : (
                <>WE CREATE OPPORTUNITIES,<br /> SHORTEN DISTANCES, AND TURN PROJECTS INTO <span className="text-yellow-500">PROFITABLE ASSETS.</span></>
              )}
            </h1>

            <p className="text-gray-500 text-lg md:text-xl max-w-2xl border-l-2 border-yellow-500/30 px-6 py-2 leading-relaxed">
              {isAr ? 
                'منصة مجانية تجمع أصحاب المشاريع والأراضي، الشركات، المقاولين، المهندسين، والمستقلين لتحويل المشاريع إلى أصول مربحة بأفضل سعر وجودة بجميع المدن.' 
                : 
                'A free platform that brings together project and land owners, companies, contractors, engineers, and freelancers to turn projects into profitable assets with the best price and quality Across all cities.'
              }
            </p>
            
            <div className="flex flex-wrap gap-8 pt-6 items-start">
              <div className="flex flex-col items-center gap-3">
                <button 
                  onClick={() => setSubscribeModalOpen(true)} 
                  className="relative group bg-yellow-500 text-black w-[220px] h-[75px] font-black text-xl uppercase tracking-tighter overflow-hidden transition-all hover:bg-yellow-400 active:scale-95 shadow-[0_0_30px_rgba(234,179,8,0.2)] rounded-[20px] flex items-center justify-center"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    FOLLOW HIXA
                    <div className="w-3 h-3 rounded-full bg-black/20 border border-black/10 shadow-inner" />
                  </span>
                  <div className="absolute top-0 right-0 p-1.5 bg-black text-yellow-500 group-hover:rotate-90 transition-transform">
                    <Plus size={14} />
                  </div>
                </button>
                <span className="text-gray-500 text-sm font-bold tracking-tight">
                  {isAr ? 'بدون تسجيل' : 'no signup required'}
                </span>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div className="relative group">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button 
                        className="w-[220px] h-[75px] border-2 border-white/20 text-white bg-black font-black text-xl uppercase tracking-tighter hover:border-yellow-500/50 hover:bg-yellow-500/5 hover:text-yellow-500 transition-all flex items-center justify-center gap-2 rounded-[20px] relative overflow-hidden group"
                      >
                        <span className="relative z-10">
                          JOIN HIXA
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${isAr ? 'mr-1' : 'ml-1'}`} />
                        <div className="w-3 h-3 rounded-full bg-white/20 border border-white/10 shadow-inner group-hover:bg-yellow-500 transition-colors" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      align={isAr ? "end" : "start"}
                      className="bg-[#0D0D0D] border-white/10 text-white min-w-[220px] mt-2 rounded-lg"
                    >
                      <DropdownMenuItem 
                        className="cursor-pointer hover:bg-yellow-500/10 hover:text-yellow-500 focus:bg-yellow-500/10 focus:text-yellow-500 py-3 px-4 flex items-center gap-2"
                        onClick={() => navigate('/auth/partner')}
                      >
                        {!isAr && <Handshake className="h-6 w-6" />}
                        <span>{isAr ? 'تسجيل الدخول كشريك' : 'Login as Partner'}</span>
                        {isAr && <Handshake className="h-6 w-6" />}
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="cursor-pointer hover:bg-yellow-500/10 hover:text-yellow-500 focus:bg-yellow-500/10 focus:text-yellow-500 py-3 px-4 flex items-center gap-2"
                        onClick={() => navigate('/auth/partner?role=client')}
                      >
                        {!isAr && <User className="h-6 w-6" />}
                        <span>{isAr ? 'تسجيل الدخول كعميل' : 'Login as Client'}</span>
                        {isAr && <User className="h-6 w-6" />}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <span className="text-gray-500 text-xs font-bold leading-tight text-center max-w-[180px]">
                  {isAr ? 'لأصحاب المشاريع، للشركات، والمهندسين' : 'Clients, & partners Professionals'}
                </span>
              </div>
            </div>
            
          </div>

          <div className="relative flex justify-center items-center">
            <div className="absolute inset-0 bg-yellow-500/5 blur-[150px] rounded-full" />
            <div className="relative z-10 border border-white/10 p-4 bg-black/50 backdrop-blur-sm rotate-3 group hover:rotate-0 transition-all duration-700 shadow-2xl rounded-sm">
                <img
                  src={heroImage || './images/herohixa.png'}
                  alt="HIXA"
                  className="w-[400px] h-[550px] object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-yellow-500 text-black p-6 font-black text-2xl shadow-2xl italic">HIXA</div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 2: HIXA Community --- */}
      {/* تم إضافة id="community" للربط مع الهيدر */}
      <section id="community" className="py-32 relative bg-[#0A0A0A] border-t border-white/5">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-7xl font-black italic uppercase tracking-tighter">
              {isAr ? 'مجتمع ' : 'THE '} 
              <span className="text-yellow-500">HIXA</span> 
              {isAr ? ' المتكامل' : ' COMMUNITY'}
            </h2>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            {communityCategories.map((item, i) => (
              <div key={i} className="group relative bg-[#0D0D0D] border border-white/5 p-10 rounded-[45px] hover:border-yellow-500/20 transition-all duration-500 hover:-translate-y-2">
                <div className="mb-10 w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black transition-all duration-500">
                  {item.icon}
                </div>
                <div className="space-y-4 mb-10">
                  <h3 className="text-3xl font-black italic uppercase tracking-tight group-hover:text-yellow-500 transition-colors">{item.title}</h3>
                  <p className="text-gray-500 font-medium leading-relaxed min-h-[50px]">{item.desc}</p>
                </div>
                <ul className="space-y-4 border-t border-white/5 pt-8">
                  {item.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-3 text-sm font-bold text-gray-400 group-hover:text-white transition-colors">
                      <div className="w-5 h-5 rounded-full border border-yellow-500/50 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full" />
                      </div>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Section 3: Featured Projects --- */}
      {/* تم إضافة id="projects" للربط مع الهيدر */}
      {/* <div id="projects">
        <FeaturedProjects />
      </div> */}

      {/* --- Section 4: FAQ --- */}
      {/* تم إضافة id="faq" للربط مع الهيدر */}
      <section id="faq" className="py-32 bg-[#0A0A0A] relative overflow-hidden border-t border-white/5">
        <div className="container mx-auto px-6 max-w-4xl relative z-10">
          <div className="text-center mb-20">
            <span className="text-yellow-500 text-[10px] font-bold uppercase tracking-[0.4em] block mb-4">{isAr ? 'لديك استفسار؟' : 'HAVE QUESTIONS?'}</span>
            <h2 className="text-5xl md:text-6xl font-black italic uppercase tracking-tighter">
              {isAr ? 'الأسئلة ' : 'COMMON '} 
              <span className="text-transparent stroke-text">FAQ</span>
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className={`group border transition-all duration-500 rounded-[30px] overflow-hidden ${activeFaq === i ? 'bg-[#111] border-yellow-500/30' : 'bg-[#0D0D0D] border-white/5 hover:border-white/10'}`}>
                <button onClick={() => setActiveFaq(activeFaq === i ? null : i)} className="w-full flex items-center justify-between p-8">
                  <span className={`text-xl md:text-2xl font-bold transition-colors ${activeFaq === i ? 'text-yellow-500' : 'text-white/80 group-hover:text-white'}`}>{faq.q}</span>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all duration-500 ${activeFaq === i ? 'bg-yellow-500 border-yellow-500 text-black rotate-45' : 'border-white/10 text-white/30'}`}>
                    <Plus size={20} />
                  </div>
                </button>
                <div className={`transition-all duration-500 ${activeFaq === i ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className={`px-8 pb-8 text-gray-500 text-lg border-t border-white/5 pt-6 mx-8`}>{faq.a}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <Chatbot />

      {/* --- Modal SUBSCRIBE (أخبار HIXA) --- */}
      {subscribeModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className={`w-full max-w-5xl bg-[#111] border border-white/10 flex flex-col ${isAr ? 'md:flex-row-reverse' : 'md:flex-row'} shadow-2xl relative overflow-hidden rounded-[40px]`}>
            
            {/* الجزء الجانبي (صورة المبنى مع الطبقة الصفراء) */}
            <div className="hidden md:block w-5/12 relative overflow-hidden">
              <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070" className="w-full h-full object-cover grayscale" alt="Building" />
              <div className="absolute inset-0 bg-yellow-500/80 mix-blend-multiply" />
              <div className={`absolute bottom-10 ${isAr ? 'right-10' : 'left-10'} text-black font-black text-6xl opacity-30 rotate-90 origin-bottom`}>HIXA</div>
            </div>

            {/* الجزء الخاص بالنموذج (Form) */}
            <div className="w-full md:w-7/12 p-12 md:p-20 relative bg-[#111]">
              {/* زر الإغلاق (X) */}
              <button onClick={() => setSubscribeModalOpen(false)} className={`absolute top-8 ${isAr ? 'left-8' : 'right-8'} text-white/30 hover:text-white transition-colors group`}>
                <X size={28} className="group-hover:rotate-90 transition-transform" />
              </button>

              <div className={`mb-12 ${isAr ? 'text-right' : 'text-left'}`}>
                <h3 className={`text-4xl md:text-5xl font-black uppercase tracking-tight mb-2 italic flex items-center gap-2 ${isAr ? 'justify-end' : 'justify-start'}`}>
                  {isAr ? (
                    <><span className="text-yellow-500">أخبار</span> <span className="text-white">HIXA</span></>
                  ) : (
                    <><span className="text-white">HIXA</span> <span className="text-yellow-500">NEWS</span></>
                  )}
                </h3>
                <p className="text-gray-500 text-[20px] font-bold uppercase tracking-[0.3em]">
                  {isAr ? 'اشترك في النشرة الإخبارية للحصول على آخر المشاريع  والتحديثات' : 'SUBSCRIBE TO OUR NEWSLETTER FOR LATEST UPDATES'}
                </p>
              </div>

              <form onSubmit={handleSubscribeSubmit} className="space-y-8">
                {/* حقل الاسم */}
                <div className="border-b border-white/10 pb-2">
                  <input 
                    value={subscribeName} 
                    onChange={(e) => setSubscribeName(e.target.value)} 
                    placeholder={isAr ? "الاسم الكامل" : "FULL NAME"} 
                    className={`w-full bg-transparent border-0 focus:ring-0 ${isAr ? 'text-right' : 'text-left'} text-xl placeholder:text-gray-700 outline-none`} 
                  />
                </div>

                {/* حقل البريد الإلكتروني */}
                <div className="border-b border-white/10 pb-2 relative">
                  <Mail className={`absolute ${isAr ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 text-white/10`} size={20} />
                  <input 
                    type="email" 
                    required 
                    value={subscribeEmail} 
                    onChange={(e) => setSubscribeEmail(e.target.value)} 
                    placeholder={isAr ? "البريد الإلكتروني" : "EMAIL ADDRESS"} 
                    className={`w-full bg-transparent border-0 focus:ring-0 ${isAr ? 'text-right pr-10' : 'text-left pl-10'} text-xl placeholder:text-gray-700 outline-none`} 
                  />
                </div>

                {/* حقل رقم الجوال (الكبير) */}
                <div className="pt-4 border-b border-yellow-500/50 mb-10">
                  <input 
                    required 
                    type="tel" 
                    value={subscribePhone} 
                    onChange={(e) => setSubscribePhone(e.target.value)} 
                    placeholder={isAr ? "رقم الجوال" : "PHONE NUMBER"} 
                    dir={isAr ? "rtl" : "ltr"} 
                    className={`w-full bg-transparent border-0 focus:ring-0 text-4xl md:text-6xl font-black text-white placeholder:text-gray-800 p-0 ${isAr ? 'text-right' : 'text-left'} outline-none`} 
                  />
                </div>
                
                {/* زر الاشتراك المشطوف (GET NEWS NOW) */}
                <button 
                  type="submit"
                  disabled={subscribing} 
                  style={{ clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)' }}
                  className="w-full bg-yellow-500 text-black hover:bg-yellow-400 h-20 font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 group/btn relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {subscribing ? (
                      <span className="animate-pulse">{isAr ? 'جاري الاشتراك...' : 'SUBSCRIBING...'}</span>
                    ) : (
                      <>
                        {isAr ? 'تصلني الأخبار الآن' : 'GET NEWS NOW'}
                        <ArrowRight size={18} className={`${isAr ? 'rotate-180' : ''} group-hover/btn:translate-x-1 transition-transform`} />
                      </>
                    )}
                  </span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .stroke-text { -webkit-text-stroke: 1.5px rgba(255,255,255,0.15); }
        .font-arabic { font-family: 'Cairo', sans-serif; }
      `}</style>
    </div>
  );
};

export default Landing;