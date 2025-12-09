import { useState, useEffect } from 'react';
import { AdminSidebar } from '@/components/AdminSidebar';
import { AdminTopBar } from '@/components/AdminTopBar';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Calendar, Package, RefreshCw } from 'lucide-react';
import { http } from '@/services/http';
import { toast } from '@/components/ui/sonner';

interface Order {
  _id?: string;
  id?: string;
  email: string;
  service: {
    _id?: string;
    id?: string;
    title?: string;
    title_en?: string;
    title_ar?: string;
    name?: string;
  };
  section: {
    title: string;
    description: string;
    image?: string;
    textarea: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const { language } = useApp();

  // جلب الطلبات
  const fetchOrders = async () => {
    setOrdersLoading(true);
    try {
      const response = await http.get('/orders');
      setOrders(response.data || []);
    } catch (error: any) {
      console.error('Error fetching orders:', error);
      toast.error(language === 'en' ? 'Failed to fetch orders' : 'فشل في جلب الطلبات');
    } finally {
      setOrdersLoading(false);
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
          ) : orders.length === 0 ? (
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
              {orders.map((order, index) => {
                const orderId = order._id || order.id || `order-${index}`;
                const serviceTitle = order.service?.title_en || 
                                   order.service?.title_ar || 
                                   order.service?.title || 
                                   order.service?.name || 
                                   (language === 'en' ? 'Unknown Service' : 'خدمة غير معروفة');
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
                  <Card key={orderId} className="border-2 hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <Package className="h-6 w-6 text-gold" />
                            </div>
                            <div>
                              <CardTitle className="text-xl">
                                {language === 'en' ? 'Order' : 'طلب'} #{index + 1}
                              </CardTitle>
                              {orderDate && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{orderDate}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
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

                      {/* Service */}
                      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                        <div className="w-10 h-10 bg-gold/20 rounded-full flex items-center justify-center flex-shrink-0">
                          <Package className="h-5 w-5 text-gold" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-muted-foreground mb-1">
                            {language === 'en' ? 'Service' : 'الخدمة'}
                          </p>
                          <p className="text-base font-semibold text-card-foreground">
                            {serviceTitle}
                          </p>
                        </div>
                      </div>

                      {/* Order Details */}
                      {order.section && (
                        <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border">
                          <h4 className="font-semibold text-lg text-card-foreground mb-3">
                            {language === 'en' ? 'Order Details' : 'تفاصيل الطلب'}
                          </h4>
                          
                          {order.section.title && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">
                                {language === 'en' ? 'Title' : 'العنوان'}
                              </p>
                              <p className="text-base text-card-foreground">{order.section.title}</p>
                            </div>
                          )}

                          {order.section.description && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">
                                {language === 'en' ? 'Description' : 'الوصف'}
                              </p>
                              <p className="text-base text-card-foreground">{order.section.description}</p>
                            </div>
                          )}

                          {order.section.textarea && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-1">
                                {language === 'en' ? 'Details' : 'التفاصيل'}
                              </p>
                              <p className="text-base text-card-foreground whitespace-pre-wrap bg-background/50 p-3 rounded border border-border">
                                {order.section.textarea}
                              </p>
                            </div>
                          )}

                          {order.section.image && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground mb-2">
                                {language === 'en' ? 'Image' : 'الصورة'}
                              </p>
                              <div className="rounded-lg border border-border overflow-hidden bg-muted/20">
                                <img 
                                  src={order.section.image} 
                                  alt={order.section.title || 'Order image'}
                                  className="w-full h-auto max-h-96 object-contain"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Contact Button */}
                      <div className="flex gap-2 pt-2">
                        <Button
                          onClick={() => window.location.href = `mailto:${order.email}`}
                          className="flex-1 bg-gold hover:bg-gold-dark text-black font-semibold"
                        >
                          <Mail className="h-4 w-4 mr-2" />
                          {language === 'en' ? 'Contact via Email' : 'التواصل عبر البريد'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Orders;

