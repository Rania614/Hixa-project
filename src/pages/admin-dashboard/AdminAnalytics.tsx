import { useState, useEffect, useMemo } from 'react';
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
  TrendingUp,
  MousePointer2,
  ScrollText,
  RefreshCcw
} from 'lucide-react';
import { http } from '@/services/http';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { HexagonIcon } from '@/components/ui/hexagon-icon';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';

// Type definitions
interface VisitorStats {
  total: number;
  unique: number;
}

interface PageView {
  page: string;
  views: number;
}

interface EventData {
  event: string;
}

interface ActivityItem {
  id: string;
  event: string;
  page: string;
  userId?: string;
  timestamp: string;
  data?: any;
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
  const [refreshing, setRefreshing] = useState(false);
  const [visitorStats, setVisitorStats] = useState<VisitorStats | null>(null);
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [events, setEvents] = useState<EventData[]>([]);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data
  const fetchAnalytics = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    else setRefreshing(true);

    setError(null);

    try {
      const [visitorsRes, pageViewsRes, eventsRes, activityRes, dailyRes] = await Promise.all([
        http.get('/admin/analytics/visitors').catch(() => ({ data: null })),
        http.get('/admin/analytics/page-views').catch(() => ({ data: [] })),
        http.get('/admin/analytics/events').catch(() => ({ data: [] })),
        http.get('/admin/analytics/activity').catch(() => ({ data: [] })),
        http.get('/admin/analytics/daily').catch(() => ({ data: [] })),
      ]);

      setVisitorStats({
        total: visitorsRes.data?.data?.totalVisitors || 0,
        unique: visitorsRes.data?.data?.totalSessions || 0,
      });

      setPageViews(Array.isArray(pageViewsRes.data?.data) ? pageViewsRes.data.data : []);
      setEvents(Array.isArray(eventsRes.data?.data) ? eventsRes.data.data : []);

      const activityData = activityRes.data?.data || [];
      setActivity(Array.isArray(activityData)
        ? activityData.map((item: any) => ({
          id: item._id,
          event: item.event,
          page: item.page,
          userId: item.userId,
          timestamp: item.createdAt,
          data: item.data
        }))
        : []);

      setDailyStats(Array.isArray(dailyRes.data?.data) ? dailyRes.data.data : []);

    } catch (err: any) {
      console.error('Error fetching analytics:', err);
      setError(err.response?.data?.message || (isAr ? 'حدث خطأ أثناء جلب البيانات' : 'Error fetching analytics data'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics(true);

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchAnalytics(), 30000);
    return () => clearInterval(interval);
  }, [isAr]);

  // Data Normalization & Filtering
  const normalizedPageViews = useMemo(() => {
    const counts: Record<string, number> = {};
    pageViews.forEach(pv => {
      if (!pv.page) return;
      let page = pv.page.toLowerCase();
      if (page.length > 1 && page.endsWith('/')) page = page.slice(0, -1);

      // Ignore admin and auth pages
      if (page.startsWith('/admin') || page.startsWith('/auth')) return;

      counts[page] = (counts[page] || 0) + pv.views;
    });
    return Object.entries(counts)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views);
  }, [pageViews]);

  const topInteractions = useMemo(() => {
    const counts: Record<string, number> = {};
    activity.forEach(item => {
      if (item.event === 'click' && item.data?.target) {
        const key = item.data.target;
        counts[key] = (counts[key] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);
  }, [activity]);

  const scrollStats = useMemo(() => {
    const counts: Record<number, number> = { 25: 0, 50: 0, 75: 0, 100: 0 };
    activity.forEach(item => {
      if (item.event === 'scroll' && item.data?.depth) {
        const depth = item.data.depth;
        if (counts[depth] !== undefined) counts[depth]++;
      }
    });
    return Object.entries(counts).map(([depth, count]) => ({
      name: `${depth}%`,
      value: count
    }));
  }, [activity]);

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
    } catch { return dateString; }
  };

  const formatDailyDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat(isAr ? 'ar-SA' : 'en-US', {
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch { return dateString; }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">
        <AdminTopBar />
        <main className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {isAr ? 'التحليلات والإحصائيات' : 'Analytics & Statistics'}
              </h2>
              <p className="text-muted-foreground">
                {isAr ? 'مراقبة نشاط المستخدمين وإحصائيات المنصة' : 'Monitor user activity and platform statistics'}
              </p>
            </div>
            <button
              onClick={() => fetchAnalytics()}
              className="p-2 hover:bg-muted rounded-full transition-colors"
              disabled={refreshing}
            >
              <RefreshCcw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">{isAr ? 'جاري تحميل البيانات...' : 'Loading analytics...'}</p>
              </div>
            </div>
          ) : error ? (
            <Card className="glass-card"><CardContent className="p-6 text-center"><p className="text-destructive">{error}</p></CardContent></Card>
          ) : (
            <>
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{isAr ? 'إجمالي الزوار' : 'Total Visitors'}</CardTitle>
                    <HexagonIcon size="sm" className="text-cyan"><Users className="h-5 w-5 text-cyan" /></HexagonIcon>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{visitorStats?.total || 0}</div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{isAr ? 'زوار فريدون' : 'Unique Visitors'}</CardTitle>
                    <HexagonIcon size="sm" className="text-cyan"><Activity className="h-5 w-5 text-cyan" /></HexagonIcon>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{visitorStats?.unique || 0}</div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{isAr ? 'إجمالي التفاعلات' : 'Total Interactions'}</CardTitle>
                    <HexagonIcon size="sm" className="text-gold"><MousePointer2 className="h-5 w-5 text-gold" /></HexagonIcon>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{activity.length}</div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">{isAr ? 'أحداث مسجلة' : 'Recorded Events'}</CardTitle>
                    <HexagonIcon size="sm" className="text-purple-500"><Activity className="h-5 w-5 text-purple-500" /></HexagonIcon>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">{events.length}</div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Chart */}
              <Card className="glass-card mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    {isAr ? 'اتجاهات الزوار والصفحات' : 'Visitor & Page Trends'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={dailyStats}>
                        <defs>
                          <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00E5FF" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#00E5FF" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="colorPages" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FFD700" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#FFD700" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                        <XAxis
                          dataKey="date"
                          tickFormatter={formatDailyDate}
                          stroke="rgba(255,255,255,0.5)"
                          fontSize={12}
                        />
                        <YAxis stroke="rgba(255,255,255,0.5)" fontSize={12} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                          labelFormatter={formatDailyDate}
                        />
                        <Area type="monotone" dataKey="visitors" stroke="#00E5FF" fillOpacity={1} fill="url(#colorVisitors)" name={isAr ? 'الزوار' : 'Visitors'} />
                        <Area type="monotone" dataKey="pageViews" stroke="#FFD700" fillOpacity={1} fill="url(#colorPages)" name={isAr ? 'المشاهدات' : 'Views'} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Top Pages */}
                <Card className="glass-card">
                  <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="h-5 w-5" />{isAr ? 'أكثر الصفحات زيارة' : 'Top Pages'}</CardTitle></CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader><TableRow><TableHead>{isAr ? 'الصفحة' : 'Page'}</TableHead><TableHead className="text-right">{isAr ? 'المشاهدات' : 'Views'}</TableHead></TableRow></TableHeader>
                      <TableBody>
                        {normalizedPageViews.slice(0, 8).map((pv, i) => (
                          <TableRow key={i}>
                            <TableCell className="font-medium">{pv.page}</TableCell>
                            <TableCell className="text-right">{pv.views}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>

                {/* Top Interactions */}
                <Card className="glass-card">
                  <CardHeader><CardTitle className="flex items-center gap-2"><MousePointer2 className="h-5 w-5" />{isAr ? 'أكثر العناصر تفاعلاً' : 'Top Interactions'}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="h-[250px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={topInteractions} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.1)" />
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" width={100} stroke="rgba(255,255,255,0.5)" fontSize={10} />
                          <Tooltip contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} />
                          <Bar dataKey="value" fill="#00E5FF" radius={[0, 4, 4, 0]}>
                            {topInteractions.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#00E5FF' : '#FFD700'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Scroll Depth */}
                <Card className="glass-card lg:col-span-1">
                  <CardHeader><CardTitle className="flex items-center gap-2"><ScrollText className="h-5 w-5" />{isAr ? 'عمق التصفح' : 'Scroll Depth'}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {scrollStats.map((stat, i) => (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span>{stat.name}</span>
                            <span>{stat.value} {isAr ? 'مرة' : 'times'}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gold transition-all duration-500"
                              style={{ width: `${Math.min(100, (stat.value / (activity.length || 1)) * 1000)}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="glass-card lg:col-span-2">
                  <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />{isAr ? 'نشاط حديث' : 'Recent Activity'}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                      {activity.slice(0, 15).map((item) => (
                        <div key={item.id} className="flex items-start justify-between p-3 bg-muted/20 rounded-lg border border-border/30 hover:border-border/60 transition-colors">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className={`text-xs px-2 py-0.5 rounded-full ${item.event === 'click' ? 'bg-cyan/20 text-cyan' :
                                  item.event === 'scroll' ? 'bg-gold/20 text-gold' :
                                    'bg-purple-500/20 text-purple-500'
                                }`}>
                                {item.event}
                              </span>
                              <span className="text-sm font-medium">{item.page}</span>
                            </div>
                            {item.data && (
                              <p className="text-xs text-muted-foreground italic">
                                {item.event === 'click' ? `Clicked: ${item.data.target}` :
                                  item.event === 'scroll' ? `Reached: ${item.data.depth}%` :
                                    `Viewed: ${item.data.section}`}
                              </p>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground">{formatDate(item.timestamp)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminAnalytics;

