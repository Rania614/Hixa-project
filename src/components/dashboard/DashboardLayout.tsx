import React, { useEffect } from "react";
import { useApp } from "@/context/AppContext";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardTopBar } from "./DashboardTopBar";

interface DashboardLayoutProps {
  children: React.ReactNode;
  userType: "client" | "engineer";
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, userType }) => {
  const { language } = useApp();

  useEffect(() => {
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = language;
  }, [language]);

  return (
    <div className="min-h-screen bg-hexa-bg text-hexa-text-dark" dir={language === "ar" ? "rtl" : "ltr"}>
      <div className="flex h-screen overflow-hidden">
        <DashboardSidebar userType={userType} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardTopBar userType={userType} />
          <main className="flex-1 overflow-y-auto bg-hexa-bg">
            <div className="p-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

