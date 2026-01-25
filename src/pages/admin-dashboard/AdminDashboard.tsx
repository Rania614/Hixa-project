import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminTopBar';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Briefcase, 
  FileText, 
  MessageSquare, 
  BarChart3,
  CheckCircle,
  Clock,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { HexagonIcon } from '@/components/ui/hexagon-icon';
import { http } from '@/services/http';
import { toast } from '@/components/ui/sonner';

const AdminDashboard = () => {
  const { language } = useApp();
  const isAr = language === 'ar';
  
  // State
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState([
    {
      title: isAr ? 'مستخدمون جدد' : 'New Users',
      value: '0',
      change: '+0%',
      icon: Users,
      color: 'text-cyan',
    },
    {
      title: isAr ? 'مشاريع نشطة' : 'Active Projects',
      value: '0',
      change: '+0%',
      icon: Briefcase,
      color: 'text-cyan',
    },
    {
      title: isAr ? 'مستندات مرفوعة' : 'Documents Uploaded',
      value: '0',
      change: '+0%',
      icon: FileText,
      color: 'text-cyan',
    },
    {
      title: isAr ? 'قيد المراجعة' : 'Pending Reviews',
      value: '0',
      change: '+0%',
      icon: Clock,
      color: 'text-cyan',
    },
  ]);
  
  const [userStats, setUserStats] = useState([
    { status: isAr ? 'مهندسين نشطين' : 'Active Engineers', count: 0, icon: CheckCircle, color: 'text-green-500' },
    { status: isAr ? 'عملاء نشطين' : 'Active Clients', count: 0, icon: CheckCircle, color: 'text-green-500' },
    { status: isAr ? 'قيد التحقق' : 'Pending Verification', count: 0, icon: Clock, color: 'text-yellow-500' },
    { status: isAr ? 'معلقين' : 'Suspended', count: 0, icon: AlertCircle, color: 'text-red-500' },
  ]);
  
  const [totalProjects, setTotalProjects] = useState(0);
  const [projectsList, setProjectsList] = useState<any[]>([]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      
      try {
        // Fetch all data in parallel
        const [projectsStatsRes, subscribersStatsRes, projectsRes, pendingProjectsRes, usersRes] = await Promise.all([
          http.get('/projects/statistics').catch(() => ({ data: null })),
          http.get('/subscribers/statistics').catch(() => ({ data: null })),
          http.get('/projects').catch(() => ({ data: [] })), // Get all projects to display names
          http.get('/projects/pending').catch(() => ({ data: [] })),
          http.get('/users').catch(() => ({ data: [] })),
        ]);

        // Process Projects Statistics - GET /api/projects/statistics
        let activeProjects = 0;
        let activeProjectsChange = 0;
        let pendingReviews = 0;
        let pendingReviewsChange = 0;
        let totalProjectsCount = 0;
        
        if (projectsStatsRes.data) {
          activeProjects = projectsStatsRes.data.activeProjects || projectsStatsRes.data.totalActive || projectsStatsRes.data.count || 0;
          activeProjectsChange = projectsStatsRes.data.activeProjectsChange || projectsStatsRes.data.change || 0;
          pendingReviews = projectsStatsRes.data.pending || projectsStatsRes.data.pendingProjects || 0;
          pendingReviewsChange = projectsStatsRes.data.pendingChange || -2;
          // Get total projects from statistics
          totalProjectsCount = projectsStatsRes.data.total || projectsStatsRes.data.totalProjects || projectsStatsRes.data.count || 0;
        }

        // Process Pending Projects - GET /api/projects/pending
        if (Array.isArray(pendingProjectsRes.data)) {
          pendingReviews = pendingProjectsRes.data.length;
        } else if (pendingProjectsRes.data?.data && Array.isArray(pendingProjectsRes.data.data)) {
          pendingReviews = pendingProjectsRes.data.data.length;
        } else if (pendingProjectsRes.data?.projects && Array.isArray(pendingProjectsRes.data.projects)) {
          pendingReviews = pendingProjectsRes.data.projects.length;
        }

        // Process Subscribers Statistics - GET /api/subscribers/statistics (for New Users)
        let newUsers = 0;
        let newUsersChange = 0;
        if (subscribersStatsRes.data) {
          newUsers = subscribersStatsRes.data.total || subscribersStatsRes.data.count || subscribersStatsRes.data.newUsers || 0;
          newUsersChange = subscribersStatsRes.data.change || subscribersStatsRes.data.newUsersChange || 0;
        }

        // Process Projects - GET /api/projects to get total count and list
        let allProjectsList: any[] = [];
        if (projectsRes.data) {
          if (Array.isArray(projectsRes.data)) {
            allProjectsList = projectsRes.data;
            if (totalProjectsCount === 0) totalProjectsCount = projectsRes.data.length;
          } else if (projectsRes.data.data && Array.isArray(projectsRes.data.data)) {
            allProjectsList = projectsRes.data.data;
            if (totalProjectsCount === 0) totalProjectsCount = projectsRes.data.data.length;
          } else if (projectsRes.data.projects && Array.isArray(projectsRes.data.projects)) {
            allProjectsList = projectsRes.data.projects;
            if (totalProjectsCount === 0) totalProjectsCount = projectsRes.data.projects.length;
          } else if (projectsRes.data.total !== undefined) {
            totalProjectsCount = projectsRes.data.total;
          } else if (projectsRes.data.count !== undefined) {
            totalProjectsCount = projectsRes.data.count;
          }
        }

        // Sort projects from oldest to newest (by createdAt or date)
        allProjectsList.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.date || a.created_at || 0).getTime();
          const dateB = new Date(b.createdAt || b.date || b.created_at || 0).getTime();
          return dateA - dateB; // Oldest first
        });

        // Process Users Statistics - GET /api/users
        let activeEngineers = 0;
        let activeClients = 0;
        let pendingVerification = 0;
        let suspended = 0;
        
        if (usersRes.data) {
          let usersList: any[] = [];
          if (Array.isArray(usersRes.data)) {
            usersList = usersRes.data;
          } else if (usersRes.data.data && Array.isArray(usersRes.data.data)) {
            usersList = usersRes.data.data;
          } else if (usersRes.data.users && Array.isArray(usersRes.data.users)) {
            usersList = usersRes.data.users;
          }

          usersList.forEach((user: any) => {
            const role = (user.role || '').toLowerCase();
            const status = (user.status || user.isActive !== undefined ? (user.isActive ? 'active' : 'inactive') : 'active').toLowerCase();
            const isVerified = user.isVerified !== false && user.verified !== false;

            if (role === 'engineer' || role === 'partner') {
              if (status === 'active' && isVerified) activeEngineers++;
              else if (!isVerified) pendingVerification++;
              else if (status === 'suspended' || status === 'inactive') suspended++;
            } else if (role === 'client' || role === 'customer') {
              if (status === 'active' && isVerified) activeClients++;
              else if (!isVerified) pendingVerification++;
              else if (status === 'suspended' || status === 'inactive') suspended++;
            }
          });
        }

        // Update metrics
        setMetrics([
          {
            title: isAr ? 'مستخدمون جدد' : 'New Users',
            value: newUsers.toString(),
            change: newUsersChange >= 0 ? `+${newUsersChange}%` : `${newUsersChange}%`,
            icon: Users,
            color: 'text-cyan',
          },
          {
            title: isAr ? 'مشاريع نشطة' : 'Active Projects',
            value: activeProjects.toString(),
            change: activeProjectsChange >= 0 ? `+${activeProjectsChange}%` : `${activeProjectsChange}%`,
            icon: Briefcase,
            color: 'text-cyan',
          },
          {
            title: isAr ? 'مستندات مرفوعة' : 'Documents Uploaded',
            value: '0', // TODO: No endpoint available yet
            change: '+0%',
            icon: FileText,
            color: 'text-cyan',
          },
          {
            title: isAr ? 'قيد المراجعة' : 'Pending Reviews',
            value: pendingReviews.toString(),
            change: pendingReviewsChange >= 0 ? `+${pendingReviewsChange}%` : `${pendingReviewsChange}%`,
            icon: Clock,
            color: 'text-cyan',
          },
        ]);

        // Update user stats
        setUserStats([
          { status: isAr ? 'مهندسين نشطين' : 'Active Engineers', count: activeEngineers, icon: CheckCircle, color: 'text-green-500' },
          { status: isAr ? 'عملاء نشطين' : 'Active Clients', count: activeClients, icon: CheckCircle, color: 'text-green-500' },
          { status: isAr ? 'قيد التحقق' : 'Pending Verification', count: pendingVerification, icon: Clock, color: 'text-yellow-500' },
          { status: isAr ? 'معلقين' : 'Suspended', count: suspended, icon: AlertCircle, color: 'text-red-500' },
        ]);

        // Update total projects count and list
        setTotalProjects(totalProjectsCount);
        setProjectsList(allProjectsList);

      } catch (error: any) {
        console.error('Error fetching dashboard data:', error);
        toast.error(isAr ? 'حدث خطأ أثناء جلب البيانات' : 'Error fetching dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAr]);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1">
        <AdminTopBar />
        
        <main className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              {language === 'en' ? 'Dashboard Overview' : 'نظرة عامة على لوحة التحكم'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'en'
                ? 'Monitor platform activity, user management, and project progress'
                : 'مراقبة نشاط المنصة، إدارة المستخدمين، وتقدم المشاريع'}
            </p>
          </div>

          {/* Overview Metrics */}
          {/* 
            API Endpoints Used:
            - GET /api/projects/statistics (Active Projects, Pending Reviews)
            - GET /api/subscribers/statistics (New Users)
            - GET /api/projects/pending (Pending Reviews count)
            - Documents Uploaded: No endpoint available yet
          */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <Card key={index} className="glass-card">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-center h-20">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              metrics.map((metric, index) => (
              <Card key={index} className="glass-card">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </CardTitle>
                  <HexagonIcon size="sm" className={metric.color}>
                    <metric.icon className={`h-5 w-5 ${metric.color}`} />
                  </HexagonIcon>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{metric.value}</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {metric.change} {isAr ? 'من الشهر الماضي' : 'from last month'}
                    </p>
                </CardContent>
              </Card>
              ))
            )}
          </div>

          {/* User Management and Project Status */}
          {/* 
            API Endpoints Used:
            - GET /api/users (User Statistics - Active Engineers, Clients, Pending Verification, Suspended)
            - GET /api/projects?limit=4 (Recent Projects)
          */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* User Management */}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>
                  {isAr ? 'إدارة المستخدمين' : 'User Management'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : (
                <div className="space-y-4">
                  {userStats.map((stat, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <HexagonIcon size="sm" className={stat.color}>
                          <stat.icon className={`h-4 w-4 ${stat.color}`} />
                        </HexagonIcon>
                        <span>{stat.status}</span>
                      </div>
                      <span className="font-semibold">{stat.count}</span>
                    </div>
                  ))}
                </div>
                )}
              </CardContent>
            </Card>

            {/* Projects List - Oldest to Newest */}
            {/* API Endpoint: GET /api/projects (sorted by createdAt - oldest first) */}
            <Card className="glass-card">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle>
                  {isAr ? 'عدد المشاريع' : 'Total Projects'}
                </CardTitle>
                <HexagonIcon size="sm" className="text-cyan">
                  <Briefcase className="h-5 w-5 text-cyan" />
                </HexagonIcon>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                      </div>
                ) : (
                  <div className="space-y-3">
                    <div className="text-center pb-3 border-b border-border/50">
                      <div className="text-3xl font-bold mb-1">{totalProjects}</div>
                      <p className="text-xs text-muted-foreground">
                        {isAr ? 'إجمالي المشاريع على المنصة' : 'Total projects on the platform'}
                      </p>
                        </div>
                    {projectsList.length === 0 ? (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        {isAr ? 'لا توجد مشاريع' : 'No projects found'}
                      </div>
                    ) : (
                      <div className="max-h-[400px] overflow-y-auto space-y-2 pr-2">
                        {projectsList.map((project, index) => (
                          <div 
                            key={project._id || project.id || index} 
                            className="flex items-center justify-between p-2 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-sm truncate">
                                {project.title || project.name || (isAr ? `مشروع ${index + 1}` : `Project ${index + 1}`)}
                              </h4>
                              {project.createdAt && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  {new Date(project.createdAt).toLocaleDateString(
                                    isAr ? 'ar-SA' : 'en-US',
                                    { year: 'numeric', month: 'short', day: 'numeric' }
                                  )}
                                </p>
                              )}
                      </div>
                            <span className="text-xs text-muted-foreground ml-2 flex-shrink-0">
                              #{index + 1}
                            </span>
                    </div>
                  ))}
                </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Documents and Communication */}
          {/* 
            TODO: API Endpoints Not Available Yet
            - Recent Documents: No endpoint available yet
            - Communication Overview: No endpoint available yet
          */}
          {/* 
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Documents - TODO: No API endpoint available yet *}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>
                  {isAr ? 'أحدث المستندات المرفوعة' : 'Recent Document Uploads'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  {isAr ? 'API غير متوفر حالياً' : 'API not available yet'}
                </div>
              </CardContent>
            </Card>

            {/* Communication Overview - TODO: No API endpoint available yet *}
            <Card className="glass-card">
              <CardHeader>
                <CardTitle>
                  {isAr ? 'نظرة عامة على التواصل' : 'Communication Overview'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  {isAr ? 'API غير متوفر حالياً' : 'API not available yet'}
                </div>
              </CardContent>
            </Card>
          </div>
          */}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;