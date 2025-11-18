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

  const handleSave = () => {
    toast({
      title: language === 'en' ? 'Saved!' : 'تم الحفظ!',
      description: language === 'en' ? 'Content updated successfully' : 'تم تحديث المحتوى بنجاح',
    });
  };

  const addService = () => {
    const newService = {
      id: Date.now().toString(),
      order: content.services.length + 1,
      title: { en: 'New Service', ar: 'خدمة جديدة' },
      description: { en: 'Service description', ar: 'وصف الخدمة' },
      icon: 'Code',
    };
    updateContent({ services: [...content.services, newService] });
  };

  const deleteService = (id: string) => {
    updateContent({
      services: content.services.filter((s) => s.id !== id),
    });
  };

  const moveService = (index: number, direction: 'up' | 'down') => {
    const newServices = [...content.services];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newServices.length) return;
    
    [newServices[index], newServices[targetIndex]] = [newServices[targetIndex], newServices[index]];
    newServices.forEach((s, i) => s.order = i + 1);
    updateContent({ services: newServices });
  };

  const addProject = () => {
    const newProject = {
      id: Date.now().toString(),
      order: content.projects.length + 1,
      title: { en: 'New Project', ar: 'مشروع جديد' },
      description: { en: 'Project description', ar: 'وصف المشروع' },
      image: '/placeholder.svg',
    };
    updateContent({ projects: [...content.projects, newProject] });
  };

  const deleteProject = (id: string) => {
    updateContent({
      projects: content.projects.filter((p) => p.id !== id),
    });
  };

  const moveProject = (index: number, direction: 'up' | 'down') => {
    const newProjects = [...content.projects];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newProjects.length) return;
    
    [newProjects[index], newProjects[targetIndex]] = [newProjects[targetIndex], newProjects[index]];
    newProjects.forEach((p, i) => p.order = i + 1);
    updateContent({ projects: newProjects });
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
            <TabsList className="grid grid-cols-4 lg:grid-cols-7 gap-2">
              <TabsTrigger value="hero">Hero</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="cta">CTA</TabsTrigger>
              <TabsTrigger value="footer">Footer</TabsTrigger>
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
                        value={content.hero.title.en}
                        onChange={(e) =>
                          updateContent({
                            hero: { ...content.hero, title: { ...content.hero.title, en: e.target.value } },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">العنوان (العربية)</label>
                      <Input
                        value={content.hero.title.ar}
                        onChange={(e) =>
                          updateContent({
                            hero: { ...content.hero, title: { ...content.hero.title, ar: e.target.value } },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Subtitle (English)</label>
                      <Textarea
                        value={content.hero.subtitle.en}
                        onChange={(e) =>
                          updateContent({
                            hero: { ...content.hero, subtitle: { ...content.hero.subtitle, en: e.target.value } },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">العنوان الفرعي (العربية)</label>
                      <Textarea
                        value={content.hero.subtitle.ar}
                        onChange={(e) =>
                          updateContent({
                            hero: { ...content.hero, subtitle: { ...content.hero.subtitle, ar: e.target.value } },
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

            {/* About Section */}
            <TabsContent value="about">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>About Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Title (English)</label>
                      <Input
                        value={content.about.title.en}
                        onChange={(e) =>
                          updateContent({
                            about: { ...content.about, title: { ...content.about.title, en: e.target.value } },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">العنوان (العربية)</label>
                      <Input
                        value={content.about.title.ar}
                        onChange={(e) =>
                          updateContent({
                            about: { ...content.about, title: { ...content.about.title, ar: e.target.value } },
                          })
                        }
                      />
                    </div>
                  </div>

                  {content.about.values.map((value, index) => (
                    <Card key={value.id} className="p-4 bg-secondary/30">
                      <h4 className="font-semibold mb-3">Value Card {index + 1}</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          placeholder="Title (EN)"
                          value={value.title.en}
                          onChange={(e) => {
                            const newValues = [...content.about.values];
                            newValues[index].title.en = e.target.value;
                            updateContent({ about: { ...content.about, values: newValues } });
                          }}
                        />
                        <Input
                          placeholder="العنوان (AR)"
                          value={value.title.ar}
                          onChange={(e) => {
                            const newValues = [...content.about.values];
                            newValues[index].title.ar = e.target.value;
                            updateContent({ about: { ...content.about, values: newValues } });
                          }}
                        />
                        <Textarea
                          placeholder="Description (EN)"
                          value={value.description.en}
                          onChange={(e) => {
                            const newValues = [...content.about.values];
                            newValues[index].description.en = e.target.value;
                            updateContent({ about: { ...content.about, values: newValues } });
                          }}
                        />
                        <Textarea
                          placeholder="الوصف (AR)"
                          value={value.description.ar}
                          onChange={(e) => {
                            const newValues = [...content.about.values];
                            newValues[index].description.ar = e.target.value;
                            updateContent({ about: { ...content.about, values: newValues } });
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

            {/* Services Section */}
            <TabsContent value="services">
              <Card className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Services</CardTitle>
                  <Button onClick={addService} size="sm" className="bg-gold hover:bg-gold-dark">
                    <HexagonIcon size="sm" className="mr-2">
                      <Plus className="h-4 w-4" />
                    </HexagonIcon>
                    Add Service
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {content.services.map((service, index) => (
                    <Card key={service.id} className="p-4 bg-secondary/30">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Service {index + 1}</h4>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moveService(index, 'up')}
                            disabled={index === 0}
                          >
                            <HexagonIcon size="sm">
                              <ChevronUp className="h-4 w-4" />
                            </HexagonIcon>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moveService(index, 'down')}
                            disabled={index === content.services.length - 1}
                          >
                            <HexagonIcon size="sm">
                              <ChevronDown className="h-4 w-4" />
                            </HexagonIcon>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteService(service.id)}
                            className="text-destructive"
                          >
                            <HexagonIcon size="sm">
                              <Trash2 className="h-4 w-4" />
                            </HexagonIcon>
                          </Button>
                        </div>
                      </div>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          placeholder="Title (EN)"
                          value={service.title.en}
                          onChange={(e) => {
                            const newServices = [...content.services];
                            newServices[index].title.en = e.target.value;
                            updateContent({ services: newServices });
                          }}
                        />
                        <Input
                          placeholder="العنوان (AR)"
                          value={service.title.ar}
                          onChange={(e) => {
                            const newServices = [...content.services];
                            newServices[index].title.ar = e.target.value;
                            updateContent({ services: newServices });
                          }}
                        />
                        <Textarea
                          placeholder="Description (EN)"
                          value={service.description.en}
                          onChange={(e) => {
                            const newServices = [...content.services];
                            newServices[index].description.en = e.target.value;
                            updateContent({ services: newServices });
                          }}
                        />
                        <Textarea
                          placeholder="الوصف (AR)"
                          value={service.description.ar}
                          onChange={(e) => {
                            const newServices = [...content.services];
                            newServices[index].description.ar = e.target.value;
                            updateContent({ services: newServices });
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
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Featured Projects</CardTitle>
                  <Button onClick={addProject} size="sm" className="bg-gold hover:bg-gold-dark">
                    <HexagonIcon size="sm" className="mr-2">
                      <Plus className="h-4 w-4" />
                    </HexagonIcon>
                    Add Project
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  {content.projects.map((project, index) => (
                    <Card key={project.id} className="p-4 bg-secondary/30">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold">Project {index + 1}</h4>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moveProject(index, 'up')}
                            disabled={index === 0}
                          >
                            <HexagonIcon size="sm">
                              <ChevronUp className="h-4 w-4" />
                            </HexagonIcon>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => moveProject(index, 'down')}
                            disabled={index === content.projects.length - 1}
                          >
                            <HexagonIcon size="sm">
                              <ChevronDown className="h-4 w-4" />
                            </HexagonIcon>
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteProject(project.id)}
                            className="text-destructive"
                          >
                            <HexagonIcon size="sm">
                              <Trash2 className="h-4 w-4" />
                            </HexagonIcon>
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <Input
                            placeholder="Title (EN)"
                            value={project.title.en}
                            onChange={(e) => {
                              const newProjects = [...content.projects];
                              newProjects[index].title.en = e.target.value;
                              updateContent({ projects: newProjects });
                            }}
                          />
                          <Input
                            placeholder="العنوان (AR)"
                            value={project.title.ar}
                            onChange={(e) => {
                              const newProjects = [...content.projects];
                              newProjects[index].title.ar = e.target.value;
                              updateContent({ projects: newProjects });
                            }}
                          />
                          <Textarea
                            placeholder="Description (EN)"
                            value={project.description.en}
                            onChange={(e) => {
                              const newProjects = [...content.projects];
                              newProjects[index].description.en = e.target.value;
                              updateContent({ projects: newProjects });
                            }}
                          />
                          <Textarea
                            placeholder="الوصف (AR)"
                            value={project.description.ar}
                            onChange={(e) => {
                              const newProjects = [...content.projects];
                              newProjects[index].description.ar = e.target.value;
                              updateContent({ projects: newProjects });
                            }}
                          />
                        </div>
                        <Input
                          placeholder="Image URL"
                          value={project.image}
                          onChange={(e) => {
                            const newProjects = [...content.projects];
                            newProjects[index].image = e.target.value;
                            updateContent({ projects: newProjects });
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

            {/* Platform Features */}
            <TabsContent value="features">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Platform Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {content.platformFeatures.map((feature, index) => (
                    <Card key={feature.id} className="p-4 bg-secondary/30">
                      <h4 className="font-semibold mb-3">Feature {index + 1}</h4>
                      <div className="grid md:grid-cols-2 gap-4">
                        <Input
                          placeholder="Title (EN)"
                          value={feature.title.en}
                          onChange={(e) => {
                            const newFeatures = [...content.platformFeatures];
                            newFeatures[index].title.en = e.target.value;
                            updateContent({ platformFeatures: newFeatures });
                          }}
                        />
                        <Input
                          placeholder="العنوان (AR)"
                          value={feature.title.ar}
                          onChange={(e) => {
                            const newFeatures = [...content.platformFeatures];
                            newFeatures[index].title.ar = e.target.value;
                            updateContent({ platformFeatures: newFeatures });
                          }}
                        />
                        <Textarea
                          placeholder="Description (EN)"
                          value={feature.description.en}
                          onChange={(e) => {
                            const newFeatures = [...content.platformFeatures];
                            newFeatures[index].description.en = e.target.value;
                            updateContent({ platformFeatures: newFeatures });
                          }}
                        />
                        <Textarea
                          placeholder="الوصف (AR)"
                          value={feature.description.ar}
                          onChange={(e) => {
                            const newFeatures = [...content.platformFeatures];
                            newFeatures[index].description.ar = e.target.value;
                            updateContent({ platformFeatures: newFeatures });
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

            {/* CTA Section */}
            <TabsContent value="cta">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Call to Action</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Title (EN)"
                      value={content.cta.title.en}
                      onChange={(e) =>
                        updateContent({
                          cta: { ...content.cta, title: { ...content.cta.title, en: e.target.value } },
                        })
                      }
                    />
                    <Input
                      placeholder="العنوان (AR)"
                      value={content.cta.title.ar}
                      onChange={(e) =>
                        updateContent({
                          cta: { ...content.cta, title: { ...content.cta.title, ar: e.target.value } },
                        })
                      }
                    />
                    <Textarea
                      placeholder="Subtitle (EN)"
                      value={content.cta.subtitle.en}
                      onChange={(e) =>
                        updateContent({
                          cta: { ...content.cta, subtitle: { ...content.cta.subtitle, en: e.target.value } },
                        })
                      }
                    />
                    <Textarea
                      placeholder="العنوان الفرعي (AR)"
                      value={content.cta.subtitle.ar}
                      onChange={(e) =>
                        updateContent({
                          cta: { ...content.cta, subtitle: { ...content.cta.subtitle, ar: e.target.value } },
                        })
                      }
                    />
                  </div>

                  <Button onClick={handleSave} className="bg-gold hover:bg-gold-dark">
                    Save Changes
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Footer Section */}
            <TabsContent value="footer">
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle>Footer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-3">Navigation Links</h4>
                    {content.footer.links.map((link, index) => (
                      <div key={link.id} className="grid md:grid-cols-3 gap-4 mb-3">
                        <Input
                          placeholder="Label (EN)"
                          value={link.label.en}
                          onChange={(e) => {
                            const newLinks = [...content.footer.links];
                            newLinks[index].label.en = e.target.value;
                            updateContent({ footer: { ...content.footer, links: newLinks } });
                          }}
                        />
                        <Input
                          placeholder="العنوان (AR)"
                          value={link.label.ar}
                          onChange={(e) => {
                            const newLinks = [...content.footer.links];
                            newLinks[index].label.ar = e.target.value;
                            updateContent({ footer: { ...content.footer, links: newLinks } });
                          }}
                        />
                        <Input
                          placeholder="URL"
                          value={link.url}
                          onChange={(e) => {
                            const newLinks = [...content.footer.links];
                            newLinks[index].url = e.target.value;
                            updateContent({ footer: { ...content.footer, links: newLinks } });
                          }}
                        />
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="font-semibold mb-3">Social Links</h4>
                    {content.footer.socials.map((social, index) => (
                      <div key={social.id} className="grid md:grid-cols-2 gap-4 mb-3">
                        <Input
                          placeholder="Platform"
                          value={social.platform}
                          onChange={(e) => {
                            const newSocials = [...content.footer.socials];
                            newSocials[index].platform = e.target.value;
                            updateContent({ footer: { ...content.footer, socials: newSocials } });
                          }}
                        />
                        <Input
                          placeholder="URL"
                          value={social.url}
                          onChange={(e) => {
                            const newSocials = [...content.footer.socials];
                            newSocials[index].url = e.target.value;
                            updateContent({ footer: { ...content.footer, socials: newSocials } });
                          }}
                        />
                      </div>
                    ))}
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
