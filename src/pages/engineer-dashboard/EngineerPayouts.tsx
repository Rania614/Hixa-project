import React from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const EngineerPayouts = () => {
  const { language } = useApp();

  const stats = [
    { label: language === "en" ? "Total Earnings" : "إجمالي الأرباح", value: "125,000 SAR", icon: DollarSign },
    { label: language === "en" ? "Pending" : "قيد الانتظار", value: "25,000 SAR", icon: Calendar },
    { label: language === "en" ? "Available" : "متاح", value: "100,000 SAR", icon: TrendingUp },
  ];

  const transactions = [
    {
      id: 1,
      project: "Residential Building Design",
      amount: "50,000 SAR",
      status: "completed",
      date: "2024-02-15",
      type: "milestone",
    },
    {
      id: 2,
      project: "Office Complex Construction",
      amount: "30,000 SAR",
      status: "pending",
      date: "2024-02-20",
      type: "milestone",
    },
    {
      id: 3,
      project: "Bridge Engineering Project",
      amount: "20,000 SAR",
      status: "completed",
      date: "2024-02-10",
      type: "final",
    },
  ];

  return (
    <DashboardLayout userType="engineer">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-hexa-text-dark">
            {getDashboardText("payoutsEarnings", language)}
          </h1>
          <p className="text-hexa-text-light mt-1">
            {language === "en" ? "Track your earnings and payouts" : "تتبع أرباحك ومدفوعاتك"}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <Card key={idx} className="bg-hexa-card border-hexa-border hover:border-hexa-secondary/50 transition-colors">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-hexa-text-light mb-1">{stat.label}</p>
                      <p className="text-2xl font-bold text-hexa-text-dark">{stat.value}</p>
                    </div>
                    <div className="p-3 bg-hexa-secondary/20 rounded-lg">
                      <Icon className="w-6 h-6 text-hexa-secondary" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Transactions */}
        <Card className="bg-hexa-card border-hexa-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-hexa-text-dark">{language === "en" ? "Transaction History" : "سجل المعاملات"}</CardTitle>
                <CardDescription className="text-hexa-text-light">
                  {language === "en" ? "All your earnings and payouts" : "جميع أرباحك ومدفوعاتك"}
                </CardDescription>
              </div>
              <Button variant="outline" className="border-hexa-border bg-hexa-bg text-hexa-text-light hover:bg-hexa-secondary/20 hover:text-hexa-secondary hover:border-hexa-secondary">
                <Download className="w-4 h-4 mr-2" />
                {language === "en" ? "Export" : "تصدير"}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="p-4 border border-hexa-border rounded-lg hover:bg-hexa-bg transition-colors bg-hexa-bg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-5 h-5 text-hexa-secondary" />
                        <div>
                          <p className="font-medium text-hexa-text-dark">{transaction.project}</p>
                          <p className="text-sm text-hexa-text-light">
                            {transaction.type === "milestone"
                              ? (language === "en" ? "Milestone Payment" : "دفعة معلم")
                              : (language === "en" ? "Final Payment" : "الدفعة النهائية")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <Badge 
                          variant={transaction.status === "completed" ? "default" : "outline"}
                          className={transaction.status === "completed" 
                            ? "bg-hexa-secondary text-black font-bold" 
                            : "bg-hexa-card text-hexa-text-light border-hexa-border"}
                        >
                          {transaction.status === "completed"
                            ? (language === "en" ? "Completed" : "مكتمل")
                            : (language === "en" ? "Pending" : "قيد الانتظار")}
                        </Badge>
                        <span className="text-sm text-hexa-text-light flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {transaction.date}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-hexa-text-dark">{transaction.amount}</p>
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

export default EngineerPayouts;

