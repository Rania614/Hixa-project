import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminTopBar } from "@/components/AdminTopBar";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bell, FileText, MessageSquare, CheckCircle, XCircle, X, Check, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNotifications } from "@/hooks/useNotifications";
import { useUnreadNotificationsCount } from "@/hooks/useUnreadNotificationsCount";
import { useNotificationWebSocket } from "@/hooks/useNotificationWebSocket";
import { notificationsApi, Notification } from "@/services/notificationsApi";
import { toast } from "@/components/ui/sonner";

const AdminNotifications = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  
  const { notifications, meta, loading, markAsRead, removeNotification, refetch, goToPage, page: currentPage } = useNotifications({
    page: 1,
    limit: 20,
    autoRefresh: true,
  });
  
  const { unreadCount, refetch: refetchCount } = useUnreadNotificationsCount();

  // WebSocket integration for real-time notifications
  useNotificationWebSocket({
    enabled: true,
    onNewNotification: (notification) => {
      // Refresh notifications list when a new notification arrives
      refetch();
      refetchCount();
    },
  });

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "proposal_submitted":
      case "proposal_accepted":
      case "proposal_rejected":
        return <FileText className="w-5 h-5" />;
      case "message_received":
        return <MessageSquare className="w-5 h-5" />;
      case "project_approved":
      case "project_completed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "project_rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  // Normalize actionUrl to match the correct route format for admin
  const normalizeActionUrl = (notification: Notification): string | null => {
    const actionUrl = notification.actionUrl;
    if (!actionUrl) return null;

    // If it already starts with /admin/, return as is
    if (actionUrl.startsWith('/admin/')) {
      return actionUrl;
    }

    // Convert /projects/:id to /admin/projects/:id
    if (actionUrl.startsWith('/projects/')) {
      return actionUrl.replace('/projects/', '/admin/projects/');
    }

    // Convert /chat/:id or /messages to /admin/messages
    if (actionUrl.startsWith('/chat/') || actionUrl.startsWith('/messages')) {
      return '/admin/messages';
    }

    // Convert /proposals/:id - try to get projectId from notification.data
    if (actionUrl.startsWith('/proposals/')) {
      if (notification.data?.projectId) {
        return `/admin/projects/${notification.data.projectId}/proposals`;
      }
      return '/admin/projects';
    }

    // Convert /users/:id to /admin/users
    if (actionUrl.startsWith('/users/')) {
      return '/admin/users';
    }

    // For any other URLs starting with /, prepend /admin
    if (actionUrl.startsWith('/')) {
      return `/admin${actionUrl}`;
    }

    return actionUrl;
  };

  const handleNotificationClick = async (notification: Notification) => {
    if (!notification.isRead) {
      try {
        setProcessingIds((prev) => new Set(prev).add(notification._id));
        await markAsRead(notification._id);
        refetchCount();
      } catch (error) {
        console.error("Error marking notification as read:", error);
      } finally {
        setProcessingIds((prev) => {
          const newSet = new Set(prev);
          newSet.delete(notification._id);
          return newSet;
        });
      }
    }

    const normalizedUrl = normalizeActionUrl(notification);
    if (normalizedUrl) {
      navigate(normalizedUrl);
    }
  };

  const handleMarkAsRead = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    try {
      setProcessingIds((prev) => new Set(prev).add(notificationId));
      await markAsRead(notificationId);
      refetchCount();
    } catch (error) {
      toast.error(
        language === "en" ? "Failed to mark notification as read" : "فشل في تحديد الإشعار كمقروء"
      );
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleDelete = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    if (!confirm(language === "en" ? "Are you sure you want to delete this notification?" : "هل أنت متأكد من حذف هذا الإشعار؟")) {
      return;
    }

    try {
      setProcessingIds((prev) => new Set(prev).add(notificationId));
      await removeNotification(notificationId);
      refetchCount();
    } catch (error) {
      toast.error(
        language === "en" ? "Failed to delete notification" : "فشل في حذف الإشعار"
      );
    } finally {
      setProcessingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllNotificationsAsRead();
      refetch();
      refetchCount();
      toast.success(
        language === "en" ? "All notifications marked as read" : "تم تحديد جميع الإشعارات كمقروءة"
      );
    } catch (error) {
      toast.error(
        language === "en" ? "Failed to mark all as read" : "فشل في تحديد الكل كمقروء"
      );
    }
  };

  const handleDeleteAllRead = async () => {
    if (!confirm(language === "en" ? "Are you sure you want to delete all read notifications?" : "هل أنت متأكد من حذف جميع الإشعارات المقروءة؟")) {
      return;
    }

    try {
      await notificationsApi.deleteAllReadNotifications();
      refetch();
      refetchCount();
      toast.success(
        language === "en" ? "All read notifications deleted" : "تم حذف جميع الإشعارات المقروءة"
      );
    } catch (error) {
      toast.error(
        language === "en" ? "Failed to delete read notifications" : "فشل في حذف الإشعارات المقروءة"
      );
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
              {language === 'en' ? 'Notifications' : 'الإشعارات'}
            </h2>
            <p className="text-muted-foreground">
              {language === 'en'
                ? 'Stay updated with platform activities and important updates'
                : 'ابق على اطلاع بنشاطات المنصة والتحديثات المهمة'}
            </p>
          </div>

          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {language === "en" ? "All Notifications" : "جميع الإشعارات"}
                </CardTitle>
                <div className="flex gap-2">
                  {unreadCount > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleMarkAllAsRead}
                      className="text-xs"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      {language === "en" ? `Mark All Read (${unreadCount})` : `تحديد الكل كمقروء (${unreadCount})`}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteAllRead}
                    className="text-xs"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {language === "en" ? "Delete Read" : "حذف المقروءة"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading && notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {language === "en" ? "Loading..." : "جاري التحميل..."}
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {language === "en" ? "No notifications" : "لا توجد إشعارات"}
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {notifications.map((notification) => {
                      const isProcessing = processingIds.has(notification._id);
                      return (
                        <div
                          key={notification._id}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                            notification.isRead
                              ? "bg-card border-border hover:bg-muted/50"
                              : "bg-primary/5 border-primary/20 hover:bg-primary/10"
                          } ${isProcessing ? "opacity-50 pointer-events-none" : ""}`}
                        >
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-lg flex-shrink-0 ${
                              notification.isRead ? "bg-muted" : "bg-primary/10"
                            }`}>
                              <div className={notification.isRead ? "text-muted-foreground" : "text-primary"}>
                                {getIcon(notification.type)}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex-1 min-w-0">
                                  <p className="font-medium">{notification.title}</p>
                                  <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                                  <p className="text-xs text-muted-foreground mt-2">
                                    {formatDistanceToNow(new Date(notification.createdAt), {
                                      addSuffix: true,
                                    })}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                  {!notification.isRead && (
                                    <Badge className="bg-primary text-primary-foreground font-semibold">
                                      {language === "en" ? "New" : "جديد"}
                                    </Badge>
                                  )}
                                  {!notification.isRead && (
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={(e) => handleMarkAsRead(e, notification._id)}
                                      title={language === "en" ? "Mark as read" : "تحديد كمقروء"}
                                    >
                                      <Check className="w-4 h-4" />
                                    </Button>
                                  )}
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                    onClick={(e) => handleDelete(e, notification._id)}
                                    title={language === "en" ? "Delete" : "حذف"}
                                  >
                                    <X className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {meta && meta.pages > 1 && (
                    <div className="flex items-center justify-center gap-4 mt-6">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={loading || currentPage === 1}
                      >
                        {language === "en" ? "Previous" : "السابق"}
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        {language === "en" ? `Page ${currentPage} of ${meta.pages}` : `صفحة ${currentPage} من ${meta.pages}`}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={loading || currentPage === meta.pages}
                      >
                        {language === "en" ? "Next" : "التالي"}
                      </Button>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  );
};

export default AdminNotifications;

