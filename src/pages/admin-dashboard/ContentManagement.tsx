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

  // جلب البيانات عند تحميل الصفحة
  useEffect(() => {
    fetchContent();
    fetchOrderSections();
  }, []);

  const fetchOrderSections = async () => {
    try {
      const response = await http.get('/api/content');
      const data = response.data?.servicesDetails || response.data?.services_details || [];
      if (data.length > 0 && Array.isArray(data[0])) {
        // Data is already in correct format (array of arrays)
        setServicesDetails(data);
      } else {
        // Try to load from localStorage as fallback
        const savedData = localStorage.getItem('servicesDetails');
        if (savedData) {
          try {
            const parsed = JSON.parse(savedData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setServicesDetails(parsed);
            }
          } catch (e) {
            console.error('Error parsing saved data:', e);
          }
        }
      }
    } catch (error) {
      console.error('Error fetching services details:', error);
      // Fallback to localStorage
      const savedData = localStorage.getItem('servicesDetails');
      if (savedData) {
        try {
          const parsed = JSON.parse(savedData);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setServicesDetails(parsed);
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
      const response = await http.post('/api/content/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const imageUrl = response.data?.url || response.data?.imageUrl || '';
      handleSectionChange(serviceIndex, sectionIndex, 'image', imageUrl);
      toast.success(language === 'en' ? 'Image uploaded successfully' : 'تم رفع الصورة بنجاح');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error(language === 'en' ? 'Failed to upload image' : 'فشل رفع الصورة');
    }
  };

  const saveServicesDetails = async () => {
    try {
      // Save to localStorage first (as backup)
      localStorage.setItem('servicesDetails', JSON.stringify(servicesDetails));
      
      // Try to save using the main content endpoint
      try {
        // First, get current content to preserve other data
        const currentContent = await http.get('/api/content');
        const updatedContent = {
          ...currentContent.data,
          servicesDetails: servicesDetails,
        };
        
        // Save using PUT to /content with servicesDetails included
        await http.put('/api/content', updatedContent);
        toast.success(language === 'en' ? 'Services details saved successfully' : 'تم حفظ تفاصيل الخدمات بنجاح');
        return;
      } catch (putError: any) {
        console.warn('PUT /content failed, trying alternative:', putError);
        
        // Try saving directly to services-details endpoint
        try {
          await http.put('/api/content/services-details', { servicesDetails });
          toast.success(language === 'en' ? 'Services details saved successfully' : 'تم حفظ تفاصيل الخدمات بنجاح');
          return;
        } catch (secondError: any) {
          console.warn('PUT /content/services-details also failed:', secondError);
          // Data is already saved to localStorage, so show success with warning
          toast.success(
            language === 'en' 
              ? 'Services details saved locally. Backend endpoint not available yet.' 
              : 'تم حفظ تفاصيل الخدمات محلياً. الـ endpoint في الخادم غير متاح بعد.'
          );
        }
      }
    } catch (error: any) {
      console.error('Error saving services details:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          (language === 'en' 
                            ? 'Failed to save services details' 
                            : 'فشل حفظ تفاصيل الخدمات');
      toast.error(errorMessage);
    }
  };

  // تحديث اتجاه النص عند تغيير اللغة
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  // Helper لتجنب الأخطاء لو services أو projects أو partners أو jobs مش Array
  const servicesData = Array.isArray(services) ? { items: services } : (services || { items: [] });
  const safeServices = Array.isArray(servicesData.items) ? servicesData.items : [];
  const projectsData = Array.isArray(projects) ? { items: projects } : (projects || { items: [] });
  const safeProjects = Array.isArray(projectsData.items) ? projectsData.items : [];
  const partnersData = Array.isArray(partners) ? { items: partners } : (partners || { items: [] });
  const safePartners = Array.isArray(partnersData.items) ? partnersData.items : [];
  const jobsData = Array.isArray(jobs) ? { items: jobs } : (jobs || { items: [] });
  const safeJobs = Array.isArray(jobsData.items) ? jobsData.items : [];

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
                                        const uploadResponse = await http.post('/api/content/upload', formData);

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
                                        const uploadResponse = await http.post('/api/content/upload', formData);

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
