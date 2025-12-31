import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, MessageSquare, FileText, Briefcase, Send, CheckCircle, Star, Bell } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { projectsApi, Project, ProjectStatistics } from "@/services/projectsApi";
import { useUnreadNotificationsCount } from "@/hooks/useUnreadNotificationsCount";
import { useUnreadMessagesCount } from "@/hooks/useUnreadMessagesCount";
import { toast } from "@/components/ui/sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { http } from "@/services/http";

const EngineerDashboard = () => {
  const { language } = useApp();
  const navigate = useNavigate();

  const [statistics, setStatistics] = useState<ProjectStatistics>({});
  const [activeProjects, setActiveProjects] = useState<Project[]>([]);
  const [completedProjects, setCompletedProjects] = useState<Project[]>([]);
  const [proposals, setProposals] = useState<any[]>([]);
  const [chatRooms, setChatRooms] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [proposalsLoading, setProposalsLoading] = useState(true);
  const [chatRoomsLoading, setChatRoomsLoading] = useState(true);

  // Hooks for unread counts
  const { unreadCount: unreadNotificationsCount } = useUnreadNotificationsCount();
  const { unreadCount: unreadMessagesCount } = useUnreadMessagesCount();

  // Fetch statistics
  useEffect(() => {
    const fetchStatistics = async () => {
      try {
        const stats = await projectsApi.getStatistics();
        setStatistics(stats);
      } catch (error: any) {
        console.error('Error fetching statistics:', error);
        if (error.response?.status !== 404) {
          toast.error(language === 'en' ? 'Failed to load statistics' : 'فشل تحميل الإحصائيات');
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchStatistics();
  }, [language]);

  // Fetch active projects
  useEffect(() => {
    const fetchActiveProjects = async () => {
      try {
        setProjectsLoading(true);
        const response = await projectsApi.getProjects({ 
          page: 1, 
          limit: 5,
          status: "In Progress"
        });
        setActiveProjects(response.data || []);
      } catch (error: any) {
        console.error('Error fetching active projects:', error);
        if (error.response?.status !== 404) {
          toast.error(language === 'en' ? 'Failed to load projects' : 'فشل تحميل المشاريع');
        }
        setActiveProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    };
    
    fetchActiveProjects();
  }, [language]);

  // Fetch completed projects
  useEffect(() => {
    const fetchCompletedProjects = async () => {
      try {
        const response = await projectsApi.getProjects({ 
          page: 1, 
          limit: 5,
          status: "Completed"
        });
        setCompletedProjects(response.data || []);
      } catch (error: any) {
        console.error('Error fetching completed projects:', error);
        setCompletedProjects([]);
      }
    };
    
    fetchCompletedProjects();
  }, [language]);

  // Fetch proposals count
  useEffect(() => {
    const fetchProposals = async () => {
      try {
        setProposalsLoading(true);
        const response = await http.get("/proposals/my");
        let proposalsData = response.data;
        
        if (proposalsData && typeof proposalsData === 'object' && !Array.isArray(proposalsData)) {
          proposalsData = proposalsData.data || proposalsData.proposals || [];
        }
        
        if (!Array.isArray(proposalsData)) {
          proposalsData = [];
        }
        
        setProposals(proposalsData);
      } catch (error: any) {
        console.error('Error fetching proposals:', error);
        if (error.response?.status !== 404 && error.response?.status !== 403) {
          toast.error(language === 'en' ? 'Failed to load proposals' : 'فشل تحميل العروض');
        }
        setProposals([]);
      } finally {
        setProposalsLoading(false);
      }
    };
    
    fetchProposals();
  }, [language]);

  // Fetch chat rooms
  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        setChatRoomsLoading(true);
        const response = await projectsApi.getChatRooms();
        const activeRooms = (response.data || [])
          .filter((room: any) => room.lastMessage)
          .sort((a: any, b: any) => {
            const dateA = new Date(a.lastMessage?.createdAt || a.updatedAt || 0).getTime();
            const dateB = new Date(b.lastMessage?.createdAt || b.updatedAt || 0).getTime();
            return dateB - dateA;
          })
          .slice(0, 5);
        setChatRooms(activeRooms);
      } catch (error: any) {
        console.error('Error fetching chat rooms:', error);
        setChatRooms([]);
      } finally {
        setChatRoomsLoading(false);
      }
    };
    
    fetchChatRooms();
  }, [language]);

  // Calculate stats from API data
  const stats = [
    { 
      label: language === "en" ? "Active Projects" : "المشاريع النشطة", 
      value: statistics.byStatus?.["In Progress"] || statistics.inProgress || statistics.activeProjects || 0, 
      icon: FileText, 
      description: language === "en" ? "Projects you're working on" : "المشاريع التي تعمل عليها", 
      path: "/engineer/projects?tab=inProgress" 
    },
    { 
      label: language === "en" ? "Submitted Proposals" : "العروض المقدمة", 
      value: proposals.length || statistics.totalProposals || 0, 
      icon: Send, 
      description: language === "en" ? "Proposals you've submitted" : "العروض التي قدمتها", 
      path: "/engineer/projects?tab=waitingForAdminDecision" 
    },
    { 
      label: language === "en" ? "Completed Projects" : "المشاريع المكتملة", 
      value: statistics.byStatus?.["Completed"] || statistics.completed || 0, 
      icon: CheckCircle, 
      description: language === "en" ? "Projects you've completed" : "المشاريع التي أكملتها", 
      path: "/engineer/projects?tab=completed" 
    },
    { 
      label: language === "en" ? "Available Projects" : "المشاريع المتاحة", 
      value: statistics.byStatus?.["Waiting for Engineers"] || statistics.waitingForEngineers || 0, 
      icon: Briefcase, 
      description: language === "en" ? "Projects you can apply to" : "المشاريع التي يمكنك التقدم عليها", 
      path: "/engineer/available-projects" 
    },
  ];

  return (
    <DashboardLayout userType="engineer">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-hexa-secondary font-semibold">
                {getDashboardText("engineerDashboard", language)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h1 className="text-3xl font-bold text-hexa-text-dark">
            {getDashboardText("engineerDashboard", language)}
          </h1>
          <p className="text-hexa-text-light mt-1">
            {language === "en" ? "Welcome back! Here's your dashboard overview" : "مرحباً بعودتك! إليك نظرة عامة على لوحة التحكم"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card 
                key={idx} 
                className="bg-hexa-card border-hexa-border hover:border-hexa-secondary/50 transition-colors cursor-pointer"
                onClick={() => navigate(stat.path)}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-hexa-text-light mb-1">{stat.label}</p>
                      {loading && idx === 0 ? (
                        <Skeleton className="h-8 w-16 mb-1" />
                      ) : (
                        <p className="text-2xl font-bold text-hexa-text-dark mb-1">{stat.value}</p>
                      )}
                      <p className="text-xs text-hexa-text-light">{stat.description}</p>
                    </div>
                    <div className="p-3 bg-hexa-secondary/20 rounded-lg">
                      <Icon className="w-6 h-6 text-hexa-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Notifications and Messages Quick Access */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-hexa-card border-hexa-border hover:border-hexa-secondary/50 transition-colors cursor-pointer" onClick={() => navigate("/engineer/notifications")}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-hexa-secondary/20 rounded-lg">
                    <Bell className="w-6 h-6 text-hexa-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-hexa-text-light mb-1">
                      {getDashboardText("notifications", language)}
                    </p>
                    <p className="text-2xl font-bold text-hexa-text-dark">
                      {unreadNotificationsCount || 0}
                    </p>
                    <p className="text-xs text-hexa-text-light mt-1">
                      {language === "en" ? "Unread notifications" : "إشعارات غير مقروءة"}
                    </p>
                  </div>
                </div>
                {unreadNotificationsCount > 0 && (
                  <Badge className="bg-hexa-secondary text-black">
                    {unreadNotificationsCount}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-hexa-card border-hexa-border hover:border-hexa-secondary/50 transition-colors cursor-pointer" onClick={() => navigate("/engineer/messages")}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-hexa-secondary/20 rounded-lg">
                    <MessageSquare className="w-6 h-6 text-hexa-secondary" />
                  </div>
                  <div>
                    <p className="text-sm text-hexa-text-light mb-1">
                      {getDashboardText("messages", language)}
                    </p>
                    <p className="text-2xl font-bold text-hexa-text-dark">
                      {unreadMessagesCount?.total || 0}
                    </p>
                    <p className="text-xs text-hexa-text-light mt-1">
                      {language === "en" ? "Unread messages" : "رسائل غير مقروءة"}
                    </p>
                  </div>
                </div>
                {(unreadMessagesCount?.total || 0) > 0 && (
                  <Badge className="bg-hexa-secondary text-black">
                    {unreadMessagesCount?.total || 0}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Projects */}
        <Card className="bg-hexa-card border-hexa-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-hexa-text-dark">{getDashboardText("myProjects", language)}</CardTitle>
              <CardDescription className="text-hexa-text-light">
                {language === "en" ? "Your active projects" : "مشاريعك النشطة"}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/engineer/projects?tab=inProgress")}
              className="border-hexa-border bg-hexa-card text-hexa-text-light hover:bg-hexa-secondary/20 hover:text-hexa-secondary hover:border-hexa-secondary"
            >
              {language === "en" ? "View All" : "عرض الكل"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectsLoading ? (
                <div className="space-y-4">
                  {[1, 2].map((i) => (
                    <div key={i} className="p-4 border border-hexa-border rounded-lg bg-hexa-bg">
                      <Skeleton className="h-5 w-3/4 mb-3" />
                      <Skeleton className="h-9 w-full" />
                    </div>
                  ))}
                </div>
              ) : activeProjects.length > 0 ? (
                activeProjects.map((project) => (
                  <div 
                    key={project._id || project.id} 
                    className="p-4 border border-hexa-border rounded-lg hover:bg-hexa-bg transition-colors bg-hexa-bg cursor-pointer"
                    onClick={() => navigate(`/engineer/projects/${project._id || project.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-hexa-text-dark">{project.title}</h3>
                        {project.location && (
                          <p className="text-sm text-hexa-text-light mt-1 flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {project.location}
                          </p>
                        )}
                      </div>
                      <Badge className="bg-hexa-secondary/20 text-hexa-secondary border-hexa-secondary/40 font-medium">
                        {getDashboardText("inProgress", language)}
                      </Badge>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/engineer/messages?project=${project._id || project.id}`);
                        }}
                        className="flex-1 border-hexa-border bg-hexa-card text-hexa-text-light hover:bg-hexa-secondary hover:text-black hover:border-hexa-secondary transition-all"
                      >
                        <MessageSquare className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                        {getDashboardText("chat", language)}
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-16 h-16 text-hexa-text-light mx-auto mb-4 opacity-50" />
                  <p className="text-hexa-text-light">
                    {language === "en" ? "No active projects yet" : "لا توجد مشاريع نشطة بعد"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Completed Projects */}
        <Card className="bg-hexa-card border-hexa-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div>
              <CardTitle className="text-hexa-text-dark">
                {language === "en" ? "Completed Projects" : "المشاريع المكتملة"}
              </CardTitle>
              <CardDescription className="text-hexa-text-light">
                {language === "en" ? "Your recently completed projects" : "مشاريعك المكتملة مؤخراً"}
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/engineer/projects?tab=completed")}
              className="border-hexa-border bg-hexa-card text-hexa-text-light hover:bg-hexa-secondary/20 hover:text-hexa-secondary hover:border-hexa-secondary"
            >
              {language === "en" ? "View All" : "عرض الكل"}
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {completedProjects.length > 0 ? (
                completedProjects.map((project) => (
                  <div 
                    key={project._id || project.id} 
                    className="p-4 border border-hexa-border rounded-lg hover:bg-hexa-bg transition-colors bg-hexa-bg cursor-pointer"
                    onClick={() => navigate(`/engineer/projects/${project._id || project.id}`)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-hexa-text-dark mb-1">{project.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-hexa-text-light">
                          {project.location && (
                            <>
                              <MapPin className="w-4 h-4 text-hexa-secondary" />
                              <span>{project.location}</span>
                            </>
                          )}
                          {project.category && (
                            <>
                              <span className="mx-1">•</span>
                              <span>{project.category}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <Badge className="bg-hexa-secondary/20 text-hexa-secondary border-hexa-secondary/40 font-medium">
                        {getDashboardText("completed", language)}
                      </Badge>
                    </div>
                    {project.completedAt && (
                      <div className="pt-3 border-t border-hexa-border">
                        <span className="text-xs text-hexa-text-light">
                          {language === "en" 
                            ? `Completed on ${new Date(project.completedAt).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US")}` 
                            : `مكتمل في ${new Date(project.completedAt).toLocaleDateString("ar-SA")}`
                          }
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-hexa-text-light mx-auto mb-4 opacity-50" />
                  <p className="text-hexa-text-light">
                    {language === "en" ? "No completed projects yet" : "لا توجد مشاريع مكتملة بعد"}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Active Conversations Section */}
        {chatRooms.length > 0 && (
          <Card className="bg-hexa-card border-hexa-border">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-hexa-text-dark text-xl">
                  {language === "en" ? "Active Conversations" : "المحادثات النشطة"}
                </CardTitle>
                <CardDescription className="text-hexa-text-light mt-1">
                  {language === "en" ? "Recent conversations with clients and admins" : "المحادثات الأخيرة مع العملاء والإدارة"}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/engineer/messages")}
                className="border-hexa-border bg-hexa-card text-hexa-text-light hover:bg-hexa-secondary/20 hover:text-hexa-secondary hover:border-hexa-secondary"
              >
                {language === "en" ? "View All" : "عرض الكل"}
              </Button>
            </CardHeader>
            <CardContent>
              {chatRoomsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-hexa-bg/50">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  {chatRooms.map((room) => {
                    const projectTitle = room.project?.title || (language === "en" ? "Project" : "مشروع");
                    const lastMessage = room.lastMessage?.content || "";
                    const unreadCount = room.unreadCount || 0;
                    const participants = room.participants || [];
                    const otherParticipants = participants.filter((p: any) => {
                      const userId = typeof p.user === 'string' ? p.user : (p.user?._id || p.user?.id);
                      return userId;
                    });

                    return (
                      <div
                        key={room._id}
                        className="flex items-center gap-4 p-4 rounded-lg bg-hexa-bg/50 hover:bg-hexa-bg cursor-pointer transition-colors border border-hexa-border hover:border-hexa-secondary/50"
                        onClick={() => navigate(`/engineer/messages?room=${room._id}`)}
                      >
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full bg-hexa-secondary/20 flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-hexa-secondary" />
                          </div>
                          {unreadCount > 0 && (
                            <Badge className="absolute -top-1 -right-1 bg-hexa-secondary text-black text-xs px-1.5 py-0.5 min-w-[20px] flex items-center justify-center">
                              {unreadCount}
                            </Badge>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-hexa-text-dark truncate">
                              {projectTitle}
                            </p>
                            {room.lastMessage?.createdAt && (
                              <span className="text-xs text-hexa-text-light flex-shrink-0">
                                {new Date(room.lastMessage.createdAt).toLocaleDateString(language === "ar" ? "ar-SA" : "en-US", {
                                  month: "short",
                                  day: "numeric",
                                })}
                              </span>
                            )}
                          </div>
                          {lastMessage && (
                            <p className="text-xs text-hexa-text-light truncate">
                              {lastMessage.length > 60 ? `${lastMessage.substring(0, 60)}...` : lastMessage}
                            </p>
                          )}
                          {otherParticipants.length > 0 && (
                            <p className="text-xs text-hexa-text-light mt-1">
                              {language === "en" ? "With: " : "مع: "}
                              {otherParticipants.slice(0, 2).map((p: any) => {
                                const name = typeof p.user === 'object' ? (p.user?.name || p.user?.email) : "";
                                return name;
                              }).filter(Boolean).join(", ")}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EngineerDashboard;

