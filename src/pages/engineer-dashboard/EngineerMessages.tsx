import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Send } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const EngineerMessages = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState(1);
  const [message, setMessage] = useState("");

  const conversations = [
    {
      id: 1,
      type: "admin",
      project: "Admin Communication",
      lastMessage: "I've reviewed your proposal. It looks good! I'll approve it.",
      time: "2 hours ago",
      unread: 1,
    },
    {
      id: 2,
      type: "client",
      project: "Residential Building Design",
      lastMessage: "Great! Looking forward to seeing the progress.",
      time: "3 hours ago",
      unread: 0,
    },
    {
      id: 3,
      type: "client",
      project: "Industrial Plant Design",
      lastMessage: "Thank you for the update.",
      time: "1 day ago",
      unread: 0,
    },
  ];

  const messages = [
    { id: 1, sender: "engineer", text: "Hello! I've submitted my proposal for the project. Please review it when you have time.", time: "10:00 AM" },
    { id: 2, sender: "admin", text: "Thank you for submitting. I'll review it and get back to you by tomorrow.", time: "10:15 AM" },
    { id: 3, sender: "engineer", text: "Perfect! I've also attached the required documents. Let me know if you need anything else.", time: "10:30 AM" },
    { id: 4, sender: "admin", text: "I've reviewed your proposal. It looks good! I'll approve it and assign you to the project.", time: "11:00 AM" },
  ];

  const currentChat = conversations.find(c => c.id === selectedChat);

  return (
    <DashboardLayout userType="engineer">
      <div className="space-y-4 mb-4">
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
                {getDashboardText("messages", language)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="h-[calc(100vh-14rem)]">
        <div className="flex h-full gap-4">
          {/* Conversations List */}
          <Card className="w-72 md:w-80 flex-shrink-0 bg-hexa-card border-hexa-border">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="p-4 border-b border-hexa-border">
                <h2 className="text-lg font-bold text-hexa-text-dark mb-3">
                  {getDashboardText("messages", language)}
                </h2>
                <div className="relative">
                  <Search className={`absolute top-1/2 transform -translate-y-1/2 text-hexa-text-light w-4 h-4 ${language === "ar" ? "right-3" : "left-3"}`} />
                  <Input
                    placeholder={language === "en" ? "Search conversations..." : "البحث في المحادثات..."}
                    className={`${language === "ar" ? "pr-10" : "pl-10"} bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light h-10`}
                  />
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {conversations.map((conv) => (
                    <div
                      key={conv.id}
                      onClick={() => setSelectedChat(conv.id)}
                      className={`p-2 rounded-lg cursor-pointer transition-colors mb-1.5 ${
                        selectedChat === conv.id
                          ? "bg-hexa-secondary/20 border border-hexa-secondary/40"
                          : "hover:bg-hexa-bg"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Avatar className="w-9 h-9 flex-shrink-0">
                          <AvatarFallback className="bg-hexa-secondary text-black text-sm font-semibold">
                            {conv.type === "admin" ? (language === "en" ? "A" : "م") : (language === "en" ? "C" : "ع")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0 overflow-hidden">
                          <div className="flex items-center justify-between gap-1.5 mb-1">
                            <p className="font-semibold text-xs text-hexa-text-dark truncate flex-1 min-w-0">
                              {conv.type === "admin" ? (language === "en" ? "Admin" : "المسؤول") : (language === "en" ? "Client" : "العميل")}
                            </p>
                            {conv.unread > 0 && (
                              <span className="bg-hexa-secondary text-black text-xs rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center font-bold flex-shrink-0 shadow-md border border-hexa-card">
                                {conv.unread}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-hexa-text-light truncate mb-0.5 font-medium">{conv.project}</p>
                          <p className="text-[11px] text-hexa-text-light truncate line-clamp-1 mb-0.5">{conv.lastMessage}</p>
                          <p className="text-[10px] text-hexa-text-light">{conv.time}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="flex-1 flex flex-col bg-hexa-card border-hexa-border">
            <CardContent className="p-0 h-full flex flex-col">
              {currentChat && (
                <>
                  <div className="p-4 border-b border-hexa-border">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-hexa-secondary text-black text-sm">
                          {currentChat.type === "admin" ? (language === "en" ? "A" : "م") : (language === "en" ? "C" : "ع")}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-hexa-text-dark text-sm">
                          {currentChat.type === "admin" ? (language === "en" ? "Admin" : "المسؤول") : (language === "en" ? "Client" : "العميل")}
                        </p>
                        <p className="text-xs text-hexa-text-light">{currentChat.project}</p>
                      </div>
                    </div>
                  </div>
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      {messages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender === "engineer" ? "justify-end" : "justify-start"}`}
                        >
                          <div
                            className={`max-w-[75%] md:max-w-[70%] rounded-xl p-3 ${
                              msg.sender === "engineer"
                                ? "bg-hexa-secondary/40 text-hexa-text-dark font-semibold shadow-lg shadow-hexa-secondary/15 border border-hexa-secondary/30"
                                : msg.sender === "admin"
                                ? "bg-hexa-bg border border-hexa-border/50 text-hexa-text-dark shadow-md"
                                : "bg-hexa-bg border border-hexa-border/50 text-hexa-text-dark shadow-md"
                            }`}
                          >
                            <p className={`leading-relaxed text-sm ${
                              msg.sender === "engineer" 
                                ? "text-hexa-text-dark font-semibold" 
                                : "text-hexa-text-dark font-normal"
                            }`}>
                              {msg.text}
                            </p>
                            <p className={`text-xs mt-2 ${
                              msg.sender === "engineer" 
                                ? "text-hexa-text-light font-semibold" 
                                : "text-hexa-text-light font-normal"
                            }`}>
                              {msg.time}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t border-hexa-border">
                    <div className="flex gap-2">
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={language === "en" ? "Type a message..." : "اكتب رسالة..."}
                        className="flex-1 bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light h-11"
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && message.trim()) {
                            setMessage("");
                          }
                        }}
                      />
                      <Button
                        onClick={() => {
                          if (message.trim()) {
                            setMessage("");
                          }
                        }}
                        className="bg-hexa-secondary hover:bg-hexa-secondary/90 text-black h-11 px-4"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EngineerMessages;

