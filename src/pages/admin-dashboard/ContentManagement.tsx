import { useState } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminTopBar';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { HexagonIcon } from '@/components/ui/hexagon-icon';

const ContentManagement = () => {
  const { language, content, updateContent } = useApp();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('hero');

  const handleSave = async () => {
    // The content is already being saved through the updateContent calls
    // This function is called to show the success message
    toast({
      title: language === 'en' ? 'Saved!' : 'تم الحفظ!',
      description: language === 'en' ? 'Content updated successfully' : 'تم تحديث المحتوى بنجاح',
    });
  };

  const addService = async () => {
    const newService = {
      id: Date.now().toString(),
      order: content.services.length + 1,
      title: { en: 'New Service', ar: 'خدمة جديدة' },
      description: { en: 'Service description', ar: 'وصف الخدمة' },
      icon: 'Code',
    };
    await updateContent({ services: [...content.services, newService] });
  };

  const deleteService = async (id: string) => {
    await updateContent({
      services: content.services.filter((s) => s.id !== id),
    });
  };

  const moveService = async (index: number, direction: 'up' | 'down') => {
    const newServices = [...content.services];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newServices.length) return;
    
    [newServices[index], newServices[targetIndex]] = [newServices[targetIndex], newServices[index]];
    newServices.forEach((s, i) => s.order = i + 1);
    await updateContent({ services: newServices });
  };

  const addProject = async () => {
    const newProject = {
      id: Date.now().toString(),
      order: content.projects.length + 1,
      title: { en: 'New Project', ar: 'مشروع جديد' },
      description: { en: 'Project description', ar: 'وصف المشروع' },
      image: '/placeholder.svg',
    };
    await updateContent({ projects: [...content.projects, newProject] });
  };

  const deleteProject = async (id: string) => {
    await updateContent({
      projects: content.projects.filter((p) => p.id !== id),
    });
  };

  const moveProject = async (index: number, direction: 'up' | 'down') => {
    const newProjects = [...content.projects];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newProjects.length) return;
    
    [newProjects[index], newProjects[targetIndex]] = [newProjects[targetIndex], newProjects[index]];
    newProjects.forEach((p, i) => p.order = i + 1);
    await updateContent({ projects: newProjects });
  };

  const addPartner = async () => {
    const newPartner = {
      id: Date.now().toString(),
      name: { en: 'New Partner', ar: 'شريك جديد' },
      logo: '/placeholder.svg',
      order: content.partners.length + 1,
      active: true,
    };
    await updateContent({ partners: [...content.partners, newPartner] });
  };

  const deletePartner = async (id: string) => {
    await updateContent({
      partners: content.partners.filter((p) => p.id !== id),
    });
  };

  const movePartner = async (index: number, direction: 'up' | 'down') => {
    const newPartners = [...content.partners];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newPartners.length) return;
    
    [newPartners[index], newPartners[targetIndex]] = [newPartners[targetIndex], newPartners[index]];
    newPartners.forEach((p, i) => p.order = i + 1);
    await updateContent({ partners: newPartners });
  };

  const addJob = async () => {
    const newJob = {
      id: Date.now().toString(),
      title: { en: 'New Job', ar: 'وظيفة جديدة' },
      description: { en: 'Job description', ar: 'وصف الوظيفة' },
      status: 'active' as const,
    };
    await updateContent({ jobs: [...content.jobs, newJob] });
  };

  const deleteJob = async (id: string) => {
    await updateContent({
      jobs: content.jobs.filter((j) => j.id !== id),
    });
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1">
        <AdminTopBar />
        
        <main className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              {language === 'en' ? 'Content Management' : 'إدارة المحتوى'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'en'
                ? 'Edit all website content in English and Arabic'
                : 'تحرير جميع محتوى الموقع بالإنجليزية والعربية'}
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid grid-cols-4 lg:grid-cols-9 gap-2">
              <TabsTrigger value="hero">Hero</TabsTrigger>
              <TabsTrigger value="about-company">About (C)</TabsTrigger>
              <TabsTrigger value="about-platform">About (P)</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="partners">Partners</TabsTrigger>
              <TabsTrigger value="jobs">Jobs</TabsTrigger>
              <TabsTrigger value="cta">CTA</TabsTrigger>
            </TabsList>

            {/* Hero Section */}
            <TabsContent value="hero">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Hero Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title (English)</label>
                      <Input
                        value={content.platformContent.heading.en}
                        onChange={async (e) =>
                          await updateContent({
                            platformContent: { ...content.platformContent, heading: { ...content.platformContent.heading, en: e.target.value } },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">العنوان (العربية)</label>
                      <Input
                        value={content.platformContent.heading.ar}
                        onChange={async (e) =>
                          await updateContent({
                            platformContent: { ...content.platformContent, heading: { ...content.platformContent.heading, ar: e.target.value } },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Subtitle (English)</label>
                      <Textarea
                        value={content.platformContent.slogan.en}
                        onChange={async (e) =>
                          await updateContent({
                            platformContent: { ...content.platformContent, slogan: { ...content.platformContent.slogan, en: e.target.value } },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">العنوان الفرعي (العربية)</label>
                      <Textarea
                        value={content.platformContent.slogan.ar}
                        onChange={async (e) =>
                          await updateContent({
                            platformContent: { ...content.platformContent, slogan: { ...content.platformContent.slogan, ar: e.target.value } },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Caption (English)</label>
                      <Textarea
                        value={language === 'en' 
                          ? 'Transforming ideas into experiences that leave a lasting impact.' 
                          : 'نحول الأفكار إلى تجارب تترك أثراً دائماً.'}
                        onChange={async (e) => {
                          // This content is hardcoded in the component, but we can add it to the content management
                          // For now, we'll note that this is hardcoded
                        }}
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">الشرح (العربية)</label>
                      <Textarea
                        value={language === 'en' 
                          ? 'Transforming ideas into experiences that leave a lasting impact.' 
                          : 'نحول الأفكار إلى تجارب تترك أثراً دائماً.'}
                        onChange={async (e) => {
                          // This content is hardcoded in the component, but we can add it to the content management
                        }}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Button Text (English)</label>
                      <Input
                        value={language === 'en' ? 'Join the Platform' : 'انضم للمنصة'}
                        onChange={async (e) => {
                          // This content is hardcoded in the component, but we can add it to the content management
                        }}
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">نص الزر (العربية)</label>
                      <Input
                        value={language === 'en' ? 'Join the Platform' : 'انضم للمنصة'}
                        onChange={async (e) => {
                          // This content is hardcoded in the component, but we can add it to the content management
                        }}
                        disabled
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Caption Below Button (English)</label>
                      <Textarea
                        value={language === 'en' 
                          ? 'A platform that connects clients with engineers to execute engineering projects professionally.' 
                          : 'منصة تربط العملاء بالمهندسين لتنفيذ المشاريع الهندسية باحترافية.'}
                        onChange={async (e) => {
                          // This content is hardcoded in the component, but we can add it to the content management
                        }}
                        disabled
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">الشرح تحت الزر (العربية)</label>
                      <Textarea
                        value={language === 'en' 
                          ? 'A platform that connects clients with engineers to execute engineering projects professionally.' 
                          : 'منصة تربط العملاء بالمهندسين لتنفيذ المشاريع الهندسية باحترافية.'}
                        onChange={async (e) => {
                          // This content is hardcoded in the component, but we can add it to the content management
                        }}
                        disabled
                      />
                    </div>
                  </div>

                  <Button onClick={handleSave} className="bg-gold hover:bg-gold-dark">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>


            {/* About Company Section */}
            <TabsContent value="about-company">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>About Section (Company Landing)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title (English)</label>
                      <Input
                        value={content.about.title.en}
                        onChange={async (e) =>
                          await updateContent({
                            about: { ...content.about, title: { ...content.about.title, en: e.target.value } },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">العنوان (العربية)</label>
                      <Input
                        value={content.about.title.ar}
                        onChange={async (e) =>
                          await updateContent({
                            about: { ...content.about, title: { ...content.about.title, ar: e.target.value } },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Subtitle (English)</label>
                      <Textarea
                        value={content.about.subtitle.en}
                        onChange={async (e) =>
                          await updateContent({
                            about: { ...content.about, subtitle: { ...content.about.subtitle, en: e.target.value } },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">العنوان الفرعي (العربية)</label>
                      <Textarea
                        value={content.about.subtitle.ar}
                        onChange={async (e) =>
                          await updateContent({
                            about: { ...content.about, subtitle: { ...content.about.subtitle, ar: e.target.value } },
                          })
                        }
                      />
                    </div>
                  </div>

                  {/* Card 1 - Mission */}
                  <Card className="p-4 bg-secondary/30">
                    <h4 className="font-semibold mb-3">Card 1 - Mission</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Title (EN)"
                        value={content.about.card1.title.en}
                        onChange={async (e) => {
                          const newCard1 = { ...content.about.card1, title: { ...content.about.card1.title, en: e.target.value } };
                          await updateContent({ about: { ...content.about, card1: newCard1 } });
                        }}
                      />
                      <Input
                        placeholder="العنوان (AR)"
                        value={content.about.card1.title.ar}
                        onChange={async (e) => {
                          const newCard1 = { ...content.about.card1, title: { ...content.about.card1.title, ar: e.target.value } };
                          await updateContent({ about: { ...content.about, card1: newCard1 } });
                        }}
                      />
                      <Textarea
                        placeholder="Text (EN)"
                        value={content.about.card1.text.en}
                        onChange={async (e) => {
                          const newCard1 = { ...content.about.card1, text: { ...content.about.card1.text, en: e.target.value } };
                          await updateContent({ about: { ...content.about, card1: newCard1 } });
                        }}
                      />
                      <Textarea
                        placeholder="النص (AR)"
                        value={content.about.card1.text.ar}
                        onChange={async (e) => {
                          const newCard1 = { ...content.about.card1, text: { ...content.about.card1.text, ar: e.target.value } };
                          await updateContent({ about: { ...content.about, card1: newCard1 } });
                        }}
                      />
                    </div>
                  </Card>

                  {/* Card 2 - Vision */}
                  <Card className="p-4 bg-secondary/30">
                    <h4 className="font-semibold mb-3">Card 2 - Vision</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Title (EN)"
                        value={content.about.card2.title.en}
                        onChange={async (e) => {
                          const newCard2 = { ...content.about.card2, title: { ...content.about.card2.title, en: e.target.value } };
                          await updateContent({ about: { ...content.about, card2: newCard2 } });
                        }}
                      />
                      <Input
                        placeholder="العنوان (AR)"
                        value={content.about.card2.title.ar}
                        onChange={async (e) => {
                          const newCard2 = { ...content.about.card2, title: { ...content.about.card2.title, ar: e.target.value } };
                          await updateContent({ about: { ...content.about, card2: newCard2 } });
                        }}
                      />
                      <Textarea
                        placeholder="Text (EN)"
                        value={content.about.card2.text.en}
                        onChange={async (e) => {
                          const newCard2 = { ...content.about.card2, text: { ...content.about.card2.text, en: e.target.value } };
                          await updateContent({ about: { ...content.about, card2: newCard2 } });
                        }}
                      />
                      <Textarea
                        placeholder="النص (AR)"
                        value={content.about.card2.text.ar}
                        onChange={async (e) => {
                          const newCard2 = { ...content.about.card2, text: { ...content.about.card2.text, ar: e.target.value } };
                          await updateContent({ about: { ...content.about, card2: newCard2 } });
                        }}
                      />
                    </div>
                  </Card>

                  {/* Card 3 - Values */}
                  <Card className="p-4 bg-secondary/30">
                    <h4 className="font-semibold mb-3">Card 3 - Values</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Input
                        placeholder="Title (EN)"
                        value={content.about.card3.title.en}
                        onChange={async (e) => {
                          const newCard3 = { ...content.about.card3, title: { ...content.about.card3.title, en: e.target.value } };
                          await updateContent({ about: { ...content.about, card3: newCard3 } });
                        }}
                      />
                      <Input
                        placeholder="العنوان (AR)"
                        value={content.about.card3.title.ar}
                        onChange={async (e) => {
                          const newCard3 = { ...content.about.card3, title: { ...content.about.card3.title, ar: e.target.value } };
                          await updateContent({ about: { ...content.about, card3: newCard3 } });
                        }}
                      />
                      <Textarea
                        placeholder="Text (EN)"
                        value={content.about.card3.text.en}
                        onChange={async (e) => {
                          const newCard3 = { ...content.about.card3, text: { ...content.about.card3.text, en: e.target.value } };
                          await updateContent({ about: { ...content.about, card3: newCard3 } });
                        }}
                      />
                      <Textarea
                        placeholder="النص (AR)"
                        value={content.about.card3.text.ar}
                        onChange={async (e) => {
                          const newCard3 = { ...content.about.card3, text: { ...content.about.card3.text, ar: e.target.value } };
                          await updateContent({ about: { ...content.about, card3: newCard3 } });
                        }}
                      />
                    </div>
                  </Card>

                  <Button onClick={handleSave} className="bg-gold hover:bg-gold-dark">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* About Platform Section */}
            <TabsContent value="about-platform">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>About Section (Platform)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title (English)</label>
                      <Input
                        value={content.platformContent.heading.en}
                        onChange={async (e) =>
                          await updateContent({
                            platformContent: { ...content.platformContent, heading: { ...content.platformContent.heading, en: e.target.value } },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">العنوان (العربية)</label>
                      <Input
                        value={content.platformContent.heading.ar}
                        onChange={async (e) =>
                          await updateContent({
                            platformContent: { ...content.platformContent, heading: { ...content.platformContent.heading, ar: e.target.value } },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Subtitle (English)</label>
                      <Textarea
                        value={content.platformContent.slogan.en}
                        onChange={async (e) =>
                          await updateContent({
                            platformContent: { ...content.platformContent, slogan: { ...content.platformContent.slogan, en: e.target.value } },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">العنوان الفرعي (العربية)</label>
                      <Textarea
                        value={content.platformContent.slogan.ar}
                        onChange={async (e) =>
                          await updateContent({
                            platformContent: { ...content.platformContent, slogan: { ...content.platformContent.slogan, ar: e.target.value } },
                          })
                        }
                      />
                    </div>
                  </div>

                  <Button onClick={handleSave} className="bg-gold hover:bg-gold-dark">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Services Section */}
            <TabsContent value="services">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Services Section</CardTitle>
                  <Button onClick={addService} className="w-fit bg-gold hover:bg-gold-dark">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[...content.services].sort((a, b) => a.order - b.order).map((service, index) => (
                    <Card key={service.id} className="p-4 bg-secondary/30">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold">Service {index + 1}</h4>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => moveService(index, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => moveService(index, 'down')}
                            disabled={index === content.services.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteService(service.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          placeholder="Title (EN)"
                          value={service.title.en}
                          onChange={async (e) => {
                            const newServices = [...content.services];
                            const serviceIndex = newServices.findIndex(s => s.id === service.id);
                            newServices[serviceIndex].title.en = e.target.value;
                            await updateContent({ services: newServices });
                          }}
                        />
                        <Input
                          placeholder="العنوان (AR)"
                          value={service.title.ar}
                          onChange={async (e) => {
                            const newServices = [...content.services];
                            const serviceIndex = newServices.findIndex(s => s.id === service.id);
                            newServices[serviceIndex].title.ar = e.target.value;
                            await updateContent({ services: newServices });
                          }}
                        />
                        <Textarea
                          placeholder="Description (EN)"
                          value={service.description.en}
                          onChange={async (e) => {
                            const newServices = [...content.services];
                            const serviceIndex = newServices.findIndex(s => s.id === service.id);
                            newServices[serviceIndex].description.en = e.target.value;
                            await updateContent({ services: newServices });
                          }}
                        />
                        <Textarea
                          placeholder="الوصف (AR)"
                          value={service.description.ar}
                          onChange={async (e) => {
                            const newServices = [...content.services];
                            const serviceIndex = newServices.findIndex(s => s.id === service.id);
                            newServices[serviceIndex].description.ar = e.target.value;
                            await updateContent({ services: newServices });
                          }}
                        />
                        <Input
                          placeholder="Icon (e.g., Code, Smartphone)"
                          value={service.icon}
                          onChange={async (e) => {
                            const newServices = [...content.services];
                            const serviceIndex = newServices.findIndex(s => s.id === service.id);
                            newServices[serviceIndex].icon = e.target.value;
                            await updateContent({ services: newServices });
                          }}
                        />
                      </div>
                    </Card>
                  ))}

                  <Button onClick={handleSave} className="bg-gold hover:bg-gold-dark">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Projects Section */}
            <TabsContent value="projects">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Projects Section</CardTitle>
                  <Button onClick={addProject} className="w-fit bg-gold hover:bg-gold-dark">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Project
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[...content.projects].sort((a, b) => a.order - b.order).map((project, index) => (
                    <Card key={project.id} className="p-4 bg-secondary/30">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold">Project {index + 1}</h4>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => moveProject(index, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => moveProject(index, 'down')}
                            disabled={index === content.projects.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteProject(project.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          placeholder="Title (EN)"
                          value={project.title.en}
                          onChange={async (e) => {
                            const newProjects = [...content.projects];
                            const projectIndex = newProjects.findIndex(p => p.id === project.id);
                            newProjects[projectIndex].title.en = e.target.value;
                            await updateContent({ projects: newProjects });
                          }}
                        />
                        <Input
                          placeholder="العنوان (AR)"
                          value={project.title.ar}
                          onChange={async (e) => {
                            const newProjects = [...content.projects];
                            const projectIndex = newProjects.findIndex(p => p.id === project.id);
                            newProjects[projectIndex].title.ar = e.target.value;
                            await updateContent({ projects: newProjects });
                          }}
                        />
                        <Textarea
                          placeholder="Description (EN)"
                          value={project.description.en}
                          onChange={async (e) => {
                            const newProjects = [...content.projects];
                            const projectIndex = newProjects.findIndex(p => p.id === project.id);
                            newProjects[projectIndex].description.en = e.target.value;
                            await updateContent({ projects: newProjects });
                          }}
                        />
                        <Textarea
                          placeholder="الوصف (AR)"
                          value={project.description.ar}
                          onChange={async (e) => {
                            const newProjects = [...content.projects];
                            const projectIndex = newProjects.findIndex(p => p.id === project.id);
                            newProjects[projectIndex].description.ar = e.target.value;
                            await updateContent({ projects: newProjects });
                          }}
                        />
                        <Input
                          placeholder="Image URL"
                          value={project.image}
                          onChange={async (e) => {
                            const newProjects = [...content.projects];
                            const projectIndex = newProjects.findIndex(p => p.id === project.id);
                            newProjects[projectIndex].image = e.target.value;
                            await updateContent({ projects: newProjects });
                          }}
                        />
                      </div>
                    </Card>
                  ))}

                  <Button onClick={handleSave} className="bg-gold hover:bg-gold-dark">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Partners Section */}
            <TabsContent value="partners">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Partners Section</CardTitle>
                  <Button onClick={addPartner} className="w-fit bg-gold hover:bg-gold-dark">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Partner
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {[...content.partners].sort((a, b) => a.order - b.order).map((partner, index) => (
                    <Card key={partner.id} className="p-4 bg-secondary/30">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold">Partner {index + 1}</h4>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => movePartner(index, 'up')}
                            disabled={index === 0}
                          >
                            <ChevronUp className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => movePartner(index, 'down')}
                            disabled={index === content.partners.length - 1}
                          >
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deletePartner(partner.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          placeholder="Name (EN)"
                          value={partner.name.en}
                          onChange={async (e) => {
                            const newPartners = [...content.partners];
                            const partnerIndex = newPartners.findIndex(p => p.id === partner.id);
                            newPartners[partnerIndex].name.en = e.target.value;
                            await updateContent({ partners: newPartners });
                          }}
                        />
                        <Input
                          placeholder="الاسم (AR)"
                          value={partner.name.ar}
                          onChange={async (e) => {
                            const newPartners = [...content.partners];
                            const partnerIndex = newPartners.findIndex(p => p.id === partner.id);
                            newPartners[partnerIndex].name.ar = e.target.value;
                            await updateContent({ partners: newPartners });
                          }}
                        />
                        
                      
                        {/* File upload for logo */}
                        <div>
                          <label className="block text-sm font-medium mb-2">
                            Upload Logo (optional - will override Logo URL)
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // In a real implementation, you would upload the file to a server
                                // and get a URL back. For now, we'll just show a preview.
                                const reader = new FileReader();
                                reader.onload = async (event) => {
                                  if (event.target?.result) {
                                    // This is a simplified example - in reality, you would:
                                    // 1. Upload the file to your server/storage service
                                    // 2. Get back a URL for the uploaded image
                                    // 3. Update the partner.logo with that URL
                                    
                                    // For demonstration, we'll use the data URL directly
                                    // Note: This won't persist after refresh in a real app
                                    const newPartners = [...content.partners];
                                    const partnerIndex = newPartners.findIndex(p => p.id === partner.id);
                                    newPartners[partnerIndex].logo = event.target.result as string;
                                    await updateContent({ partners: newPartners });
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            className="w-full p-2 border border-border rounded-md bg-background"
                          />
                        </div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`active-${partner.id}`}
                            checked={partner.active}
                            onChange={async (e) => {
                              const newPartners = [...content.partners];
                              const partnerIndex = newPartners.findIndex(p => p.id === partner.id);
                              newPartners[partnerIndex].active = e.target.checked;
                              await updateContent({ partners: newPartners });
                            }}
                            className="h-4 w-4"
                          />
                          <label htmlFor={`active-${partner.id}`}>Active</label>
                        </div>
                      </div>
                    </Card>
                  ))}

                  <Button onClick={handleSave} className="bg-gold hover:bg-gold-dark">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Jobs Section */}
            <TabsContent value="jobs">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Jobs Section</CardTitle>
                  <Button onClick={addJob} className="w-fit bg-gold hover:bg-gold-dark">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Job
                  </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                  {content.jobs.map((job, index) => (
                    <Card key={job.id} className="p-4 bg-secondary/30">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-semibold">Job {index + 1}</h4>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteJob(job.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          placeholder="Title (EN)"
                          value={job.title.en}
                          onChange={async (e) => {
                            const newJobs = [...content.jobs];
                            const jobIndex = newJobs.findIndex(j => j.id === job.id);
                            newJobs[jobIndex].title.en = e.target.value;
                            await updateContent({ jobs: newJobs });
                          }}
                        />
                        <Input
                          placeholder="العنوان (AR)"
                          value={job.title.ar}
                          onChange={async (e) => {
                            const newJobs = [...content.jobs];
                            const jobIndex = newJobs.findIndex(j => j.id === job.id);
                            newJobs[jobIndex].title.ar = e.target.value;
                            await updateContent({ jobs: newJobs });
                          }}
                        />
                        <Textarea
                          placeholder="Description (EN)"
                          value={job.description.en}
                          onChange={async (e) => {
                            const newJobs = [...content.jobs];
                            const jobIndex = newJobs.findIndex(j => j.id === job.id);
                            newJobs[jobIndex].description.en = e.target.value;
                            await updateContent({ jobs: newJobs });
                          }}
                        />
                        <Textarea
                          placeholder="الوصف (AR)"
                          value={job.description.ar}
                          onChange={async (e) => {
                            const newJobs = [...content.jobs];
                            const jobIndex = newJobs.findIndex(j => j.id === job.id);
                            newJobs[jobIndex].description.ar = e.target.value;
                            await updateContent({ jobs: newJobs });
                          }}
                        />
                        <Input
                          placeholder="Application Link (optional)"
                          value={job.applicationLink || ''}
                          onChange={async (e) => {
                            const newJobs = [...content.jobs];
                            const jobIndex = newJobs.findIndex(j => j.id === job.id);
                            newJobs[jobIndex].applicationLink = e.target.value;
                            await updateContent({ jobs: newJobs });
                          }}
                        />
                        <div className="md:col-span-2 flex items-center space-x-2">
                          <input
                            type="checkbox"
                            id={`status-${job.id}`}
                            checked={job.status === 'active'}
                            onChange={async (e) => {
                              const newJobs = [...content.jobs];
                              const jobIndex = newJobs.findIndex(j => j.id === job.id);
                              newJobs[jobIndex].status = e.target.checked ? 'active' : 'inactive';
                              await updateContent({ jobs: newJobs });
                            }}
                            className="h-4 w-4"
                          />
                          <label htmlFor={`status-${job.id}`}>Active</label>
                        </div>
                      </div>
                    </Card>
                  ))}

                  <Button onClick={handleSave} className="bg-gold hover:bg-gold-dark">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* CTA Section */}
            <TabsContent value="cta">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Call to Action Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title (English)</label>
                      <Input
                        value={content.cta.title.en}
                        onChange={async (e) =>
                          await updateContent({
                            cta: { ...content.cta, title: { ...content.cta.title, en: e.target.value } },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">العنوان (العربية)</label>
                      <Input
                        value={content.cta.title.ar}
                        onChange={async (e) =>
                          await updateContent({
                            cta: { ...content.cta, title: { ...content.cta.title, ar: e.target.value } },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Subtitle (English)</label>
                      <Textarea
                        value={content.cta.subtitle.en}
                        onChange={async (e) =>
                          await updateContent({
                            cta: { ...content.cta, subtitle: { ...content.cta.subtitle, en: e.target.value } },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">العنوان الفرعي (العربية)</label>
                      <Textarea
                        value={content.cta.subtitle.ar}
                        onChange={async (e) =>
                          await updateContent({
                            cta: { ...content.cta, subtitle: { ...content.cta.subtitle, ar: e.target.value } },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Button Text (English)</label>
                      <Input
                        value={content.cta.button.en}
                        onChange={async (e) =>
                          await updateContent({
                            cta: { ...content.cta, button: { ...content.cta.button, en: e.target.value } },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">نص الزر (العربية)</label>
                      <Input
                        value={content.cta.button.ar}
                        onChange={async (e) =>
                          await updateContent({
                            cta: { ...content.cta, button: { ...content.cta.button, ar: e.target.value } },
                          })
                        }
                      />
                    </div>
                  </div>

                  <Button onClick={handleSave} className="bg-gold hover:bg-gold-dark">
                    Save Changes
                  </Button>
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