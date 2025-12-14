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
import { Plus, Trash2, ChevronUp, ChevronDown, ChevronDown as ChevronDownIcon, Upload, Eye, Edit } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { http } from '@/services/http';
import { toast } from '@/components/ui/sonner';

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('hero');
  const { language } = useApp();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<{ id: string; index: number } | null>(null);
  
  // Service modal state
  const [serviceModalOpen, setServiceModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Service detail modal state
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDetail, setSelectedDetail] = useState<any>(null);
  const [isDetailEditMode, setIsDetailEditMode] = useState(false);
  
  // Structure: servicesDetails mapped by serviceId (not index) to avoid mismatches when services are deleted/reordered
  // Format: { [serviceId]: [section1, section2, section3, section4] }
  const [servicesDetails, setServicesDetails] = useState<{ [serviceId: string]: any[] }>({});
  
  // Helper function to get service details by serviceId
  // Returns data as-is from state, no padding
  const getServiceDetails = (serviceId: string): any[] => {
    if (!serviceId) {
      console.warn('⚠️ getServiceDetails called with empty serviceId');
      return [];
    }
    
    // Normalize serviceId for lookup (handle ObjectId)
    const normalizeId = (id: any): string => {
      if (!id) return '';
      if (id.toString && typeof id.toString === 'function') {
        return id.toString();
      }
      return String(id);
    };
    
    const normalizedServiceId = normalizeId(serviceId);
    
    // Try to find details by normalized ID
    const foundDetails = Object.keys(servicesDetails).find(key => {
      const normalizedKey = normalizeId(key);
      return normalizedKey === normalizedServiceId;
    });
    
    if (foundDetails && servicesDetails[foundDetails]) {
      const foundDetailsArray = servicesDetails[foundDetails];
      console.log(`✅ Found details for serviceId ${normalizedServiceId}:`, foundDetailsArray);
      console.log(`📊 Details count: ${foundDetailsArray.length}`);
      if (foundDetailsArray.length > 0) {
        console.log(`📋 First section:`, foundDetailsArray[0]);
      }
      return foundDetailsArray;
    }
    
    console.warn(`⚠️ No details found for serviceId ${normalizedServiceId}, returning empty array`);
    console.warn(`🔍 Available keys in servicesDetails:`, Object.keys(servicesDetails));
    console.warn(`🔍 servicesDetails content:`, servicesDetails);
    return [];
  };
  
  // Helper function to set service details by serviceId
  const setServiceDetails = (serviceId: string, details: any[]) => {
    if (!serviceId) return;
    console.log(`💾 Setting details for service ${serviceId}:`, details);
    setServicesDetails(prev => {
      const updated = {
        ...prev,
        [serviceId]: details,
      };
      console.log(`✅ State updated. Total services in state: ${Object.keys(updated).length}`);
      return updated;
    });
  };

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

  // Helper لتجنب الأخطاء - services الآن object يحتوي على item1, item2, item3, item4
  const servicesData = services || {};
  const safeServices = [
    { ...servicesData.item1, itemId: 'item1', index: 0 },
    { ...servicesData.item2, itemId: 'item2', index: 1 },
    { ...servicesData.item3, itemId: 'item3', index: 2 },
    { ...servicesData.item4, itemId: 'item4', index: 3 },
  ].filter(item => item.title_en || item.title_ar); // Filter out empty services
  
  // Debug: Log services data
  useEffect(() => {
    console.log('🔍 Services Debug:', {
      services,
      servicesData,
      safeServices,
      safeServicesLength: safeServices.length,
      firstService: safeServices[0],
    });
  }, [services, safeServices.length]);
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
      console.log('🔄 Services loaded, fetching details...');
      fetchOrderSections();
    }
  }, [safeServices.length]);
  
  // Also fetch details when Services Details tab is opened
  useEffect(() => {
    if (activeTab === 'services-details' && safeServices.length > 0) {
      console.log('🔄 Services Details tab opened, fetching details...');
      fetchOrderSections();
    }
  }, [activeTab, safeServices.length]);

  // Removed useEffect that auto-creates empty sections
  // Data is now stored exactly as fetched from backend

  // Get service details from local state (from services object)
  const getServiceDetailsFromState = (itemId: string): any => {
    const service = servicesData[itemId];
    if (!service || !service.details) {
      return {
        detail1: { title_en: '', title_ar: '', details_en: '', details_ar: '', image: '' },
        detail2: { title_en: '', title_ar: '', details_en: '', details_ar: '', image: '' },
        detail3: { title_en: '', title_ar: '', details_en: '', details_ar: '', image: '' },
        detail4: { title_en: '', title_ar: '', details_en: '', details_ar: '', image: '' },
      };
    }
    return service.details;
  };

  const fetchOrderSections = async () => {
    try {
      console.log('🔄 Services details are now part of services object, no need to fetch separately');
      // Details are now part of the services object structure
      // No need to fetch separately - they come with the service
    } catch (error: any) {
      console.error('❌ Error:', error);
    }
  };

  const handleSectionChange = async (itemId: string, detailId: string, field: string, value: string) => {
    if (!itemId || !detailId) return;
    
    // Update local state immediately for better UX
    setContent({
      services: {
        ...servicesData,
        [itemId]: {
          ...servicesData[itemId],
          details: {
            ...servicesData[itemId]?.details,
            [detailId]: {
              ...servicesData[itemId]?.details?.[detailId],
              [field]: value,
            },
          },
        },
      },
    });
    
    // Save to backend
    try {
      const updatePayload: any = {};
      updatePayload[field] = value;
      
      await http.put(`/content/services/${itemId}/details/${detailId}`, updatePayload);
      console.log(`✅ Updated ${field} for ${itemId}/${detailId}`);
    } catch (error: any) {
      console.error(`❌ Error updating ${field}:`, error);
      // Don't show error toast for every keystroke - only log it
    }
  };

  const handleSectionImageUpload = async (itemId: string, detailId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      console.log(`🔄 Uploading image for ${itemId}/${detailId}...`);
      const response = await http.post(`/content/services/${itemId}/details/${detailId}/image`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      const imageUrl = response.data?.data?.image || response.data?.image || '';
      if (imageUrl) {
        // Update local state
        setContent({
          services: {
            ...servicesData,
            [itemId]: {
              ...servicesData[itemId],
              details: {
                ...servicesData[itemId]?.details,
                [detailId]: {
                  ...servicesData[itemId]?.details?.[detailId],
                  image: imageUrl,
                },
              },
            },
          },
        });
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

  // Save details for a single service by itemId
  const saveServiceDetails = async (itemId: string) => {
    if (!itemId) {
      toast.error(language === 'en' ? 'Service ID is required' : 'معرف الخدمة مطلوب');
      return;
    }
    
    try {
      const service = servicesData[itemId];
      if (!service || !service.details) {
        toast.error(language === 'en' ? 'Service not found' : 'الخدمة غير موجودة');
          return;
      }
      
      const details = service.details;
      const detailIds = ['detail1', 'detail2', 'detail3', 'detail4'];
      
      // Save each detail individually
      const savePromises = detailIds.map(async (detailId) => {
        const detail = details[detailId];
        if (!detail) return { success: true, detailId, skipped: true };
        
        // Skip empty details
        if (!detail.title_en && !detail.title_ar && !detail.details_en && !detail.details_ar && !detail.image) {
          return { success: true, detailId, skipped: true };
        }
        
        try {
          const updatePayload = {
            title_en: detail.title_en || '',
            title_ar: detail.title_ar || '',
            details_en: detail.details_en || '',
            details_ar: detail.details_ar || '',
            image: detail.image || '',
          };
          
          await http.put(`/content/services/${itemId}/details/${detailId}`, updatePayload);
          console.log(`✅ Updated ${itemId}/${detailId}`);
          return { success: true, detailId };
        } catch (error: any) {
          console.error(`❌ Error updating ${itemId}/${detailId}:`, error);
          return { success: false, detailId, error };
        }
      });
      
      const results = await Promise.all(savePromises);
      const successCount = results.filter(r => r.success && !r.skipped).length;
      const failCount = results.filter(r => !r.success).length;
      
      if (failCount === 0) {
        toast.success(
          language === 'en' 
            ? `Service details saved successfully` 
            : `تم حفظ تفاصيل الخدمة بنجاح`
        );
        await fetchContent();
          } else {
        toast.error(
          language === 'en' 
            ? `Failed to save some details (${failCount} failed)` 
            : `فشل حفظ بعض التفاصيل (${failCount} فشل)`
        );
      }
    } catch (error: any) {
      console.error(`❌ Error saving service ${itemId} details:`, error);
      toast.error(
        language === 'en' 
          ? 'Failed to save service details' 
          : 'فشل حفظ تفاصيل الخدمة'
      );
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
              
              const serviceDetails = getServiceDetails(serviceId);
              
              try {
                // Always use serviceId as categoryKey to ensure proper linking
                const categoryKey = serviceId;
                console.log(`🔑 Using serviceId ${serviceId} as categoryKey for service ${index + 1}`);
                
                // Prepare all sections for this service
                const sections = serviceDetails
                  .map((section: any, sectionIndex: number) => {
                    const titleEn = (section.title_en || '').trim();
                    if (!titleEn) {
                      return null; // Skip empty sections
                    }
                    
                    return {
                      categoryKey: serviceId, // Always use serviceId to ensure correct linking
                      sectionKey: section.sectionKey || `section${sectionIndex + 1}`,
                      title_en: titleEn,
                      title_ar: (section.title_ar || '').trim(),
                      image: (section.image || '').trim(),
                      details_en: (section.details_en || '').trim(),
                      details_ar: (section.details_ar || '').trim(),
                      _id: section._id, // Keep _id if exists for updates
                    };
                  })
                  .filter((s: any) => s !== null); // Remove empty sections
                
                if (sections.length === 0) {
                  console.log(`⏭️ Service ${index + 1} has no valid sections to save`);
                  return { success: true, serviceIndex: index, skipped: true };
                }
                
                console.log(`💾 Saving service ${index + 1} (ID: ${serviceId}) with ${sections.length} section(s)`);
                console.log(`🔑 Using categoryKey: ${categoryKey}`);
                
                // Save each section individually using the correct endpoint structure
                // PUT /content/services/items/{serviceId}/details/{detailId} for updates
                // POST /content/services/items/{serviceId}/details for new sections
                const sectionPromises = sections.map(async (section: any, sectionIndex: number) => {
                  const sectionPayload = {
                    categoryKey: serviceId, // Always use serviceId to ensure correct linking
                    sectionKey: section.sectionKey,
                    title_en: section.title_en,
                    title_ar: section.title_ar,
                    image: section.image,
                    details_en: section.details_en,
                    details_ar: section.details_ar,
                  };
                  
                  const endpoint = section._id 
                    ? `/content/services/items/${serviceId}/details/${section._id}`
                    : `/content/services/items/${serviceId}/details`;
                  
                  try {
                    let response;
                      if (section._id) {
                        // UPDATE existing section
                      console.log(`🔄 Updating section ${sectionIndex + 1} via PUT ${endpoint}`);
                      response = await http.put(endpoint, sectionPayload);
                      console.log(`✅ Section ${sectionIndex + 1} updated successfully`);
                      } else {
                        // CREATE new section
                      console.log(`🆕 Creating section ${sectionIndex + 1} via POST ${endpoint}`);
                      response = await http.post(endpoint, sectionPayload);
                      console.log(`✅ Section ${sectionIndex + 1} created successfully`);
                    }
                    
                    return { success: true, sectionIndex, data: response.data };
                    } catch (err: any) {
                    // Check if error is 400 with "doesn't belong to service" message
                    const errorMessage = err.response?.data?.message || '';
                    const isBelongingError = errorMessage.includes('لا تنتمي') || errorMessage.includes('does not belong');
                    
                    if (err.response?.status === 400 && isBelongingError && section._id) {
                      // Detail doesn't belong to this service - create a new one instead
                      console.warn(`⚠️ Section ${sectionIndex + 1} detail (${section._id}) doesn't belong to service ${serviceId}. Creating new detail instead.`);
                      
                      try {
                        const createEndpoint = `/content/services/items/${serviceId}/details`;
                        console.log(`🆕 Creating new section ${sectionIndex + 1} via POST ${createEndpoint}`);
                        const response = await http.post(createEndpoint, sectionPayload);
                        console.log(`✅ Section ${sectionIndex + 1} created successfully (replaced old detail)`);
                        return { success: true, sectionIndex, data: response.data, replaced: true };
                      } catch (createErr: any) {
                        console.error(`❌ Error creating new section ${sectionIndex + 1}:`, createErr);
                        return { success: false, sectionIndex, error: createErr };
                      }
                    }
                    
                    console.error(`❌ Error saving section ${sectionIndex + 1}:`, {
                      status: err.response?.status,
                      message: errorMessage,
                      endpoint: endpoint,
                    });
                    return { success: false, sectionIndex, error: err };
                  }
                });
                
                const sectionResults = await Promise.all(sectionPromises);
                const successCount = sectionResults.filter(r => r.success).length;
                const failCount = sectionResults.filter(r => !r.success).length;
                
                if (successCount > 0) {
                  console.log(`✅ Service ${index + 1}: ${successCount} section(s) saved successfully`);
                if (failCount > 0) {
                    console.warn(`⚠️ Service ${index + 1}: ${failCount} section(s) failed`);
                }
                return { 
                    success: true, 
                  serviceIndex: index, 
                  sectionResults 
                };
                } else {
                  console.error(`❌ Service ${index + 1}: All sections failed to save`);
                  return { 
                    success: false, 
                    serviceIndex: index,
                    sectionResults,
                    error: sectionResults[0]?.error
                  };
                }
              } catch (err: any) {
                if (err.response?.status === 404) {
                  console.log(`⚠️ Service ${index + 1} details endpoint not found (404)`);
                  return { success: false, serviceIndex: index, error: err, skipped: true };
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
            const failCount = results.filter(r => !r.success && !r.skipped).length;
            const skippedCount = results.filter(r => r.skipped).length;
            
            // Check if all failures are due to 404 (endpoint not implemented)
            const all404 = results.every(r => {
              if (r.success) return true;
              return r.skipped || r.error?.response?.status === 404;
            });
            
            if (successCount > 0) {
              console.log(`✅ Saved ${successCount} service(s) details successfully`);
          toast.success(
            language === 'en' 
                  ? `Services details saved successfully (${successCount} service${successCount > 1 ? 's' : ''})` 
                  : `تم حفظ تفاصيل الخدمات بنجاح (${successCount} خدمة)`
              );
              
              // If some failed or skipped, show warning
              if (failCount > 0 || skippedCount > 0) {
                const totalFailed = failCount + skippedCount;
                console.warn(`⚠️ ${totalFailed} service(s) failed to save. Data saved locally in localStorage.`);
                toast.warning(
                  language === 'en' 
                    ? `${totalFailed} service(s) could not be saved. Data saved locally.` 
                    : `لم يتم حفظ ${totalFailed} خدمة. تم حفظ البيانات محلياً.`
                );
              }
              return;
            } else if (all404) {
              // All requests failed with 404 - endpoint not implemented
              console.warn('⚠️ Services details endpoint not implemented on backend. Data saved locally only.');
              toast.warning(
                language === 'en' 
                  ? 'Services details endpoint not available. Data saved locally only.' 
                  : 'نقطة نهاية تفاصيل الخدمات غير متاحة. تم حفظ البيانات محلياً فقط.'
              );
              return;
            }
          }
          
          // If individual save failed or no services, check if it's a 404
          const has404 = results.some(r => {
            if (r.success) return false;
            return r.skipped || r.error?.response?.status === 404;
          });
          
          if (has404) {
            console.warn('⚠️ Services details endpoint not implemented on backend. Data saved locally only.');
            toast.warning(
              language === 'en' 
                ? 'Services details endpoint not available. Data saved locally only.' 
                : 'نقطة نهاية تفاصيل الخدمات غير متاحة. تم حفظ البيانات محلياً فقط.'
            );
            return;
          }
          
          console.error('❌ Individual service details save failed');
          throw new Error('Failed to save services details. Please try again.');
        } else {
          throw servicesDetailsErr;
        }
      }
    } catch (error: any) {
      console.error('❌ Error saving services details:', error);
      
      // Check if it's a 404 error (endpoint not implemented)
      if (error.response?.status === 404) {
        const errorMessage = language === 'en' 
          ? 'Services details endpoint not available. Data saved locally only.' 
          : 'نقطة نهاية تفاصيل الخدمات غير متاحة. تم حفظ البيانات محلياً فقط.';
        toast.warning(errorMessage);
      } else {
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          (language === 'en' 
                            ? 'Failed to save services details. Data saved locally.' 
                            : 'فشل حفظ تفاصيل الخدمات. تم حفظ البيانات محلياً.');
      toast.error(errorMessage);
      }
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
              <TabsTrigger value="services-details">{language === 'en' ? 'Services Details' : 'تفاصيل الخدمات'}</TabsTrigger>
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
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold">
                    {language === 'en' ? 'Services Section' : 'قسم الخدمات'}
                  </h3>
                    {/* Add Service Button - Commented out temporarily */}
                    {/* <Button
                      onClick={async () => {
                        try {
                          await addService({
                            title_en: 'New Service',
                            title_ar: 'خدمة جديدة',
                            description_en: 'Service description',
                            description_ar: 'وصف الخدمة',
                            icon: '',
                          });
                          
                          // Wait a moment for the service to be added and get its ID
                          await new Promise(resolve => setTimeout(resolve, 500));
                          
                          // Fetch content again to get the new service with its ID
                          await fetchContent();
                          
                          // The useEffect will automatically add 4 empty sections for the new service
                          toast.success(
                            language === 'en' 
                              ? 'Service added successfully. 4 empty detail sections have been created.' 
                              : 'تم إضافة الخدمة بنجاح. تم إنشاء 4 أقسام تفاصيل فارغة.'
                          );
                        } catch (error) {
                          console.error('Error adding service:', error);
                        }
                      }}
                      disabled={loading}
                      className="bg-gold hover:bg-gold-dark text-black font-semibold"
                    >
                      <HexagonIcon size="sm" className="mr-2">
                        <Plus className="h-4 w-4" />
                      </HexagonIcon>
                      {language === 'en' ? 'Add Service' : 'إضافة خدمة'}
                    </Button> */}
                  </div>
                </div>

                {safeServices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>{language === 'en' ? 'No services found.' : 'لا توجد خدمات.'}</p>
                  </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {safeServices.map((s) => {
                    const itemId = s.itemId || `item${s.index + 1}`;
                    return (
                      <Card key={itemId} className="border-2 hover:shadow-lg transition-shadow">
                        <CardHeader>
                          <CardTitle className="text-lg mb-2">
                            {language === 'en' ? s.title_en || `Service ${s.index + 1}` : s.title_ar || `الخدمة ${s.index + 1}`}
                                </CardTitle>
                          {s.description_en || s.description_ar ? (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {language === 'en' ? s.description_en : s.description_ar}
                            </p>
                          ) : null}
                        </CardHeader>
                        <CardContent>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                                    size="sm"
                              className="flex-1"
                              onClick={() => {
                                setSelectedService({ ...s, itemId });
                                setIsEditMode(false);
                                setServiceModalOpen(true);
                              }}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              {language === 'en' ? 'View' : 'عرض'}
                            </Button>
                            <Button
                              variant="default"
                              size="sm"
                              className="flex-1"
                              onClick={() => {
                                setSelectedService({ ...s, itemId });
                                setIsEditMode(true);
                                setServiceModalOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              {language === 'en' ? 'Edit' : 'تعديل'}
                            </Button>
                              </div>
                            </CardContent>
                  </Card>
                    );
                  })}
                </div>
                )}

                <div className="mt-6">
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    {language === 'en' 
                      ? '💡 Click "Edit" on any service card to modify it. Changes are saved individually.'
                      : '💡 اضغط "تعديل" على أي كارد خدمة لتعديله. يتم حفظ التغييرات بشكل فردي.'
                    }
                  </p>
                </div>
              </Card>
            </TabsContent>

            {/* Services Details Section */}
            <TabsContent value="services-details">
              <Card className="p-6">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-4">
                    {language === 'en' ? 'Services Details Section' : 'قسم تفاصيل الخدمات'}
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    {language === 'en' 
                      ? 'Manage details for each service. Select a service below to edit its details sections.' 
                      : 'إدارة تفاصيل كل خدمة. اختر خدمة أدناه لتعديل أقسام تفاصيلها.'}
                  </p>
                </div>

                {safeServices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>{language === 'en' ? 'No services found. Please add services first in the Services tab.' : 'لا توجد خدمات. يرجى إضافة الخدمات أولاً في تبويب الخدمات.'}</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {safeServices.map((s) => {
                      const itemId = s.itemId || `item${(s.index || 0) + 1}`;
                      const serviceDetails = s.details || {};
                      const detailsArray = [
                        { ...serviceDetails.detail1, detailId: 'detail1' },
                        { ...serviceDetails.detail2, detailId: 'detail2' },
                        { ...serviceDetails.detail3, detailId: 'detail3' },
                        { ...serviceDetails.detail4, detailId: 'detail4' },
                      ];
                      
                      return (
                        <Collapsible key={itemId} defaultOpen={s.index === 0}>
                          <Card className="border-2">
                            <CollapsibleTrigger asChild>
                              <CardHeader className="cursor-pointer hover:bg-secondary/50 transition-colors">
                                <div className="flex items-center justify-between">
                                  <CardTitle>
                                    {language === 'en' 
                                      ? `Service ${(s.index || 0) + 1}: ${s.title_en || s.title_ar || 'Untitled'}` 
                                      : `الخدمة ${(s.index || 0) + 1}: ${s.title_ar || s.title_en || 'بدون عنوان'}`}
                                  </CardTitle>
                                  <ChevronDownIcon className="h-5 w-5 transition-transform duration-200 data-[state=open]:rotate-180" />
                                </div>
                              </CardHeader>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                              <CardContent className="pt-4 space-y-4">
                                {/* Service Details Sections */}
                                <div className="mt-4">
                                <h4 className="text-lg font-semibold mb-4">
                                  {language === 'en' ? 'Service Details Sections' : 'أقسام تفاصيل الخدمة'}
                                </h4>
                                <div className="space-y-4">
                                    {detailsArray.map((section, sectionIndex) => {
                                      const detailId = section.detailId || `detail${sectionIndex + 1}`;
                                      
                                    return (
                                      <Collapsible key={sectionIndex} defaultOpen={sectionIndex === 0}>
                                        <Card className="border">
                                          <CollapsibleTrigger asChild>
                                            <CardHeader className="cursor-pointer hover:bg-secondary/50 transition-colors py-3">
                                              <div className="flex items-center justify-between">
                                                <CardTitle className="text-base">
                                                  {language === 'en' 
                                                    ? `Section ${sectionIndex + 1}${section.title_en ? `: ${section.title_en}` : ''}`
                                                    : `القسم ${sectionIndex + 1}${section.title_ar ? `: ${section.title_ar}` : ''}`
                                                  }
                                                </CardTitle>
                                                <ChevronDownIcon className="h-4 w-4 transition-transform duration-200 data-[state=open]:rotate-180" />
                                              </div>
                                            </CardHeader>
                                          </CollapsibleTrigger>
                                          <CollapsibleContent>
                                            <CardContent className="pt-4 space-y-4">
                                              {/* Title Row - English and Arabic */}
                                              <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                  <label className="text-sm font-medium mb-1 block">
                                                    {language === 'en' ? 'Section Title (English)' : 'عنوان القسم (إنجليزي)'}
                                                  </label>
                                                  <Input
                                                    value={section.title_en || ''}
                                                      onChange={(e) => handleSectionChange(itemId, detailId, 'title_en', e.target.value)}
                                                    placeholder={language === 'en' ? 'Enter section title in English...' : 'أدخل عنوان القسم بالإنجليزية...'}
                                                  />
                                                </div>
                                                <div>
                                                  <label className="text-sm font-medium mb-1 block">
                                                    {language === 'en' ? 'Section Title (Arabic)' : 'عنوان القسم (عربي)'}
                                                  </label>
                                                  <Input
                                                    value={section.title_ar || ''}
                                                      onChange={(e) => handleSectionChange(itemId, detailId, 'title_ar', e.target.value)}
                                                    placeholder={language === 'en' ? 'Enter section title in Arabic...' : 'أدخل عنوان القسم بالعربية...'}
                                                    dir="rtl"
                                                  />
                                                </div>
                                              </div>

                                              {/* Image */}
                                              <div>
                                                <label className="text-sm font-medium mb-1 block">
                                                  {language === 'en' ? 'Section Image' : 'صورة القسم'}
                                                </label>
                                                <div className="space-y-2">
                                                  <input
                                                    type="file"
                                                    accept="image/*"
                                                      onChange={(e) => handleSectionImageUpload(itemId, detailId, e)}
                                                    className="hidden"
                                                      id={`service-details-${itemId}-${detailId}-image`}
                                                  />
                                                  <label
                                                      htmlFor={`service-details-${itemId}-${detailId}-image`}
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
                                                          alt={`Service ${(s.index || 0) + 1} - Section ${sectionIndex + 1}`}
                                                        className="w-full h-48 object-cover rounded-lg border border-border"
                                                      />
                                                    </div>
                                                  )}
                                                </div>
                                              </div>

                                              {/* Details Row - English and Arabic */}
                                              <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                  <label className="text-sm font-medium mb-1 block">
                                                    {language === 'en' ? 'Details (English)' : 'التفاصيل (إنجليزي)'}
                                                  </label>
                                                  <Textarea
                                                    value={section.details_en || ''}
                                                      onChange={(e) => handleSectionChange(itemId, detailId, 'details_en', e.target.value)}
                                                    placeholder={language === 'en' ? 'Enter details in English...' : 'أدخل التفاصيل بالإنجليزية...'}
                                                    rows={6}
                                                  />
                                                </div>
                                                <div>
                                                  <label className="text-sm font-medium mb-1 block">
                                                    {language === 'en' ? 'Details (Arabic)' : 'التفاصيل (عربي)'}
                                                  </label>
                                                  <Textarea
                                                    value={section.details_ar || ''}
                                                      onChange={(e) => handleSectionChange(itemId, detailId, 'details_ar', e.target.value)}
                                                    placeholder={language === 'en' ? 'Enter details in Arabic...' : 'أدخل التفاصيل بالعربية...'}
                                                    rows={6}
                                                    dir="rtl"
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
                                </div>

                                  {/* Save Button for this specific service */}
                                  <div className="mt-6 pt-4 border-t border-border">
                  <Button
                    onClick={async () => {
                                      console.log(`💾 Saving details for service ${itemId}...`);
                                      await saveServiceDetails(itemId);
                    }}
                    disabled={loading}
                                        className="w-full bg-gold hover:bg-gold-dark text-black font-semibold"
                  >
                                        {loading ? (language === 'en' ? 'Saving...' : 'جاري الحفظ...') : (language === 'en' ? `Save Service Details` : `حفظ تفاصيل الخدمة`)}
                </Button>
                                </div>
                              </CardContent>
                            </CollapsibleContent>
                          </Card>
                        </Collapsible>
                      );
                    })}
                  </div>
                )}
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

          </Tabs>
        </main>
      </div>

      {/* Delete Service Confirmation Dialog - Commented out temporarily */}
      {/* Service Details Modal */}
      <Dialog open={serviceModalOpen} onOpenChange={setServiceModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isEditMode 
                ? (language === 'en' ? 'Edit Service' : 'تعديل الخدمة')
                : (language === 'en' ? 'View Service' : 'عرض الخدمة')
              }
            </DialogTitle>
            <DialogDescription>
              {selectedService 
                ? (language === 'en' 
                  ? `Service ${(selectedService.index || 0) + 1} details`
                  : `تفاصيل الخدمة ${(selectedService.index || 0) + 1}`
                )
                : ''
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedService && (
            <div className="space-y-6 py-4">
              {/* Title Row - English and Arabic */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Title (English)</label>
                  {isEditMode ? (
                    <Input
                      placeholder="Service Title (English)"
                      value={selectedService.title_en || ''}
                      onChange={(e) => setSelectedService({ ...selectedService, title_en: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded-md">{selectedService.title_en || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Title (Arabic)</label>
                  {isEditMode ? (
                    <Input
                      placeholder="عنوان الخدمة (عربي)"
                      dir="rtl"
                      value={selectedService.title_ar || ''}
                      onChange={(e) => setSelectedService({ ...selectedService, title_ar: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded-md" dir="rtl">{selectedService.title_ar || '-'}</p>
                  )}
                </div>
              </div>

              {/* Description Row - English and Arabic */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Description (English)</label>
                  {isEditMode ? (
                    <Textarea
                      placeholder="Service description in English"
                      value={selectedService.description_en || ''}
                      onChange={(e) => setSelectedService({ ...selectedService, description_en: e.target.value })}
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded-md whitespace-pre-wrap">{selectedService.description_en || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Description (Arabic)</label>
                  {isEditMode ? (
                    <Textarea
                      placeholder="وصف الخدمة بالعربية"
                      dir="rtl"
                      value={selectedService.description_ar || ''}
                      onChange={(e) => setSelectedService({ ...selectedService, description_ar: e.target.value })}
                      rows={4}
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded-md whitespace-pre-wrap" dir="rtl">{selectedService.description_ar || '-'}</p>
                  )}
                </div>
              </div>

              {/* Icon Field */}
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {language === 'en' ? 'Icon (URL or icon name)' : 'الأيقونة (رابط أو اسم الأيقونة)'}
                </label>
                {isEditMode ? (
                  <Input
                    placeholder={language === 'en' ? 'Enter icon URL or icon name...' : 'أدخل رابط الأيقونة أو اسم الأيقونة...'}
                    value={selectedService.icon || ''}
                    onChange={(e) => setSelectedService({ ...selectedService, icon: e.target.value })}
                  />
                ) : (
                  <p className="text-sm p-2 bg-muted rounded-md">{selectedService.icon || '-'}</p>
                )}
              </div>

              {/* Service Details Sections */}
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="text-lg font-semibold mb-4">
                  {language === 'en' ? 'Service Details Sections' : 'أقسام تفاصيل الخدمة'}
                </h4>
                {(() => {
                  const itemId = selectedService.itemId || `item${(selectedService.index || 0) + 1}`;
                  // Get details from servicesData if not in selectedService
                  const serviceFromData = servicesData[itemId];
                  const serviceDetails = selectedService.details || serviceFromData?.details || {};
                  const detailsArray = [
                    { ...serviceDetails.detail1, detailId: 'detail1' },
                    { ...serviceDetails.detail2, detailId: 'detail2' },
                    { ...serviceDetails.detail3, detailId: 'detail3' },
                    { ...serviceDetails.detail4, detailId: 'detail4' },
                  ].filter(d => d.title_en || d.title_ar || d.details_en || d.details_ar || d.image);
                  
                  if (detailsArray.length === 0) {
                    return (
                      <p className="text-sm text-muted-foreground text-center py-4">
                        {language === 'en' 
                          ? 'No details sections found. Add details in the "Services Details" tab.'
                          : 'لا توجد أقسام تفاصيل. أضف التفاصيل في تبويب "تفاصيل الخدمات".'
                        }
                      </p>
                    );
                  }
                  
                  return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {detailsArray.map((section: any, sectionIndex: number) => (
                        <Card key={section.detailId || sectionIndex} className="border-2 hover:shadow-lg transition-shadow overflow-hidden">
                          {/* Image at top - like product card */}
                          {section.image ? (
                            <div className="relative w-full h-48 overflow-hidden bg-muted">
                              <img 
                                src={section.image} 
                                alt={section.title_en || section.title_ar || 'Detail image'} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div className="w-full h-48 bg-muted flex items-center justify-center">
                              <span className="text-muted-foreground text-sm">
                                {language === 'en' ? 'No Image' : 'لا توجد صورة'}
                              </span>
                            </div>
                          )}
                          <CardHeader>
                            <CardTitle className="text-base">
                              {section.title_en || section.title_ar || 
                                (language === 'en' ? `Section ${sectionIndex + 1}` : `القسم ${sectionIndex + 1}`)
                              }
                            </CardTitle>
                            {(section.title_en || section.title_ar) && (
                              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {language === 'en' ? (section.title_en || section.title_ar) : (section.title_ar || section.title_en)}
                              </p>
                            )}
                            {(section.details_en || section.details_ar) && (
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-2">
                                {language === 'en' 
                                  ? (section.details_en || section.details_ar || '')
                                  : (section.details_ar || section.details_en || '')
                                }
                              </p>
                            )}
                          </CardHeader>
                          <CardContent>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1"
                                onClick={() => {
                                  const itemId = selectedService.itemId || `item${(selectedService.index || 0) + 1}`;
                                  setSelectedDetail({ ...section, itemId, detailId: section.detailId });
                                  setIsDetailEditMode(false);
                                  setDetailModalOpen(true);
                                }}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                {language === 'en' ? 'View' : 'عرض'}
                              </Button>
                              <Button
                                variant="default"
                                size="sm"
                                className="flex-1"
                                onClick={() => {
                                  const itemId = selectedService.itemId || `item${(selectedService.index || 0) + 1}`;
                                  setSelectedDetail({ ...section, itemId, detailId: section.detailId });
                                  setIsDetailEditMode(true);
                                  setDetailModalOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                {language === 'en' ? 'Edit' : 'تعديل'}
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          <DialogFooter>
            {isEditMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setServiceModalOpen(false);
                    setSelectedService(null);
                  }}
                >
                  {language === 'en' ? 'Cancel' : 'إلغاء'}
                </Button>
                <Button
                  onClick={async () => {
                    if (!selectedService) return;
                    
                    const itemId = selectedService.itemId || `item${(selectedService.index || 0) + 1}`;
                    if (!itemId) {
                      toast.error(
                        language === 'en' 
                          ? 'Service ID is required' 
                          : 'معرف الخدمة مطلوب'
                      );
                      return;
                    }
                    
                    // Prepare update payload
                    const updatePayload = {
                      title_en: selectedService.title_en || '',
                      title_ar: selectedService.title_ar || '',
                      description_en: selectedService.description_en || '',
                      description_ar: selectedService.description_ar || '',
                      icon: selectedService.icon || '',
                    };
                    
                    try {
                      // Update service by itemId using the new endpoint
                      console.log(`🔄 Updating service ${itemId} via PUT /content/services/${itemId}`);
                      const response = await http.put(`/content/services/${itemId}`, updatePayload);
                      console.log(`✅ Service updated successfully:`, response.data);
                      
                      // Update local state
                      setContent({
                        services: {
                          ...servicesData,
                          [itemId]: { ...selectedService },
                        },
                      });
                      
                      toast.success(
                        language === 'en' 
                          ? 'Service updated successfully' 
                          : 'تم تحديث الخدمة بنجاح'
                      );
                      setServiceModalOpen(false);
                      setSelectedService(null);
                      // Refresh content to get latest data
                      await fetchContent();
                    } catch (error: any) {
                      console.error('❌ Error updating service:', error);
                      const errorMessage = error.response?.data?.message || 
                        (language === 'en' 
                          ? 'Failed to update service' 
                          : 'فشل تحديث الخدمة'
                        );
                      toast.error(errorMessage);
                    }
                  }}
                >
                  {language === 'en' ? 'Save Changes' : 'حفظ التغييرات'}
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  setIsEditMode(true);
                }}
              >
                {language === 'en' ? 'Edit' : 'تعديل'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Service Detail Modal */}
      <Dialog open={detailModalOpen} onOpenChange={setDetailModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isDetailEditMode 
                ? (language === 'en' ? 'Edit Service Detail' : 'تعديل تفصيل الخدمة')
                : (language === 'en' ? 'View Service Detail' : 'عرض تفصيل الخدمة')
              }
            </DialogTitle>
            <DialogDescription>
              {selectedDetail 
                ? (language === 'en' 
                  ? `Detail ${selectedDetail.detailId || ''}`
                  : `التفصيل ${selectedDetail.detailId || ''}`
                )
                : ''
              }
            </DialogDescription>
          </DialogHeader>
          
          {selectedDetail && (
            <div className="space-y-6 py-4">
              {/* Title Row - English and Arabic */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Title (English)</label>
                  {isDetailEditMode ? (
                    <Input
                      placeholder="Detail Title (English)"
                      value={selectedDetail.title_en || ''}
                      onChange={(e) => setSelectedDetail({ ...selectedDetail, title_en: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded-md">{selectedDetail.title_en || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Title (Arabic)</label>
                  {isDetailEditMode ? (
                    <Input
                      placeholder="عنوان التفصيل (عربي)"
                      dir="rtl"
                      value={selectedDetail.title_ar || ''}
                      onChange={(e) => setSelectedDetail({ ...selectedDetail, title_ar: e.target.value })}
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded-md" dir="rtl">{selectedDetail.title_ar || '-'}</p>
                  )}
                </div>
              </div>

              {/* Image */}
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {language === 'en' ? 'Image' : 'الصورة'}
                </label>
                {isDetailEditMode ? (
                  <div className="space-y-2">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;

                        // Validate file size (max 5MB)
                        if (file.size > 5 * 1024 * 1024) {
                          toast.error(
                            language === 'en' 
                              ? 'Image size must be less than 5MB' 
                              : 'يجب أن يكون حجم الصورة أقل من 5MB'
                          );
                          e.target.value = '';
                          return;
                        }

                        // Validate file type
                        if (!file.type.startsWith('image/')) {
                          toast.error(
                            language === 'en' 
                              ? 'Please select an image file' 
                              : 'يرجى اختيار ملف صورة'
                          );
                          e.target.value = '';
                          return;
                        }

                        const formData = new FormData();
                        formData.append('image', file);

                        try {
                          // Show loading toast
                          const loadingToast = toast.loading(
                            language === 'en' ? 'Uploading image...' : 'جاري رفع الصورة...'
                          );

                          const response = await http.post(
                            `/content/services/${selectedDetail.itemId}/details/${selectedDetail.detailId}/image`,
                            formData,
                            { 
                              headers: { 'Content-Type': 'multipart/form-data' },
                              onUploadProgress: (progressEvent) => {
                                if (progressEvent.total) {
                                  const percentCompleted = Math.round(
                                    (progressEvent.loaded * 100) / progressEvent.total
                                  );
                                  console.log(`Upload progress: ${percentCompleted}%`);
                                }
                              }
                            }
                          );
                          
                          // Dismiss loading toast
                          toast.dismiss(loadingToast);
                          
                          const imageUrl = response.data?.data?.image || response.data?.image || response.data?.data?.detail?.image || '';
                          if (imageUrl) {
                            setSelectedDetail({ ...selectedDetail, image: imageUrl });
                            
                            // Update local state immediately
                            setContent({
                              services: {
                                ...servicesData,
                                [selectedDetail.itemId]: {
                                  ...servicesData[selectedDetail.itemId],
                                  details: {
                                    ...servicesData[selectedDetail.itemId]?.details,
                                    [selectedDetail.detailId]: {
                                      ...selectedDetail,
                                      image: imageUrl,
                                    },
                                  },
                                },
                              },
                            });
                            
                            toast.success(language === 'en' ? 'Image uploaded successfully' : 'تم رفع الصورة بنجاح');
                          } else {
                            throw new Error('No image URL returned from server');
                          }
                        } catch (error: any) {
                          console.error('Error uploading image:', error);
                          const errorMessage = error.response?.data?.message || error.message || 
                            (language === 'en' ? 'Failed to upload image' : 'فشل رفع الصورة');
                          toast.error(errorMessage);
                        } finally {
                          // Reset file input
                          e.target.value = '';
                        }
                      }}
                      className="hidden"
                      id="detail-image-upload"
                      disabled={loading}
                    />
                    <label
                      htmlFor="detail-image-upload"
                      className={`flex items-center justify-center w-full px-4 py-2 bg-background border border-border rounded-lg transition-colors ${
                        loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted'
                      }`}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        {loading 
                          ? (language === 'en' ? 'Uploading...' : 'جاري الرفع...')
                          : selectedDetail.image
                          ? (language === 'en' ? 'Change image...' : 'تغيير الصورة...')
                          : (language === 'en' ? 'Choose image...' : 'اختر صورة...')}
                      </span>
                    </label>
                    {selectedDetail.image && (
                      <div className="mt-2 relative">
                        <img
                          src={selectedDetail.image}
                          alt={selectedDetail.title_en || selectedDetail.title_ar || 'Detail image'}
                          className="w-full h-48 object-cover rounded-md border border-border"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            toast.error(language === 'en' ? 'Failed to load image' : 'فشل تحميل الصورة');
                          }}
                        />
                        {isDetailEditMode && (
                          <Button
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2"
                            onClick={async () => {
                              try {
                                setSelectedDetail({ ...selectedDetail, image: '' });
                                // Update in backend by sending empty string
                                await http.put(
                                  `/content/services/${selectedDetail.itemId}/details/${selectedDetail.detailId}`,
                                  { ...selectedDetail, image: '' }
                                );
                                toast.success(language === 'en' ? 'Image removed' : 'تم حذف الصورة');
                              } catch (error) {
                                console.error('Error removing image:', error);
                                toast.error(language === 'en' ? 'Failed to remove image' : 'فشل حذف الصورة');
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {language === 'en' 
                        ? 'JPG, PNG or GIF. Max size 5MB. Image will be uploaded to Cloudinary.'
                        : 'JPG أو PNG أو GIF. الحد الأقصى للحجم 5MB. سيتم رفع الصورة إلى Cloudinary.'}
                    </p>
                  </div>
                ) : (
                  selectedDetail.image ? (
                    <div className="mt-2">
                      <img
                        src={selectedDetail.image}
                        alt={selectedDetail.title_en || selectedDetail.title_ar || 'Detail image'}
                        className="w-full h-64 object-cover rounded-md border border-border"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded-md">{language === 'en' ? 'No image' : 'لا توجد صورة'}</p>
                  )
                )}
              </div>

              {/* Details Row - English and Arabic */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Details (English)</label>
                  {isDetailEditMode ? (
                    <Textarea
                      placeholder="Details in English"
                      value={selectedDetail.details_en || ''}
                      onChange={(e) => setSelectedDetail({ ...selectedDetail, details_en: e.target.value })}
                      rows={6}
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded-md whitespace-pre-wrap">{selectedDetail.details_en || '-'}</p>
                  )}
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Details (Arabic)</label>
                  {isDetailEditMode ? (
                    <Textarea
                      placeholder="التفاصيل بالعربية"
                      dir="rtl"
                      value={selectedDetail.details_ar || ''}
                      onChange={(e) => setSelectedDetail({ ...selectedDetail, details_ar: e.target.value })}
                      rows={6}
                    />
                  ) : (
                    <p className="text-sm p-2 bg-muted rounded-md whitespace-pre-wrap" dir="rtl">{selectedDetail.details_ar || '-'}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            {isDetailEditMode ? (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    setDetailModalOpen(false);
                    setSelectedDetail(null);
                  }}
                >
                  {language === 'en' ? 'Cancel' : 'إلغاء'}
                </Button>
                <Button
                  onClick={async () => {
                    if (!selectedDetail) return;
                    
                    const { itemId, detailId } = selectedDetail;
                    if (!itemId || !detailId) {
                      toast.error(language === 'en' ? 'Detail ID is required' : 'معرف التفصيل مطلوب');
                      return;
                    }
                    
                    // Validate that at least one field has content
                    if (!selectedDetail.title_en && !selectedDetail.title_ar && 
                        !selectedDetail.details_en && !selectedDetail.details_ar && 
                        !selectedDetail.image) {
                      toast.warning(
                        language === 'en' 
                          ? 'Please fill at least one field' 
                          : 'يرجى ملء حقل واحد على الأقل'
                      );
                      return;
                    }
                    
                    const updatePayload = {
                      title_en: selectedDetail.title_en || '',
                      title_ar: selectedDetail.title_ar || '',
                      details_en: selectedDetail.details_en || '',
                      details_ar: selectedDetail.details_ar || '',
                      image: selectedDetail.image || '',
                    };
                    
                    try {
                      console.log(`🔄 Updating detail ${itemId}/${detailId}...`);
                      const response = await http.put(
                        `/content/services/${itemId}/details/${detailId}`, 
                        updatePayload
                      );
                      console.log(`✅ Detail updated successfully:`, response.data);
                      
                      // Update local state
                      setContent({
                        services: {
                          ...servicesData,
                          [itemId]: {
                            ...servicesData[itemId],
                            details: {
                              ...servicesData[itemId]?.details,
                              [detailId]: { ...selectedDetail },
                            },
                          },
                        },
                      });
                      
                      toast.success(
                        language === 'en' 
                          ? 'Detail updated successfully' 
                          : 'تم تحديث التفصيل بنجاح'
                      );
                      
                      // Refresh content to get latest data
                      await fetchContent();
                      
                      setDetailModalOpen(false);
                      setSelectedDetail(null);
                      setIsDetailEditMode(false);
                    } catch (error: any) {
                      console.error('❌ Error updating detail:', error);
                      const errorMessage = error.response?.data?.message || 
                        (language === 'en' ? 'Failed to update detail' : 'فشل تحديث التفصيل');
                      toast.error(errorMessage);
                    }
                  }}
                  disabled={loading}
                >
                  {loading 
                    ? (language === 'en' ? 'Saving...' : 'جاري الحفظ...')
                    : (language === 'en' ? 'Save Changes' : 'حفظ التغييرات')
                  }
                </Button>
              </>
            ) : (
              <Button
                onClick={() => {
                  setIsDetailEditMode(true);
                }}
              >
                {language === 'en' ? 'Edit' : 'تعديل'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="bg-background border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              {language === 'en' ? 'Delete Service' : 'حذف الخدمة'}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              {language === 'en' 
                ? `Are you sure you want to delete Service ${serviceToDelete ? serviceToDelete.index + 1 : ''}? This action cannot be undone.`
                : `هل أنت متأكد من حذف الخدمة ${serviceToDelete ? serviceToDelete.index + 1 : ''}؟ لا يمكن التراجع عن هذا الإجراء.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2">
            <AlertDialogCancel className="bg-secondary hover:bg-secondary/80">
              {language === 'en' ? 'Cancel' : 'إلغاء'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={async () => {
                if (serviceToDelete) {
                  await deleteService(serviceToDelete.id);
                  // Also remove from servicesDetails if exists (servicesDetails is now an object)
                  setServicesDetails(prev => {
                    const newDetails = { ...prev };
                    delete newDetails[serviceToDelete.id];
                    return newDetails;
                  });
                  setServiceToDelete(null);
                }
                setDeleteDialogOpen(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {language === 'en' ? 'Delete' : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog> */}
    </div>
  );
};

export default ContentManagement;
