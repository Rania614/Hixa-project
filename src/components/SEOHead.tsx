import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '@/context/AppContext';

const SEO_TITLE_AR = 'هيكسا HIXA – High XpertA شركة مقاولات ومنصة هندسية';
const SEO_TITLE_EN = 'HIXA – High XpertA | Construction Company & Engineering Platform Saudi Arabia';
const SEO_DESCRIPTION_AR =
  'هيكسا HIXA – High XpertA شركة مقاولات ومنصة هندسية. هيكسا ..لكل مشروع لاينسى ..شركة مقاولات وتصميم وإشراف هندسي وتطوير عقاري ومنصة تربط أصحاب المشاريع بالمهندسين والمقاولين لتنفيذ احترافي متكامل.';
const SEO_DESCRIPTION_EN =
  'HIXA – High XpertA: contracting, engineering design, supervision, real estate development, and a platform connecting project owners with engineers and contractors in Saudi Arabia.';
const SEO_KEYWORDS_AR =
  'هيكسا, HIXA, High XpertA, شركة مقاولات, تصميم هندسي, إشراف هندسي, تطوير عقاري, منصة هندسية, مهندسين, مقاولين, مشاريع بناء, بناء وتشييد, مقاولات السعودية';
const SEO_KEYWORDS_EN =
  'HIXA, High XpertA, construction company, engineering design, engineering supervision, real estate development, engineering platform, engineers, contractors, building projects, Saudi Arabia';
const SEO_IMAGE = 'https://hixa.com.sa/og-image.jpg';
const SITE_ORIGIN = 'https://hixa.com.sa';

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
  image,
}: SEOHeadProps) => {
  const { language } = useApp();
  const location = useLocation();

  useEffect(() => {
    const defaultTitle = { ar: SEO_TITLE_AR, en: SEO_TITLE_EN };
    const defaultDescription = { ar: SEO_DESCRIPTION_AR, en: SEO_DESCRIPTION_EN };
    const defaultKeywords = { ar: SEO_KEYWORDS_AR, en: SEO_KEYWORDS_EN };

    const finalTitle = title || defaultTitle[language];
    const finalDescription = description || defaultDescription[language];
    const finalKeywords = keywords || defaultKeywords[language];
    const finalImage = image || SEO_IMAGE;

    const path = location.pathname + location.search;
    const currentUrl = `${SITE_ORIGIN}${path.startsWith('/') ? path : `/${path}`}`;

    document.title = finalTitle;
    document.documentElement.lang = language === 'ar' ? 'ar' : 'en';
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';

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

    updateMetaTag('title', finalTitle);
    updateMetaTag('description', finalDescription);
    updateMetaTag('keywords', finalKeywords);
    updateMetaTag('og:title', finalTitle, true);
    updateMetaTag('og:description', finalDescription, true);
    updateMetaTag('og:url', currentUrl, true);
    updateMetaTag('og:image', finalImage, true);
    updateMetaTag('og:locale', language === 'ar' ? 'ar_SA' : 'en_US', true);
    updateMetaTag('og:site_name', SEO_TITLE_AR, true);
    updateMetaTag('twitter:title', finalTitle);
    updateMetaTag('twitter:description', finalDescription);
    updateMetaTag('twitter:image', finalImage);
    updateMetaTag('twitter:image:alt', SEO_TITLE_AR);

    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', currentUrl);

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

    const basePath = location.pathname || '/';
    updateHreflang('ar', `${SITE_ORIGIN}${basePath}`);
    updateHreflang('en', `${SITE_ORIGIN}${basePath}?lang=en`);
    updateHreflang('x-default', `${SITE_ORIGIN}${basePath}`);
  }, [language, location, title, description, keywords, image]);

  return null;
};
