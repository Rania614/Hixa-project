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

  // Fetch service details by serviceId from backend
  // Returns data exactly as fetched - no padding or normalization
  const fetchServiceDetails = async (serviceId: string): Promise<any[]> => {
    try {
      console.log(`🔄 Fetching details for service ${serviceId}...`);
      
      // Try the new endpoint first: /api/content/services/details/{id}
      let response;
      try {
        console.log(`🔄 Trying endpoint: /api/content/services/details/${serviceId}`);
        response = await http.get(`/api/content/services/details/${serviceId}`);
        console.log(`✅ Successfully fetched from /api/content/services/details/${serviceId}`);
      } catch (newEndpointError: any) {
        if (newEndpointError.response?.status === 404) {
          // If new endpoint returns 404, try the old endpoint as fallback
          console.log(`⚠️ /api/content/services/details/${serviceId} returned 404, trying fallback endpoint...`);
          console.log(`🔄 Trying fallback endpoint: /content/services/items/${serviceId}/details`);
          response = await http.get(`/content/services/items/${serviceId}/details`);
          console.log(`✅ Successfully fetched from fallback endpoint`);
        } else {
          throw newEndpointError;
        }
      }
      
      // Log raw response for debugging
      console.log(`📦 Raw response.data for service ${serviceId}:`, response.data);
      console.log(`📦 Response.data type:`, typeof response.data);
      console.log(`📦 Response.data isArray:`, Array.isArray(response.data));
      
      // Handle nested response shapes
      let details: any[] = [];
      if (Array.isArray(response.data)) {
        // Direct array response
        details = response.data;
        console.log(`✅ Found direct array response with ${details.length} items`);
      } else if (response.data?.items && Array.isArray(response.data.items)) {
        // Nested in items
        details = response.data.items;
        console.log(`✅ Found nested items array with ${details.length} items`);
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        // Nested in data
        details = response.data.data;
        console.log(`✅ Found nested data array with ${details.length} items`);
      } else if (response.data?.details && Array.isArray(response.data.details)) {
        // Nested in details
        details = response.data.details;
        console.log(`✅ Found nested details array with ${details.length} items`);
      } else {
        // Try to find any array property
        const dataKeys = Object.keys(response.data || {});
        console.log(`⚠️ Response.data keys:`, dataKeys);
        for (const key of dataKeys) {
          if (Array.isArray(response.data[key])) {
            details = response.data[key];
            console.log(`✅ Found array in key "${key}" with ${details.length} items`);
            break;
          }
        }
      }
      
      // Log extracted details
      console.log(`📋 Extracted ${details.length} details for service ${serviceId}:`, details);
      
      // Sort by sectionKey if present, but don't modify the data structure
      const sortedDetails = [...details].sort((a, b) => {
        const aKey = a.sectionKey || '';
        const bKey = b.sectionKey || '';
        return aKey.localeCompare(bKey);
      });
      
      console.log(`✅ Fetched ${sortedDetails.length} details for service ${serviceId} (exact data from backend)`);
      return sortedDetails;
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Service has no details yet, return empty array (not 4 empty sections)
        console.log(`ℹ️ No details found for service ${serviceId}, returning empty array`);
        return [];
      }
      console.error(`❌ Error fetching details for service ${serviceId}:`, error);
      throw error;
    }
  };

  const fetchOrderSections = async () => {
    try {
      console.log('🔄 Fetching services details from API...');
      
      // Get current services
      const currentServices = Array.isArray(services) ? services : (services?.items || []);
      const servicesWithIds = currentServices.filter((s: any) => s._id || s.id);
      
      if (servicesWithIds.length === 0) {
        console.log('ℹ️ No services with IDs found');
        return;
      }
      
      // Fetch details for each service by serviceId
      const detailsMap: { [serviceId: string]: any[] } = {};
      
      await Promise.all(
        servicesWithIds.map(async (service: any) => {
          const serviceId = String(service._id || service.id);
          if (!serviceId) return;
          
          try {
            console.log(`🔄 Fetching details for service ${serviceId}...`);
            const details = await fetchServiceDetails(serviceId);
            detailsMap[serviceId] = details;
            console.log(`✅ Fetched ${details.length} details for service ${serviceId}:`, details);
          } catch (error) {
            console.error(`❌ Failed to fetch details for service ${serviceId}:`, error);
            // Use empty array on error (no padding)
            detailsMap[serviceId] = [];
          }
        })
      );
      
      console.log(`📦 Details map before setting state:`, detailsMap);
      console.log(`📊 Total services with details: ${Object.keys(detailsMap).length}`);
      Object.keys(detailsMap).forEach(serviceId => {
        console.log(`  - Service ${serviceId}: ${detailsMap[serviceId].length} sections`);
      });
      
      setServicesDetails(detailsMap);
      console.log(`✅ Fetched and set details for ${Object.keys(detailsMap).length} service(s)`);
      console.log(`📦 State updated. Available serviceIds in state:`, Object.keys(detailsMap));
    } catch (error: any) {
      console.error('❌ Error fetching services details:', error);
      toast({
        title: "Error",
        description: "Failed to fetch services details",
        variant: "destructive",
      });
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

  // Save details for a single service by serviceId
  const saveServiceDetails = async (serviceId: string) => {
    if (!serviceId) {
      toast.error(language === 'en' ? 'Service ID is required' : 'معرف الخدمة مطلوب');
      return;
    }
    
    try {
      
      // Verify service exists in backend
      try {
        await http.get(`/content/services/items/${serviceId}`);
        console.log(`✅ Service ${serviceId} verified in backend`);
      } catch (verifyErr: any) {
        if (verifyErr.response?.status === 404) {
          toast.error(language === 'en' 
            ? 'Service not found in backend. Please save the service first.' 
            : 'الخدمة غير موجودة في الخادم. يرجى حفظ الخدمة أولاً.');
          return;
        }
        console.warn(`⚠️ Could not verify service, continuing anyway:`, verifyErr);
      }
      
      const serviceDetails = getServiceDetails(serviceId);
      
      // Use serviceId directly as categoryKey to ensure proper linking
      // The categoryKey should always match the serviceId for correct association
      const categoryKey = serviceId; // Always use serviceId as categoryKey
      
      console.log(`🔑 Using serviceId ${serviceId} as categoryKey`);
      
      // Prepare all sections for this service
      // Update existing sections (with _id) and create new ones (without _id)
      const sections = serviceDetails
        .map((section: any, sectionIndex: number) => {
          const titleEn = (section.title_en || '').trim();
          if (!titleEn) {
            // Skip sections without title_en (empty sections)
            console.log(`⚠️ Section ${sectionIndex + 1} has no title_en, skipping`);
            return null;
          }
          
          // Ensure sectionKey is set correctly ("section1", "section2", etc.)
          const sectionKey = section.sectionKey || `section${sectionIndex + 1}`;
          console.log(`📝 Section ${sectionIndex + 1}: sectionKey="${sectionKey}", categoryKey="${serviceId}"`);
          
          return {
            categoryKey: serviceId, // Always use serviceId to ensure correct linking
            sectionKey: sectionKey,
            title_en: titleEn,
            title_ar: (section.title_ar || '').trim(),
            image: (section.image || '').trim(),
            details_en: (section.details_en || '').trim(),
            details_ar: (section.details_ar || '').trim(),
            _id: section._id, // Will be undefined for new sections
          };
        })
        .filter((s: any) => s !== null);
      
      if (sections.length === 0) {
        toast.warning(
          language === 'en' 
            ? 'No valid sections to save. Please enter at least a title for one section.' 
            : 'لا توجد أقسام صالحة للحفظ. يرجى إدخال عنوان على الأقل لقسم واحد.'
        );
        return;
      }
      
      console.log(`💾 Saving service ${serviceId} with ${sections.length} section(s)`);
      
      // Save each section individually
      // PUT /content/services/items/{serviceId}/details/{detailId} for updates
      // POST /content/services/items/{serviceId}/details for new sections
      const sectionPromises = sections.map(async (section: any, sectionIndex: number) => {
        const sectionPayload = {
          categoryKey: serviceId, // Always use serviceId to ensure correct linking
          sectionKey: section.sectionKey, // sectionKey was set in the previous map
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
            console.log(`📦 Payload categoryKey: "${sectionPayload.categoryKey}" (should match serviceId: "${serviceId}")`);
            console.log(`📦 Payload sectionKey: "${sectionPayload.sectionKey}"`);
            console.log(`📦 Full Payload:`, JSON.stringify(sectionPayload, null, 2));
            response = await http.put(endpoint, sectionPayload);
            console.log(`✅ Section ${sectionIndex + 1} updated successfully`);
            console.log(`📦 Response:`, response.data);
          } else {
            // CREATE new section
            console.log(`🆕 Creating section ${sectionIndex + 1} via POST ${endpoint}`);
            console.log(`📦 Payload categoryKey: "${sectionPayload.categoryKey}" (should match serviceId: "${serviceId}")`);
            console.log(`📦 Payload sectionKey: "${sectionPayload.sectionKey}"`);
            console.log(`📦 Full Payload:`, JSON.stringify(sectionPayload, null, 2));
            response = await http.post(endpoint, sectionPayload);
            console.log(`✅ Section ${sectionIndex + 1} created successfully (POST 200)`);
            console.log(`📦 Response:`, response.data);
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
            // Detail doesn't belong to this service - skip it (we only update existing)
            console.warn(`⚠️ Section ${sectionIndex + 1} detail (${section._id}) doesn't belong to service ${serviceId}. Skipping update.`);
            return { 
              success: false, 
              sectionIndex, 
              error: err,
              message: 'Detail does not belong to this service'
            };
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
            ? 'Service not found in backend. Please save the service first.' 
            : 'الخدمة غير موجودة في الخادم. يرجى حفظ الخدمة أولاً.'
        );
        return;
      }
      
      if (successCount > 0) {
        console.log(`✅ Service ${serviceId}: ${successCount} section(s) saved successfully`);
        
        // Re-fetch details from backend to get updated data (with _id from backend)
        try {
          const fetchedDetails = await fetchServiceDetails(serviceId);
          
          // If POST succeeded but GET returns empty array, keep previous saved details
          if (fetchedDetails.length === 0 && serviceDetails.length > 0) {
            console.warn(`⚠️ POST succeeded but GET returned empty array for service ${serviceId}`);
            console.warn(`⚠️ Keeping previous saved details (${serviceDetails.length} sections) instead of overwriting with empty array`);
            console.warn(`💡 This might indicate a backend filtering issue (check categoryKey/serviceId/serviceItemId matching)`);
            console.warn(`💡 POST payload used categoryKey: "${serviceId}" - verify backend filters by this field`);
            
            // Keep the current state, but update sections that were successfully saved with their _id from response
            // This is a fallback to prevent data loss
            const updatedDetails = [...serviceDetails];
            sectionResults.forEach((result, idx) => {
              if (result.success && result.data && result._id) {
                // Update the section with _id from backend
                if (idx < updatedDetails.length) {
                  updatedDetails[idx] = {
                    ...updatedDetails[idx],
                    _id: result._id,
                  };
                }
              }
            });
            setServiceDetails(serviceId, updatedDetails);
          } else {
            // Normal case: update with fetched data
            setServiceDetails(serviceId, fetchedDetails);
            console.log(`✅ Re-fetched and updated details for service ${serviceId} (${fetchedDetails.length} sections)`);
          }
        } catch (fetchError: any) {
          console.error(`❌ Error re-fetching details after save for service ${serviceId}:`, fetchError);
          console.warn(`⚠️ Keeping current state instead of overwriting`);
          // Don't overwrite state if re-fetch fails
        }
        
        toast.success(
          language === 'en' 
            ? `Service details saved successfully (${successCount} section${successCount > 1 ? 's' : ''})` 
            : `تم حفظ تفاصيل الخدمة بنجاح (${successCount} قسم${successCount > 1 ? 'ات' : ''})`
        );
        
        if (failCount > 0) {
          console.warn(`⚠️ Service ${serviceId}: ${failCount} section(s) failed to save`);
          toast.warning(
            language === 'en' 
              ? `${failCount} section(s) could not be saved` 
              : `لم يتم حفظ ${failCount} قسم`
          );
        }
      } else {
        console.error(`❌ Service ${serviceId}: All sections failed to save`);
        
        // Show detailed error message
        const firstError = sectionResults.find(r => !r.success)?.error;
        let errorMessage = language === 'en' 
          ? 'Failed to save service details. Data saved locally.' 
          : 'فشل حفظ تفاصيل الخدمة. تم حفظ البيانات محلياً.';
        
        toast.error(errorMessage);
      }
    } catch (error: any) {
      console.error(`❌ Error saving service ${serviceId} details:`, error);
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
                      await saveAllServicesDetails();
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
                                  {(() => {
                                    // Get actual data from state (no padding)
                                    const serviceDetailsForThisService = getServiceDetails(serviceId);
                                    
                                    // Pad to 4 sections ONLY at render time, not in state
                                    const paddedSections = [...serviceDetailsForThisService];
                                    while (paddedSections.length < 4) {
                                      paddedSections.push({
                                        title_en: '',
                                        title_ar: '',
                                        image: '',
                                        details_en: '',
                                        details_ar: '',
                                        _id: undefined,
                                        sectionKey: `section${paddedSections.length + 1}`,
                                      });
                                    }
                                    
                                    return paddedSections.map((section, sectionIndex) => {
                                    
                                    // Debug log for first section of first service
                                    if (index === 0 && sectionIndex === 0) {
                                      console.log(`🔍 Rendering section ${sectionIndex + 1} for service ${index + 1}:`, {
                                        serviceId,
                                        section,
                                        serviceDetailsForThisService,
                                        allServiceDetails: servicesDetails,
                                      });
                                    }
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
                                  });
                                })()}
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
                                          const serviceId = s._id || s.id;
                                          if (serviceId) {
                                            console.log(`💾 Saving details for service ${serviceId}...`);
                                            await saveServiceDetails(serviceId);
                                          } else {
                                            toast.error(language === 'en' ? 'Service ID not found' : 'معرف الخدمة غير موجود');
                                          }
                    }}
                    disabled={loading}
                                        className="w-full bg-gold hover:bg-gold-dark text-black font-semibold"
                  >
                                        {loading ? (language === 'en' ? 'Saving...' : 'جاري الحفظ...') : (language === 'en' ? `Save Service Details` : `حفظ تفاصيل الخدمة`)}
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
