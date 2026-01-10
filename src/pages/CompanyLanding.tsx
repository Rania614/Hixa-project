import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Chatbot } from "@/components/Chatbot";
import { Partners } from "@/components/Partners";
import { Jobs } from "@/components/Jobs";
import { SkeletonCard } from "@/components/SkeletonCard";
import { useLandingStore } from "@/stores/landingStore";
import { useShallow } from "zustand/react/shallow";
import { useApp } from "@/context/AppContext";
import { http } from "@/services/http";
import { toast } from "@/components/ui/sonner";
import { HeroSection } from "@/components/company-landing/HeroSection";
import { AboutSection } from "@/components/company-landing/AboutSection";
import { ServicesSection } from "@/components/company-landing/ServicesSection";
import { ProjectsSection } from "@/components/company-landing/ProjectsSection";
import { ContactSection } from "@/components/company-landing/ContactSection";
import { ServiceDetailsModal } from "@/components/company-landing/modals/ServiceDetailsModal";
import { ProjectDetailsModal } from "@/components/company-landing/modals/ProjectDetailsModal";
import { ImageModal } from "@/components/company-landing/modals/ImageModal";
import { OrderModal } from "@/components/company-landing/modals/OrderModal";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";


const CompanyLanding = () => {
  const navigate = useNavigate();
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [serviceDetailsModalOpen, setServiceDetailsModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [selectedServiceForDetails, setSelectedServiceForDetails] = useState<any>(null);
  const [selectedServiceDetails, setSelectedServiceDetails] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [orderDetails, setOrderDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedCardIndex, setExpandedCardIndex] = useState<number | null>(null);
  const [expandedServiceId, setExpandedServiceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<number>(0);
  const { language } = useApp();
  const { hero, about, services, projects, cta, loading } = useLandingStore(
    useShallow((state) => ({
      hero: state.hero,
      about: state.about,
      services: state.services,
      projects: state.projects,
      cta: state.cta,
      loading: state.loading,
    }))
  );
  const fetchLandingData = useLandingStore((state) => state.fetchLandingData);
  
  // Debug: Log CTA data changes
  useEffect(() => {
    console.log('🏠 CompanyLanding - CTA from store:', cta);
    console.log('🏠 CompanyLanding - CTA social:', cta?.social);
    console.log('🏠 CompanyLanding - Is CTA social array?', Array.isArray(cta?.social));
  }, [cta]);
  
  // Fetch services details from API (4 services, each with 4 sections)
  // Store service details by serviceId
  const [servicesDetailsMap, setServicesDetailsMap] = useState<{ [serviceId: string]: any[] }>({});
  const [loadingDetails, setLoadingDetails] = useState<{ [serviceId: string]: boolean }>({});
  
  // Store specific service data from API endpoints
  const [serviceItem1, setServiceItem1] = useState<any>(null);
  const [serviceItem2, setServiceItem2] = useState<any>(null);
  const [serviceItem3, setServiceItem3] = useState<any>(null);
  const [serviceItem4, setServiceItem4] = useState<any>(null);
  const [serviceItem3Detail4, setServiceItem3Detail4] = useState<any>(null);
  const [loadingServiceItem1, setLoadingServiceItem1] = useState(false);
  const [loadingServiceItem2, setLoadingServiceItem2] = useState(false);
  const [loadingServiceItem3, setLoadingServiceItem3] = useState(false);
  const [loadingServiceItem4, setLoadingServiceItem4] = useState(false);
  const [loadingServiceItem3Detail4, setLoadingServiceItem3Detail4] = useState(false);

  // Handle services structure - can be array or object with items array
  // services can be:
  // 1. Array directly: [service1, service2, ...]
  // 2. Object with items: { items: [service1, service2, ...], title_en, title_ar, ... }
  const safeServices = Array.isArray(services) 
    ? services 
    : (services && typeof services === 'object' && 'items' in services && Array.isArray((services as any).items))
    ? (services as any).items
    : [];
  
  // Extract services metadata (title, subtitle) if services is an object
  const servicesMetadata = services && typeof services === 'object' && !Array.isArray(services)
    ? services
    : null;

  // Calculate allServices using useMemo (must be before useEffect hooks)
  const allServices = useMemo(() => {
    const servicesList: any[] = [];
    
    // Helper function to extract details from a service
    const extractDetails = (service: any): any[] => {
      const details: any[] = [];
      if (service?.details && typeof service.details === 'object') {
        Object.keys(service.details).forEach((key) => {
          const detail = service.details[key];
          if (detail && typeof detail === 'object') {
            details.push(detail);
          }
        });
      }
      return details;
    };
    
    // Add item1 if available
    if (serviceItem1) {
      servicesList.push({ 
        service: serviceItem1, 
        details: extractDetails(serviceItem1), 
        serviceId: 'item1' 
      });
    }
    
    // Add item2 if available
    if (serviceItem2) {
      servicesList.push({ 
        service: serviceItem2, 
        details: extractDetails(serviceItem2), 
        serviceId: 'item2' 
      });
    }
    
    // Add item3 if available
    if (serviceItem3) {
      const item3Details = extractDetails(serviceItem3);
      const detailKeys = new Set<string>();
      
      item3Details.forEach((detail: any, index: number) => {
        if (detail.title_en || detail.title_ar) {
          detailKeys.add(`detail${index + 1}`);
        }
      });
      
      if (serviceItem3Detail4 && !detailKeys.has('detail4')) {
        item3Details.push(serviceItem3Detail4);
      }
      
      servicesList.push({ 
        service: serviceItem3, 
        details: item3Details, 
        serviceId: 'item3' 
      });
    }
    
    // Add item4 if available
    if (serviceItem4) {
      servicesList.push({ 
        service: serviceItem4, 
        details: extractDetails(serviceItem4), 
        serviceId: 'item4' 
      });
    }
    
    // Add services from safeServices only if they're not already added from API
    safeServices.forEach((service: any) => {
      const serviceId = service._id || service.id;
      const alreadyAdded = servicesList.some(item => {
        const apiServiceId = item.service?._id || item.service?.id;
        return apiServiceId === serviceId;
      });
      
      if (!alreadyAdded) {
        const serviceDetails = serviceId ? servicesDetailsMap[String(serviceId)] || [] : [];
        servicesList.push({ service, details: serviceDetails, serviceId });
      }
    });
    
    // Sort by order if available, otherwise by serviceId
    servicesList.sort((a: any, b: any) => {
      const orderA = a.service?.order;
      const orderB = b.service?.order;
      
      if (orderA !== undefined && orderB !== undefined) {
        return orderA - orderB;
      }
      
      const idA = a.serviceId || '';
      const idB = b.serviceId || '';
      const numA = idA.match(/\d+/)?.[0] || '999';
      const numB = idB.match(/\d+/)?.[0] || '999';
      
      return parseInt(numA) - parseInt(numB);
    });
    
    return servicesList;
  }, [serviceItem1, serviceItem2, serviceItem3, serviceItem4, serviceItem3Detail4, safeServices, servicesDetailsMap]);

  const isLoadingServices = loadingServiceItem1 || loadingServiceItem2 || loadingServiceItem3 || loadingServiceItem4 || loadingServiceItem3Detail4;

  useEffect(() => {
    // Fetch real data from API immediately
    fetchLandingData();
    
    // Refetch data when page becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchLandingData();
      }
    };
    
    // Refetch data when window gets focus (user switches back to tab)
    const handleFocus = () => {
      fetchLandingData();
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    // Listen for services update event from dashboard
    const handleServicesUpdated = () => {
      fetchLandingData();
    };
    
    // Listen for CTA update events
    const handleCTAUpdated = () => {
      console.log('🔄 CTA updated event received, refreshing landing data...');
      fetchLandingData();
    };
    
    window.addEventListener('servicesUpdated', handleServicesUpdated);
    window.addEventListener('ctaUpdated', handleCTAUpdated);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('servicesUpdated', handleServicesUpdated);
      window.removeEventListener('ctaUpdated', handleCTAUpdated);
    };
  }, [fetchLandingData]);

  // Debug: Log data changes
  useEffect(() => {
  
  }, [hero, about, services, projects, loading]);
  
  // Debug: Log services data
  useEffect(() => {
   
  }, [services, safeServices]);

  // Debug: Log specific service data from API
  useEffect(() => {
    if (serviceItem1) {
    }
    if (serviceItem2) {
    }
    if (serviceItem3) {
    }
    if (serviceItem4) {
    }
    if (serviceItem3Detail4) {
    }
  }, [serviceItem1, serviceItem2, serviceItem3, serviceItem4, serviceItem3Detail4]);

  // Fetch service details for all services when services are loaded
  useEffect(() => {
    const fetchAllServiceDetails = async () => {
      if (!safeServices || safeServices.length === 0) return;
      
      const fetchPromises = safeServices.map(async (service: any) => {
        const serviceId = service._id || service.id;
        if (!serviceId) return;
        
        // Skip if already fetched
        if (servicesDetailsMap[String(serviceId)]) return;
        
        setLoadingDetails(prev => ({ ...prev, [String(serviceId)]: true }));
        
        try {
          const response = await http.get(`/content/services/items/${serviceId}/details`);
          
          let details: any[] = [];
          if (Array.isArray(response.data)) {
            details = response.data;
          } else if (response.data?.data && Array.isArray(response.data.data)) {
            details = response.data.data;
          } else if (response.data?.items && Array.isArray(response.data.items)) {
            details = response.data.items;
          } else if (response.data?.details && Array.isArray(response.data.details)) {
            details = response.data.details;
          } else {
            const dataKeys = Object.keys(response.data || {});
            for (const key of dataKeys) {
              if (Array.isArray(response.data[key])) {
                details = response.data[key];
                break;
              }
            }
          }
          
          const sortedDetails = details
            .sort((a: any, b: any) => {
              const aKey = a.sectionKey || '';
              const bKey = b.sectionKey || '';
              return aKey.localeCompare(bKey);
            })
            .slice(0, 4);
          
          setServicesDetailsMap(prev => ({
            ...prev,
            [String(serviceId)]: sortedDetails
          }));
          
        } catch (error: any) {
          if (error.response?.status === 404) {
            setServicesDetailsMap(prev => ({
              ...prev,
              [String(serviceId)]: []
            }));
          }
        } finally {
          setLoadingDetails(prev => ({ ...prev, [String(serviceId)]: false }));
        }
      });
      
      await Promise.all(fetchPromises);
    };
    
    if (safeServices.length > 0) {
      fetchAllServiceDetails();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeServices]);

  // Fetch specific service data from API endpoints
  useEffect(() => {
    const fetchSpecificServiceData = async () => {
      // Fetch service item1 data
      setLoadingServiceItem1(true);
      try {
        const response = await http.get('/content/services/item1');
        setServiceItem1(response.data?.data || response.data);
      } catch (error: any) {
        // Silently handle 404 (endpoint may not exist)
        if (error.response?.status !== 404) {
        }
      } finally {
        setLoadingServiceItem1(false);
      }

      // Fetch service item2 data
      setLoadingServiceItem2(true);
      try {
        const response = await http.get('/content/services/item2');
        setServiceItem2(response.data?.data || response.data);
      } catch (error: any) {
        // Silently handle 404 (endpoint may not exist)
        if (error.response?.status !== 404) {
        }
      } finally {
        setLoadingServiceItem2(false);
      }

      // Fetch service item3 data (full service with all details)
      setLoadingServiceItem3(true);
      try {
        const response = await http.get('/content/services/item3');
        setServiceItem3(response.data?.data || response.data);
      } catch (error: any) {
        // Silently handle 404 (endpoint may not exist)
        if (error.response?.status !== 404) {
        }
      } finally {
        setLoadingServiceItem3(false);
      }

      // Fetch service item4 data
      setLoadingServiceItem4(true);
      try {
        const response = await http.get('/content/services/item4');
        setServiceItem4(response.data?.data || response.data);
      } catch (error: any) {
        // Silently handle 404 (endpoint may not exist)
        if (error.response?.status !== 404) {
        }
      } finally {
        setLoadingServiceItem4(false);
      }

      // Fetch service item3 detail4 data (optional - endpoint may not exist)
      // This is handled silently if it doesn't exist
      setLoadingServiceItem3Detail4(true);
      try {
        const response = await http.get('/content/services/item3/details/detail4');
        setServiceItem3Detail4(response.data?.data || response.data);
      } catch (error: any) {
        // Silently handle 404 (endpoint may not exist) - don't log as error
        if (error.response?.status === 404) {
          // Endpoint doesn't exist, which is fine
        } else if (error.response?.status !== 404) {
        }
      } finally {
        setLoadingServiceItem3Detail4(false);
      }
    };

    fetchSpecificServiceData();
  }, []);

  // Show skeleton loading while fetching data
  if (loading && !hero && !about) {
    return <SkeletonCard />;
  }

  const getFieldValue = (entity: any, field: string, lang: "en" | "ar" = "en") => {
    if (!entity) return undefined;

    const direct = entity[field];
    if (typeof direct === "string" && direct.trim()) return direct;
    if (direct && typeof direct === "object" && !Array.isArray(direct)) {
      const localized =
        direct[lang] ??
        direct[lang.toUpperCase()] ??
        (lang === "ar" ? direct.en ?? direct.EN : undefined) ??
        direct.default;
      if (typeof localized === "string" && localized.trim()) return localized;
    }

    const langKey = `${field}_${lang}`;
    if (typeof entity[langKey] === "string" && entity[langKey].trim()) {
      return entity[langKey];
    }

    if (lang !== "en") {
      const fallbackKey = `${field}_en`;
      if (typeof entity[fallbackKey] === "string" && entity[fallbackKey].trim()) {
        return entity[fallbackKey];
      }
    }

    return undefined;
  };

  const heroTitle =
    getFieldValue(hero, "title", language) ||
    getFieldValue(hero, "name", language) ||
    "High Xpert ARTBUILD";
  const heroSubtitle =
    getFieldValue(hero, "subtitle", language) ||
    getFieldValue(hero, "description", language) ||
    "Connecting expertise and High Xpert ART BUILD opportunities… with no spatial limits";
  const heroCta =
    getFieldValue(hero, "cta", language) ||
    getFieldValue(hero, "cta_button", language) ||
    getFieldValue(hero, "button", language) ||
    "Get Started";

  const aboutTitle = getFieldValue(about, "title", language) || "About HIXA";
  const aboutSubtitle =
    getFieldValue(about, "subtitle", language) ||
    getFieldValue(about, "description", language) ||
    "We deliver innovative solutions that drive business growth";
  const aboutDescription =
    getFieldValue(about, "description", language) ||
    getFieldValue(about, "details", language);
  const safeProjects = Array.isArray(projects) ? projects : [];
  const aboutValues = Array.isArray(about?.values)
    ? about.values
    : [];
  const ctaContent = cta || hero?.ctaSection || hero;
  const ctaTitle =
    getFieldValue(ctaContent, "title", language) ||
    heroTitle ||
    "Ready to Start Your Project?";
  const ctaSubtitle =
    getFieldValue(ctaContent, "subtitle", language) ||
    heroSubtitle ||
    "Let's build something amazing together";
  const ctaButton =
    getFieldValue(ctaContent, "button", language) ||
    getFieldValue(ctaContent, "cta", language) ||
    heroCta ||
    "Get Started";

  const handleGetStarted = () => {
    navigate("/platform");
  };

  // Helper function to render a service card
  const renderServiceCard = (service: any, index: number, serviceDetails: any[] = [], serviceId: string | null = null) => {
    const serviceTitle =
      getFieldValue(service, "title", language) ||
      service?.name ||
      "Service";
    const serviceDescription =
      getFieldValue(service, "description", language) ||
      service?.details ||
      "";
    
    // Use first letter of service title (uppercase)
    const serviceDisplay = serviceTitle?.charAt(0)?.toUpperCase() || "S";
    
    const serviceLink = service?.link || service?.url || service?.href;

    // Truncate description to 1 line
    const truncateDescription = (text: string, maxLength: number = 100) => {
      if (!text) return '';
      if (text.length <= maxLength) return text;
      return text.substring(0, maxLength).trim() + '...';
    };

    const shortDescription = truncateDescription(serviceDescription);

    const handleServiceClick = () => {
      if (serviceLink) {
        if (serviceLink.startsWith('http://') || serviceLink.startsWith('https://')) {
          window.open(serviceLink, '_blank', 'noopener,noreferrer');
        } else {
          navigate(serviceLink);
        }
      }
    };

    const cardServiceId = serviceId || service._id || service.id || `service-${index}`;
    const isExpanded = expandedServiceId === String(cardServiceId);
    const isLoading = cardServiceId ? loadingDetails[String(cardServiceId)] : false;

    const handleReadMoreClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      e.stopPropagation();
      // Ensure service has the ID for modal to fetch details
      const serviceWithId = {
        ...service,
        _id: service._id || service.id || cardServiceId,
        id: service.id || service._id || cardServiceId,
        serviceId: serviceId || cardServiceId, // Add serviceId explicitly
        itemId: serviceId || cardServiceId, // Add itemId for compatibility
      };
      setSelectedServiceForDetails(serviceWithId);
      // Get the 4 sections for this service from servicesDetailsMap
      const serviceDetailsToShow = cardServiceId && servicesDetailsMap[String(cardServiceId)]
        ? servicesDetailsMap[String(cardServiceId)].slice(0, 4)
        : serviceDetails.slice(0, 4);
      setSelectedServiceDetails(serviceDetailsToShow);
      setServiceDetailsModalOpen(true);
    };

    return (
      <div 
        key={cardServiceId} 
        className="bg-card text-card-foreground hexagon border border-border p-6 sm:p-8 md:p-10 transition-all duration-300 ease-in-out hover:shadow-xl hover:shadow-gold/20 hover:bg-card/80 group flex flex-col items-center justify-center w-[280px] h-[280px] sm:w-[320px] sm:h-[320px] md:w-[340px] md:h-[340px] mx-auto relative"
      >
        {/* Service Title */}
        <h3 className="text-lg sm:text-xl font-bold mb-2 sm:mb-3 text-center text-card-foreground leading-tight w-full">
          {serviceTitle}
        </h3>

        {/* Short Description (One line) */}
        <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed line-clamp-2 text-center mb-4 sm:mb-6 w-full">
          {shortDescription}
        </p>

        {/* Read More Link */}
        <a
          href="#"
          onClick={handleReadMoreClick}
          className="flex items-center justify-center gap-2 text-gold hover:text-gold-dark font-semibold text-sm sm:text-base transition-colors duration-300 group/link no-underline"
        >
          <span>{language === 'en' ? 'Read More' : 'اقرأ المزيد'}</span>
          <ArrowRight className={`h-4 w-4 transition-transform duration-300 ${language === 'ar' ? 'rotate-180' : ''} group-hover/link:translate-x-1`} />
        </a>
      </div>
    );
  };

  const handleOrderNow = async (e: React.MouseEvent, service: any) => {
    e.stopPropagation(); // Prevent card click
    setSelectedService(service);
    setOrderModalOpen(true);
    // Reset form
    setEmail("");
    setPhone("");
    setOrderDetails("");
    
    // Fetch service details by serviceId
    const serviceId = service._id || service.id;
    if (serviceId) {
      try {
        
        // Use the correct endpoint: /content/services/items/{serviceId}/details
        const response = await http.get(`/content/services/items/${serviceId}/details`);
        
        // Handle nested response shapes
        // Backend returns: { message: "...", data: [...], count: ... }
        // So we need to check response.data.data first (axios wraps it in response.data)
        let details: any[] = [];
        if (Array.isArray(response.data)) {
          // Direct array response (unlikely but possible)
          details = response.data;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          // Backend standard response: { message, data: [...], count }
          details = response.data.data;
        } else if (response.data?.items && Array.isArray(response.data.items)) {
          details = response.data.items;
        } else if (response.data?.details && Array.isArray(response.data.details)) {
          details = response.data.details;
        } else {
          // Try to find any array property
          const dataKeys = Object.keys(response.data || {});
          for (const key of dataKeys) {
            if (Array.isArray(response.data[key])) {
              details = response.data[key];
              break;
            }
          }
        }
        
        // Sort by sectionKey and ensure we have 4 sections
        const sortedDetails = details
          .sort((a: any, b: any) => {
            const aKey = a.sectionKey || '';
            const bKey = b.sectionKey || '';
            return aKey.localeCompare(bKey);
          })
          .slice(0, 4);
        
        // Update the map for this service
        setServicesDetailsMap(prev => ({
          ...prev,
          [String(serviceId)]: sortedDetails
        }));
        
      } catch (error: any) {
        if (error.response?.status === 404) {
          // Set empty array for this service
          setServicesDetailsMap(prev => ({
            ...prev,
            [String(serviceId)]: []
          }));
        } else {
        }
      }
    }
  };

  const handleCloseModal = () => {
    setOrderModalOpen(false);
    setSelectedService(null);
    setEmail("");
    setPhone("");
    setOrderDetails("");
  };

  const handleOpenGeneralOrderModal = () => {
    setSelectedService(null); // No specific service
    setOrderModalOpen(true);
    setEmail("");
    setPhone("");
    setOrderDetails("");
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error(language === 'en' ? 'Please enter a valid email address' : 'يرجى إدخال عنوان بريد إلكتروني صحيح');
      return;
    }

    if (!phone || !phone.trim()) {
      toast.error(language === 'en' ? 'Please enter your phone number' : 'يرجى إدخال رقم التليفون');
      return;
    }

    setSubmitting(true);

    try {
      if (!orderDetails || !orderDetails.trim()) {
        toast.error(language === 'en' ? 'Please enter your order details' : 'يرجى إدخال تفاصيل الطلب');
        setSubmitting(false);
        return;
      }
      
      // Get serviceId from multiple possible fields
      const serviceId = selectedService?.serviceId || selectedService?.itemId || selectedService?._id || selectedService?.id;
      
      // Use JSON instead of FormData since we're only sending text
      const payload: any = {
        email: email.trim(),
        phone: phone.trim(),
        orderDetails: orderDetails.trim(),
      };
      
      // Add serviceId only if a specific service is selected
      if (serviceId) {
        payload.serviceId = String(serviceId);
        
        // Add service title if available
        const serviceTitle = getFieldValue(selectedService, "title", language) || selectedService?.name || selectedService?.service?.title_en || selectedService?.service?.title_ar || "";
        if (serviceTitle) {
          payload.title = serviceTitle;
        }
        
        // Add service detail (section) information if available
        if (selectedService?.serviceDetailId) {
          payload.serviceDetailId = String(selectedService.serviceDetailId);
        }
        if (selectedService?.serviceDetailTitle || selectedService?.detailTitle) {
          payload.serviceDetailTitle = selectedService.serviceDetailTitle || selectedService.detailTitle;
          payload.detailTitle = selectedService.serviceDetailTitle || selectedService.detailTitle; // Support both field names
        }
      }

      // Send to API
      console.log('📤 Sending service order request:', payload);
      const response = await http.post('/service-orders', payload);

      // Log response (for debugging)
      console.log('✅ Service Order Response:', response.data);

      toast.success(language === 'en' ? 'Order submitted successfully!' : 'تم إرسال الطلب بنجاح!');

      // Close modal and reset form
      handleCloseModal();
    } catch (error: any) {
      console.error('❌ Service Order Error:', error);
      console.error('❌ Error Response:', error.response?.data);
      console.error('❌ Error Status:', error.response?.status);
      console.error('❌ Error Message:', error.message);
      
      // Show detailed error message
      let errorMessage = '';
      
      if (error.response?.data) {
        // Try to get error message from different possible fields
        errorMessage = error.response.data.message || 
                      error.response.data.error || 
                      error.response.data.msg ||
                      (typeof error.response.data === 'string' ? error.response.data : '');
        
        // If error is an object with details, try to extract more info
        if (typeof error.response.data === 'object' && !errorMessage) {
          const errorObj = error.response.data;
          errorMessage = errorObj.errors?.map((e: any) => e.message || e.msg).join(', ') ||
                        errorObj.details?.map((d: any) => d.message || d.msg).join(', ') ||
                        JSON.stringify(errorObj);
        }
      }
      
      // Fallback messages
      if (!errorMessage) {
        if (error.response?.status === 400) {
          errorMessage = language === 'en' 
            ? 'Invalid data. Please check all fields and try again.' 
            : 'بيانات غير صحيحة. يرجى التحقق من جميع الحقول والمحاولة مرة أخرى.';
        } else if (error.response?.status === 401) {
          errorMessage = language === 'en' 
            ? 'Authentication required. Please try again.' 
            : 'يجب تسجيل الدخول. يرجى المحاولة مرة أخرى.';
        } else if (error.response?.status === 403) {
          errorMessage = language === 'en' 
            ? 'Permission denied. Please contact support.' 
            : 'لا توجد صلاحية. يرجى التواصل مع الدعم.';
        } else if (error.response?.status === 404) {
          errorMessage = language === 'en' 
            ? 'Service not found. Please try again.' 
            : 'الخدمة غير موجودة. يرجى المحاولة مرة أخرى.';
        } else if (error.response?.status === 500) {
          errorMessage = language === 'en' 
            ? 'Server error. Please try again later.' 
            : 'خطأ في الخادم. يرجى المحاولة مرة أخرى لاحقاً.';
        } else if (error.message) {
          errorMessage = error.message;
        } else {
          errorMessage = language === 'en' 
            ? 'Failed to submit order. Please try again.' 
            : 'فشل إرسال الطلب. يرجى المحاولة مرة أخرى.';
        }
      }
      
      toast.error(errorMessage || (language === 'en' ? 'Failed to submit order' : 'فشل إرسال الطلب'));
    } finally {
      setSubmitting(false);
    }
  };

  // Don't show loading - page renders immediately with fallback data
  // Data will update silently in background when API responds

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <HeroSection
        heroTitle={heroTitle}
        heroSubtitle={heroSubtitle}
        language={language}
        onGetStarted={handleGetStarted}
      />

      <AboutSection
        aboutTitle={aboutTitle}
        aboutSubtitle={aboutSubtitle}
        aboutDescription={aboutDescription}
        aboutValues={aboutValues}
        language={language}
        getFieldValue={getFieldValue}
        expandedCardIndex={expandedCardIndex}
        setExpandedCardIndex={setExpandedCardIndex}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <ServicesSection
        servicesMetadata={servicesMetadata}
        services={services}
        language={language}
        getFieldValue={getFieldValue}
        allServices={allServices}
        renderServiceCard={renderServiceCard}
        onOpenGeneralOrderModal={handleOpenGeneralOrderModal}
        isLoading={isLoadingServices}
      />

      <ProjectsSection
        projects={safeProjects}
        language={language}
        getFieldValue={getFieldValue}
        onProjectClick={(project) => {
                  setSelectedProject(project);
                  setProjectModalOpen(true);
        }}
      />

      {/* Partners */}
      <Partners />

      {/* Jobs */}
      <Jobs />

      <ContactSection 
        language={language} 
        cta={cta}
      />

      <Footer />
      <Chatbot />

      <ServiceDetailsModal
        open={serviceDetailsModalOpen}
        onOpenChange={setServiceDetailsModalOpen}
        selectedServiceForDetails={selectedServiceForDetails}
        selectedServiceDetails={selectedServiceDetails}
        language={language}
        getFieldValue={getFieldValue}
        onOrderClick={(service) => {
          setSelectedService(service);
                            setServiceDetailsModalOpen(false);
                            setOrderModalOpen(true);
                            setEmail("");
                            setOrderDetails("");
        }}
      />

      <ProjectDetailsModal
        open={projectModalOpen}
        onOpenChange={setProjectModalOpen}
        selectedProject={selectedProject}
        language={language}
        getFieldValue={getFieldValue}
        onImageClick={(imageUrl) => {
          setSelectedImage(imageUrl);
          setImageModalOpen(true);
        }}
      />

      <ImageModal
        open={imageModalOpen}
        onOpenChange={setImageModalOpen}
        selectedImage={selectedImage}
        language={language}
      />

      <OrderModal
        open={orderModalOpen}
        onClose={handleCloseModal}
        selectedService={selectedService}
        language={language}
        getFieldValue={getFieldValue}
        servicesDetailsMap={servicesDetailsMap}
        email={email}
        setEmail={setEmail}
        phone={phone}
        setPhone={setPhone}
        orderDetails={orderDetails}
        setOrderDetails={setOrderDetails}
        submitting={submitting}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default CompanyLanding;