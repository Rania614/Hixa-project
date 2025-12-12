import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminTopBar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Send, X, RefreshCw, Download } from 'lucide-react';
import { http } from '@/services/http';
import { toast } from '@/components/ui/sonner';

interface Subscriber {
  _id?: string;
  id?: string;
  email?: string;
  phone?: string;
  phoneNumber?: string;
  contact?: string;
  name?: string;
  isActive?: boolean;
  source?: string;
  subscribedAt?: string;
  createdAt?: string;
  joinDate?: string;
}

export const Subscribers = () => {
  const { language } = useApp();
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subscribersLoading, setSubscribersLoading] = useState(true);
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastSubjectEn, setBroadcastSubjectEn] = useState('');
  const [broadcastSubjectAr, setBroadcastSubjectAr] = useState('');
  const [broadcastMessageEn, setBroadcastMessageEn] = useState('');
  const [broadcastMessageAr, setBroadcastMessageAr] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [statistics, setStatistics] = useState({
    total: 0,
    email: 0,
    phone: 0
  });

  const fetchStatistics = async () => {
    try {
      const response = await http.get('/api/subscribers/statistics');
      const stats = response.data;
      
      setStatistics({
        total: stats.total || stats.totalSubscribers || 0,
        email: stats.email || stats.emailSubscribers || 0,
        phone: stats.phone || stats.phoneSubscribers || 0
      });
    } catch (error: any) {
      console.error('Error fetching statistics:', error);
      // Don't show error toast for statistics, just use local count
    }
  };

  const fetchSubscribers = async () => {
    setSubscribersLoading(true);
    try {
      // Use /api/subscribers endpoint (works correctly)
      const response = await http.get('/api/subscribers');
      let subscribersData = response.data;
      
      console.log('Subscribers response:', subscribersData);
      
      // Handle different response structures
      // The API returns {data: Array, meta: {...}}
      if (subscribersData && typeof subscribersData === 'object' && !Array.isArray(subscribersData)) {
        subscribersData = subscribersData.data || subscribersData.subscribers || subscribersData.items || subscribersData.results || [];
      }
      
      // Ensure it's an array
      let subscribersArray = Array.isArray(subscribersData) ? subscribersData : [];
      
      // Filter out inactive subscribers (isActive: false) - they are considered deleted/unsubscribed
      // Only show active subscribers (isActive: true or undefined)
      subscribersArray = subscribersArray.filter((sub: any) => {
        // Include if isActive is true or undefined (not explicitly false)
        return sub.isActive !== false;
      });
      
      console.log('Processed subscribers (after filter):', subscribersArray);
      
      setSubscribers(subscribersArray);
      
      // Fetch statistics after getting subscribers
      await fetchStatistics();
    } catch (error: any) {
      console.error('Error fetching subscribers:', error);
      console.error('Error response:', error.response?.data);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          (language === 'en' 
                            ? 'Failed to fetch subscribers. Please check the API endpoint.' 
                            : 'فشل في جلب المشتركين. يرجى التحقق من نقطة نهاية API.');
      toast.error(errorMessage);
      // Set empty array on error to prevent UI issues
      setSubscribers([]);
    } finally {
      setSubscribersLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleDeleteSubscriber = async (id: string) => {
    const subscriberId = id;
    if (!subscriberId) {
      toast.error(language === 'en' ? 'Invalid subscriber ID' : 'معرف المشترك غير صحيح');
      return;
    }

    setDeletingId(subscriberId);
    try {
      let deleted = false;
      
      // Try DELETE endpoint first (actual deletion)
      try {
        await http.delete(`/api/subscribers/${subscriberId}`);
        deleted = true;
        console.log('Subscriber deleted via DELETE endpoint');
      } catch (error1: any) {
        // If DELETE fails (404 or other), try unsubscribe endpoint (sets isActive: false)
        if (error1.response?.status === 404) {
          try {
            await http.post('/api/subscribers/unsubscribe', { id: subscriberId });
            deleted = true;
            console.log('Subscriber unsubscribed via unsubscribe endpoint');
          } catch (error2: any) {
            console.error('Both DELETE and unsubscribe failed:', error1, error2);
            // If both fail, throw the first error
            throw error1;
          }
        } else {
          throw error1;
        }
      }
      
      if (deleted) {
        toast.success(language === 'en' ? 'Subscriber deleted successfully' : 'تم حذف المشترك بنجاح');
        // Small delay to ensure backend has processed the deletion
        await new Promise(resolve => setTimeout(resolve, 500));
        // Refresh the list and statistics
        await fetchSubscribers();
      }
    } catch (error: any) {
      console.error('Error unsubscribing subscriber:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          (language === 'en' 
                            ? 'Failed to unsubscribe subscriber' 
                            : 'فشل إلغاء اشتراك المشترك');
      toast.error(errorMessage);
    } finally {
      setDeletingId(null);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await http.get('/api/subscribers/export', {
        responseType: 'blob'
      });
      
      // Create a blob URL and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `subscribers-${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success(language === 'en' ? 'Subscribers exported successfully' : 'تم تصدير المشتركين بنجاح');
    } catch (error: any) {
      console.error('Error exporting subscribers:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error ||
                          (language === 'en' 
                            ? 'Failed to export subscribers' 
                            : 'فشل تصدير المشتركين');
      toast.error(errorMessage);
    }
  };

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    
    try {
      // Try different possible endpoints
      let response;
      
      try {
        // First try: /api/subscribers/broadcast
        response = await http.post('/api/subscribers/broadcast', {
          subject: { en: broadcastSubjectEn, ar: broadcastSubjectAr },
          message: { en: broadcastMessageEn, ar: broadcastMessageAr }
        });
      } catch (error1: any) {
        console.log('First endpoint failed, trying /subscribers/subscribe/broadcast...');
        try {
          // Second try: /api/subscribers/subscribe/broadcast
          response = await http.post('/api/subscribers/subscribe/broadcast', {
            subject: { en: broadcastSubjectEn, ar: broadcastSubjectAr },
            message: { en: broadcastMessageEn, ar: broadcastMessageAr }
          });
        } catch (error2: any) {
          console.log('Second endpoint failed, trying /subscribers/send-broadcast...');
          try {
            // Third try: /api/subscribers/send-broadcast
            response = await http.post('/api/subscribers/send-broadcast', {
              subject: { en: broadcastSubjectEn, ar: broadcastSubjectAr },
              message: { en: broadcastMessageEn, ar: broadcastMessageAr }
            });
          } catch (error3: any) {
            console.error('All broadcast endpoints failed:', error1, error2, error3);
            throw error1; // Throw the first error
          }
        }
      }
      
      setIsSending(false);
      setSendSuccess(true);
      
      // Reset form and close modal after 2 seconds
      setTimeout(() => {
        setSendSuccess(false);
        setShowBroadcastModal(false);
        setBroadcastSubjectEn('');
        setBroadcastSubjectAr('');
        setBroadcastMessageEn('');
        setBroadcastMessageAr('');
      }, 2000);
    } catch (error: any) {
      console.error('Failed to send broadcast:', error);
      console.error('Error response:', error.response?.data);
      
      // Check if it's a 404 error
      if (error.response?.status === 404) {
        toast.error(
          language === 'en' 
            ? 'Broadcast endpoint not found. Please check if the API endpoint is implemented in the backend.' 
            : 'نقطة نهاية البث غير موجودة. يرجى التحقق من أن نقطة نهاية API موجودة في الـ backend.'
        );
      } else {
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.error ||
                            (language === 'en' 
                              ? 'Failed to send broadcast. Please try again later.' 
                              : 'فشل إرسال البث. يرجى المحاولة مرة أخرى لاحقاً.');
        toast.error(errorMessage);
      }
      setIsSending(false);
    }
  };

  // Use statistics if available, otherwise use local count
  const totalSubscribers = statistics.total > 0 ? statistics.total : subscribers.length;

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col">
        <AdminTopBar />
        
        <main className="flex-1 p-6 bg-background">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">
              {language === 'en' ? 'Subscribers' : 'المشتركون'}
            </h1>
            <p className="text-muted-foreground">
              {language === 'en' 
                ? 'Manage platform subscribers and send broadcasts' 
                : 'إدارة مشتركي المنصة وإرسال البثوث'}
            </p>
          </div>
          
          {/* Stats Card */}
          <Card className="mb-6 glass-card">
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'Subscriber Statistics' : 'إحصائيات المشتركين'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="text-2xl font-bold">{totalSubscribers}</h3>
                  <p className="text-muted-foreground">
                    {language === 'en' ? 'Total Subscribers' : 'إجمالي المشتركين'}
                  </p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="text-2xl font-bold">
                    {statistics.email > 0 
                      ? statistics.email 
                      : (Array.isArray(subscribers) ? subscribers.filter(s => s.email).length : 0)}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'en' ? 'Email Subscribers' : 'المشتركون عبر البريد الإلكتروني'}
                  </p>
                </div>
                <div className="bg-secondary/30 p-4 rounded-lg">
                  <h3 className="text-2xl font-bold">
                    {statistics.phone > 0 
                      ? statistics.phone 
                      : (Array.isArray(subscribers) ? subscribers.filter(s => s.phone || s.phoneNumber || s.contact).length : 0)}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'en' ? 'Phone Subscribers' : 'المشتركون عبر الهاتف'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Actions */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">
              {language === 'en' ? 'Subscriber List' : 'قائمة المشتركين'}
            </h2>
            <div className="flex gap-2">
              <Button 
                onClick={fetchSubscribers}
                variant="outline"
                disabled={subscribersLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${subscribersLoading ? 'animate-spin' : ''}`} />
                {language === 'en' ? 'Refresh' : 'تحديث'}
              </Button>
              <Button 
                onClick={handleExportCSV}
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Export CSV' : 'تصدير CSV'}
              </Button>
              {/* Broadcast button - Commented out until endpoint is implemented */}
              {/* <Button 
                onClick={() => setShowBroadcastModal(true)}
                className="bg-gold hover:bg-gold-dark"
              >
                <Send className="h-4 w-4 mr-2" />
                {language === 'en' ? 'Send Email Broadcast' : 'إرسال بث عبر البريد الإلكتروني'}
              </Button> */}
            </div>
          </div>
          
          {/* Subscribers Table */}
          <Card className="glass-card">
            <CardContent className="p-0">
              {subscribersLoading ? (
                <div className="p-8 text-center text-muted-foreground">
                  {language === 'en' ? 'Loading subscribers...' : 'جاري تحميل المشتركين...'}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-4 font-semibold">
                          {language === 'en' ? 'Name' : 'الاسم'}
                        </th>
                        <th className="text-left p-4 font-semibold">
                          {language === 'en' ? 'Email' : 'البريد الإلكتروني'}
                        </th>
                        <th className="text-left p-4 font-semibold">
                          {language === 'en' ? 'Phone' : 'الهاتف'}
                        </th>
                        <th className="text-left p-4 font-semibold">
                          {language === 'en' ? 'Active' : 'نشط'}
                        </th>
                        <th className="text-left p-4 font-semibold">
                          {language === 'en' ? 'Source' : 'المصدر'}
                        </th>
                        <th className="text-left p-4 font-semibold">
                          {language === 'en' ? 'Subscribed At' : 'تاريخ الاشتراك'}
                        </th>
                        <th className="text-left p-4 font-semibold">
                          {language === 'en' ? 'Actions' : 'الإجراءات'}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(subscribers) && subscribers.length > 0 ? (
                        subscribers.map((subscriber, index) => {
                          const subscriberId = subscriber._id || subscriber.id || `subscriber-${index}`;
                          // Get phone from different possible field names
                          const phone = subscriber.phone || subscriber.phoneNumber || subscriber.contact;
                          const email = subscriber.email;
                          const name = subscriber.name || '-';
                          const isActive = subscriber.isActive !== false; // true if not explicitly false
                          const source = subscriber.source || '-';
                          const subscribedAt = subscriber.subscribedAt || subscriber.createdAt;
                          const joinDate = subscribedAt
                            ? new Date(subscribedAt).toLocaleDateString(language === 'en' ? 'en-US' : 'ar-SA', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })
                            : '-';
                          
                          return (
                            <tr key={subscriberId} className="border-b border-border hover:bg-secondary/30">
                              <td className="p-4">
                                <span className="text-sm font-medium">{name}</span>
                              </td>
                              <td className="p-4">
                                {email ? (
                                  <span className="text-sm">{email}</span>
                                ) : (
                                  <span className="text-sm text-muted-foreground">-</span>
                                )}
                              </td>
                              <td className="p-4">
                                {phone ? (
                                  <span className="text-sm">{phone}</span>
                                ) : (
                                  <span className="text-sm text-muted-foreground">-</span>
                                )}
                              </td>
                              <td className="p-4">
                                <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${
                                  isActive 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                }`}>
                                  {isActive 
                                    ? (language === 'en' ? 'Yes' : 'نعم') 
                                    : (language === 'en' ? 'No' : 'لا')}
                                </span>
                              </td>
                              <td className="p-4">
                                <span className="text-sm text-muted-foreground">{source}</span>
                              </td>
                              <td className="p-4">
                                <span className="text-sm">{joinDate}</span>
                              </td>
                              <td className="p-4">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteSubscriber(subscriberId)}
                                  disabled={deletingId === subscriberId}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  {deletingId === subscriberId ? (
                                    <RefreshCw className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={7} className="p-4 text-center text-muted-foreground">
                            {language === 'en' 
                              ? 'No subscribers yet' 
                              : 'لا يوجد مشتركون بعد'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
      
      {/* Broadcast Modal - Commented out until POST /api/subscribers/broadcast endpoint is implemented */}
      {/* {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-2xl glass-card relative">
            <Button
              onClick={() => setShowBroadcastModal(false)}
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4"
            >
              <X className="h-4 w-4" />
            </Button>
            
            <CardHeader>
              <CardTitle>
                {language === 'en' ? 'Send Email Broadcast' : 'إرسال بث عبر البريد الإلكتروني'}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {sendSuccess ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">🎉</div>
                  <h3 className="text-xl font-bold mb-2">
                    {language === 'en' ? 'Success!' : 'نجحت العملية!'}
                  </h3>
                  <p className="text-muted-foreground">
                    {language === 'en' 
                      ? 'Broadcast sent to all subscribers' 
                      : 'تم إرسال البث إلى جميع المشتركين'}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSendBroadcast} className="space-y-4">
                  <div>
                    <label htmlFor="subject-en" className="block text-sm font-medium mb-2">
                      {language === 'en' ? 'Subject (English)' : 'الموضوع (الإنجليزية)'}
                    </label>
                    <Input
                      id="subject-en"
                      value={broadcastSubjectEn}
                      onChange={(e) => setBroadcastSubjectEn(e.target.value)}
                      placeholder={language === 'en' ? 'Broadcast subject' : 'موضوع البث'}
                      className="bg-secondary/50"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="subject-ar" className="block text-sm font-medium mb-2">
                      {language === 'en' ? 'Subject (Arabic)' : 'الموضوع (العربية)'}
                    </label>
                    <Input
                      id="subject-ar"
                      value={broadcastSubjectAr}
                      onChange={(e) => setBroadcastSubjectAr(e.target.value)}
                      placeholder={language === 'en' ? 'Broadcast subject' : 'موضوع البث'}
                      className="bg-secondary/50"
                      required
                      dir="rtl"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message-en" className="block text-sm font-medium mb-2">
                      {language === 'en' ? 'Message (English)' : 'الرسالة (الإنجليزية)'}
                    </label>
                    <textarea
                      id="message-en"
                      value={broadcastMessageEn}
                      onChange={(e) => setBroadcastMessageEn(e.target.value)}
                      placeholder={language === 'en' ? 'Your message here...' : 'رسالتك هنا...'}
                      className="w-full h-32 p-3 bg-secondary/50 rounded-md border border-input"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message-ar" className="block text-sm font-medium mb-2">
                      {language === 'en' ? 'Message (Arabic)' : 'الرسالة (العربية)'}
                    </label>
                    <textarea
                      id="message-ar"
                      value={broadcastMessageAr}
                      onChange={(e) => setBroadcastMessageAr(e.target.value)}
                      placeholder={language === 'en' ? 'Your message here...' : 'رسالتك هنا...'}
                      className="w-full h-32 p-3 bg-secondary/50 rounded-md border border-input"
                      required
                      dir="rtl"
                    />
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-gold-light to-gold hover:from-gold hover:to-gold-dark text-primary-foreground font-semibold"
                    disabled={isSending}
                  >
                    {isSending 
                      ? (language === 'en' ? 'Sending...' : 'إرسال...') 
                      : (language === 'en' ? 'Send to All Subscribers' : 'إرسال إلى جميع المشتركين')}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      )} */}
    </div>
  );
};

export default Subscribers;