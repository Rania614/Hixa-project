import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminTopBar';
import { useContentStore } from '@/stores/contentStore';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { HexagonIcon } from '@/components/ui/hexagon-icon';
import { Plus, Trash2, ChevronUp, ChevronDown, ChevronDown as ChevronDownIcon, Upload } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { http } from '@/services/http';
import { toast } from '@/components/ui/sonner';

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('hero');
  const [activeServiceIndex, setActiveServiceIndex] = useState(0); // 0, 1, 2, 3 (for 4 services)
  const [activeSectionIndex, setActiveSectionIndex] = useState(0); // 0, 1, 2, 3 (for 4 sections per service)
  const { language } = useApp();
  
  // Structure: 4 services, each with 4 sections
  const [servicesDetails, setServicesDetails] = useState<any[]>([
    // Service 1 - 4 sections
    [
      { title_en: '', title_ar: '', image: '', details_en: '', details_ar: '' },
      { title_en: '', title_ar: '', image: '', details_en: '', details_ar: '' },
      { title_en: '', title_ar: '', image: '', details_en: '', details_ar: '' },
      { title_en: '', title_ar: '', image: '', details_en: '', details_ar: '' },
    ],
    // Service 2 - 4 sections
    [
      { title_en: '', title_ar: '', image: '', details_en: '', details_ar: '' },
      { title_en: '', title_ar: '', image: '', details_en: '', details_ar: '' },
      { title_en: '', title_ar: '', image: '', details_en: '', details_ar: '' },
      { title_en: '', title_ar: '', image: '', details_en: '', details_ar: '' },
    ],
    // Service 3 - 4 sections
    [
      { title_en: '', title_ar: '', image: '', details_en: '', details_ar: '' },
      { title_en: '', title_ar: '', image: '', details_en: '', details_ar: '' },
      { title_en: '', title_ar: '', image: '', details_en: '', details_ar: '' },
      { title_en: '', title_ar: '', image: '', details_en: '', details_ar: '' },
    ],
    // Service 4 - 4 sections
    [
      { title_en: '', title_ar: '', image: '', details_en: '', details_ar: '' },
      { title_en: '', title_ar: '', image: '', details_en: '', details_ar: '' },
      { title_en: '', title_ar: '', image: '', details_en: '', details_ar: '' },
      { title_en: '', title_ar: '', image: '', details_en: '', details_ar: '' },
    ],
  ]);

  const {
    hero,
    about,
    services,
    projects,
    partners,
    jobs,
    loading,
    fetchContent,
    updateHero,
    updateAbout,
    updateServices,
    addService,
    deleteService,
    reorderService,
    updateProjects,
    addProject,
    deleteProject,
    reorderProject,
    updatePartners,
    addPartner,
    deletePartner,
    reorderPartner,
    updateJobs,
    addJob,
    deleteJob,
    setContent,
  } = useContentStore();

  // Helper لتجنب الأخطاء لو services أو projects أو partners أو jobs مش Array
  const servicesData = Array.isArray(services) ? { items: services } : (services || { items: [] });
  const safeServices = Array.isArray(servicesData.items) ? servicesData.items : [];
  const projectsData = Array.isArray(projects) ? { items: projects } : (projects || { items: [] });
  const safeProjects = Array.isArray(projectsData.items) ? projectsData.items : [];
  const partnersData = Array.isArray(partners) ? { items: partners } : (partners || { items: [] });
  const safePartners = Array.isArray(partnersData.items) ? partnersData.items : [];
  const jobsData = Array.isArray(jobs) ? { items: jobs } : (jobs || { items: [] });
  const safeJobs = Array.isArray(jobsData.items) ? jobsData.items : [];

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchContent();
  }, []);

  // Fetch services details after services are loaded
  useEffect(() => {
    if (safeServices.length > 0) {
      fetchOrderSections();
    }
  }, [safeServices.length]);

  const fetchOrderSections = async () => {
    try {
      console.log('🔄 Fetching services details from API...');
      
      // First, fetch services to get their IDs (in case we need to fetch individual service details)
      await fetchContent();
      await new Promise(resolve => setTimeout(resolve, 100));
      const currentServices = Array.isArray(services) ? services : (services?.items || []);
      
      // Try to fetch services details from API (same approach as CompanyLanding.tsx)
      let data: any[] = [];
      
      // Try /content/services-details first (but expect it might not exist)
      try {
        console.log('🔄 Trying to fetch services details from /content/services-details');
        const response = await http.get('/content/services-details');
        console.log('✅ Services details response from /content/services-details:', response.data);
        data = response.data?.servicesDetails || response.data?.services_details || response.data || [];
      } catch (servicesDetailsErr: any) {
        // If that fails (expected), try /content and extract servicesDetails
        if (servicesDetailsErr.response?.status === 404) {
          // Silently continue - this endpoint is expected to not exist
          console.log('ℹ️ /content/services-details not found (expected), trying /content');
    try {
      const response = await http.get('/content');
            console.log('✅ Full content response from /content:', response.data);
            console.log('📋 Response keys:', Object.keys(response.data || {}));
            console.log('🔍 Checking for services details:', {
              servicesDetails: response.data?.servicesDetails,
              services_details: response.data?.services_details,
              services: response.data?.services,
              servicesDetails: response.data?.services?.details,
            });
            
            // Check if details are in services.details
            const servicesDetails = response.data?.services?.details;
            if (Array.isArray(servicesDetails) && servicesDetails.length > 0) {
              console.log('✅ Found services.details array:', servicesDetails);
              // Group details by categoryKey (service identifier)
              const groupedDetails: { [key: string]: any[] } = {};
              servicesDetails.forEach((detail: any) => {
                const categoryKey = detail.categoryKey || 'general';
                if (!groupedDetails[categoryKey]) {
                  groupedDetails[categoryKey] = [];
                }
                groupedDetails[categoryKey].push(detail);
              });
              
              // Convert to array format (4 services, each with 4 sections)
              const servicesArray = Object.values(groupedDetails);
              data = servicesArray.slice(0, 4).map((serviceDetails: any[]) => {
                // Sort by sectionKey and take first 4
                const sorted = serviceDetails.sort((a, b) => {
                  const aKey = a.sectionKey || '';
                  const bKey = b.sectionKey || '';
                  return aKey.localeCompare(bKey);
                });
                return sorted.slice(0, 4);
              });
              console.log('📦 Grouped and formatted data:', data);
      } else {
              data = response.data?.servicesDetails || response.data?.services_details || [];
            }
            console.log('📦 Extracted data:', data);
          } catch (contentErr: any) {
            // If /content also fails, try fetching individual service details
            if (contentErr.response?.status === 404) {
              console.log('⚠️ /content not found, trying to fetch individual service details');
              // Try to fetch details for each service using /content/services/details/{serviceId}
              if (currentServices.length > 0) {
                try {
                  const detailsPromises = currentServices.slice(0, 4).map(async (service: any, index: number) => {
                    const serviceId = service._id || service.id;
                    if (!serviceId) {
                      console.warn(`Service ${index + 1} has no ID, skipping...`);
                      return null;
                    }
                    
                    try {
                      console.log(`🔄 Fetching details for service ${index + 1} (ID: ${serviceId}) from /content/services/details/${serviceId}`);
                      const response = await http.get(`/content/services/details/${serviceId}`);
                      const details = response.data?.sections || response.data?.details || response.data || [];
                      console.log(`✅ Service ${index + 1} details fetched:`, details);
                      return Array.isArray(details) && details.length > 0 ? details : null;
                    } catch (err: any) {
                      if (err.response?.status === 404) {
                        console.log(`⚠️ Service ${index + 1} details not found (404)`);
                        return null;
                      }
                      console.error(`❌ Error fetching service ${index + 1} details:`, err);
                      return null;
                    }
                  });
                  
                  const fetchedDetails = await Promise.all(detailsPromises);
                  const validDetails = fetchedDetails.filter(d => d !== null);
                  
                  if (validDetails.length > 0) {
                    console.log('✅ Fetched individual service details:', validDetails);
                    data = validDetails;
                  } else {
                    // If individual fetch also fails, try /content/services
                    console.log('⚠️ Individual service details not found, trying /content/services');
                    try {
                      const servicesResponse = await http.get('/content/services');
                      console.log('✅ Services response from /content/services:', servicesResponse.data);
                      data = servicesResponse.data?.servicesDetails || servicesResponse.data?.services_details || [];
                    } catch (servicesErr) {
                      console.warn('⚠️ Could not fetch services details from API');
                      data = [];
                    }
                  }
                } catch (individualErr) {
                  console.error('❌ Error fetching individual service details:', individualErr);
                  data = [];
                }
              } else {
                console.log('⚠️ No services found, trying /content/services');
                try {
                  const servicesResponse = await http.get('/content/services');
                  console.log('✅ Services response from /content/services:', servicesResponse.data);
                  data = servicesResponse.data?.servicesDetails || servicesResponse.data?.services_details || [];
                } catch (servicesErr) {
                  console.warn('⚠️ Could not fetch services details from API');
                  data = [];
                }
              }
            } else {
              throw contentErr;
            }
          }
        } else {
          throw servicesDetailsErr;
        }
      }
      
      console.log('📦 Services details from API:', data);
      console.log('📊 Data type:', Array.isArray(data) ? 'Array' : typeof data);
      console.log('📊 Data length:', Array.isArray(data) ? data.length : 'N/A');
      
      // Ensure we have 4 services, each with 4 sections
      const defaultServicesDetails: any[][] = Array(4).fill(null).map(() => 
        Array(4).fill(null).map(() => ({
          title_en: '',
          title_ar: '',
          image: '',
          details_en: '',
          details_ar: '',
          categoryKey: 'general',
          sectionKey: '',
        }))
      );
      
      // Merge API data with defaults
      let mergedData = [...defaultServicesDetails];
      if (Array.isArray(data) && data.length > 0) {
        console.log('✅ Using services details from API');
        data.forEach((serviceSections: any[], serviceIndex: number) => {
          if (serviceIndex < 4 && Array.isArray(serviceSections)) {
            serviceSections.forEach((section: any, sectionIndex: number) => {
              if (sectionIndex < 4) {
                mergedData[serviceIndex][sectionIndex] = {
                  ...defaultServicesDetails[serviceIndex][sectionIndex],
                  ...section,
                  // Preserve categoryKey and sectionKey from API
                  categoryKey: section.categoryKey || 'general',
                  sectionKey: section.sectionKey || `section${sectionIndex + 1}`,
                };
              }
            });
          }
        });
      } else {
        console.log('⚠️ No services details found in API response, trying localStorage...');
        // Try to load from localStorage as fallback
        const savedData = localStorage.getItem('servicesDetails');
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              console.log('✅ Using services details from localStorage');
              parsed.forEach((serviceSections: any[], serviceIndex: number) => {
                if (serviceIndex < 4 && Array.isArray(serviceSections)) {
                  serviceSections.forEach((section: any, sectionIndex: number) => {
                    if (sectionIndex < 4) {
                      mergedData[serviceIndex][sectionIndex] = {
                        ...defaultServicesDetails[serviceIndex][sectionIndex],
                        ...section,
                        // Preserve categoryKey and sectionKey
                        categoryKey: section.categoryKey || 'general',
                        sectionKey: section.sectionKey || `section${sectionIndex + 1}`,
                      };
                    }
                  });
                }
              });
            } else {
              console.log('⚠️ localStorage data is not a valid array');
            }
          } catch (e) {
            console.error('❌ Error parsing saved data:', e);
          }
        } else {
          console.log('⚠️ No services details in localStorage, using empty defaults');
        }
      }
      
      setServicesDetails(mergedData.slice(0, 4));
      console.log('✅ Services details loaded successfully');
    } catch (error) {
      console.error('❌ Error fetching services details:', error);
      // Fallback to localStorage
      const savedData = localStorage.getItem('servicesDetails');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            // Ensure we have 4 services, each with 4 sections
            const defaultServicesDetails: any[][] = Array(4).fill(null).map(() => 
              Array(4).fill(null).map(() => ({
                title_en: '',
                title_ar: '',
                image: '',
                details_en: '',
                details_ar: '',
                categoryKey: 'general',
                sectionKey: '',
              }))
            );
            let mergedData = [...defaultServicesDetails];
            parsed.forEach((serviceSections: any[], serviceIndex: number) => {
              if (serviceIndex < 4 && Array.isArray(serviceSections)) {
                serviceSections.forEach((section: any, sectionIndex: number) => {
                  if (sectionIndex < 4) {
                    mergedData[serviceIndex][sectionIndex] = {
                      ...defaultServicesDetails[serviceIndex][sectionIndex],
                      ...section,
                      // Preserve categoryKey and sectionKey
                      categoryKey: section.categoryKey || 'general',
                      sectionKey: section.sectionKey || `section${sectionIndex + 1}`,
                    };
                  }
                });
              }
            });
            setServicesDetails(mergedData.slice(0, 4));
            console.log('✅ Services details loaded from localStorage');
          }
        } catch (e) {
          console.error('Error parsing saved data:', e);
        }
      }
    }
  };

  const handleSectionChange = (serviceIndex: number, sectionIndex: number, field: string, value: string) => {
    setServicesDetails((prev) => {
      const newData = [...prev];
      newData[serviceIndex] = [...newData[serviceIndex]];
      newData[serviceIndex][sectionIndex] = {
        ...newData[serviceIndex][sectionIndex],
        [field]: value,
      };
      return newData;
    });
  };

  const handleSectionImageUpload = async (serviceIndex: number, sectionIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      // Try multiple upload endpoints
      const uploadEndpoints = [
        '/content/upload-image',
        '/content/upload',
        '/upload-image',
        '/upload',
      ];
      
      let response;
      let lastError;
      
      for (const endpoint of uploadEndpoints) {
        try {
          console.log(`🔄 Trying to upload image to ${endpoint}`);
          response = await http.post(endpoint, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
          console.log(`✅ Image uploaded successfully via ${endpoint}:`, response.data);
          break;
        } catch (err: any) {
          lastError = err;
          if (err.response?.status !== 404) {
            // If it's not 404, throw immediately (might be 400, 413, etc.)
            throw err;
          }
          // Silently continue - 404 is expected for upload endpoints
          // Don't log to avoid console noise
        }
      }
      
      if (!response) {
        throw lastError || new Error('All upload endpoints failed');
      }
      
      const imageUrl = response.data?.url || response.data?.imageUrl || response.data?.data?.url || '';
      if (imageUrl) {
      handleSectionChange(serviceIndex, sectionIndex, 'image', imageUrl);
      toast.success(language === 'en' ? 'Image uploaded successfully' : 'تم رفع الصورة بنجاح');
      } else {
        throw new Error('No image URL returned from server');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      const errorMessage = error.response?.data?.message || error.message || 
        (language === 'en' ? 'Failed to upload image. Please use image URL instead.' : 'فشل رفع الصورة. يرجى استخدام رابط الصورة بدلاً من ذلك.');
      toast.error(errorMessage);
    }
  };

  const saveServicesDetails = async () => {
    try {
      // Save to localStorage first (as backup)
      localStorage.setItem('servicesDetails', JSON.stringify(servicesDetails));
      
      console.log('💾 Saving services details to API...');
      
      // Get services from store to get their IDs
      const currentServices = Array.isArray(services) ? services : (services?.items || []);
      
      // Try to save to /content/services-details first
      try {
        console.log('🔄 Trying to save to /content/services-details');
          await http.put('/content/services-details', { servicesDetails });
        console.log('✅ Services details saved to /content/services-details');
        toast.success(
          language === 'en' 
            ? 'Services details saved successfully' 
            : 'تم حفظ تفاصيل الخدمات بنجاح'
        );
          return;
      } catch (servicesDetailsErr: any) {
        // If that fails, try to save individual service details
        if (servicesDetailsErr.response?.status === 404) {
          console.log('⚠️ /content/services-details not found, trying to save individual service details');
          
          if (currentServices.length > 0) {
            // Try to save details for each service using /content/services/details/{serviceId}
            const savePromises = currentServices.slice(0, 4).map(async (service: any, index: number) => {
              const serviceId = service._id || service.id;
              if (!serviceId) {
                console.warn(`Service ${index + 1} has no ID, skipping...`);
                return { success: false, serviceIndex: index };
              }
              
              const serviceDetails = servicesDetails[index] || [];
              
              try {
                // Save each section individually using categoryKey + sectionKey
                // Try two approaches: with ID in URL, and with categoryKey + sectionKey in body
                const sectionPromises = serviceDetails.map(async (section: any, sectionIndex: number) => {
                  try {
                    // Skip empty sections (backend requires title_en to be non-empty)
                    const titleEn = (section.title_en || '').trim();
                    if (!titleEn) {
                      console.log(`⏭️ Skipping section ${sectionIndex + 1} for service ${index + 1} (title_en is empty)`);
                      return { success: true, sectionIndex, skipped: true };
                    }
                    
                    console.log(`💾 Saving section ${sectionIndex + 1} for service ${index + 1} (ID: ${serviceId})`);
                    
                    // Use categoryKey + sectionKey from existing data, or use defaults
                    // categoryKey should be like "general" or service identifier
                    // sectionKey should be like "section1", "section2", etc.
                    const categoryKey = section.categoryKey || 'general';
                    const sectionKey = section.sectionKey || `section${sectionIndex + 1}`;
                    
                    const payload = {
                      categoryKey: categoryKey,
                      sectionKey: sectionKey,
                      title_en: titleEn,
                      title_ar: (section.title_ar || '').trim(),
                      image: (section.image || '').trim(),
                      details_en: (section.details_en || '').trim(),
                      details_ar: (section.details_ar || '').trim(),
                    };
                    console.log(`📦 Payload for section ${sectionIndex + 1}:`, JSON.stringify(payload, null, 2));
                    
                    // Use /content/services/details/any with categoryKey + sectionKey in body
                    // This matches the backend API: PUT update Services section BY categoryKey + sectionKey
                    let response;
                    try {
                      response = await http.put(`/content/services/details/any`, payload);
                      console.log(`✅ Section ${sectionIndex + 1} saved successfully via /any:`, response.data);
                    } catch (anyErr: any) {
                      // If /any fails, try with serviceId in URL (PUT update Services section BY ID)
                      if (anyErr.response?.status === 404 || anyErr.response?.status === 400) {
                        console.log(`⚠️ /any endpoint failed (${anyErr.response?.status}), trying with serviceId in URL...`);
                        // For BY ID approach, send data without categoryKey and sectionKey
                        // But skip if title_en is empty (backend validation)
                        if (!titleEn) {
                          console.log(`⏭️ Skipping section ${sectionIndex + 1} (title_en is empty for BY ID approach)`);
                          return { success: true, sectionIndex, skipped: true };
                        }
                        
                        const payloadById = {
                          title_en: titleEn,
                          title_ar: (section.title_ar || '').trim(),
                          image: (section.image || '').trim(),
                          details_en: (section.details_en || '').trim(),
                          details_ar: (section.details_ar || '').trim(),
                        };
                        response = await http.put(`/content/services/details/${serviceId}`, payloadById);
                        console.log(`✅ Section ${sectionIndex + 1} saved successfully via ID:`, response.data);
                      } else {
                        throw anyErr;
                      }
                    }
                    
                    return { success: true, sectionIndex };
                  } catch (sectionErr: any) {
                    if (sectionErr.response?.status === 400) {
                      console.error(`❌ Bad Request (400) for section ${sectionIndex + 1}:`, {
                        status: sectionErr.response?.status,
                        data: sectionErr.response?.data,
                        message: sectionErr.response?.data?.message,
                        fullError: sectionErr.response,
                      });
                    } else {
                      console.error(`❌ Error saving section ${sectionIndex + 1}:`, sectionErr);
                    }
                    return { success: false, sectionIndex, error: sectionErr };
                  }
                });
                
                const sectionResults = await Promise.all(sectionPromises);
                const successCount = sectionResults.filter(r => r.success).length;
                const failCount = sectionResults.filter(r => !r.success).length;
                
                if (successCount > 0) {
                  console.log(`✅ Service ${index + 1}: ${successCount} section(s) saved successfully`);
                }
                if (failCount > 0) {
                  console.log(`⚠️ Service ${index + 1}: ${failCount} section(s) failed`);
                }
                
                return { 
                  success: successCount > 0, 
                  serviceIndex: index, 
                  sectionResults 
                };
              } catch (err: any) {
                if (err.response?.status === 404) {
                  console.log(`⚠️ Service ${index + 1} details endpoint not found (404)`);
                } else if (err.response?.status === 400) {
                  console.error(`❌ Bad Request (400) for service ${index + 1}:`, {
                    status: err.response?.status,
                    statusText: err.response?.statusText,
                    data: err.response?.data,
                    message: err.response?.data?.message,
                    errors: err.response?.data?.errors,
                    fullResponse: err.response,
                  });
                  console.error(`❌ Full error for service ${index + 1}:`, err);
                } else {
                  console.error(`❌ Error saving service ${index + 1} details:`, err);
                }
                return { success: false, serviceIndex: index, error: err };
              }
            });
            
            const results = await Promise.all(savePromises);
            const successCount = results.filter(r => r.success).length;
            const failCount = results.filter(r => !r.success).length;
            
            if (successCount > 0) {
              console.log(`✅ Saved ${successCount} service(s) details successfully`);
          toast.success(
            language === 'en' 
                  ? `Services details saved successfully (${successCount} service${successCount > 1 ? 's' : ''})` 
                  : `تم حفظ تفاصيل الخدمات بنجاح (${successCount} خدمة)`
              );
              
              // If some failed, show warning but don't try fallback (CORS + 413 issues)
              if (failCount > 0) {
                console.warn(`⚠️ ${failCount} service(s) failed to save. Data saved locally in localStorage.`);
                toast.warning(
                  language === 'en' 
                    ? `${failCount} service(s) could not be saved. Data saved locally.` 
                    : `لم يتم حفظ ${failCount} خدمة. تم حفظ البيانات محلياً.`
                );
              }
              return;
            }
          }
          
          // If individual save failed or no services, show error
          console.error('❌ Individual service details save failed');
          throw new Error('Failed to save services details. Please try again.');
        } else {
          throw servicesDetailsErr;
        }
      }
    } catch (error: any) {
      console.error('❌ Error saving services details:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          (language === 'en' 
                            ? 'Failed to save services details. Data saved locally.' 
                            : 'فشل حفظ تفاصيل الخدمات. تم حفظ البيانات محلياً.');
      toast.error(errorMessage);
    }
  };

  // تحديث اتجاه النص عند تغيير اللغة
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">
        <AdminTopBar />
        <main className="p-8">
          <h2 className="text-3xl font-bold mb-4">
            {language === 'en' ? 'Content Management' : 'إدارة المحتوى'}
          </h2>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <TabsList className="grid grid-cols-7 gap-2" style={{ direction: language === 'ar' ? 'rtl' : 'ltr' }}>
              <TabsTrigger value="hero">{language === 'en' ? 'Hero' : 'البطل'}</TabsTrigger>
              <TabsTrigger value="about">{language === 'en' ? 'About' : 'حول'}</TabsTrigger>
              <TabsTrigger value="services">{language === 'en' ? 'Services' : 'الخدمات'}</TabsTrigger>
              <TabsTrigger value="order-sections">{language === 'en' ? 'Services Details' : 'تفاصيل الخدمات'}</TabsTrigger>
              <TabsTrigger value="projects">{language === 'en' ? 'Projects' : 'المشاريع'}</TabsTrigger>
              <TabsTrigger value="partners">{language === 'en' ? 'Partners' : 'الشركاء'}</TabsTrigger>
              <TabsTrigger value="jobs">{language === 'en' ? 'Jobs' : 'الوظائف'}</TabsTrigger>
            </TabsList>

            {/* Hero Section */}
            <TabsContent value="hero">
  <Card className="p-4">
    <Input
      placeholder="Title (English)"
      value={hero?.title_en || ''}
      onChange={(e) => setContent({ hero: { ...hero, title_en: e.target.value } })}
      className="mb-2"
    />
    <Input
      placeholder="Title (Arabic)"
      value={hero?.title_ar || ''}
      onChange={(e) => setContent({ hero: { ...hero, title_ar: e.target.value } })}
      className="mb-2"
    />
    <Input
      placeholder="Subtitle (English)"
      value={hero?.subtitle_en || ''}
      onChange={(e) => setContent({ hero: { ...hero, subtitle_en: e.target.value } })}
      className="mb-2"
    />
    <Input
      placeholder="Subtitle (Arabic)"
      value={hero?.subtitle_ar || ''}
      onChange={(e) => setContent({ hero: { ...hero, subtitle_ar: e.target.value } })}
      className="mb-2"
    />
    <Button onClick={() => updateHero(hero)} disabled={loading}>
      {loading ? (language === 'en' ? 'Saving...' : 'جاري الحفظ...') : (language === 'en' ? 'Save Hero' : 'حفظ البطل')}
    </Button>
  </Card>
</TabsContent>


            {/* About Section */}
            <TabsContent value="about">
              <Card className="p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-4">
                    {language === 'en' ? 'About Section (Company Landing)' : 'قسم حول (صفحة الشركة)'}
                  </h3>
                  
                  {/* Main Title and Subtitle */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Title (English)</label>
                      <Input
                        placeholder="Title (English)"
                        value={about?.title_en || ''}
                        onChange={(e) =>
                          setContent({
                            about: {
                              ...(about || {}),
                              title_en: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">العنوان (العربية)</label>
                      <Input
                        placeholder="Title (Arabic)"
                        dir="rtl"
                        value={about?.title_ar || ''}
                        onChange={(e) =>
                          setContent({
                            about: {
                              ...(about || {}),
                              title_ar: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Subtitle (English)</label>
                      <Textarea
                        placeholder="Subtitle (English)"
                        value={about?.subtitle_en || about?.description_en || ''}
                        onChange={(e) =>
                          setContent({
                            about: {
                              ...(about || {}),
                              subtitle_en: e.target.value,
                              description_en: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-1 block">العنوان الفرعي (العربية)</label>
                      <Textarea
                        placeholder="Subtitle (Arabic)"
                        dir="rtl"
                        value={about?.subtitle_ar || about?.description_ar || ''}
                        onChange={(e) =>
                          setContent({
                            about: {
                              ...(about || {}),
                              subtitle_ar: e.target.value,
                              description_ar: e.target.value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                  
                  <div className="border-t pt-4 mb-4">
                    <h4 className="text-lg font-semibold mb-4">About Cards</h4>
                    <Button
                      onClick={() => {
                        const currentAbout = about || {};
                        const currentValues = Array.isArray(currentAbout.values) ? currentAbout.values : [];
                        setContent({
                          about: {
                            ...currentAbout,
                            values: [
                              ...currentValues,
                              {
                                title_en: 'New Card',
                                title_ar: 'كارد جديد',
                                description_en: 'Card description',
                                description_ar: 'وصف الكارد',
                              },
                            ],
                          },
                        });
                      }}
                      disabled={loading}
                      className="bg-gold hover:bg-gold-dark text-black font-semibold"
                    >
                      <HexagonIcon size="sm" className="mr-2">
                        <Plus className="h-4 w-4" />
                      </HexagonIcon>
                      {language === 'en' ? 'Add Card' : 'إضافة كارد'}
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {Array.isArray(about?.values) && about.values.map((value: any, index: number) => {
                    const valueId = value._id || value.id || `value-${index}`;
                    return (
                      <Collapsible key={valueId} defaultOpen={index === 0}>
                        <Card className="border-2">
                          <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-secondary/50 transition-colors">
                              <div className="flex items-center justify-between">
                                <CardTitle>
                                  Card {index + 1} - {value.title_en || value.title?.['en'] || 'Untitled'}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                  {index > 0 && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const currentAbout = about || {};
                                        const currentValues = Array.isArray(currentAbout.values) ? [...currentAbout.values] : [];
                                        [currentValues[index], currentValues[index - 1]] = [currentValues[index - 1], currentValues[index]];
                                        setContent({
                                          about: {
                                            ...currentAbout,
                                            values: currentValues,
                                          },
                                        });
                                      }}
                                      disabled={loading}
                                    >
                                      <ChevronUp className="h-4 w-4" />
                                    </Button>
                                  )}
                                  {index < (about?.values?.length || 0) - 1 && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const currentAbout = about || {};
                                        const currentValues = Array.isArray(currentAbout.values) ? [...currentAbout.values] : [];
                                        [currentValues[index], currentValues[index + 1]] = [currentValues[index + 1], currentValues[index]];
                                        setContent({
                                          about: {
                                            ...currentAbout,
                                            values: currentValues,
                                          },
                                        });
                                      }}
                                      disabled={loading}
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                  )}
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const currentAbout = about || {};
                                      const currentValues = Array.isArray(currentAbout.values) ? currentAbout.values : [];
                                      setContent({
                                        about: {
                                          ...currentAbout,
                                          values: currentValues.filter((v: any, i: number) => i !== index),
                                        },
                                      });
                                    }}
                                    disabled={loading}
                                  >
                                    <HexagonIcon size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </HexagonIcon>
                                  </Button>
                                  <ChevronDownIcon className="h-5 w-5 shrink-0 transition-transform duration-200 data-[state=open]:rotate-180" />
                                </div>
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="pt-4 space-y-4">
                              {/* Title Row - English and Arabic */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium mb-1 block">
                                    {index === 0 ? 'Our Mission' : index === 1 ? 'Our Vision' : `Card ${index + 1} Title`} (English)
                                  </label>
                                  <Input
                                    placeholder="Card Title (English)"
                                    value={value.title_en || value.title?.['en'] || ''}
                                    onChange={(e) => {
                                      const currentAbout = about || {};
                                      const currentValues = Array.isArray(currentAbout.values) ? [...currentAbout.values] : [];
                                      currentValues[index] = {
                                        ...value,
                                        title_en: e.target.value,
                                        title: { ...(typeof value.title === 'object' ? value.title : {}), en: e.target.value },
                                      };
                                      setContent({
                                        about: {
                                          ...currentAbout,
                                          values: currentValues,
                                        },
                                      });
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-1 block">
                                    {index === 0 ? 'مهمتنا' : index === 1 ? 'رؤيتنا' : `عنوان الكارد ${index + 1}`} (العربية)
                                  </label>
                                  <Input
                                    placeholder="Card Title (Arabic)"
                                    dir="rtl"
                                    value={value.title_ar || value.title?.['ar'] || ''}
                                    onChange={(e) => {
                                      const currentAbout = about || {};
                                      const currentValues = Array.isArray(currentAbout.values) ? [...currentAbout.values] : [];
                                      currentValues[index] = {
                                        ...value,
                                        title_ar: e.target.value,
                                        title: { ...(typeof value.title === 'object' ? value.title : {}), ar: e.target.value },
                                      };
                                      setContent({
                                        about: {
                                          ...currentAbout,
                                          values: currentValues,
                                        },
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                              
                              {/* Description Row - English and Arabic */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Description (English)</label>
                                  <Textarea
                                    placeholder="Card Description (English)"
                                    value={value.description_en || value.description?.['en'] || ''}
                                    onChange={(e) => {
                                      const currentAbout = about || {};
                                      const currentValues = Array.isArray(currentAbout.values) ? [...currentAbout.values] : [];
                                      currentValues[index] = {
                                        ...value,
                                        description_en: e.target.value,
                                        description: { ...(typeof value.description === 'object' ? value.description : {}), en: e.target.value },
                                      };
                                      setContent({
                                        about: {
                                          ...currentAbout,
                                          values: currentValues,
                                        },
                                      });
                                    }}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-1 block">الوصف (العربية)</label>
                <Textarea
                                    placeholder="Card Description (Arabic)"
                                    dir="rtl"
                                    value={value.description_ar || value.description?.['ar'] || ''}
                                    onChange={(e) => {
                                      const currentAbout = about || {};
                                      const currentValues = Array.isArray(currentAbout.values) ? [...currentAbout.values] : [];
                                      currentValues[index] = {
                                        ...value,
                                        description_ar: e.target.value,
                                        description: { ...(typeof value.description === 'object' ? value.description : {}), ar: e.target.value },
                                      };
                                      setContent({
                                        about: {
                                          ...currentAbout,
                                          values: currentValues,
                                        },
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    );
                  })}
                </div>
                
                <div className="mt-6">
                  <Button
                    onClick={() => updateAbout(about)}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (language === 'en' ? 'Saving...' : 'جاري الحفظ...') : (language === 'en' ? 'Save All About Content' : 'حفظ كل محتوى حول')}
                </Button>
                </div>
              </Card>
            </TabsContent>

            {/* Services Section */}
            <TabsContent value="services">
              <Card className="p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-4">
                    {language === 'en' ? 'Services Section' : 'قسم الخدمات'}
                  </h3>
                </div>

                <div className="space-y-4">
                  {safeServices.map((s, index) => {
                    const serviceId = s._id || s.id;
                    return (
                      <Collapsible key={serviceId} defaultOpen={index === 0}>
                        <Card className="border-2">
                          <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-secondary/50 transition-colors">
                              <div className="flex items-center justify-between">
                                <CardTitle>
                                  Service {index + 1}
                                </CardTitle>
                                <ChevronDownIcon className="h-5 w-5 transition-transform duration-200 data-[state=open]:rotate-180" />
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="pt-4 space-y-4">
                              {/* Title Row - English and Arabic */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Title (English)</label>
                                  <Input
                                    placeholder="Service Title (English)"
                                    value={s.title_en || ''}
                                    onChange={(e) =>
                                      setContent({
                                        services: {
                                          ...servicesData,
                                          items: safeServices.map((srv) =>
                                            (srv._id === serviceId || srv.id === serviceId)
                                              ? { ...srv, title_en: e.target.value }
                                              : srv
                                          ),
                                        },
                                      })
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Title (Arabic)</label>
                    <Input
                                    placeholder="عنوان الخدمة (عربي)"
                                    dir="rtl"
                                    value={s.title_ar || ''}
                                    onChange={(e) =>
                                      setContent({
                                        services: {
                                          ...servicesData,
                                          items: safeServices.map((srv) =>
                                            (srv._id === serviceId || srv.id === serviceId)
                                              ? { ...srv, title_ar: e.target.value }
                                              : srv
                                          ),
                                        },
                                      })
                                    }
                                  />
                                </div>
                              </div>

                              {/* Description Row - English and Arabic */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Description (English)</label>
                                  <Textarea
                                    placeholder="Service description in English"
                                    value={s.description_en || ''}
                      onChange={(e) =>
                        setContent({
                                        services: {
                                          ...servicesData,
                                          items: safeServices.map((srv) =>
                                            (srv._id === serviceId || srv.id === serviceId)
                                              ? { ...srv, description_en: e.target.value }
                                              : srv
                                          ),
                                        },
                                      })
                                    }
                                    rows={4}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Description (Arabic)</label>
                    <Textarea
                                    placeholder="وصف الخدمة بالعربية"
                                    dir="rtl"
                                    value={s.description_ar || ''}
                                    onChange={(e) =>
                                      setContent({
                                        services: {
                                          ...servicesData,
                                          items: safeServices.map((srv) =>
                                            (srv._id === serviceId || srv.id === serviceId)
                                              ? { ...srv, description_ar: e.target.value }
                                              : srv
                                          ),
                                        },
                                      })
                                    }
                                    rows={4}
                                  />
                                </div>
                              </div>

                              {/* Code Field - Commented out */}
                              {/* <div>
                                <label className="text-sm font-medium mb-1 block">Code</label>
                                <Input
                                  placeholder="Service Code"
                                  value={s.code || ''}
                      onChange={(e) =>
                        setContent({
                                      services: {
                                        ...servicesData,
                                        items: safeServices.map((srv) =>
                                          (srv._id === serviceId || srv.id === serviceId)
                                            ? { ...srv, code: e.target.value }
                                            : srv
                                        ),
                                      },
                                    })
                                  }
                                />
                              </div> */}
                            </CardContent>
                          </CollapsibleContent>
                  </Card>
                      </Collapsible>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <Button
                    onClick={() => updateServices(servicesData)}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (language === 'en' ? 'Saving...' : 'جاري الحفظ...') : (language === 'en' ? 'Save All Services' : 'حفظ كل الخدمات')}
                </Button>
                </div>
              </Card>
            </TabsContent>

            {/* Projects Section */}
            <TabsContent value="projects">
              <Card className="p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-4">
                    {language === 'en' ? 'Projects Section' : 'قسم المشاريع'}
                  </h3>
                  <Button
                    onClick={() =>
                      addProject({
                        title_en: 'New Project',
                        title_ar: 'مشروع جديد',
                        description_en: 'Project description',
                        description_ar: 'وصف المشروع',
                        image: '',
                        link: '',
                      })
                    }
                    disabled={loading}
                    className="bg-gold hover:bg-gold-dark text-black font-semibold"
                  >
                    <HexagonIcon size="sm" className="mr-2">
                      <Plus className="h-4 w-4" />
                    </HexagonIcon>
                    Add Project
                  </Button>
                </div>

                <div className="space-y-4">
                  {safeProjects.map((p, index) => {
                    const projectId = p._id || p.id || `project-${index}`;
                    return (
                      <Collapsible key={projectId} defaultOpen={index === 0}>
                        <Card className="border-2">
                          <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-secondary/50 transition-colors">
                              <div className="flex items-center justify-between">
                                <CardTitle>
                                  Project {index + 1}
                                </CardTitle>
                                <ChevronDownIcon className="h-5 w-5 transition-transform duration-200 data-[state=open]:rotate-180" />
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="pt-4 space-y-4">
                              {/* Title Row - English and Arabic */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Title (English)</label>
                                  <Input
                                    placeholder="Project Title (English)"
                                    value={p.title_en || ''}
                                    onChange={(e) =>
                                      setContent({
                                        projects: {
                                          ...projectsData,
                                          items: safeProjects.map((proj, idx) => {
                                            const projId = proj._id || proj.id || `project-${idx}`;
                                            return projId === projectId
                                              ? { ...proj, title_en: e.target.value }
                                              : proj;
                                          }),
                                        },
                                      })
                                    }
                                  />
                                </div>
                    <div>
                                  <label className="text-sm font-medium mb-1 block">Title (Arabic)</label>
                      <Input
                                    placeholder="عنوان المشروع (عربي)"
                                    dir="rtl"
                                    value={p.title_ar || ''}
                                    onChange={(e) =>
                                      setContent({
                                        projects: {
                                          ...projectsData,
                                          items: safeProjects.map((proj, idx) => {
                                            const projId = proj._id || proj.id || `project-${idx}`;
                                            return projId === projectId
                                              ? { ...proj, title_ar: e.target.value }
                                              : proj;
                                          }),
                                        },
                                      })
                                    }
                                  />
                                </div>
                              </div>

                              {/* Description Row - English and Arabic */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Description (English)</label>
                                  <Textarea
                                    placeholder="Project description in English"
                                    value={p.description_en || ''}
                        onChange={(e) =>
                          setContent({
                                        projects: {
                                          ...projectsData,
                                          items: safeProjects.map((proj, idx) => {
                                            const projId = proj._id || proj.id || `project-${idx}`;
                                            return projId === projectId
                                              ? { ...proj, description_en: e.target.value }
                                              : proj;
                                          }),
                                        },
                                      })
                                    }
                                    rows={4}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Description (Arabic)</label>
                      <Textarea
                                    placeholder="وصف المشروع بالعربية"
                                    dir="rtl"
                                    value={p.description_ar || ''}
                                    onChange={(e) =>
                                      setContent({
                                        projects: {
                                          ...projectsData,
                                          items: safeProjects.map((proj, idx) => {
                                            const projId = proj._id || proj.id || `project-${idx}`;
                                            return projId === projectId
                                              ? { ...proj, description_ar: e.target.value }
                                              : proj;
                                          }),
                                        },
                                      })
                                    }
                                    rows={4}
                                  />
                                </div>
                              </div>

                              {/* Image Upload */}
                              <div>
                                <label className="text-sm font-medium mb-1 block">
                                  Upload Project Image
                                </label>
                                <div className="space-y-2">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;

                                      // Validate file size (max 5MB)
                                      if (file.size > 5 * 1024 * 1024) {
                                        alert(language === 'en' 
                                          ? 'Image size must be less than 5MB' 
                                          : 'يجب أن يكون حجم الصورة أقل من 5MB');
                                        return;
                                      }

                                      try {
                                        // Create FormData for file upload
                                        const formData = new FormData();
                                        formData.append('image', file);
                                        formData.append('folder', 'hixa/projects');

                                        // Upload image to API
                                        const uploadResponse = await http.post('/content/upload', formData);

                                        // Get uploaded image URL - try different response formats
                                        const imageUrl = uploadResponse.data?.url || 
                                                       uploadResponse.data?.data?.url || 
                                                       uploadResponse.data?.imageUrl ||
                                                       uploadResponse.data?.secure_url;
                                        
                                        if (imageUrl) {
                                          // Update project image with uploaded URL
                                          setContent({
                                            projects: {
                                              ...projectsData,
                                              items: safeProjects.map((proj, idx) => {
                                                const projId = proj._id || proj.id || `project-${idx}`;
                                                return projId === projectId
                                                  ? { ...proj, image: imageUrl }
                                                  : proj;
                                              }),
                                            },
                                          });
                                          
                                          toast.success(
                                            language === 'en' 
                                              ? '🎉 Image uploaded successfully!' 
                                              : '🎉 تم رفع الصورة بنجاح!',
                                            {
                                              position: 'top-center',
                                            }
                                          );
                                        } else {
                                          throw new Error('No URL returned from upload');
                                        }
                                      } catch (err: any) {
                                        console.error('Upload error details:', {
                                          message: err.message,
                                          status: err.response?.status,
                                          statusText: err.response?.statusText,
                                          data: err.response?.data,
                                          url: err.config?.url,
                                        });
                                        
                                        // Check if it's a 500 error (server error)
                                        if (err.response?.status === 500) {
                                          const errorDetails = err.response?.data?.message || 
                                                             err.response?.data?.error || 
                                                             'Server error occurred';
                                          
                                          const errorMsg = language === 'en'
                                            ? `Image upload failed (Server Error 500): ${errorDetails}\n\nThe upload endpoint may not be configured on the backend. Please use the "Image URL" field below to enter the image URL directly, or contact the backend team to enable the upload endpoint.`
                                            : `فشل رفع الصورة (خطأ في الخادم 500): ${errorDetails}\n\nنقطة رفع الصور قد لا تكون مفعلة في الـ backend. يرجى استخدام حقل "رابط الصورة" أدناه لإدخال رابط الصورة مباشرة، أو الاتصال بفريق الـ backend لتفعيل نقطة الرفع.`;
                                          toast.error(
                                            language === 'en'
                                              ? `😢 ${errorMsg}`
                                              : `😢 ${errorMsg}`,
                                            {
                                              position: 'top-center',
                                              duration: 5000,
                                            }
                                          );
                                        } else {
                                          const errorMessage = err.response?.data?.message || 
                                                             err.response?.data?.error || 
                                                             err.message || 
                                                             'Unknown error';
                                          
                                          toast.error(
                                            language === 'en' 
                                              ? `😢 Failed to upload image: ${errorMessage}` 
                                              : `😢 فشل رفع الصورة: ${errorMessage}`,
                                            {
                                              position: 'top-center',
                                            }
                                          );
                                        }
                                      }
                                      
                                      // Reset file input
                                      e.target.value = '';
                                    }}
                                    className="cursor-pointer"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    {language === 'en' 
                                      ? 'JPG, PNG or GIF. Max size 5MB. Image will be uploaded to Cloudinary and URL will be set automatically.'
                                      : 'JPG أو PNG أو GIF. الحد الأقصى للحجم 5MB. سيتم رفع الصورة إلى Cloudinary وستتم إضافة الرابط تلقائياً.'}
                                  </p>
                                  {p.image && (
                                    <div className="mt-2">
                                      <p className="text-xs text-muted-foreground mb-1">
                                        {language === 'en' ? 'Current Image:' : 'الصورة الحالية:'}
                                      </p>
                                      <img 
                                        src={p.image} 
                                        alt="Project Image" 
                                        className="h-32 w-full object-cover border rounded"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Image and Link Fields */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Image URL</label>
                                  <Input
                                    placeholder="https://example.com/image.jpg"
                                    value={p.image || ''}
                                    onChange={(e) =>
                                      setContent({
                                        projects: {
                                          ...projectsData,
                                          items: safeProjects.map((proj, idx) => {
                                            const projId = proj._id || proj.id || `project-${idx}`;
                                            return projId === projectId
                                              ? { ...proj, image: e.target.value }
                                              : proj;
                                          }),
                                        },
                                      })
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Project Link</label>
                                  <Input
                                    placeholder="https://example.com/project"
                                    value={p.link || ''}
                        onChange={(e) =>
                          setContent({
                                        projects: {
                                          ...projectsData,
                                          items: safeProjects.map((proj, idx) => {
                                            const projId = proj._id || proj.id || `project-${idx}`;
                                            return projId === projectId
                                              ? { ...proj, link: e.target.value }
                                              : proj;
                                          }),
                                        },
                          })
                        }
                      />
                    </div>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex justify-end gap-2 pt-2">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => reorderProject(projectId, 'up')}
                                    disabled={loading || index === 0}
                                  >
                                    <HexagonIcon size="sm">
                                      <ChevronUp className="h-4 w-4" />
                                    </HexagonIcon>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => reorderProject(projectId, 'down')}
                                    disabled={loading || index === safeProjects.length - 1}
                                  >
                                    <HexagonIcon size="sm">
                                      <ChevronDown className="h-4 w-4" />
                                    </HexagonIcon>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deleteProject(projectId)}
                                    disabled={loading}
                                  >
                                    <HexagonIcon size="sm">
                      <Trash2 className="h-4 w-4" />
                                    </HexagonIcon>
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <Button
                    onClick={() => updateProjects(projectsData)}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (language === 'en' ? 'Saving...' : 'جاري الحفظ...') : (language === 'en' ? 'Save All Projects' : 'حفظ كل المشاريع')}
                    </Button>
                </div>
                  </Card>
            </TabsContent>

            {/* Partners Section */}
            <TabsContent value="partners">
              <Card className="p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-4">
                    {language === 'en' ? 'Partners Section' : 'قسم الشركاء'}
                  </h3>
                <Button
                  onClick={() =>
                      addPartner({
                        name_en: 'New Partner',
                        name_ar: 'شريك جديد',
                        logo: '',
                        link: '',
                        isActive: true,
                      }).catch((err) => {
                        // Error is already handled in the store
                        console.error('Failed to add partner:', err);
                      })
                    }
                    disabled={loading}
                    className="bg-gold hover:bg-gold-dark text-black font-semibold"
                  >
                    <HexagonIcon size="sm" className="mr-2">
                      <Plus className="h-4 w-4" />
                    </HexagonIcon>
                    Add Partner
                  </Button>
                </div>

                <div className="space-y-4">
                  {safePartners.map((p, index) => {
                    const partnerId = p._id || p.id || `partner-${index}`;
                    return (
                      <Collapsible key={partnerId} defaultOpen={index === 0}>
                        <Card className="border-2">
                          <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-secondary/50 transition-colors">
                              <div className="flex items-center justify-between">
                                <CardTitle>
                                  Partner {index + 1}
                                </CardTitle>
                                <ChevronDownIcon className="h-5 w-5 transition-transform duration-200 data-[state=open]:rotate-180" />
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="pt-4 space-y-4">
                              {/* Name Row - English and Arabic */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Name (English)</label>
                                  <Input
                                    placeholder="Partner Name (English)"
                                    value={p.name_en || ''}
                                    onChange={(e) =>
                                      setContent({
                                        partners: {
                                          ...partnersData,
                                          items: safePartners.map((partner, idx) => {
                                            const partId = partner._id || partner.id || `partner-${idx}`;
                                            return partId === partnerId
                                              ? { ...partner, name_en: e.target.value }
                                              : partner;
                                          }),
                                        },
                                      })
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Name (Arabic)</label>
                                  <Input
                                    placeholder="اسم الشريك (عربي)"
                                    dir="rtl"
                                    value={p.name_ar || ''}
                                    onChange={(e) =>
                                      setContent({
                                        partners: {
                                          ...partnersData,
                                          items: safePartners.map((partner, idx) => {
                                            const partId = partner._id || partner.id || `partner-${idx}`;
                                            return partId === partnerId
                                              ? { ...partner, name_ar: e.target.value }
                                              : partner;
                                          }),
                                        },
                                      })
                                    }
                                  />
                                </div>
                              </div>

                              {/* Logo Upload */}
                              <div>
                                <label className="text-sm font-medium mb-1 block">
                                  Upload Logo
                                </label>
                                <div className="space-y-2">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={async (e) => {
                                      const file = e.target.files?.[0];
                                      if (!file) return;

                                      // Validate file size (max 5MB)
                                      if (file.size > 5 * 1024 * 1024) {
                                        alert(language === 'en' 
                                          ? 'Image size must be less than 5MB' 
                                          : 'يجب أن يكون حجم الصورة أقل من 5MB');
                                        return;
                                      }

                                      try {
                                        // Create FormData for file upload
                                        const formData = new FormData();
                                        formData.append('image', file);
                                        formData.append('folder', 'hixa/partners');

                                        // Upload image to API
                                        const uploadResponse = await http.post('/content/upload', formData);

                                        // Get uploaded image URL - try different response formats
                                        const imageUrl = uploadResponse.data?.url || 
                                                       uploadResponse.data?.data?.url || 
                                                       uploadResponse.data?.imageUrl ||
                                                       uploadResponse.data?.secure_url;
                                        
                                        if (imageUrl) {
                                          // Update partner logo with uploaded URL
                                          setContent({
                                            partners: {
                                              ...partnersData,
                                              items: safePartners.map((partner, idx) => {
                                                const partId = partner._id || partner.id || `partner-${idx}`;
                                                return partId === partnerId
                                                  ? { ...partner, logo: imageUrl }
                                                  : partner;
                                              }),
                                            },
                                          });
                                          
                                          toast.success(
                                            language === 'en' 
                                              ? '🎉 Image uploaded successfully!' 
                                              : '🎉 تم رفع الصورة بنجاح!',
                                            {
                                              position: 'top-center',
                                            }
                                          );
                                        } else {
                                          throw new Error('No URL returned from upload');
                                        }
                                      } catch (err: any) {
                                        console.error('Upload error details:', {
                                          message: err.message,
                                          status: err.response?.status,
                                          statusText: err.response?.statusText,
                                          data: err.response?.data,
                                          url: err.config?.url,
                                        });
                                        
                                        // Check if it's a 500 error (server error)
                                        if (err.response?.status === 500) {
                                          const errorDetails = err.response?.data?.message || 
                                                             err.response?.data?.error || 
                                                             'Server error occurred';
                                          
                                          const errorMsg = language === 'en'
                                            ? `Image upload failed (Server Error 500): ${errorDetails}\n\nThe upload endpoint may not be configured on the backend. Please use the "Logo URL" field below to enter the image URL directly, or contact the backend team to enable the upload endpoint.`
                                            : `فشل رفع الصورة (خطأ في الخادم 500): ${errorDetails}\n\nنقطة رفع الصور قد لا تكون مفعلة في الـ backend. يرجى استخدام حقل "رابط الشعار" أدناه لإدخال رابط الصورة مباشرة، أو الاتصال بفريق الـ backend لتفعيل نقطة الرفع.`;
                                          alert(errorMsg);
                                        } else {
                                          const errorMessage = err.response?.data?.message || 
                                                             err.response?.data?.error || 
                                                             err.message || 
                                                             'Unknown error';
                                          
                                          toast.error(
                                            language === 'en' 
                                              ? `😢 Failed to upload image: ${errorMessage}` 
                                              : `😢 فشل رفع الصورة: ${errorMessage}`,
                                            {
                                              position: 'top-center',
                                            }
                                          );
                                        }
                                      }
                                      
                                      // Reset file input
                                      e.target.value = '';
                                    }}
                                    className="cursor-pointer"
                                  />
                                  <p className="text-xs text-muted-foreground">
                                    {language === 'en' 
                                      ? 'JPG, PNG or GIF. Max size 5MB. Image will be uploaded to Cloudinary and URL will be set automatically.'
                                      : 'JPG أو PNG أو GIF. الحد الأقصى للحجم 5MB. سيتم رفع الصورة إلى Cloudinary وستتم إضافة الرابط تلقائياً.'}
                                  </p>
                                  {p.logo && (
                                    <div className="mt-2">
                                      <p className="text-xs text-muted-foreground mb-1">
                                        {language === 'en' ? 'Current Logo:' : 'الشعار الحالي:'}
                                      </p>
                                      <img 
                                        src={p.logo} 
                                        alt="Partner Logo" 
                                        className="h-20 w-20 object-contain border rounded"
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Logo URL */}
                              <div>
                                <label className="text-sm font-medium mb-1 block">Logo URL</label>
                                <Input
                                  placeholder="https://example.com/logo.png"
                                  value={p.logo || ''}
                                  onChange={(e) =>
                                    setContent({
                                      partners: {
                                        ...partnersData,
                                        items: safePartners.map((partner, idx) => {
                                          const partId = partner._id || partner.id || `partner-${idx}`;
                                          return partId === partnerId
                                            ? { ...partner, logo: e.target.value }
                                            : partner;
                                        }),
                                      },
                                    })
                                  }
                                />
                              </div>

                              {/* Link */}
                              <div>
                                <label className="text-sm font-medium mb-1 block">Partner Link</label>
                                <Input
                                  placeholder="https://example.com"
                                  value={p.link || ''}
                                  onChange={(e) =>
                                    setContent({
                                      partners: {
                                        ...partnersData,
                                        items: safePartners.map((partner, idx) => {
                                          const partId = partner._id || partner.id || `partner-${idx}`;
                                          return partId === partnerId
                                            ? { ...partner, link: e.target.value }
                                            : partner;
                                        }),
                                      },
                                    })
                                  }
                                />
                              </div>

                              {/* Active Checkbox */}
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`active-${partnerId}`}
                                  checked={p.isActive ?? true}
                                  onCheckedChange={(checked) =>
                                    setContent({
                                      partners: {
                                        ...partnersData,
                                        items: safePartners.map((partner, idx) => {
                                          const partId = partner._id || partner.id || `partner-${idx}`;
                                          return partId === partnerId
                                            ? { ...partner, isActive: checked === true }
                                            : partner;
                                        }),
                                      },
                                    })
                                  }
                                />
                                <label
                                  htmlFor={`active-${partnerId}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Active
                                </label>
                              </div>

                              {/* Action Buttons */}
                              <div className="flex justify-end gap-2 pt-2">
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => reorderPartner(partnerId, 'up')}
                                    disabled={loading || index === 0}
                                  >
                                    <HexagonIcon size="sm">
                                      <ChevronUp className="h-4 w-4" />
                                    </HexagonIcon>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => reorderPartner(partnerId, 'down')}
                                    disabled={loading || index === safePartners.length - 1}
                                  >
                                    <HexagonIcon size="sm">
                                      <ChevronDown className="h-4 w-4" />
                                    </HexagonIcon>
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => deletePartner(partnerId)}
                                    disabled={loading}
                                  >
                                    <HexagonIcon size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </HexagonIcon>
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <Button
                    onClick={() => updatePartners(partnersData)}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (language === 'en' ? 'Saving...' : 'جاري الحفظ...') : (language === 'en' ? 'Save All Partners' : 'حفظ كل الشركاء')}
                </Button>
                </div>
              </Card>
            </TabsContent>

            {/* Jobs Section */}
            <TabsContent value="jobs">
              <Card className="p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-4">
                    {language === 'en' ? 'Jobs Section' : 'قسم الوظائف'}
                  </h3>
                  <Button
                    onClick={() => {
                      const newJob = {
                        title_en: 'New Job',
                        title_ar: 'وظيفة جديدة',
                        description_en: 'Job description',
                        description_ar: 'وصف الوظيفة',
                        link: '',
                        isActive: true,
                      };
                      // Add to local state only (don't save to server yet)
                      // User will fill in the fields and click "Save All Jobs"
                      setContent({
                        jobs: {
                          ...jobsData,
                          items: [...safeJobs, newJob],
                        },
                      });
                    }}
                    disabled={loading}
                    className="bg-gold hover:bg-gold-dark text-black font-semibold"
                  >
                    <HexagonIcon size="sm" className="mr-2">
                      <Plus className="h-4 w-4" />
                    </HexagonIcon>
                    Add Job
                  </Button>
                </div>

                <div className="space-y-4">
                  {safeJobs.map((j, index) => {
                    const jobId = j._id || j.id || `job-${index}`;
                    const isNewJob = !j._id && !j.id;
                    return (
                      <Collapsible key={jobId} defaultOpen={index === 0}>
                        <Card className="border-2">
                          <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-secondary/50 transition-colors">
                              <div className="flex items-center justify-between">
                                <CardTitle>
                                  Job {index + 1}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                  {!isNewJob && (
                                    <Button
                                      size="sm"
                                      variant="destructive"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        const realId = j._id || j.id;
                                        if (realId) {
                                          deleteJob(realId);
                                        }
                                      }}
                                      disabled={loading}
                                    >
                                      <HexagonIcon size="sm">
                                        <Trash2 className="h-4 w-4" />
                                      </HexagonIcon>
                                    </Button>
                                  )}
                                  <ChevronDownIcon className="h-5 w-5 transition-transform duration-200 data-[state=open]:rotate-180" />
                                </div>
                              </div>
                            </CardHeader>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <CardContent className="pt-4 space-y-4">
                              {/* Title Row - English and Arabic */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Job Title (English)</label>
                                  <Input
                                    placeholder="Job Title (English)"
                                    value={j.title_en || ''}
                                    onChange={(e) =>
                                      setContent({
                                        jobs: {
                                          ...jobsData,
                                          items: safeJobs.map((job, idx) =>
                                            (job._id === j._id && job.id === j.id) || 
                                            (!job._id && !job.id && idx === index)
                                              ? { ...job, title_en: e.target.value }
                                              : job
                                          ),
                                        },
                                      })
                                    }
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Job Title (Arabic)</label>
                                  <Input
                                    placeholder="عنوان الوظيفة (عربي)"
                                    dir="rtl"
                                    value={j.title_ar || ''}
                                    onChange={(e) =>
                                      setContent({
                                        jobs: {
                                          ...jobsData,
                                          items: safeJobs.map((job, idx) =>
                                            (job._id === j._id && job.id === j.id) || 
                                            (!job._id && !job.id && idx === index)
                                              ? { ...job, title_ar: e.target.value }
                                              : job
                                          ),
                                        },
                                      })
                                    }
                                  />
                                </div>
                              </div>

                              {/* Description Row - English and Arabic */}
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Description (English)</label>
                                  <Textarea
                                    placeholder="Job description in English"
                                    value={j.description_en || ''}
                                    onChange={(e) =>
                                      setContent({
                                        jobs: {
                                          ...jobsData,
                                          items: safeJobs.map((job, idx) =>
                                            (job._id === j._id && job.id === j.id) || 
                                            (!job._id && !job.id && idx === index)
                                              ? { ...job, description_en: e.target.value }
                                              : job
                                          ),
                                        },
                                      })
                                    }
                                    rows={4}
                                  />
                                </div>
                                <div>
                                  <label className="text-sm font-medium mb-1 block">Description (Arabic)</label>
                                  <Textarea
                                    placeholder="وصف الوظيفة بالعربية"
                                    dir="rtl"
                                    value={j.description_ar || ''}
                                    onChange={(e) =>
                                      setContent({
                                        jobs: {
                                          ...jobsData,
                                          items: safeJobs.map((job, idx) =>
                                            (job._id === j._id && job.id === j.id) || 
                                            (!job._id && !job.id && idx === index)
                                              ? { ...job, description_ar: e.target.value }
                                              : job
                                          ),
                                        },
                                      })
                                    }
                                    rows={4}
                                  />
                                </div>
                              </div>

                              {/* Application Link */}
                              <div>
                                <label className="text-sm font-medium mb-1 block">Application Link (optional)</label>
                                <Input
                                  placeholder="https://example.com/apply"
                                  value={j.link || ''}
                                  onChange={(e) =>
                                    setContent({
                                      jobs: {
                                        ...jobsData,
                                        items: safeJobs.map((job, idx) =>
                                          (job._id === j._id && job.id === j.id) || 
                                          (!job._id && !job.id && idx === index)
                                            ? { ...job, link: e.target.value }
                                            : job
                                        ),
                                      },
                                    })
                                  }
                                />
                              </div>

                              {/* Active Checkbox */}
                              <div className="flex items-center space-x-2">
                                <Checkbox
                                  id={`active-job-${jobId}`}
                                  checked={j.isActive ?? true}
                                  onCheckedChange={(checked) =>
                                    setContent({
                                      jobs: {
                                        ...jobsData,
                                        items: safeJobs.map((job, idx) =>
                                          (job._id === j._id && job.id === j.id) || 
                                          (!job._id && !job.id && idx === index)
                                            ? { ...job, isActive: checked === true }
                                            : job
                                        ),
                                      },
                                    })
                                  }
                                />
                                <label
                                  htmlFor={`active-job-${jobId}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  Active
                                </label>
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    );
                  })}
                </div>

                <div className="mt-6">
                  <Button
                    onClick={() => updateJobs(jobsData)}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (language === 'en' ? 'Saving...' : 'جاري الحفظ...') : (language === 'en' ? 'Save All Jobs' : 'حفظ كل الوظائف')}
                </Button>
                </div>
              </Card>
            </TabsContent>

            {/* Order Sections Tab - Contains 4 sub-sections */}
            <TabsContent value="order-sections">
              <Card className="p-6">
                <CardHeader>
                  <CardTitle>{language === 'en' ? 'Services Details' : 'تفاصيل الخدمات'}</CardTitle>
                  <p className="text-sm text-muted-foreground mt-2">
                    {language === 'en' ? 'Manage the 4 service details sections displayed in the order modal' : 'إدارة الأقسام الأربعة لتفاصيل الخدمات المعروضة في نموذج الطلب'}
                  </p>
                </CardHeader>
                <CardContent>
                  {/* Level 1: Service Tabs (4 services) */}
                  <Tabs value={String(activeServiceIndex)} onValueChange={(val) => {
                    setActiveServiceIndex(Number(val));
                    setActiveSectionIndex(0); // Reset to first section when switching services
                  }} className="space-y-6">
                    <TabsList className="grid grid-cols-4 gap-2 w-full">
                      {[0, 1, 2, 3].map((serviceIndex) => {
                        const service = safeServices[serviceIndex];
                        const serviceTitle = service 
                          ? (service.title_en || service.title_ar || service.name || `Service ${serviceIndex + 1}`)
                          : (language === 'en' ? `Service ${serviceIndex + 1}` : `الخدمة ${serviceIndex + 1}`);
                        const displayTitle = serviceTitle.length > 15 ? `${serviceTitle.substring(0, 12)}...` : serviceTitle;
                        return (
                          <TabsTrigger key={serviceIndex} value={String(serviceIndex)} className="flex flex-col items-center gap-1">
                            <span className="text-xs font-medium">{displayTitle}</span>
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>

                    {/* Level 2: For each service, show 4 sections */}
                    {[0, 1, 2, 3].map((serviceIndex) => (
                      <TabsContent key={serviceIndex} value={String(serviceIndex)}>
                        {/* Level 2: Section Tabs (4 sections per service) */}
                        <Tabs value={String(activeSectionIndex)} onValueChange={(val) => setActiveSectionIndex(Number(val))} className="space-y-6">
                          <TabsList className="grid grid-cols-4 gap-2 w-full">
                            {[0, 1, 2, 3].map((sectionIndex) => (
                              <TabsTrigger key={sectionIndex} value={String(sectionIndex)}>
                                {language === 'en' ? `Section ${sectionIndex + 1}` : `القسم ${sectionIndex + 1}`}
                              </TabsTrigger>
                            ))}
                          </TabsList>

                          {/* Section Content */}
                          {[0, 1, 2, 3].map((sectionIndex) => {
                            const section = servicesDetails[serviceIndex]?.[sectionIndex] || { title_en: '', title_ar: '', image: '', details_en: '', details_ar: '' };
                            return (
                              <TabsContent key={sectionIndex} value={String(sectionIndex)}>
                                <Card className="p-4">
                                  <CardContent className="space-y-4 pt-6">
                                    {/* Title English */}
                                    <div>
                                      <label className="block text-sm font-medium mb-2">
                                        {language === 'en' ? 'Title (English)' : 'العنوان (إنجليزي)'}
                                      </label>
                                      <Input
                                        value={section.title_en || ''}
                                        onChange={(e) => handleSectionChange(serviceIndex, sectionIndex, 'title_en', e.target.value)}
                                        placeholder={language === 'en' ? 'Enter title in English...' : 'أدخل العنوان بالإنجليزية...'}
                                      />
                                    </div>

                                    {/* Title Arabic */}
                                    <div>
                                      <label className="block text-sm font-medium mb-2">
                                        {language === 'en' ? 'Title (Arabic)' : 'العنوان (عربي)'}
                                      </label>
                                      <Input
                                        value={section.title_ar || ''}
                                        onChange={(e) => handleSectionChange(serviceIndex, sectionIndex, 'title_ar', e.target.value)}
                                        placeholder={language === 'en' ? 'Enter title in Arabic...' : 'أدخل العنوان بالعربية...'}
                                      />
                                    </div>

                                    {/* Image */}
                                    <div>
                                      <label className="block text-sm font-medium mb-2">
                                        {language === 'en' ? 'Image' : 'الصورة'}
                                      </label>
                                      <div className="space-y-2">
                                        <input
                                          type="file"
                                          accept="image/*"
                                          onChange={(e) => handleSectionImageUpload(serviceIndex, sectionIndex, e)}
                                          className="hidden"
                                          id={`service-${serviceIndex}-section-${sectionIndex}-image`}
                                        />
                                        <label
                                          htmlFor={`service-${serviceIndex}-section-${sectionIndex}-image`}
                                          className="flex items-center justify-center w-full px-4 py-2 bg-background border border-border rounded-lg cursor-pointer hover:bg-muted transition-colors"
                                        >
                                          <Upload className="h-4 w-4 mr-2" />
                                          <span className="text-sm">
                                            {section.image
                                              ? (language === 'en' ? 'Change image...' : 'تغيير الصورة...')
                                              : (language === 'en' ? 'Choose image...' : 'اختر صورة...')}
                                          </span>
                                        </label>
                                        {section.image && (
                                          <div className="mt-2">
                                            <img
                                              src={section.image}
                                              alt={`Service ${serviceIndex + 1} - Section ${sectionIndex + 1}`}
                                              className="w-full h-48 object-cover rounded-lg border border-border"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </div>

                                    {/* Details English */}
                                    <div>
                                      <label className="block text-sm font-medium mb-2">
                                        {language === 'en' ? 'Details (English)' : 'التفاصيل (إنجليزي)'}
                                      </label>
                                      <Textarea
                                        value={section.details_en || ''}
                                        onChange={(e) => handleSectionChange(serviceIndex, sectionIndex, 'details_en', e.target.value)}
                                        placeholder={language === 'en' ? 'Enter details in English...' : 'أدخل التفاصيل بالإنجليزية...'}
                                        rows={6}
                                      />
                                    </div>

                                    {/* Details Arabic */}
                                    <div>
                                      <label className="block text-sm font-medium mb-2">
                                        {language === 'en' ? 'Details (Arabic)' : 'التفاصيل (عربي)'}
                                      </label>
                                      <Textarea
                                        value={section.details_ar || ''}
                                        onChange={(e) => handleSectionChange(serviceIndex, sectionIndex, 'details_ar', e.target.value)}
                                        placeholder={language === 'en' ? 'Enter details in Arabic...' : 'أدخل التفاصيل بالعربية...'}
                                        rows={6}
                                      />
                                    </div>
                                  </CardContent>
                                </Card>
                              </TabsContent>
                            );
                          })}
                        </Tabs>
                      </TabsContent>
                    ))}
                  </Tabs>

                  {/* Save All Button */}
                  <div className="mt-6">
                    <Button
                      onClick={saveServicesDetails}
                      disabled={loading}
                      className="w-full"
                    >
                      {loading
                        ? (language === 'en' ? 'Saving...' : 'جاري الحفظ...')
                        : (language === 'en' ? 'Save All Services Details' : 'حفظ كل تفاصيل الخدمات')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  );
};

export default ContentManagement;
