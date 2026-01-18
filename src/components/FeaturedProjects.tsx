import { useApp } from '@/context/AppContext';
import { Card, CardContent } from './ui/card';
import { useState, useEffect } from 'react';
import { projectsApi } from '@/services/projectsApi';
import { MapPin, Building2, Loader2 } from 'lucide-react';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';

export const FeaturedProjects = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch projects from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        // Fetch only approved and active projects for public display
        const response = await projectsApi.getProjects({
          limit: 6, // Show only 6 featured projects
          status: 'Waiting for Engineers',
        });
        
        // Filter to show only approved projects
        const approvedProjects = (response.data || []).filter((project: any) => {
          const adminApproval = project.adminApproval?.status || project.admin_approval?.status || '';
          return adminApproval === 'approved' && project.isActive !== false;
        });
        
        // Sort by creation date (newest first) and take first 6
        const sortedProjects = approvedProjects
          .sort((a: any, b: any) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateB - dateA;
          })
          .slice(0, 6);
        
        setProjects(sortedProjects);
      } catch (error: any) {
        console.error('Error fetching featured projects:', error);
        // Don't show error toast for public page - just set empty array
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProjects();
  }, [language]);

  // Define background colors for the project cards
  const getProjectBackground = (index: number) => {
    const backgrounds = [
      'from-gold/20 to-gold/10',
      'from-cyan/20 to-cyan/10',
      'from-gold/20 to-cyan/10'
    ];
    const colors = [
      'bg-gold',
      'bg-cyan',
      'bg-gradient-to-r from-gold to-cyan'
    ];
    return {
      background: backgrounds[index % backgrounds.length],
      color: colors[index % colors.length]
    };
  };

  // Format location string
  const formatLocation = (project: any) => {
    if (project.city && project.country) {
      return `${project.city}, ${project.country}`;
    }
    if (project.location) {
      return project.location;
    }
    if (project.city) {
      return project.city;
    }
    if (project.country) {
      return project.country;
    }
    return language === 'en' ? 'Location not specified' : 'الموقع غير محدد';
  };

  return (
    <section id="projects" className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">{language === 'en' ? 'Featured Projects' : 'المشاريع المميزة'}</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {language === 'en' 
                ? 'Explore available engineering projects and opportunities.' 
                : 'استكشف المشاريع الهندسية المتاحة والفرص.'}
            </p>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-gold" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>{language === 'en' ? 'No projects available at the moment.' : 'لا توجد مشاريع متاحة في الوقت الحالي.'}</p>
            </div>
          ) : (
            <div className="relative">
              <div className="flex overflow-x-auto gap-8 pb-4 scrollbar-hide">
                {projects.map((project, index) => {
                  const { background, color } = getProjectBackground(index);
                  return (
                    <div key={project._id || project.id} className="flex-shrink-0 w-80 md:w-96">
                      <Card className="glass-card rounded-xl overflow-hidden h-full hover:shadow-xl transition-shadow">
                        <div className={`h-48 bg-gradient-to-r ${background} flex items-center justify-center relative`}>
                          <div className={`w-16 h-16 ${color} rounded-full flex items-center justify-center`}>
                            <Building2 className="w-8 h-8 text-primary-foreground" />
                          </div>
                          {project.isNew && (
                            <Badge className="absolute top-4 right-4 bg-gold text-black">
                              {language === 'en' ? 'New' : 'جديد'}
                            </Badge>
                          )}
                        </div>
                        <CardContent className="p-6">
                          <h3 className="text-xl font-bold mb-3 line-clamp-2">{project.title}</h3>
                          <p className="text-muted-foreground mb-4 line-clamp-3 text-sm">
                            {project.description}
                          </p>
                          
                          {/* Location */}
                          <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
                            <MapPin className="w-4 h-4 text-gold" />
                            <span>{formatLocation(project)}</span>
                          </div>
                          
                          {/* Category */}
                          {project.category && (
                            <Badge variant="outline" className="mb-3 text-xs">
                              {project.category}
                            </Badge>
                          )}
                          
                          {/* View Details Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-4 border-gold text-gold hover:bg-gold hover:text-black"
                            onClick={() => {
                              // Navigate to project details if user is logged in, otherwise show login prompt
                              const token = localStorage.getItem('token');
                              if (token) {
                                navigate(`/engineer/projects/${project._id || project.id}`);
                              } else {
                                navigate('/auth/partner');
                              }
                            }}
                          >
                            {language === 'en' ? 'View Details' : 'عرض التفاصيل'}
                          </Button>
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
              {/* Gradient overlays for scroll indication */}
              <div className="absolute top-0 left-0 bottom-4 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none"></div>
              <div className="absolute top-0 right-0 bottom-4 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none"></div>
            </div>
          )}
        </div>
      </section>
  );
};