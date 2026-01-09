import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Chatbot } from '@/components/Chatbot';
import { FeaturedProjects } from '@/components/FeaturedProjects';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { 
  ChevronDown, ArrowRight, X, 
  Box, PencilRuler, Layers, Plus, Mail 
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { http } from '@/services/http';
import { toast } from '@/components/ui/sonner';
import { Input } from '@/components/ui/input';

const Landing = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  const isAr = language === 'ar';
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [subscribePhone, setSubscribePhone] = useState('');
  const [subscribeName, setSubscribeName] = useState('');
  const [subscribeEmail, setSubscribeEmail] = useState('');

  const handleSubscribeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribePhone.trim() || !subscribeEmail.trim()) {
      return toast.error(isAr ? 'جميع الحقول مطلوبة' : 'All fields are required');
    }
    setSubscribing(true);
    try {
      await http.post('/subscribers/subscribe', { 
        name: subscribeName, 
        phone: subscribePhone,
        email: subscribeEmail 
      });
      toast.success(isAr ? 'تم الاشتراك بنجاح' : 'Subscribed successfully');
      setSubscribeModalOpen(false);
    } catch (error) { 
      toast.error(isAr ? 'حدث خطأ ما' : 'Error occurred'); 
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

  return (
    <div className={`min-h-screen bg-[#0A0A0A] text-white selection:bg-yellow-500 selection:text-black ${isAr ? 'font-arabic' : ''}`} dir={isAr ? 'rtl' : 'ltr'}>
      {/* Grid Background Effect */}
      <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-0" 
           style={{ backgroundImage: `linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)`, backgroundSize: '60px 60px' }} />

      <Header />

      {/* --- Section 1: Hero --- */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-visible">
        <div className="container mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center relative z-10">
          
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="inline-block border border-yellow-500/50 px-4 py-1 rounded-full bg-yellow-500/5">
              <span className="text-yellow-500 text-[10px] font-bold uppercase tracking-[0.5em]">
                {isAr ? 'منصة البناء الرقمية' : 'Digital Construction Hub'}
              </span>
            </div>
            
            <h1 className="text-7xl md:text-[9rem] font-black leading-[0.8] tracking-tighter uppercase">
              HI<span className="text-transparent stroke-text">XA</span><br />
              <span className="text-yellow-500">{isAr ? 'هندسة' : 'CORE.'}</span>
            </h1>

            <p className="text-gray-500 text-lg md:text-xl max-w-md border-l-2 border-yellow-500/30 px-6 py-2 leading-relaxed">
              {isAr 
                ? 'نحول المخططات الورقية إلى واقع ملموس. نربط العقول الهندسية بأدوات المستقبل.' 
                : 'Transforming blueprints into reality. Connecting engineering minds with future tools.'}
            </p>

            <div className="flex flex-wrap gap-5 pt-10 relative items-center">
              <button 
                onClick={() => setSubscribeModalOpen(true)}
                className="relative group bg-yellow-500 text-black px-10 py-6 font-black text-sm uppercase tracking-widest overflow-hidden transition-all hover:bg-yellow-400 active:scale-95 shadow-[0_0_30px_rgba(234,179,8,0.2)] z-10 rounded-2xl"
              >
                <span className="relative z-10">{isAr ? 'انضم إلينا الآن' : 'JOIN US NOW'}</span>
                <div className="absolute top-0 right-0 p-1 bg-black text-yellow-500 group-hover:rotate-45 transition-transform">
                  <Plus size={14} />
                </div>
              </button>

              <div className="relative z-[200]">
                <button 
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className={`px-10 py-6 border ${dropdownOpen ? 'border-yellow-500 bg-yellow-500/5 text-yellow-500' : 'border-white/20 text-white'} font-black text-sm uppercase tracking-widest hover:border-yellow-500/50 transition-all flex items-center gap-4 group rounded-2xl`}
                >
                  {isAr ? 'ابدأ الآن' : 'START NOW'}
                  <ChevronDown className={`transition-transform duration-300 ${dropdownOpen ? (isAr ? 'rotate-90' : '-rotate-90') : ''}`} />
                </button>

                {dropdownOpen && (
                  <div className={`absolute top-0 ${isAr ? 'right-[calc(100%+20px)]' : 'left-[calc(100%+20px)]'} w-72 bg-[#111]/95 border border-white/10 shadow-2xl z-[999] animate-in fade-in slide-in-from-${isAr ? 'right' : 'left'}-5 zoom-in-95 backdrop-blur-3xl overflow-hidden rounded-2xl`}>
                    <button 
                      onClick={() => navigate('/auth/partner')} 
                      className="w-full text-left p-6 hover:bg-yellow-500/10 hover:text-yellow-500 transition-all flex justify-between items-center border-b border-white/5 group"
                    >
                      <span className="font-bold text-xs md:text-sm uppercase tracking-[0.2em] leading-none">
                        {isAr ? 'تسجيل كشريك' : 'JOIN AS PARTNER'}
                      </span>
                      <ArrowRight size={18} className={`${isAr ? 'rotate-180' : ''} group-hover:translate-x-1 transition-transform opacity-50 group-hover:opacity-100`} />
                    </button>
                    <button 
                      onClick={() => navigate('/client/login')} 
                      className="w-full text-left p-6 hover:bg-yellow-500/10 hover:text-yellow-500 transition-all flex justify-between items-center group"
                    >
                      <span className="font-bold text-xs md:text-sm uppercase tracking-[0.2em] leading-none">
                        {isAr ? 'بوابة العملاء' : 'CLIENT ACCESS'}
                      </span>
                      <ArrowRight size={18} className={`${isAr ? 'rotate-180' : ''} group-hover:translate-x-1 transition-transform opacity-50 group-hover:opacity-100`} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="relative flex justify-center items-center">
            <div className="absolute inset-0 bg-yellow-500/5 blur-[150px] rounded-full" />
            <div className="relative z-10 border border-white/10 p-4 bg-black/50 backdrop-blur-sm rotate-3 group hover:rotate-0 transition-all duration-700 shadow-2xl rounded-sm">
                <img 
                 src="https://images.unsplash.com/photo-1517581177682-a085bb7ffb15?q=80&w=2070&auto=format&fit=crop" 
                 className="w-[400px] h-[550px] object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 shadow-2xl"
                />
                <div className="absolute -bottom-6 -left-6 bg-yellow-500 text-black p-6 font-black text-2xl shadow-2xl italic">
                  HIXA
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Section 2: HIXA Community (المحدث بناءً على الصورة) --- */}
      <section className="py-32 relative bg-[#0A0A0A] border-t border-white/5">
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
              <div 
                key={i} 
                className="group relative bg-[#0D0D0D] border border-white/5 p-10 rounded-[45px] hover:border-yellow-500/20 transition-all duration-500 hover:-translate-y-2"
              >
                {/* الأيقونة العلوية */}
                <div className="mb-10 w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-yellow-500 group-hover:bg-yellow-500 group-hover:text-black transition-all duration-500">
                  {item.icon}
                </div>

                {/* النصوص */}
                <div className="space-y-4 mb-10">
                  <h3 className="text-3xl font-black italic uppercase tracking-tight group-hover:text-yellow-500 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-gray-500 font-medium leading-relaxed min-h-[50px]">
                    {item.desc}
                  </p>
                </div>

                {/* قائمة المميزات */}
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

                <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-mono text-yellow-500/40">0{i+1} // CORE_NODE</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Section 3: Featured Projects --- */}
      <section id="projects" className="py-32 bg-[#0A0A0A]">
        <FeaturedProjects />
      </section>

      <Footer />
      <Chatbot />

      {/* --- Modal HIXA INSIGHTS (المحدث تماماً بناءً على الصورة) --- */}
      {subscribeModalOpen && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300">
          <div className="w-full max-w-5xl bg-[#111] border border-white/10 flex flex-col md:flex-row shadow-2xl relative overflow-hidden rounded-[40px]">
            
            {/* الجزء الأيمن (الخلفية الصفراء للمباني) */}
            <div className="hidden md:block w-5/12 relative bg-yellow-500">
               <img 
                src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=2070" 
                className="w-full h-full object-cover mix-blend-multiply opacity-60 grayscale" 
               />
               <div className="absolute inset-0 bg-yellow-600/10" />
               <div className="absolute bottom-10 left-10 text-black font-black text-6xl opacity-20 rotate-90 origin-left">HIXA</div>
            </div>

            {/* الجزء الأيسر (الفورم) */}
            <div className="w-full md:w-7/12 p-12 md:p-20 relative bg-[#111]">
              <button onClick={() => setSubscribeModalOpen(false)} className="absolute top-8 right-8 text-white/30 hover:text-white transition-colors group">
                <X size={28} className="group-hover:rotate-90 transition-transform" />
              </button>

              <div className="mb-12 text-right">
                <h3 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-2 italic flex items-center justify-end gap-2">
                  <span className="text-white">.HIXA</span> <span className="text-yellow-500">INSIGHTS</span>
                </h3>
                <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.3em]">{isAr ? 'اشترك في النشرة الإخبارية' : 'SUBSCRIBE TO OUR NEWSLETTER'}</p>
              </div>

              <form onSubmit={handleSubscribeSubmit} className="space-y-8">
                <div className="border-b border-white/10 pb-2">
                    <input 
                      value={subscribeName} 
                      onChange={(e) => setSubscribeName(e.target.value)} 
                      placeholder={isAr ? "الاسم الكامل" : "FULL NAME"} 
                      className="w-full bg-transparent border-0 focus:ring-0 text-right text-xl placeholder:text-gray-700 outline-none" 
                    />
                </div>
                
                <div className="border-b border-white/10 pb-2 relative">
                   <Mail className={`absolute ${isAr ? 'left-0' : 'right-0'} top-1/2 -translate-y-1/2 text-white/10`} size={20} />
                   <input 
                    type="email" 
                    required 
                    value={subscribeEmail} 
                    onChange={(e) => setSubscribeEmail(e.target.value)} 
                    placeholder={isAr ? "البريد الإلكتروني" : "EMAIL ADDRESS"} 
                    className="w-full bg-transparent border-0 focus:ring-0 text-right text-xl placeholder:text-gray-700 outline-none" 
                   />
                </div>

                <div className="pt-4 border-b border-yellow-500/50 mb-10">
                  <input 
                    required 
                    type="tel" 
                    value={subscribePhone} 
                    onChange={(e) => setSubscribePhone(e.target.value)} 
                    placeholder={isAr ? "رقم الجوال" : "PHONE NUMBER"} 
                    dir="rtl" 
                    className="w-full bg-transparent border-0 focus:ring-0 text-4xl md:text-6xl font-black text-white placeholder:text-gray-800 p-0 text-right outline-none" 
                  />
                </div>

                {/* زر الاشتراك المشطوف (Hexagon-ish button) */}
                <button 
                  disabled={subscribing} 
                  style={{ clipPath: 'polygon(5% 0%, 95% 0%, 100% 50%, 95% 100%, 5% 100%, 0% 50%)' }}
                  className="w-full bg-yellow-500 text-black hover:bg-yellow-400 h-20 font-black text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50"
                >
                  {subscribing ? '...' : (isAr ? 'اشترك الآن' : 'SUBSCRIBE NOW')}
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