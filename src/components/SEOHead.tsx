import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
}

export const SEOHead = ({ 
  title, 
  description, 
  keywords, 
  image 
}: SEOHeadProps) => {
  const { language } = useApp();
  const location = useLocation();

  useEffect(() => {
    // Default SEO content
    const defaultTitle = {
      ar: 'هيكسا - High Xpert ARTBUILD | منصة ربط الخبرات والمشاريع الهندسية',
      en: 'HIXA - High Xpert ARTBUILD | Engineering Projects Platform'
    };

    const defaultDescription = {
      ar: 'هيكسا HIXA – High XpertA شركة مقاولات ومنصة هندسية. هيكسا ..لكل مشروع لاينسى ..شركة مقاولات وتصميم وإشراف هندسي وتطوير عقاري ومنصة تربط أصحاب المشاريع بالمهندسين والمقاولين لتنفيذ احترافي متكامل',
      en: 'HIXA – High XpertA: A contracting company and engineering platform. HIXA — for every unforgettable project. Contracting, design, engineering supervision, real estate development, and a platform connecting project owners with engineers and contractors for integrated professional execution.'
    };

    const defaultKeywords = {
      ar: 'هيكسا, HIXA, مشاريع هندسية, مهندسين, شركات بناء, منصة مشاريع, هندسة معمارية, بناء وتشييد, السعودية',
      en: 'HIXA, engineering projects, engineers, construction companies, project platform, architecture, construction, Saudi Arabia'
    };

    const defaultImage = 'https://hixa.com/og-image.jpg';

    // Use provided values or defaults
    const finalTitle = title || defaultTitle[language];
    const finalDescription = description || defaultDescription[language];
    const finalKeywords = keywords || defaultKeywords[language];
    const finalImage = image || defaultImage;

    // Get current URL
    const currentUrl = window.location.origin + location.pathname + location.search;

    // Update document title
    document.title = finalTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };

    // Update primary meta tags
    updateMetaTag('title', finalTitle);
    updateMetaTag('description', finalDescription);
    updateMetaTag('keywords', finalKeywords);
    
    // Update Open Graph tags
    updateMetaTag('og:title', finalTitle, true);
    updateMetaTag('og:description', finalDescription, true);
    updateMetaTag('og:url', currentUrl, true);
    updateMetaTag('og:image', finalImage, true);
    updateMetaTag('og:locale', language === 'ar' ? 'ar_SA' : 'en_US', true);
    
    // Update Twitter Card tags
    updateMetaTag('twitter:title', finalTitle);
    updateMetaTag('twitter:description', finalDescription);
    updateMetaTag('twitter:image', finalImage);
    
    // Update language attribute
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';

    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

    // Update hreflang tags
    const updateHreflang = (lang: string, url: string) => {
      let link = document.querySelector(`link[hreflang="${lang}"]`) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'alternate');
        link.setAttribute('hreflang', lang);
        document.head.appendChild(link);
      }
      link.setAttribute('href', url);
    };

    const baseUrl = window.location.origin + location.pathname;
    updateHreflang('ar', baseUrl + (location.search ? location.search + '&lang=ar' : '?lang=ar'));
    updateHreflang('en', baseUrl + (location.search ? location.search + '&lang=en' : '?lang=en'));
    updateHreflang('x-default', baseUrl);

  }, [language, location, title, description, keywords, image]);

  return null; // This component doesn't render anything
};

