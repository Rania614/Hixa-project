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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { http } from '@/services/http';
import { toast } from '@/components/ui/sonner';

const ContentManagement = () => {
  const [activeTab, setActiveTab] = useState('hero');
  const { language } = useApp();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<{ id: string; index: number } | null>(null);
  
  // Structure: servicesDetails mapped by serviceId (not index) to avoid mismatches when services are deleted/reordered
  // Format: { [serviceId]: [section1, section2, section3, section4] }
  const [servicesDetails, setServicesDetails] = useState<{ [serviceId: string]: any[] }>({});
  
  // Helper function to get service details by serviceId
  const getServiceDetails = (serviceId: string): any[] => {
    if (!serviceId) return [];
    return servicesDetails[serviceId] || [
      { title_en: '', title_ar: '', image: '', details_en: '', details_ar: '' },
      { title_en: '', title_ar: '', image: '', details_en: '', details_ar: '' },
      { title_en: '', title_ar: '', image: '', details_en: '', details_ar: '' },
      { title_en: '', title_ar: '', image: '', details_en: '', details_ar: '' },
    ];
  };
  
  // Helper function to set service details by serviceId
  const setServiceDetails = (serviceId: string, details: any[]) => {
    if (!serviceId) return;
    setServicesDetails(prev => ({
      ...prev,
      [serviceId]: details,
    }));
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

  // Helper لتجنب الأخطاء لو services أو projects أو partners أو jobs مش Array
  const servicesData = Array.isArray(services) ? { items: services } : (services || { items: [] });
  const safeServices = Array.isArray(servicesData.items) ? servicesData.items : [];
  
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
      fetchOrderSections();
    }
  }, [safeServices.length]);

  // Ensure servicesDetails has 4 sections for each service
  // This handles new services that don't have details yet
  useEffect(() => {
    if (safeServices.length > 0) {
      // servicesDetails is now an object { [serviceId]: details[] }
      const currentDetailsCount = Object.keys(servicesDetails).length;
      const servicesWithIds = safeServices.filter((s: any) => (s._id || s.id));
      const servicesLength = servicesWithIds.length;
      
      // If we have more services than details, add empty sections for new services
      if (servicesLength > currentDetailsCount) {
        console.log(`📝 Adding details sections for ${servicesLength - currentDetailsCount} new service(s)`);
        
        // Add empty sections for services that don't have details yet
        const newDetails: { [serviceId: string]: any[] } = {};
        servicesWithIds.forEach((service: any) => {
          const serviceId = service._id || service.id;
          if (serviceId && !servicesDetails[serviceId]) {
            newDetails[serviceId] = [
              { title_en: '', title_ar: '', image: '', details_en: '', details_ar: '' },
              { title_en: '', title_ar: '', image: '', details_en: '', details_ar: '' },
              { title_en: '', title_ar: '', image: '', details_en: '', details_ar: '' },
              { title_en: '', title_ar: '', image: '', details_en: '', details_ar: '' },
            ];
          }
        });
        
        if (Object.keys(newDetails).length > 0) {
          setServicesDetails(prev => ({ ...prev, ...newDetails }));
          console.log(`✅ Added ${Object.keys(newDetails).length} new service detail sections`);
        }
      }
    }
  }, [safeServices.length, servicesDetails]);

  const fetchOrderSections = async () => {
    // Get services at the start so it's accessible in both try and catch blocks
    let currentServices = Array.isArray(services) ? services : (services?.items || []);
    
    try {
      console.log('🔄 Fetching services details from API...');
      
      // First, fetch services to get their IDs (in case we need to fetch individual service details)
      await fetchContent();
      await new Promise(resolve => setTimeout(resolve, 100));
      // Update currentServices after fetchContent to get the latest services
      currentServices = Array.isArray(services) ? services : (services?.items || []);
      
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
            const servicesItems = response.data?.services?.items || currentServices || [];
            
            if (Array.isArray(servicesDetails) && servicesDetails.length > 0) {
              console.log('✅ Found services.details array:', servicesDetails);
              console.log('✅ Services items for mapping:', servicesItems.map((s: any) => ({
                id: s._id || s.id,
                title: s.title_en || s.title_ar,
              })));
              
              // Group details by serviceId - use serviceItemId first, then categoryKey
              const detailsByServiceId: { [serviceId: string]: any[] } = {};
              
              // Initialize empty arrays for all services
              servicesItems.forEach((service: any) => {
                const serviceId = service._id || service.id;
                if (serviceId) {
                  detailsByServiceId[serviceId] = [];
                }
              });
              
              // Map details to services using serviceItemId or categoryKey
              servicesDetails.forEach((detail: any) => {
                let targetServiceId: string | null = null;
                
                // Priority 1: Use serviceItemId if available (most reliable)
                if (detail.serviceItemId) {
                  const matchingService = servicesItems.find((s: any) => 
                    String(s._id || s.id) === String(detail.serviceItemId)
                  );
                  if (matchingService) {
                    targetServiceId = String(matchingService._id || matchingService.id);
                  }
                }
                
                // Priority 2: Use categoryKey if it matches a serviceId
                if (!targetServiceId && detail.categoryKey && detail.categoryKey !== 'general') {
                  const matchingService = servicesItems.find((s: any) => 
                    String(s._id || s.id) === String(detail.categoryKey)
                  );
                  if (matchingService) {
                    targetServiceId = String(matchingService._id || matchingService.id);
                  }
                }
                
                // Only add detail if we found a matching service
                if (targetServiceId && detailsByServiceId[targetServiceId]) {
                  detailsByServiceId[targetServiceId].push(detail);
                  console.log(`✅ Matched detail ${detail._id} to service ${targetServiceId} (section: ${detail.sectionKey})`);
                } else {
                  console.warn('⚠️ Detail not matched to any service:', {
                    detailId: detail._id,
                    categoryKey: detail.categoryKey,
                    serviceItemId: detail.serviceItemId,
                    availableServiceIds: servicesItems.map((s: any) => s._id || s.id),
                  });
                }
              });
              
              // Sort details by sectionKey for each service and limit to 4
              Object.keys(detailsByServiceId).forEach(serviceId => {
                detailsByServiceId[serviceId].sort((a, b) => {
                  const aKey = a.sectionKey || '';
                  const bKey = b.sectionKey || '';
                  return aKey.localeCompare(bKey);
                });
                detailsByServiceId[serviceId] = detailsByServiceId[serviceId].slice(0, 4);
              });
              
              // Convert to array format (matching service order) for backward compatibility
              // Map details to services in the same order as servicesItems
              data = servicesItems.slice(0, 4).map((service: any) => {
                const serviceId = service._id || service.id;
                return serviceId ? (detailsByServiceId[serviceId] || []) : [];
              });
              
              console.log('📦 Grouped and formatted data from services.details (by service order):', data);
              console.log('📊 Details count per service:', Object.keys(detailsByServiceId).map(serviceId => ({
                serviceId,
                count: detailsByServiceId[serviceId].length,
              })));
              
              // Also store the map directly in state for immediate use
              setServicesDetails(detailsByServiceId);
              console.log('✅ Services details map stored directly in state:', detailsByServiceId);
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
      
      // Convert mergedData array to object format: { [serviceId]: details[] }
      // But only if we haven't already set it from the API response above
      if (Object.keys(servicesDetails).length === 0) {
        const servicesDetailsMap: { [serviceId: string]: any[] } = {};
        mergedData.slice(0, 4).forEach((serviceSections: any[], serviceIndex: number) => {
          const service = currentServices[serviceIndex];
          if (service) {
            const serviceId = service._id || service.id;
            if (serviceId) {
              servicesDetailsMap[serviceId] = serviceSections;
            }
          }
        });
        setServicesDetails(servicesDetailsMap);
        console.log('✅ Services details loaded from mergedData:', servicesDetailsMap);
      } else {
        console.log('✅ Services details already loaded from API response');
      }
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
            // Convert mergedData array to object format: { [serviceId]: details[] }
            const servicesDetailsMap: { [serviceId: string]: any[] } = {};
            mergedData.slice(0, 4).forEach((serviceSections: any[], serviceIndex: number) => {
              const service = currentServices[serviceIndex];
              if (service) {
                const serviceId = service._id || service.id;
                if (serviceId) {
                  servicesDetailsMap[serviceId] = serviceSections;
                }
              }
            });
            setServicesDetails(servicesDetailsMap);
            console.log('✅ Services details loaded from localStorage');
          }
        } catch (e) {
          console.error('Error parsing saved data:', e);
        }
      }
    }
  };

  const handleSectionChange = (serviceId: string, sectionIndex: number, field: string, value: string) => {
    if (!serviceId) return;
    const currentDetails = getServiceDetails(serviceId);
    const newDetails = [...currentDetails];
    newDetails[sectionIndex] = {
      ...newDetails[sectionIndex],
        [field]: value,
      };
    setServiceDetails(serviceId, newDetails);
  };

  const handleSectionImageUpload = async (serviceId: string, sectionIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
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
      handleSectionChange(serviceId, sectionIndex, 'image', imageUrl);
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

  // Save details for a single service
  const saveServiceDetails = async (serviceIndex: number) => {
    try {
      const currentServices = Array.isArray(services) ? services : (services?.items || []);
      const service = currentServices[serviceIndex];
      
      if (!service) {
        toast.error(language === 'en' ? 'Service not found' : 'الخدمة غير موجودة');
        return;
      }
      
      const serviceId = service._id || service.id;
      if (!serviceId) {
        toast.error(language === 'en' ? 'Service ID not found' : 'معرف الخدمة غير موجود');
        return;
      }
      
      // Verify service exists in backend before saving details
      // Try to find the service by ID, and if not found, try to refresh and find by title
      try {
        let verified = false;
        let actualServiceId = serviceId;
        let lastError = null;
        
        // Try multiple times with retry logic (in case service was just saved)
        for (let attempt = 0; attempt < 5; attempt++) {
          try {
            if (attempt > 0) {
              // Wait a bit before retrying (increasing delay)
              await new Promise(resolve => setTimeout(resolve, 500 * attempt));
              
              // On later attempts, try to refresh services from backend
              if (attempt >= 2) {
                console.log('🔄 Refreshing services from backend to get updated IDs...');
                await fetchContent();
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Get updated service with potentially new ID
                const updatedServices = Array.isArray(services) ? services : (services?.items || []);
                const updatedService = updatedServices[serviceIndex];
                if (updatedService) {
                  const newServiceId = updatedService._id || updatedService.id;
                  if (newServiceId && newServiceId !== serviceId) {
                    console.log(`🔄 Service ID changed from ${serviceId} to ${newServiceId}`);
                    actualServiceId = newServiceId;
                    serviceId = newServiceId; // Update for use in payload
                  }
                }
              }
            }
            
            console.log(`🔄 Verifying service ${actualServiceId} (attempt ${attempt + 1}/5)...`);
            const verifyResponse = await http.get(`/content/services/items/${actualServiceId}`);
            console.log(`✅ Service ${actualServiceId} verified in backend:`, verifyResponse.data);
            verified = true;
            serviceId = actualServiceId; // Ensure we use the verified ID
            break;
          } catch (verifyErr: any) {
            lastError = verifyErr;
            if (verifyErr.response?.status === 404) {
              console.log(`⚠️ Service ${actualServiceId} not found (attempt ${attempt + 1}/5)`);
              if (attempt < 4) {
                // Continue to retry
                continue;
              }
            } else {
              // Other error, don't retry
              throw verifyErr;
            }
          }
        }
        
        if (!verified && lastError?.response?.status === 404) {
          const errorMsg = language === 'en' 
            ? `Service ${serviceIndex + 1} not found in backend. Please save the service first by clicking "Save Services" and wait a moment, then try again.` 
            : `الخدمة ${serviceIndex + 1} غير موجودة في الخادم. يرجى حفظ الخدمة أولاً بالنقر على "حفظ الخدمات" والانتظار قليلاً، ثم حاول مرة أخرى.`;
          toast.error(errorMsg);
          console.error(`❌ Service ${actualServiceId} not found in backend after 5 attempts. Cannot save details.`);
          console.error(`💡 Service data:`, service);
          return;
        }
      } catch (verifyErr: any) {
        // If it's another error (not 404), continue anyway (might be network issue)
        console.warn(`⚠️ Could not verify service, continuing anyway:`, verifyErr);
      }
      
      const serviceDetails = getServiceDetails(serviceId);
      
      // Use serviceId directly as categoryKey to ensure proper linking
      // The categoryKey should always match the serviceId for correct association
      const categoryKey = serviceId; // Always use serviceId as categoryKey
      
      console.log(`🔑 Using serviceId ${serviceId} as categoryKey for service ${serviceIndex + 1}`);
      
      // Prepare all sections for this service
      const sections = serviceDetails
        .map((section: any, sectionIndex: number) => {
          const titleEn = (section.title_en || '').trim();
          if (!titleEn) {
            return null;
          }
          
          return {
            categoryKey: serviceId, // Always use serviceId to ensure correct linking
            sectionKey: section.sectionKey || `section${sectionIndex + 1}`,
            title_en: titleEn,
            title_ar: (section.title_ar || '').trim(),
            image: (section.image || '').trim(),
            details_en: (section.details_en || '').trim(),
            details_ar: (section.details_ar || '').trim(),
            _id: section._id,
          };
        })
        .filter((s: any) => s !== null);
      
      if (sections.length === 0) {
        toast.warning(
          language === 'en' 
            ? 'No valid sections to save' 
            : 'لا توجد أقسام صالحة للحفظ'
        );
        return;
      }
      
      console.log(`💾 Saving service ${serviceIndex + 1} (ID: ${serviceId}) with ${sections.length} section(s)`);
      
      // Save to localStorage first (as backup)
      // servicesDetails is now an object { [serviceId]: details[] }, so we save it as is
      localStorage.setItem('servicesDetails', JSON.stringify(servicesDetails));
      
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
            console.log(`📦 Payload:`, JSON.stringify(sectionPayload, null, 2));
            response = await http.put(endpoint, sectionPayload);
            console.log(`✅ Section ${sectionIndex + 1} updated successfully`);
          } else {
            // CREATE new section
            console.log(`🆕 Creating section ${sectionIndex + 1} via POST ${endpoint}`);
            console.log(`📦 Payload:`, JSON.stringify(sectionPayload, null, 2));
            response = await http.post(endpoint, sectionPayload);
            console.log(`✅ Section ${sectionIndex + 1} created successfully`);
          }
          
          // Return success with the saved data (including _id from backend)
          const savedData = response.data || sectionPayload;
          return { 
            success: true, 
            sectionIndex, 
            data: savedData,
            _id: savedData._id || savedData.id || section._id, // Preserve _id from response
          };
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
              console.log(`📦 Payload:`, JSON.stringify(sectionPayload, null, 2));
              const response = await http.post(createEndpoint, sectionPayload);
              console.log(`✅ Section ${sectionIndex + 1} created successfully (replaced old detail)`);
              const savedData = response.data || sectionPayload;
              return { 
                success: true, 
                sectionIndex, 
                data: savedData, 
                replaced: true,
                _id: savedData._id || savedData.id, // Preserve _id from response
              };
            } catch (createErr: any) {
              console.error(`❌ Error creating new section ${sectionIndex + 1}:`, createErr);
              return { success: false, sectionIndex, error: createErr };
            }
          }
          
          console.error(`❌ Error saving section ${sectionIndex + 1}:`, {
            status: err.response?.status,
            statusText: err.response?.statusText,
            message: errorMessage,
            data: err.response?.data,
            endpoint: endpoint,
            payload: sectionPayload,
          });
          
          // Show detailed error in console
          if (err.response?.status === 404) {
            const errorMessage = err.response?.data?.message || '';
            const isServiceNotFound = errorMessage.includes('الخدمة غير موجودة') || errorMessage.includes('Service not found');
            
            if (isServiceNotFound) {
              console.error(`⚠️ Service ${serviceId} not found in backend. Cannot save details for non-existent service.`);
              console.error(`💡 Please make sure the service exists before saving its details.`);
            } else {
              console.error(`⚠️ Endpoint not found (404): ${endpoint}`);
              console.error(`💡 Make sure the backend endpoint exists and the serviceId/detailsId are correct`);
            }
          } else if (err.response?.status === 400) {
            console.error(`⚠️ Bad Request (400): Check the payload structure`);
            console.error(`📦 Payload sent:`, JSON.stringify(sectionPayload, null, 2));
            console.error(`📦 Response data:`, err.response?.data);
            if (err.response?.data?.errors) {
              console.error(`📦 Validation errors:`, err.response.data.errors);
            }
          } else if (err.response?.status === 401 || err.response?.status === 403) {
            console.error(`⚠️ Authentication error: Check your token`);
          } else {
            console.error(`⚠️ Unexpected error:`, err);
          }
          
          // Check if service not found error
          const errorMsg = err.response?.data?.message || '';
          const isServiceNotFound = errorMsg.includes('الخدمة غير موجودة') || errorMsg.includes('Service not found');
          
          return { success: false, sectionIndex, error: err, serviceNotFound: isServiceNotFound };
        }
      });
      
      const sectionResults = await Promise.all(sectionPromises);
      const successCount = sectionResults.filter(r => r.success).length;
      const failCount = sectionResults.filter(r => !r.success).length;
      const serviceNotFoundCount = sectionResults.filter(r => r.serviceNotFound).length;
      
      if (serviceNotFoundCount > 0) {
        // Service doesn't exist - show specific error
        toast.error(
          language === 'en' 
            ? `Service ${serviceIndex + 1} not found in backend. Please save the service first by clicking "Save Services".` 
            : `الخدمة ${serviceIndex + 1} غير موجودة في الخادم. يرجى حفظ الخدمة أولاً بالنقر على "حفظ الخدمات".`
        );
        return;
      }
      
      if (successCount > 0) {
        console.log(`✅ Service ${serviceIndex + 1}: ${successCount} section(s) saved successfully`);
        
        // Update local state with saved data (including _id from backend)
        const updatedDetails = [...serviceDetails];
        sectionResults.forEach((result) => {
          if (result.success && result.data) {
            const savedSection = result.data;
            const sectionIndex = result.sectionIndex;
            
            // Use sectionIndex directly since sections array is in the same order as serviceDetails
            if (sectionIndex >= 0 && sectionIndex < updatedDetails.length) {
              // Update with backend data (including _id)
              updatedDetails[sectionIndex] = {
                ...updatedDetails[sectionIndex],
                ...savedSection,
                _id: (result as any)._id || savedSection._id || savedSection.id || updatedDetails[sectionIndex]._id,
                categoryKey: serviceId, // Ensure categoryKey is set correctly
                sectionKey: savedSection.sectionKey || updatedDetails[sectionIndex].sectionKey || sections[sectionIndex]?.sectionKey || `section${sectionIndex + 1}`,
                title_en: savedSection.title_en || updatedDetails[sectionIndex].title_en || sections[sectionIndex]?.title_en || '',
                title_ar: savedSection.title_ar || updatedDetails[sectionIndex].title_ar || sections[sectionIndex]?.title_ar || '',
                image: savedSection.image || updatedDetails[sectionIndex].image || sections[sectionIndex]?.image || '',
                details_en: savedSection.details_en || updatedDetails[sectionIndex].details_en || sections[sectionIndex]?.details_en || '',
                details_ar: savedSection.details_ar || updatedDetails[sectionIndex].details_ar || sections[sectionIndex]?.details_ar || '',
              };
              console.log(`✅ Updated detail ${sectionIndex} with backend data:`, updatedDetails[sectionIndex]);
            } else {
              console.warn(`⚠️ Section index ${sectionIndex} is out of bounds (0-${updatedDetails.length - 1})`);
            }
          }
        });
        
        // Update servicesDetails state with saved data
        setServiceDetails(serviceId, updatedDetails);
        console.log(`✅ Updated local state for service ${serviceId} with ${updatedDetails.length} detail(s)`);
        
        // Also update localStorage with the updated servicesDetails object
        const updatedServicesDetails = { ...servicesDetails, [serviceId]: updatedDetails };
        localStorage.setItem('servicesDetails', JSON.stringify(updatedServicesDetails));
        console.log(`✅ Updated localStorage with saved details for service ${serviceId}`);
        
        toast.success(
          language === 'en' 
            ? `Service ${serviceIndex + 1} details saved successfully (${successCount} section${successCount > 1 ? 's' : ''})` 
            : `تم حفظ تفاصيل الخدمة ${serviceIndex + 1} بنجاح (${successCount} قسم${successCount > 1 ? 'ات' : ''})`
        );
        
        if (failCount > 0) {
          console.warn(`⚠️ Service ${serviceIndex + 1}: ${failCount} section(s) failed to save`);
          toast.warning(
            language === 'en' 
              ? `${failCount} section(s) could not be saved` 
              : `لم يتم حفظ ${failCount} قسم`
          );
        }
      } else {
        console.error(`❌ Service ${serviceIndex + 1}: All sections failed to save`);
        
        // Show detailed error message
        const firstError = sectionResults.find(r => !r.success)?.error;
        let errorMessage = language === 'en' 
          ? 'Failed to save service details. Data saved locally.' 
          : 'فشل حفظ تفاصيل الخدمة. تم حفظ البيانات محلياً.';
        
        if (firstError?.response?.status === 404) {
          const errorMsg = firstError.response?.data?.message || '';
          if (errorMsg.includes('الخدمة غير موجودة') || errorMsg.includes('Service not found')) {
            errorMessage = language === 'en'
              ? 'Service not found. Please save the service first.'
              : 'الخدمة غير موجودة. يرجى حفظ الخدمة أولاً.';
          } else {
            errorMessage = language === 'en'
              ? 'API endpoint not found. Please check backend configuration.'
              : 'نقطة النهاية غير موجودة. يرجى التحقق من إعدادات الخادم.';
          }
        } else if (firstError?.response?.status === 400) {
          errorMessage = language === 'en'
            ? 'Invalid data format. Please check the console for details.'
            : 'تنسيق البيانات غير صحيح. يرجى التحقق من وحدة التحكم للتفاصيل.';
        } else if (firstError?.response?.status) {
          errorMessage = language === 'en'
            ? `Error ${firstError.response.status}: ${firstError.response.data?.message || 'Failed to save'}`
            : `خطأ ${firstError.response.status}: ${firstError.response.data?.message || 'فشل الحفظ'}`;
        }
        
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error(`❌ Error saving service ${serviceIndex + 1} details:`, error);
      toast.error(
        language === 'en' 
          ? 'Failed to save service details. Data saved locally.' 
          : 'فشل حفظ تفاصيل الخدمة. تم حفظ البيانات محلياً.'
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
                <div className="space-y-4">
                  {safeServices.map((s, index) => {
                    const serviceId = s._id || s.id;
                    if (!serviceId) {
                      console.warn(`Service at index ${index} has no ID:`, s);
                    }
                    return (
                      <Collapsible key={serviceId} defaultOpen={index === 0}>
                        <Card className="border-2">
                          <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-secondary/50 transition-colors">
                              <div className="flex items-center justify-between">
                                <CardTitle>
                                  {language === 'en' ? `Service ${index + 1}` : `الخدمة ${index + 1}`}
                                </CardTitle>
                                <div className="flex items-center gap-2">
                                  {/* Delete Service Button - Commented out temporarily */}
                                  {/* <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setServiceToDelete({ id: serviceId, index });
                                      setDeleteDialogOpen(true);
                                    }}
                                    disabled={loading}
                                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button> */}
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

                              {/* Icon Field */}
                              <div>
                                <label className="text-sm font-medium mb-1 block">
                                  {language === 'en' ? 'Icon (URL or icon name)' : 'الأيقونة (رابط أو اسم الأيقونة)'}
                                </label>
                                <Input
                                  placeholder={language === 'en' ? 'Enter icon URL or icon name...' : 'أدخل رابط الأيقونة أو اسم الأيقونة...'}
                                  value={s.icon || ''}
                      onChange={(e) =>
                        setContent({
                                      services: {
                                        ...servicesData,
                                        items: safeServices.map((srv) =>
                                          (srv._id === serviceId || srv.id === serviceId)
                                            ? { ...srv, icon: e.target.value }
                                            : srv
                                        ),
                                      },
                                    })
                                  }
                                />
                              </div>

                              {/* Service Details Sections - Moved to separate "Services Details" tab */}
                              <div className="mt-6 pt-6 border-t border-border">
                                <p className="text-sm text-muted-foreground text-center">
                                  {language === 'en' 
                                    ? '💡 Service details are managed in the "Services Details" tab above.' 
                                    : '💡 يتم إدارة تفاصيل الخدمة في تبويب "تفاصيل الخدمات" أعلاه.'}
                                </p>
                              </div>
                            </CardContent>
                          </CollapsibleContent>
                  </Card>
                      </Collapsible>
                    );
                  })}
                </div>
                )}

                <div className="mt-6 flex gap-4">
                  <Button
                    onClick={async () => {
                      console.log('💾 Saving services data...');
                      console.log('📦 servicesData before save:', JSON.stringify(servicesData, null, 2));
                      console.log('📦 safeServices count:', safeServices.length);
                      console.log('📦 safeServices:', safeServices);
                      console.log('📦 Current services from store:', services);
                      try {
                        await updateServices(servicesData);
                        console.log('✅ Save completed');
                        
                        // Wait a moment for backend to process
                        await new Promise(resolve => setTimeout(resolve, 1000));
                        
                        // Fetch content again to ensure we have the latest IDs
                        await fetchContent();
                        
                        toast.success(
                          language === 'en' 
                            ? 'Services saved successfully. You can now save their details.' 
                            : 'تم حفظ الخدمات بنجاح. يمكنك الآن حفظ تفاصيلها.'
                        );
                      } catch (error) {
                        console.error('❌ Error saving services:', error);
                      }
                    }}
                    disabled={loading}
                    className="flex-1"
                  >
                    {loading ? (language === 'en' ? 'Saving...' : 'جاري الحفظ...') : (language === 'en' ? 'Save Services' : 'حفظ الخدمات')}
                  </Button>
                  <Button
                    onClick={async () => {
                      console.log('💾 Saving all (services + details)...');
                      await updateServices(servicesData);
                      await saveServicesDetails();
                    }}
                    disabled={loading}
                    className="flex-1 bg-gold hover:bg-gold-dark text-black font-semibold"
                  >
                    {loading ? (language === 'en' ? 'Saving...' : 'جاري الحفظ...') : (language === 'en' ? 'Save All' : 'حفظ الكل')}
                  </Button>
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
                    {safeServices.map((s, index) => {
                      const serviceId = s._id || s.id;
                      if (!serviceId) {
                        console.warn(`Service at index ${index} has no ID:`, s);
                        return null;
                      }
                      return (
                        <Collapsible key={serviceId} defaultOpen={index === 0}>
                          <Card className="border-2">
                            <CollapsibleTrigger asChild>
                              <CardHeader className="cursor-pointer hover:bg-secondary/50 transition-colors">
                                <div className="flex items-center justify-between">
                                  <CardTitle>
                                    {language === 'en' 
                                      ? `Service ${index + 1}: ${s.title_en || s.title_ar || 'Untitled'}` 
                                      : `الخدمة ${index + 1}: ${s.title_ar || s.title_en || 'بدون عنوان'}`}
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
                                    {[0, 1, 2, 3].map((sectionIndex) => {
                                      const serviceDetailsForThisService = getServiceDetails(serviceId);
                                      const section = serviceDetailsForThisService[sectionIndex] || { 
                                        title_en: '', 
                                        title_ar: '', 
                                        image: '', 
                                        details_en: '', 
                                        details_ar: '' 
                                      };
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
                                                      onChange={(e) => handleSectionChange(serviceId, sectionIndex, 'title_en', e.target.value)}
                                                      placeholder={language === 'en' ? 'Enter section title in English...' : 'أدخل عنوان القسم بالإنجليزية...'}
                                                    />
                                                  </div>
                                                  <div>
                                                    <label className="text-sm font-medium mb-1 block">
                                                      {language === 'en' ? 'Section Title (Arabic)' : 'عنوان القسم (عربي)'}
                                                    </label>
                                                    <Input
                                                      value={section.title_ar || ''}
                                                      onChange={(e) => handleSectionChange(serviceId, sectionIndex, 'title_ar', e.target.value)}
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
                                                      onChange={(e) => handleSectionImageUpload(serviceId, sectionIndex, e)}
                                                      className="hidden"
                                                      id={`service-details-${serviceId}-section-${sectionIndex}-image`}
                                                    />
                                                    <label
                                                      htmlFor={`service-details-${serviceId}-section-${sectionIndex}-image`}
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
                                                          alt={`Service ${index + 1} - Section ${sectionIndex + 1}`}
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
                                                      onChange={(e) => handleSectionChange(serviceId, sectionIndex, 'details_en', e.target.value)}
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
                                                      onChange={(e) => handleSectionChange(serviceId, sectionIndex, 'details_ar', e.target.value)}
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
                                  
                                  {/* Save Button for this specific service */}
                                  <div className="mt-6 pt-4 border-t border-border">
                                    <div className="space-y-2">
                                      <p className="text-sm text-muted-foreground text-center">
                                        {language === 'en' 
                                          ? '⚠️ Make sure to save the service first using "Save Services" button in the Services tab' 
                                          : '⚠️ تأكد من حفظ الخدمة أولاً باستخدام زر "حفظ الخدمات" في تبويب الخدمات'}
                                      </p>
                  <Button
                    onClick={async () => {
                                          console.log(`💾 Saving details for service ${index + 1}...`);
                                          await saveServiceDetails(index);
                    }}
                    disabled={loading}
                                        className="w-full bg-gold hover:bg-gold-dark text-black font-semibold"
                  >
                                        {loading ? (language === 'en' ? 'Saving...' : 'جاري الحفظ...') : (language === 'en' ? `Save Service ${index + 1} Details` : `حفظ تفاصيل الخدمة ${index + 1}`)}
                </Button>
                </div>
                                  </div>
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
