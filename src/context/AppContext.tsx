import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import logo from '@/assets/images/update logo.png';

interface ContentData {
  header: {
    logo: string;
    logoImage: string;
  };
  hero: {
    title: { en: string; ar: string };
    subtitle: { en: string; ar: string };
    cta: { en: string; ar: string };
  };
  about: {
    title: { en: string; ar: string };
    subtitle: { en: string; ar: string };
    values: Array<{
      id: string;
      icon: string;
      title: { en: string; ar: string };
      description: { en: string; ar: string };
    }>;
  };
  services: Array<{
    id: string;
    order: number;
    title: { en: string; ar: string };
    description: { en: string; ar: string };
    icon: string;
  }>;
  projects: Array<{
    id: string;
    order: number;
    title: { en: string; ar: string };
    description: { en: string; ar: string };
    image: string;
  }>;
  platformFeatures: Array<{
    id: string;
    icon: string;
    title: { en: string; ar: string };
    description: { en: string; ar: string };
  }>;
  platformContent: {
    slogan: { en: string; ar: string };
    heading: { en: string; ar: string };
    platformLabel: { en: string; ar: string };
    partnersClientsLabel: { en: string; ar: string };
    ctaButtonLabel: { en: string; ar: string };
    ctaPlatformBadge: { en: string; ar: string };
  };
  cta: {
    title: { en: string; ar: string };
    subtitle: { en: string; ar: string };
    button: { en: string; ar: string };
  };
  footer: {
    links: Array<{ id: string; label: { en: string; ar: string }; url: string }>;
    socials: Array<{ id: string; platform: string; url: string }>;
  };
  partners: Array<{
    id: string;
    name: { en: string; ar: string };
    logo: string;
    order: number;
    active: boolean;
  }>;
  jobs: Array<{
    id: string;
    title: { en: string; ar: string };
    description: { en: string; ar: string };
    status: 'active' | 'inactive';
  }>;
}

interface AppContextType {
  language: 'en' | 'ar';
  setLanguage: (lang: 'en' | 'ar') => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (value: boolean) => void;
  content: ContentData;
  updateContent: (newContent: Partial<ContentData>) => void;
}

const defaultContent: ContentData = {
  header: {
    logo: '',
    logoImage: 'src/assets/images/update logo.png',
  },
  hero: {
    title: {
      en: ' High Xpert ARTBUILD ',
      ar: 'بناء التميز الرقمي',
    },
    subtitle: {
      en: 'Connecting expertise and High Xpert ART BUILD opportunities… with no spatial limits',
      ar: 'نربطك بالخبرات وفرص المشاريع عالية الجودة… بلا حدود مكانية ',
    },
    cta: {
      en: 'Join Platform',
      ar: 'ابدأ الآن',
    },
  },
  about: {
    title: {
      en: 'About HIXA',
      ar: 'عن هيكسا',
    },
    subtitle: {
      en: 'We deliver innovative solutions that drive business growth',
      ar: 'نقدم حلولًا مبتكرة تدفع نمو الأعمال',
    },
    values: [
      {
        id: '1',
        icon: 'Zap',
        title: { en: 'Innovation', ar: 'الابتكار' },
        description: {
          en: 'Cutting-edge solutions for modern challenges',
          ar: 'حلول متطورة للتحديات الحديثة',
        },
      },
      {
        id: '2',
        icon: 'Shield',
        title: { en: 'Quality', ar: 'الجودة' },
        description: {
          en: 'Excellence in every detail we deliver',
          ar: 'التميز في كل تفصيلة نقدمها',
        },
      },
      {
        id: '3',
        icon: 'Rocket',
        title: { en: 'Growth', ar: 'النمو' },
        description: {
          en: 'Scalable solutions that grow with you',
          ar: 'حلول قابلة للتوسع تنمو معك',
        },
      },
    ],
  },
  services: [
    {
      id: '1',
      order: 1,
      title: { en: 'Web Development', ar: 'تطوير الويب' },
      description: {
        en: 'Custom websites and web applications built with modern technologies',
        ar: 'مواقع ويب وتطبيقات مخصصة مبنية بتقنيات حديثة',
      },
      icon: 'Code',
    },
    {
      id: '2',
      order: 2,
      title: { en: 'Mobile Apps', ar: 'تطبيقات الجوال' },
      description: {
        en: 'Native and cross-platform mobile applications',
        ar: 'تطبيقات جوال أصلية ومتعددة المنصات',
      },
      icon: 'Smartphone',
    },
    {
      id: '3',
      order: 3,
      title: { en: 'UI/UX Design', ar: 'تصميم واجهات المستخدم' },
      description: {
        en: 'Beautiful and intuitive user experiences',
        ar: 'تجارب مستخدم جميلة وبديهية',
      },
      icon: 'Palette',
    },
    {
      id: '4',
      order: 4,
      title: { en: 'Digital Strategy', ar: 'الاستراتيجية الرقمية' },
      description: {
        en: 'Comprehensive digital transformation consulting',
        ar: 'استشارات شاملة للتحول الرقمي',
      },
      icon: 'Target',
    },
  ],
  projects: [
    {
      id: '1',
      order: 1,
      title: { en: 'E-Commerce Platform', ar: 'منصة التجارة الإلكترونية' },
      description: {
        en: 'Modern shopping experience with seamless checkout',
        ar: 'تجربة تسوق حديثة مع دفع سلس',
      },
      image: '/placeholder.svg',
    },
    {
      id: '2',
      order: 2,
      title: { en: 'Financial Dashboard', ar: 'لوحة التحكم المالية' },
      description: {
        en: 'Real-time analytics and reporting system',
        ar: 'نظام تحليلات وتقارير في الوقت الفعلي',
      },
      image: '/placeholder.svg',
    },
    {
      id: '3',
      order: 3,
      title: { en: 'Healthcare App', ar: 'تطبيق الرعاية الصحية' },
      description: {
        en: 'Patient management and telemedicine platform',
        ar: 'منصة إدارة المرضى والطب عن بعد',
      },
      image: '/placeholder.svg',
    },
  ],
  platformFeatures: [
    {
      id: '1',
      icon: 'Layers',
      title: { en: 'Scalable Architecture', ar: 'بنية قابلة للتوسع' },
      description: {
        en: 'Built to grow with your business needs',
        ar: 'مصممة للنمو مع احتياجات عملك',
      },
    },
    {
      id: '2',
      icon: 'Lock',
      title: { en: 'Secure & Reliable', ar: 'آمن وموثوق' },
      description: {
        en: 'Enterprise-grade security and 99.9% uptime',
        ar: 'أمان على مستوى المؤسسات ووقت تشغيل 99.9٪',
      },
    },
    {
      id: '3',
      icon: 'Sparkles',
      title: { en: 'AI-Powered', ar: 'مدعوم بالذكاء الاصطناعي' },
      description: {
        en: 'Smart features that enhance user experience',
        ar: 'ميزات ذكية تعزز تجربة المستخدم',
      },
    },
    {
      id: '4',
      icon: 'Gauge',
      title: { en: 'High Performance', ar: 'أداء عالي' },
      description: {
        en: 'Lightning-fast load times and smooth interactions',
        ar: 'أوقات تحميل سريعة وفاعلات سلسة',
      },
    },
  ],
  platformContent: {
    slogan: {
      en: 'Connecting expertise and High Xpert ART BUILD opportunities with no spatial limits',
      ar: 'ربطك بالخبرات وفرص المشاريع عالية الجودة... بلا حدود مكانية',
    },
    heading: {
      en: 'HIXA Platform',
      ar: 'منصة هيكسا',
    },
    platformLabel: {
      en: 'Platform-specific',
      ar: 'خاص بالمنصة',
    },
    partnersClientsLabel: {
      en: 'Partners – Clients',
      ar: 'شركاؤنا - عملاؤنا',
    },
    ctaButtonLabel: {
      en: 'Get Started',
      ar: 'ابدأ الآن',
    },
    ctaPlatformBadge: {
      en: 'Platform-specific',
      ar: 'خاص بالمنصة',
    },
  },
  cta: {
    title: {
      en: 'Ready to Start Your Project?',
      ar: 'مستعد لبدء مشروعك؟',
    },
    subtitle: {
      en: 'Let\'s build something amazing together',
      ar: 'لنبني شيئًا مذهلاً معًا',
    },
    button: {
      en: 'Get Started',
      ar: 'ابدأ الآن',
    },
  },
  footer: {
    links: [
      { id: '1', label: { en: 'About', ar: 'عن الشركة' }, url: '#about' },
      { id: '2', label: { en: 'Services', ar: 'الخدمات' }, url: '#services' },
      { id: '3', label: { en: 'Projects', ar: 'المشاريع' }, url: '#projects' },
      { id: '4', label: { en: 'Contact', ar: 'اتصل بنا' }, url: '#contact' },
    ],
    socials: [
      { id: '1', platform: 'Twitter', url: 'https://twitter.com' },
      { id: '2', platform: 'LinkedIn', url: 'https://linkedin.com' },
      { id: '3', platform: 'GitHub', url: 'https://github.com' },
    ],
  },
  partners: [
    {
      id: '1',
      name: { en: 'TechCorp', ar: 'شركة التقنية' },
      logo: '/placeholder.svg',
      order: 1,
      active: true,
    },
    {
      id: '2',
      name: { en: 'InnovateX', ar: 'ابتكار إكس' },
      logo: '/placeholder.svg',
      order: 2,
      active: true,
    },
    {
      id: '3',
      name: { en: 'BuildMaster', ar: 'ماستر البناء' },
      logo: '/placeholder.svg',
      order: 3,
      active: true,
    },
    {
      id: '4',
      name: { en: 'DesignPro', ar: 'برو التصميم' },
      logo: '/placeholder.svg',
      order: 4,
      active: true,
    },
  ],
  jobs: [
    {
      id: '1',
      title: { en: 'Senior Frontend Developer', ar: 'مطور واجهات أمامية رئيسي' },
      description: {
        en: 'We are looking for an experienced frontend developer to join our team.',
        ar: 'نبحث عن مطور واجهات أمامية ذو خبرة للانضمام إلى فريقنا.',
      },
      status: 'active',
    },
    {
      id: '2',
      title: { en: 'Backend Engineer', ar: 'مهندس خلفية' },
      description: {
        en: 'Join our backend team to build scalable and reliable systems.',
        ar: 'انضم إلى فريق الخلفية لدينا لبناء أنظمة قابلة للتوسع ومثبته.',
      },
      status: 'active',
    },
    {
      id: '3',
      title: { en: 'UI/UX Designer', ar: 'مصمم واجهات المستخدم' },
      description: {
        en: 'Create beautiful and intuitive user experiences for our clients.',
        ar: 'أنشئ تجارب مستخدم جميلة وبديهية لعملائنا.',
      },
      status: 'active',
    },
  ],
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'ar'>('en');
  // Set isAuthenticated to false by default - user needs to login
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [content, setContent] = useState<ContentData>(defaultContent);

  // Debugging: Log authentication state changes
  useEffect(() => {
    console.log('Authentication state changed:', isAuthenticated);
  }, [isAuthenticated]);

  const updateContent = (newContent: Partial<ContentData>) => {
    setContent((prev) => ({ ...prev, ...newContent }));
  };

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        isAuthenticated,
        setIsAuthenticated,
        content,
        updateContent,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};