import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminTopBar';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Calendar, Package, RefreshCw, Trash2, Edit2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
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

interface Order {
  _id?: string;
  id?: string;
  email: string;
  serviceId?: string;
  serviceType?: string;
  title: string;
  description?: string;
  orderDetails?: string;
  image?: string;
  status?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const { language } = useApp();

  // جلب الطلبات
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await http.get('/service-orders');
      // Handle different response structures
      let ordersData = response.data;
      
      // If response.data is an object with data/items/orders property
      if (ordersData && typeof ordersData === 'object' && !Array.isArray(ordersData)) {
        ordersData = ordersData.data || ordersData.items || ordersData.orders || ordersData.results || [];
      }
      
      // Ensure it's always an array
      const finalOrders = Array.isArray(ordersData) ? ordersData : [];
      
      // Sort orders by createdAt (newest first, oldest last)
      // So the newest order will be the first one (highest number)
      const sortedOrders = finalOrders.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA; // Descending order (newest first)
      });
      
      // Log first order image structure for debugging
      if (sortedOrders.length > 0 && sortedOrders[0].image) {
        console.log('First order image structure:', {
          image: sortedOrders[0].image,
          imageType: typeof sortedOrders[0].image,
          isObject: typeof sortedOrders[0].image === 'object',
        });
      }
      
      setOrders(sortedOrders);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error(language === 'en' ? 'Failed to fetch orders' : 'فشل في جلب الطلبات');
      setOrders([]); // Set empty array on error
    } finally {
      setOrdersLoading(false);
    }
  };

  // جلب طلب محدد
  const fetchOrderById = async (orderId: string) => {
    try {
      const response = await http.get(`/service-orders/${orderId}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching order:', error);
      toast.error(language === 'en' ? 'Failed to fetch order' : 'فشل في جلب الطلب');
      return null;
    }
  };

  // فتح dialog الحذف
  const openDeleteDialog = (orderId: string) => {
    setOrderToDelete(orderId);
    setDeleteDialogOpen(true);
  };

  // حذف طلب
  const handleDeleteOrder = async () => {
    if (!orderToDelete) return;

    setDeletingId(orderToDelete);
    setDeleteDialogOpen(false);
    
    try {
      await http.delete(`/service-orders/${orderToDelete}`);
      toast.success(language === 'en' ? 'Order deleted successfully' : 'تم حذف الطلب بنجاح');
      // إعادة جلب الطلبات بعد الحذف
      await fetchOrders();
    } catch (error: any) {
      console.error('Error deleting order:', error);
      toast.error(
        error.response?.data?.message || 
        (language === 'en' ? 'Failed to delete order' : 'فشل في حذف الطلب')
      );
    } finally {
      setDeletingId(null);
      setOrderToDelete(null);
    }
  };

  // تحديث طلب
  const handleUpdateOrder = async (orderId: string, updatedData: Partial<Order>) => {
    try {
      await http.put(`/service-orders/${orderId}`, updatedData);
      toast.success(language === 'en' ? 'Order updated successfully' : 'تم تحديث الطلب بنجاح');
      // إعادة جلب الطلبات بعد التحديث
      await fetchOrders();
    } catch (error: any) {
      console.error('Error updating order:', error);
      toast.error(
        error.response?.data?.message || 
        (language === 'en' ? 'Failed to update order' : 'فشل في تحديث الطلب')
      );
    }
  };

  // جلب الطلبات عند تحميل الصفحة
  useEffect(() => {
    fetchOrders();
  }, []);

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1">
        <AdminTopBar />
        <main className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold mb-2">
                {language === 'en' ? 'Service Orders' : 'طلبات الخدمات'}
              </h2>
              <p className="text-muted-foreground">
                {language === 'en' 
                  ? 'View and manage all service orders from customers' 
                  : 'عرض وإدارة جميع طلبات الخدمات من العملاء'}
              </p>
            </div>
            <Button onClick={fetchOrders} disabled={ordersLoading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${ordersLoading ? 'animate-spin' : ''}`} />
              {ordersLoading ? (language === 'en' ? 'Loading...' : 'جاري التحميل...') : (language === 'en' ? 'Refresh' : 'تحديث')}
            </Button>
          </div>

          {ordersLoading ? (
            <Card className="p-8">
              <div className="text-center py-8">
                <RefreshCw className="h-8 w-8 mx-auto text-muted-foreground mb-4 animate-spin" />
                <p className="text-muted-foreground">
                  {language === 'en' ? 'Loading orders...' : 'جاري تحميل الطلبات...'}
                </p>
              </div>
            </Card>
          ) : !Array.isArray(orders) || orders.length === 0 ? (
            <Card className="p-8">
              <div className="text-center py-12">
                <Package className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-semibold text-muted-foreground mb-2">
                  {language === 'en' ? 'No orders yet' : 'لا توجد طلبات بعد'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {language === 'en' 
                    ? 'Orders will appear here when customers submit service requests' 
                    : 'ستظهر الطلبات هنا عندما يقدم العملاء طلبات الخدمة'}
                </p>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {Array.isArray(orders) && orders.length > 0 && orders.map((order, index) => {
                const orderId = order._id || order.id || `order-${index}`;
                const orderDate = order.createdAt 
                  ? new Date(order.createdAt).toLocaleDateString(language === 'en' ? 'en-US' : 'ar-SA', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '';

                return (
                  <Collapsible key={orderId} defaultOpen={false}>
                    <Card className="border-2 hover:shadow-lg transition-shadow">
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                                <Package className="h-6 w-6 text-gold" />
                              </div>
                              <div className="flex-1">
                                <CardTitle className="text-xl">
                                  {language === 'en' ? 'Order' : 'طلب'} #{orders.length - index}
                                </CardTitle>
                                {orderDate && (
                                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                    <Calendar className="h-4 w-4" />
                                    <span>{orderDate}</span>
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
                      {/* Email */}
                      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors">
                        <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <Mail className="h-5 w-5 text-gold" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            {language === 'en' ? 'Email' : 'البريد الإلكتروني'}
                          </p>
                          <a 
                            href={`mailto:${order.email}`}
                            className="text-base font-semibold text-card-foreground hover:text-gold transition-colors"
                          >
                            {order.email}
                          </a>
                        </div>
                      </div>

                      {/* Service - Only show if serviceType exists */}
                      {order.serviceType && (
                        <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                          <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                            <Package className="h-5 w-5 text-gold" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              {language === 'en' ? 'Service' : 'الخدمة'}
                            </p>
                            <p className="text-base font-semibold text-card-foreground">
                              {order.serviceType}
                            </p>
                          </div>
                        </div>
                      )}

                      {/* Order Details */}
                      <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
                        <h4 className="font-semibold text-lg text-card-foreground mb-3">
                          {language === 'en' ? 'Order Details' : 'تفاصيل الطلب'}
                        </h4>
                        
                        {order.title && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              {language === 'en' ? 'Title' : 'العنوان'}
                            </p>
                            <p className="text-base text-card-foreground">{order.title}</p>
                          </div>
                        )}

                        {order.description && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              {language === 'en' ? 'Description' : 'الوصف'}
                            </p>
                            <p className="text-base text-card-foreground">{order.description}</p>
                          </div>
                        )}

                        {order.orderDetails && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              {language === 'en' ? 'Order Details' : 'تفاصيل الطلب'}
                            </p>
                            <p className="text-base text-card-foreground whitespace-pre-wrap bg-background/50 p-3 rounded border border-border">
                              {order.orderDetails}
                            </p>
                          </div>
                        )}

                        {order.image && (() => {
                          // Helper function to get image URL
                          const getImageUrl = (img: any): string => {
                            if (!img) return '';
                            
                            // If it's a string
                            if (typeof img === 'string') {
                              // Already a full URL
                              if (img.startsWith('http://') || img.startsWith('https://') || img.startsWith('data:')) {
                                return img;
                              }
                              // Relative path - add base URL
                              const baseURL = import.meta.env.VITE_API_BASE_URL || '';
                              return `${baseURL}${img.startsWith('/') ? '' : '/'}${img}`;
                            }
                            
                            // If it's an object, try to extract URL
                            if (typeof img === 'object') {
                              return img.url || img.path || img.src || img.uri || '';
                            }
                            
                            return '';
                          };
                          
                          const imageUrl = getImageUrl(order.image);
                          
                          return imageUrl ? (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">
                                {language === 'en' ? 'Image' : 'الصورة'}
                              </p>
                              <div className="rounded-lg border border-border overflow-hidden bg-muted/20">
                                <img 
                                  src={imageUrl}
                                  alt={order.title || 'Order image'}
                                  className="w-full h-auto max-h-96 object-contain"
                                  onError={(e) => {
                                    // Show placeholder on error
                                    e.currentTarget.src = '/placeholder.svg';
                                    e.currentTarget.onerror = null; // Prevent infinite loop
                                  }}
                                />
                              </div>
                            </div>
                          ) : null;
                        })()}

                        {order.status && (
                          <div>
                            <p className="text-sm font-medium text-muted-foreground mb-1">
                              {language === 'en' ? 'Status' : 'الحالة'}
                            </p>
                            <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                              order.status === 'New' ? 'bg-blue-100 text-blue-800' :
                              order.status === 'In Progress' ? 'bg-yellow-100 text-yellow-800' :
                              order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {order.status}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `mailto:${order.email}`;
                          }}
                          className="flex-1 bg-gold hover:bg-gold-dark text-black font-semibold"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          {language === 'en' ? 'Contact via Email' : 'التواصل عبر البريد'}
                        </Button>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            openDeleteDialog(orderId);
                          }}
                          disabled={deletingId === orderId}
                          variant="destructive"
                          className="px-4"
                        >
                          {deletingId === orderId ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Trash2 className="h-4 w-4 mr-2" />
                              {language === 'en' ? 'Delete' : 'حذف'}
                            </>
                          )}
                        </Button>
                      </div>
                        </CardContent>
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
                {language === 'en' ? 'Delete Order' : 'حذف الطلب'}
              </AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base pt-2">
              {language === 'en' 
                ? 'Are you sure you want to delete this order? This action cannot be undone.' 
                : 'هل أنت متأكد من حذف هذا الطلب؟ لا يمكن التراجع عن هذا الإجراء.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
            <AlertDialogCancel className="w-full sm:w-auto">
              {language === 'en' ? 'Cancel' : 'إلغاء'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteOrder}
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

export default Orders;

