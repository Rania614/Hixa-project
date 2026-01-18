import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminTopBar';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Calendar, Building2, RefreshCw, Trash2, Phone, MapPin, Briefcase, Image as ImageIcon, ChevronDown, AlertTriangle } from 'lucide-react';
import { http } from '@/services/http';
import { toast } from '@/components/ui/sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PartnerRequest {
  _id?: string;
  id?: string;
  companyName: string;
  businessType: string;
  description?: string;
  phone: string;
  email: string;
  city: string;
  logo?: string;
  portfolioImages?: string[];
  adType?: string;
  status?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const PartnerRequests = () => {
  const [requests, setRequests] = useState<PartnerRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { language } = useApp();

  // جلب طلبات الشراكة
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      
      const response = await http.get('/partner-requests', { params });
      let requestsData = response.data;
      
      if (requestsData && typeof requestsData === 'object' && !Array.isArray(requestsData)) {
        requestsData = requestsData.data || requestsData.items || requestsData.requests || [];
      }
      
      const finalRequests = Array.isArray(requestsData) ? requestsData : [];
      
      const sortedRequests = finalRequests.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      
      setRequests(sortedRequests);
    } catch (error: any) {
      console.error('Error fetching partner requests:', error);
      toast.error(language === 'en' ? 'Failed to fetch partner requests' : 'فشل في جلب طلبات الشراكة');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  // تحديث حالة الطلب
  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      await http.put(`/partner-requests/${requestId}`, { status: newStatus });
      toast.success(language === 'en' ? 'Status updated successfully' : 'تم تحديث الحالة بنجاح');
      await fetchRequests();
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast.error(
        error.response?.data?.message || 
        (language === 'en' ? 'Failed to update status' : 'فشل في تحديث الحالة')
      );
    }
  };

  // حذف طلب
  const handleDeleteRequest = async () => {
    if (!requestToDelete) return;

    setDeletingId(requestToDelete);
    setDeleteDialogOpen(false);
    
    try {
      await http.delete(`/partner-requests/${requestToDelete}`);
      toast.success(language === 'en' ? 'Request deleted successfully' : 'تم حذف الطلب بنجاح');
      await fetchRequests();
    } catch (error: any) {
      console.error('Error deleting request:', error);
      toast.error(
        error.response?.data?.message || 
        (language === 'en' ? 'Failed to delete request' : 'فشل في حذف الطلب')
      );
    } finally {
      setDeletingId(null);
      setRequestToDelete(null);
    }
  };

  const openDeleteDialog = (requestId: string) => {
    setRequestToDelete(requestId);
    setDeleteDialogOpen(true);
  };

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const statusOptions = [
    { value: 'all', label: { en: 'All', ar: 'الكل' } },
    { value: 'New', label: { en: 'New', ar: 'جديد' } },
    { value: 'In Review', label: { en: 'In Review', ar: 'قيد المراجعة' } },
    { value: 'Approved', label: { en: 'Approved', ar: 'موافق عليه' } },
    { value: 'Rejected', label: { en: 'Rejected', ar: 'مرفوض' } },
  ];

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'In Review':
        return 'bg-yellow-100 text-yellow-800';
      case 'Approved':
        return 'bg-green-100 text-green-800';
      case 'Rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">
        <AdminTopBar />
        <main className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {language === 'en' ? 'Partner Requests' : 'طلبات الشراكة'}
              </h2>
              <p className="text-muted-foreground">
                {language === 'en' 
                  ? 'View and manage all partner registration requests' 
                  : 'عرض وإدارة جميع طلبات تسجيل الشركاء'}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label[language]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={fetchRequests} disabled={loading} variant="outline">
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                {loading ? (language === 'en' ? 'Loading...' : 'جاري التحميل...') : (language === 'en' ? 'Refresh' : 'تحديث')}
              </Button>
            </div>
          </div>

          {loading ? (
            <Card className="p-8">
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 mx-auto text-muted-foreground mb-4 animate-spin" />
                <p className="text-muted-foreground">
                  {language === 'en' ? 'Loading requests...' : 'جاري تحميل الطلبات...'}
                </p>
              </div>
            </Card>
          ) : !Array.isArray(requests) || requests.length === 0 ? (
            <Card className="p-8">
              <div className="text-center py-12">
                <Building2 className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-semibold text-muted-foreground mb-2">
                  {language === 'en' ? 'No requests yet' : 'لا توجد طلبات بعد'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' 
                    ? 'Partner requests will appear here when companies submit registration forms' 
                    : 'ستظهر طلبات الشراكة هنا عندما تقدم الشركات نماذج التسجيل'}
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {requests.map((request, index) => {
                const requestId = request._id || request.id || `request-${index}`;
                const requestDate = request.createdAt 
                  ? new Date(request.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'ar-SA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '';

                return (
                  <Collapsible key={requestId} defaultOpen={false}>
                    <Card className="border-2 hover:shadow-lg transition-shadow">
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <Building2 className="h-6 w-6 text-gold" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-xl">
                                  {request.companyName}
                                </CardTitle>
                                {requestDate && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{requestDate}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            <ChevronDown className="h-5 w-5 text-muted-foreground transition-transform duration-200 data-[state=open]:rotate-180" />
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="space-y-4 pt-0">
                          {/* Company Name */}
                          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                            <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <Building2 className="h-5 w-5 text-gold" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-muted-foreground mb-1">
                                {language === 'en' ? 'Company Name' : 'اسم الشركة'}
                              </p>
                              <p className="text-base font-semibold text-card-foreground">
                                {request.companyName}
                              </p>
                            </div>
                          </div>

                          {/* Business Type */}
                          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                            <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <Briefcase className="h-5 w-5 text-gold" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-muted-foreground mb-1">
                                {language === 'en' ? 'Business Type' : 'نوع العمل'}
                              </p>
                              <p className="text-base font-semibold text-card-foreground">
                                {request.businessType}
                              </p>
                            </div>
                          </div>

                          {/* Description */}
                          {request.description && (
                            <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
                              <h4 className="font-semibold text-lg text-card-foreground">
                                {language === 'en' ? 'Description' : 'الوصف'}
                              </h4>
                              <p className="text-base text-card-foreground whitespace-pre-wrap bg-background/50 p-3 rounded border border-border">
                                {request.description}
                              </p>
                            </div>
                          )}

                          {/* Email */}
                          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                            <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <Mail className="h-5 w-5 text-gold" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-muted-foreground mb-1">
                                {language === 'en' ? 'Email' : 'البريد الإلكتروني'}
                              </p>
                              <a 
                                href={`mailto:${request.email}`}
                                className="text-base font-semibold text-card-foreground hover:text-gold transition-colors"
                              >
                                {request.email}
                              </a>
                            </div>
                          </div>

                          {/* Phone */}
                          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                            <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <Phone className="h-5 w-5 text-gold" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-muted-foreground mb-1">
                                {language === 'en' ? 'Phone Number' : 'رقم الهاتف'}
                              </p>
                              <a 
                                href={`tel:${request.phone}`}
                                className="text-base font-semibold text-card-foreground hover:text-gold transition-colors"
                              >
                                {request.phone}
                              </a>
                            </div>
                          </div>

                          {/* City */}
                          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                            <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <MapPin className="h-5 w-5 text-gold" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-muted-foreground mb-1">
                                {language === 'en' ? 'City' : 'المدينة'}
                              </p>
                              <p className="text-base font-semibold text-card-foreground">
                                {request.city}
                              </p>
                            </div>
                          </div>

                          {/* Logo */}
                          {request.logo && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">
                                {language === 'en' ? 'Company Logo' : 'شعار الشركة'}
                              </p>
                              <div className="rounded-lg border border-border overflow-hidden bg-muted/20">
                                <img 
                                  src={request.logo}
                                  alt={request.companyName}
                                  className="w-full h-auto max-h-48 object-contain"
                                  onError={(e) => {
                                    e.currentTarget.src = '/placeholder.svg';
                                    e.currentTarget.onerror = null;
                                  }}
                                />
                              </div>
                            </div>
                          )}

                          {/* Portfolio Images */}
                          {request.portfolioImages && request.portfolioImages.length > 0 && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">
                                {language === 'en' ? 'Portfolio Images' : 'صور المحفظة'}
                              </p>
                              <div className="grid grid-cols-2 gap-4">
                                {request.portfolioImages.map((image, idx) => (
                                  <div key={idx} className="rounded-lg border border-border overflow-hidden bg-muted/20">
                                    <img 
                                      src={image}
                                      alt={`Portfolio ${idx + 1}`}
                                      className="w-full h-auto max-h-48 object-contain"
                                      onError={(e) => {
                                        e.currentTarget.src = '/placeholder.svg';
                                        e.currentTarget.onerror = null;
                                      }}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Ad Type */}
                          {request.adType && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">
                                {language === 'en' ? 'Ad Type' : 'نوع الإعلان'}
                              </p>
                              <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-gold/20 text-gold">
                                {request.adType}
                              </span>
                            </div>
                          )}

                          {/* Status */}
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-2">
                              {language === 'en' ? 'Status' : 'الحالة'}
                            </p>
                            <Select
                              value={request.status || 'New'}
                              onValueChange={(value) => handleUpdateStatus(requestId, value)}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="New">{language === 'en' ? 'New' : 'جديد'}</SelectItem>
                                <SelectItem value="In Review">{language === 'en' ? 'In Review' : 'قيد المراجعة'}</SelectItem>
                                <SelectItem value="Approved">{language === 'en' ? 'Approved' : 'موافق عليه'}</SelectItem>
                                <SelectItem value="Rejected">{language === 'en' ? 'Rejected' : 'مرفوض'}</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardContent>

                        {/* Action Buttons */}
                        <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `mailto:${request.email}`;
                            }}
                            className="flex-1 bg-gold hover:bg-gold-dark text-black font-semibold"
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            {language === 'en' ? 'Contact via Email' : 'التواصل عبر البريد'}
                          </Button>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDeleteDialog(requestId);
                            }}
                            disabled={deletingId === requestId}
                            variant="destructive"
                            className="px-4"
                          >
                            {deletingId === requestId ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Trash2 className="h-4 w-4 mr-2" />
                                {language === 'en' ? 'Delete' : 'حذف'}
                              </>
                            )}
                          </Button>
                        </div>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                );
              })}
            </div>
          )}
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-2 border-border">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-destructive/20 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl font-bold">
                {language === 'en' ? 'Delete Request' : 'حذف الطلب'}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base pt-2">
              {language === 'en' 
                ? 'Are you sure you want to delete this partner request? This action cannot be undone.' 
                : 'هل أنت متأكد من حذف طلب الشراكة هذا؟ لا يمكن التراجع عن هذا الإجراء.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto">
              {language === 'en' ? 'Cancel' : 'إلغاء'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRequest}
              className="w-full sm:w-auto bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              {language === 'en' ? 'Delete' : 'حذف'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PartnerRequests;
