import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, FileText, MessageSquare, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const EngineerNotifications = () => {
  const { language } = useApp();
  const navigate = useNavigate();

  const notifications = [
    {
      id: 1,
      type: "proposal",
      title: "Proposal accepted",
      message: "Your proposal for Residential Building Design has been accepted",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 2,
      type: "message",
      title: "New message",
      message: "You have a new message from Ahmed Al-Saud",
      time: "3 hours ago",
      read: false,
    },
    {
      id: 3,
      type: "milestone",
      title: "Milestone approved",
      message: "Initial Design milestone has been approved by client",
      time: "2 days ago",
      read: true,
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "proposal":
        return <FileText className="w-5 h-5" />;
      case "message":
        return <MessageSquare className="w-5 h-5" />;
      case "milestone":
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  return (
    <DashboardLayout userType="engineer">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/engineer/dashboard"
                className="text-hexa-text-light hover:text-hexa-secondary transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/engineer/dashboard");
                }}
              >
                {getDashboardText("dashboard", language)}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-hexa-text-light" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-hexa-secondary font-semibold">
                {getDashboardText("notifications", language)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h1 className="text-3xl font-bold text-hexa-text-dark">
            {getDashboardText("notifications", language)}
          </h1>
          <p className="text-hexa-text-light mt-1">
            {language === "en" ? "Stay updated with your project activities" : "ابق على اطلاع بأنشطة مشروعك"}
          </p>
        </div>

        <Card className="bg-hexa-card border-hexa-border">
          <CardHeader>
            <CardTitle className="text-hexa-text-dark">{language === "en" ? "All Notifications" : "جميع الإشعارات"}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 rounded-lg border transition-colors ${
                    notification.read
                      ? "bg-hexa-bg border-hexa-border"
                      : "bg-hexa-secondary/10 border-hexa-secondary/20"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg ${
                      notification.read ? "bg-hexa-bg" : "bg-hexa-secondary/10"
                    } text-hexa-secondary`}>
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-hexa-text-dark">{notification.title}</p>
                          <p className="text-sm text-hexa-text-light mt-1">{notification.message}</p>
                        </div>
                        {!notification.read && (
                          <Badge className="bg-hexa-secondary text-black font-bold">New</Badge>
                        )}
                      </div>
                      <p className="text-xs text-hexa-text-light mt-2">{notification.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default EngineerNotifications;

