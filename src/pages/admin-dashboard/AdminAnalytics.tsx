import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminTopBar';
import { useApp } from '@/context/AppContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Eye, 
  Activity, 
  BarChart3,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { http } from '@/services/http';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HexagonIcon } from '@/components/ui/hexagon-icon';

// Type definitions
interface VisitorStats {
  total: number;
  unique: number;
}

interface PageView {
  page: string;
  views: number;
  uniqueViews: number;
}

interface EventData {
  event: string;
  count: number;
  lastOccurrence: string;
}

interface ActivityItem {
  id: string;
  event: string;
  page: string;
  userId?: string;
  timestamp: string;
}

interface DailyStat {
  date: string;
  visitors: number;
  sessions: number;
  pageViews: number;
}

const AdminAnalytics = () => {
  const { language } = useApp();
  const isAr = language === 'ar';
  
  // State
  const [loading, setLoading] = useState(true);
  const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null);
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch all analytics endpoints in parallel
        const [visitorsRes, pageViewsRes, eventsRes, activityRes, dailyRes] = await Promise.all([
          http.get('/admin/analytics/visitors').catch(() => ({ data: null })),
          http.get('/admin/analytics/page-views').catch(() => ({ data: [] })),
          http.get('/admin/analytics/events').catch(() => ({ data: [] })),
          http.get('/admin/analytics/activity').catch(() => ({ data: [] })),
          http.get('/admin/analytics/daily').catch(() => ({ data: [] })),
        ]);

        // Set visitor stats
        if (visitorsRes.data) {
          setVisitorStats({
            total: visitorsRes.data.total || visitorsRes.data.totalVisitors || 0,
            unique: visitorsRes.data.unique || visitorsRes.data.uniqueVisitors || 0,
          });
        } else {
          setVisitorStats({ total: 0, unique: 0 });
        }

        // Set page views
        const pageViewsData = pageViewsRes.data || [];
        setPageViews(Array.isArray(pageViewsData) ? pageViewsData : []);

        // Set events
        const eventsData = eventsRes.data || [];
        setEvents(Array.isArray(eventsData) ? eventsData : []);

        // Set activity
        const activityData = activityRes.data || [];
        setActivity(Array.isArray(activityData) ? activityData : []);

        // Set daily stats
        const dailyData = dailyRes.data || [];
        setDailyStats(Array.isArray(dailyData) ? dailyData : []);

      } catch (err: any) {
        console.error('Error fetching analytics:', err);
        setError(
          err.response?.data?.message || 
          (isAr ? 'حدث خطأ أثناء جلب البيانات' : 'Error fetching analytics data')
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [isAr]);

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat(isAr ? 'ar-SA' : 'en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  // Format date for daily stats
  const formatDailyDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat(isAr ? 'ar-SA' : 'en-US', {
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1">
        <AdminTopBar />
        
        <main className="p-8">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-2">
              {isAr ? 'التحليلات والإحصائيات' : 'Analytics & Statistics'}
            </h2>
            <p className="text-muted-foreground">
              {isAr
                ? 'مراقبة نشاط المستخدمين وإحصائيات المنصة'
                : 'Monitor user activity and platform statistics'}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">
                  {isAr ? 'جاري تحميل البيانات...' : 'Loading analytics...'}
                </p>
              </div>
            </div>
          ) : error ? (
            <Card className="glass-card">
              <CardContent className="p-6 text-center">
                <p className="text-destructive">{error}</p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {isAr ? 'إجمالي الزوار' : 'Total Visitors'}
                    </CardTitle>
                    <HexagonIcon size="sm" className="text-cyan">
                      <Users className="h-5 w-5 text-cyan" />
                    </HexagonIcon>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {visitorStats?.total || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isAr ? 'إجمالي زوار' : 'Total visitors'}
                    </p>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {isAr ? 'إجمالي الجلسات' : 'Total Sessions'}
                    </CardTitle>
                    <HexagonIcon size="sm" className="text-cyan">
                      <Activity className="h-5 w-5 text-cyan" />
                    </HexagonIcon>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {visitorStats?.unique || 0}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {isAr ? 'زوار فريدون' : 'Unique visitors'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Page Views and Events Tables */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Page Views Table */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      {isAr ? 'مشاهدات الصفحات' : 'Page Views'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {pageViews.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {isAr ? 'لا توجد بيانات' : 'No data available'}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{isAr ? 'الصفحة' : 'Page'}</TableHead>
                              <TableHead className="text-right">
                                {isAr ? 'المشاهدات' : 'Views'}
                              </TableHead>
                              <TableHead className="text-right">
                                {isAr ? 'فريدة' : 'Unique'}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pageViews.slice(0, 10).map((pv, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  {pv.page || (isAr ? 'غير معروف' : 'Unknown')}
                                </TableCell>
                                <TableCell className="text-right">
                                  {pv.views || 0}
                                </TableCell>
                                <TableCell className="text-right">
                                  {pv.uniqueViews || 0}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Events Table */}
                <Card className="glass-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="h-5 w-5" />
                      {isAr ? 'الأحداث' : 'Events'}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {events.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        {isAr ? 'لا توجد بيانات' : 'No data available'}
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>{isAr ? 'الحدث' : 'Event'}</TableHead>
                              <TableHead className="text-right">
                                {isAr ? 'العدد' : 'Count'}
                              </TableHead>
                              <TableHead>
                                {isAr ? 'آخر مرة' : 'Last Occurrence'}
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {events.slice(0, 10).map((event, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  {event.event || (isAr ? 'غير معروف' : 'Unknown')}
                                </TableCell>
                                <TableCell className="text-right">
                                  {event.count || 0}
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  {event.lastOccurrence ? formatDate(event.lastOccurrence) : '-'}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Activity Timeline */}
              <Card className="glass-card mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    {isAr ? 'نشاط حديث' : 'Recent Activity'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {activity.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      {isAr ? 'لا توجد نشاطات حديثة' : 'No recent activity'}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {activity.slice(0, 20).map((item) => (
                        <div
                          key={item.id}
                          className="flex items-start justify-between p-4 bg-muted/30 rounded-lg border border-border/50"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium">{item.event}</span>
                              <span className="text-sm text-muted-foreground">
                                {isAr ? 'على' : 'on'} {item.page}
                              </span>
                            </div>
                            {item.userId && (
                              <p className="text-xs text-muted-foreground">
                                {isAr ? 'المستخدم' : 'User'}: {item.userId.slice(0, 8)}...
                              </p>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(item.timestamp)}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Daily Stats Chart Placeholder */}
              <Card className="glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {isAr ? 'الإحصائيات اليومية' : 'Daily Statistics'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dailyStats.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>{isAr ? 'لا توجد بيانات للإحصائيات اليومية' : 'No daily statistics data available'}</p>
                      <p className="text-xs mt-2">
                        {isAr 
                          ? 'سيتم عرض الرسوم البيانية هنا قريباً' 
                          : 'Charts will be displayed here soon'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Placeholder for chart - will be replaced with actual chart library */}
                      <div className="h-64 flex items-center justify-center bg-muted/30 rounded-lg border border-border/50">
                        <div className="text-center">
                          <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                          <p className="text-sm text-muted-foreground">
                            {isAr ? 'مخطط الإحصائيات اليومية' : 'Daily Statistics Chart'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {isAr 
                              ? 'سيتم دمج مكتبة الرسوم البيانية هنا' 
                              : 'Chart library integration coming soon'}
                          </p>
                        </div>
                      </div>
                      
                      {/* Display daily stats as a simple list */}
                      <div className="space-y-2">
                        {dailyStats.slice(0, 7).map((stat, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 bg-muted/20 rounded-lg"
                          >
                            <span className="text-sm font-medium">
                              {formatDailyDate(stat.date)}
                            </span>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="text-muted-foreground">
                                {isAr ? 'زوار:' : 'Visitors:'} {stat.visitors}
                              </span>
                              <span className="text-muted-foreground">
                                {isAr ? 'جلسات:' : 'Sessions:'} {stat.sessions}
                              </span>
                              <span className="text-muted-foreground">
                                {isAr ? 'صفحات:' : 'Pages:'} {stat.pageViews}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminAnalytics;

