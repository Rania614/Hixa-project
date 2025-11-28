import React from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Eye, Calendar } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ClientContracts = () => {
  const { language } = useApp();
  const navigate = useNavigate();

  const contracts = [
    {
      id: 1,
      project: "Residential Building Design",
      engineer: "Ahmed Al-Mansouri",
      type: "Service Agreement",
      status: "signed",
      date: "2024-01-20",
      files: ["Contract.pdf", "Terms.pdf"],
    },
    {
      id: 2,
      project: "Office Complex Construction",
      engineer: "Fatima Al-Zahra",
      type: "NDA",
      status: "pending",
      date: "2024-02-15",
      files: ["NDA.pdf"],
    },
  ];

  const files = [
    { name: "Project Brief.pdf", size: "2.4 MB", date: "2024-01-15", type: "document" },
    { name: "Site Plans.dwg", size: "5.1 MB", date: "2024-01-20", type: "drawing" },
    { name: "Requirements.docx", size: "1.2 MB", date: "2024-01-18", type: "document" },
  ];

  return (
    <DashboardLayout userType="client">
      <div className="space-y-6">
        {/* Breadcrumb */}
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/client/dashboard"
                className="text-hexa-text-light hover:text-hexa-secondary transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/client/dashboard");
                }}
              >
                {getDashboardText("dashboard", language)}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="text-hexa-text-light" />
            <BreadcrumbItem>
              <BreadcrumbPage className="text-hexa-secondary font-semibold">
                {getDashboardText("contractsFiles", language)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div>
          <h1 className="text-3xl font-bold text-hexa-text-dark">
            {getDashboardText("contractsFiles", language)}
          </h1>
          <p className="text-hexa-text-light mt-1">
            {language === "en" ? "Manage contracts and project files" : "إدارة العقود وملفات المشروع"}
          </p>
        </div>

        {/* Contracts Section */}
        <Card className="bg-hexa-card border-hexa-border">
          <CardHeader>
            <CardTitle className="text-hexa-text-dark">{language === "en" ? "Contracts" : "العقود"}</CardTitle>
            <CardDescription className="text-hexa-text-light">
              {language === "en" ? "View and manage your project contracts" : "عرض وإدارة عقود مشروعك"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contracts.map((contract) => (
                <div key={contract.id} className="p-4 border-hexa-border rounded-lg hover:bg-hexa-bg transition-colors bg-hexa-card border">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <FileText className="w-5 h-5 text-hexa-secondary" />
                        <div>
                          <p className="font-medium text-hexa-text-dark">{contract.project}</p>
                          <p className="text-sm text-hexa-text-light">{contract.engineer} • {contract.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <Badge 
                          variant={contract.status === "signed" ? "default" : "outline"}
                          className={contract.status === "signed" 
                            ? "bg-hexa-secondary text-black border-hexa-secondary" 
                            : "bg-hexa-secondary/10 text-hexa-secondary border-hexa-secondary/20"}
                        >
                          {contract.status === "signed" 
                            ? (language === "en" ? "Signed" : "مُوقع")
                            : (language === "en" ? "Pending" : "قيد الانتظار")}
                        </Badge>
                        <span className="text-sm text-hexa-text-light flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {contract.date}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary hover:text-black hover:border-hexa-secondary"
                      >
                        <Eye className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                        {language === "en" ? "View" : "عرض"}
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary hover:text-black hover:border-hexa-secondary"
                      >
                        <Download className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                        {language === "en" ? "Download" : "تحميل"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Files Section */}
        <Card className="bg-hexa-card border-hexa-border">
          <CardHeader>
            <CardTitle className="text-hexa-text-dark">{getDashboardText("filesAttachments", language)}</CardTitle>
            <CardDescription className="text-hexa-text-light">
              {language === "en" ? "All project files and attachments" : "جميع ملفات المشروع والمرفقات"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 border-hexa-border rounded-lg hover:bg-hexa-bg transition-colors bg-hexa-card border">
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-hexa-secondary" />
                    <div>
                      <p className="font-medium text-hexa-text-dark">{file.name}</p>
                      <p className="text-sm text-hexa-text-light">{file.size} • {file.date}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary hover:text-black hover:border-hexa-secondary"
                    >
                      <Eye className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                      {language === "en" ? "View" : "عرض"}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary hover:text-black hover:border-hexa-secondary"
                    >
                      <Download className={`w-4 h-4 ${language === "ar" ? "ml-2" : "mr-2"}`} />
                      {language === "en" ? "Download" : "تحميل"}
                    </Button>
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

export default ClientContracts;

