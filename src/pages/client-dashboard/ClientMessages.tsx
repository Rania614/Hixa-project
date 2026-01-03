import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useApp } from "@/context/AppContext";
import { getDashboardText } from "@/locales/dashboard";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Paperclip, Loader2, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/sonner";
import { messagesApi, ProjectRoom, ChatRoom, Message } from "@/services/messagesApi";
import { socketService, SocketMessageEvent } from "@/services/socketService";
import { http } from "@/services/http";
import { formatDistanceToNow } from "date-fns";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const ClientMessages = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  
  // Get user from localStorage
  const [user, setUser] = useState<any>(null);
  
  // State
  const [projectRooms, setProjectRooms] = useState<ProjectRoom[]>([]);
  const [selectedProjectRoom, setSelectedProjectRoom] = useState<ProjectRoom | null>(null);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [attachments, setAttachments] = useState<File[]>([]);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedChatRoomRef = useRef<ChatRoom | null>(null);
  
  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      try {
        // Try to get user from localStorage first
        const userStr = localStorage.getItem("user");
        if (userStr) {
          try {
            const userData = JSON.parse(userStr);
            setUser(userData);
            console.log('✅ User loaded from localStorage:', userData._id || userData.id);
          } catch (e) {
            console.error("Error parsing user from localStorage:", e);
          }
        }
        
        // If no user in localStorage, try to fetch from API
        if (!userStr) {
          try {
            const response = await http.get("/auth/me");
            const userData = response.data?.user || response.data?.data || response.data;
            if (userData) {
              setUser(userData);
              localStorage.setItem("user", JSON.stringify(userData));
              console.log('✅ User loaded from API:', userData._id || userData.id);
            }
          } catch (error: any) {
            console.warn("Could not fetch user data:", error);
          }
        }
      } catch (error) {
        console.error("Error loading user:", error);
      }
    };
    
    loadUser();
  }, []);

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load Project Rooms
  const loadProjectRooms = useCallback(async () => {
    try {
      setLoading(true);
      const rooms = await messagesApi.getProjectRooms();
      // Filter: Client sees only their project rooms
      // Backend should already filter this, but we add extra safety
      setProjectRooms(rooms);
      if (rooms.length > 0 && !selectedProjectRoom) {
        setSelectedProjectRoom(rooms[0]);
      }
    } catch (error: any) {
      console.error('Error loading project rooms:', error);
      if (error.response?.status !== 404) {
        toast.error(language === 'en' ? 'Failed to load projects' : 'فشل تحميل المشاريع');
      }
      setProjectRooms([]);
    } finally {
      setLoading(false);
    }
  }, [language, selectedProjectRoom]);

  // Load Chat Rooms (filter: admin-client and group only)
  const loadChatRooms = useCallback(async (projectRoomId: string) => {
    try {
      const rooms = await messagesApi.getChatRooms(projectRoomId);
      // Filter: Client sees only admin-client and group chat rooms
      const filteredRooms = rooms.filter(room => 
        room.type === 'admin-client' || room.type === 'group'
      );
      setChatRooms(filteredRooms);
      if (filteredRooms.length > 0 && !selectedChatRoom) {
        setSelectedChatRoom(filteredRooms[0]);
      }
    } catch (error: any) {
      console.error('Error loading chat rooms:', error);
      if (error.response?.status !== 404) {
        toast.error(language === 'en' ? 'Failed to load chats' : 'فشل تحميل المحادثات');
      }
      setChatRooms([]);
    }
  }, [language, selectedChatRoom]);

  // Load Messages
  const loadMessages = useCallback(async (chatRoomId: string, pageNum: number = 1, append: boolean = false) => {
    try {
      setLoadingMessages(true);
      const response = await messagesApi.getMessages(chatRoomId, pageNum, 50);
      
      if (!response || !response.messages) {
        setMessages([]);
        setHasMore(false);
        setPage(pageNum);
        return;
      }
      
      if (append) {
        setMessages((prev) => [...prev, ...response.messages]);
      } else {
        // Reverse to show oldest first
        const reversed = response.messages.length > 0 ? [...response.messages].reverse() : [];
        setMessages(reversed);
      }
      setHasMore(response.page < response.totalPages);
      setPage(pageNum);
      if (!append) {
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error: any) {
      console.error('Error loading messages:', error);
      if (error.response?.status !== 404) {
        toast.error(language === 'en' ? 'Failed to load messages' : 'فشل تحميل الرسائل');
      }
      setMessages([]);
      setHasMore(false);
    } finally {
      setLoadingMessages(false);
    }
  }, [scrollToBottom, language]);

  // Send Message
  const handleSendMessage = async () => {
    if (!selectedChatRoom || (!message.trim() && attachments.length === 0)) return;
    
    // Validate attachments before sending
    const maxSize = 50 * 1024 * 1024; // 50MB
    const invalidFiles = attachments.filter(file => file.size > maxSize);
    
    if (invalidFiles.length > 0) {
      toast.error(
        language === 'en' 
          ? `Cannot send files larger than 50MB: ${invalidFiles.map(f => f.name).join(', ')}`
          : `لا يمكن إرسال ملفات أكبر من 50 ميجابايت: ${invalidFiles.map(f => f.name).join(', ')}`
      );
      return;
    }
    
    try {
      setSending(true);
      setUploadProgress(0);
      const messageType = attachments.length > 0 ? 'file' : 'text';
      const messageContent = message.trim() || (attachments.length > 0 
        ? (language === 'en' ? `Sent ${attachments.length} file(s)` : `تم إرسال ${attachments.length} ملف(ات)`)
        : '');
      
      const sentMessage = await messagesApi.sendMessage(
        selectedChatRoom._id,
        messageContent,
        messageType,
        attachments.length > 0 ? attachments : undefined,
        (progress) => {
          setUploadProgress(progress);
        }
      );
      
      // Clear input immediately for better UX
      setMessage("");
      setAttachments([]);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      // Don't add message manually - wait for Socket.io event
      // But if Socket.io fails, add it optimistically after 1 second
      setTimeout(() => {
        setMessages((prev) => {
          const exists = prev.some(m => m._id === sentMessage._id);
          if (!exists) {
            return [...prev, sentMessage].sort(
              (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            );
          }
          return prev;
        });
      }, 1000);
      
      toast.success(
        language === 'en' 
          ? attachments.length > 0 
            ? `Sent ${attachments.length} file(s) successfully`
            : 'Message sent successfully'
          : attachments.length > 0
            ? `تم إرسال ${attachments.length} ملف(ات) بنجاح`
            : 'تم إرسال الرسالة بنجاح'
      );
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMessage = error.response?.data?.message || error.message || 
        (language === 'en' ? 'Failed to send message' : 'فشل إرسال الرسالة');
      toast.error(errorMessage);
      setUploadProgress(0);
    } finally {
      setSending(false);
    }
  };

  // Handle new message from Socket.io
  const handleNewMessage = useCallback((data: SocketMessageEvent) => {
    console.log('📨 New message received:', data);
    if (!selectedChatRoomRef.current || data.chatRoomId !== selectedChatRoomRef.current._id) {
      console.log('📨 Message for different chat room, ignoring');
      return;
    }
    
    const newMessage = data.message;
    setMessages((prev) => {
      // Check if message already exists
      const exists = prev.some(m => m._id === newMessage._id);
      if (exists) {
        console.log('📨 Message already exists, skipping');
        return prev;
      }
      // Add new message and sort by date
      const updated = [...prev, newMessage].sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      console.log('📨 Messages updated:', updated.length);
      return updated;
    });
    setTimeout(() => scrollToBottom(), 100);
  }, [scrollToBottom]);

  // Get Chat Room Title
  const getChatRoomTitle = (chatRoom: ChatRoom): string => {
    if (chatRoom.type === 'admin-client') {
      return language === 'en' ? 'Admin' : 'المسؤول';
    } else if (chatRoom.type === 'group') {
      return language === 'en' ? 'Group Chat' : 'الدردشة الجماعية';
    }
    return language === 'en' ? 'Chat' : 'محادثة';
  };

  // Get Chat Room Avatar
  const getChatRoomAvatar = (chatRoom: ChatRoom): string => {
    if (chatRoom.type === 'admin-client') {
      return language === 'en' ? 'A' : 'م';
    } else if (chatRoom.type === 'group') {
      return language === 'en' ? 'G' : 'ج';
    }
    return '?';
  };

  // File handling
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Validate file size (50MB max per file)
    const maxSize = 50 * 1024 * 1024; // 50MB
    const invalidFiles = files.filter(file => file.size > maxSize);
    
    if (invalidFiles.length > 0) {
      toast.error(
        language === 'en' 
          ? `File size exceeds 50MB: ${invalidFiles.map(f => f.name).join(', ')}`
          : `حجم الملف يتجاوز 50 ميجابايت: ${invalidFiles.map(f => f.name).join(', ')}`
      );
      // Only add valid files
      const validFiles = files.filter(file => file.size <= maxSize);
      if (validFiles.length > 0) {
        setAttachments((prev) => [...prev, ...validFiles]);
      }
    } else {
      // All files are valid
      setAttachments((prev) => [...prev, ...files]);
    }
    
    // Reset input to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  // Effects
  useEffect(() => {
    loadProjectRooms();
  }, [loadProjectRooms]);

  useEffect(() => {
    if (selectedProjectRoom) {
      loadChatRooms(selectedProjectRoom._id);
    }
  }, [selectedProjectRoom, loadChatRooms]);

  useEffect(() => {
    if (selectedChatRoom) {
      selectedChatRoomRef.current = selectedChatRoom;
      setMessages([]);
      setPage(1);
      loadMessages(selectedChatRoom._id, 1, false);
      // Mark chat room as read
      messagesApi.markChatRoomAsRead(selectedChatRoom._id).catch(console.error);
      // Join Socket.io room
      socketService.joinRoom(selectedChatRoom._id);
    }
    return () => {
      if (selectedChatRoom) {
        socketService.leaveRoom(selectedChatRoom._id);
      }
    };
  }, [selectedChatRoom, loadMessages]);

  // Socket.io listeners
  useEffect(() => {
    socketService.on('new_message', handleNewMessage);
    return () => {
      socketService.off('new_message', handleNewMessage);
    };
  }, [handleNewMessage]);

  // Filter chat rooms by search
  const filteredChatRooms = chatRooms.filter(room => {
    const title = getChatRoomTitle(room).toLowerCase();
    const lastMessage = room.lastMessage?.content?.toLowerCase() || '';
    const search = searchTerm.toLowerCase();
    return title.includes(search) || lastMessage.includes(search);
  });

  return (
    <DashboardLayout userType="client">
      <div className="space-y-4 mb-4">
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
                {getDashboardText("messages", language)}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="h-[calc(100vh-14rem)]">
        <div className="flex h-full gap-4">
          {/* Project Rooms List */}
          <Card className="w-64 flex-shrink-0 bg-hexa-card border-hexa-border">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="p-4 border-b border-hexa-border">
                <h2 className="text-lg font-bold text-hexa-text-dark mb-3">
                  {language === 'en' ? 'Projects' : 'المشاريع'}
                </h2>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-hexa-secondary" />
                    </div>
                  ) : projectRooms.length === 0 ? (
                    <p className="text-sm text-hexa-text-light text-center py-8">
                      {language === 'en' ? 'No projects found' : 'لا توجد مشاريع'}
                    </p>
                  ) : (
                    projectRooms.map((room) => (
                      <div
                        key={room._id}
                        onClick={() => setSelectedProjectRoom(room)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors mb-2 ${
                          selectedProjectRoom?._id === room._id
                            ? "bg-hexa-secondary/20 border border-hexa-secondary/40"
                            : "hover:bg-hexa-bg"
                        }`}
                      >
                        <p className="font-semibold text-sm text-hexa-text-dark truncate">
                          {room.projectTitle}
                        </p>
                        <p className="text-xs text-hexa-text-light mt-1">
                          {formatDistanceToNow(new Date(room.lastActivityAt), { addSuffix: true })}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Rooms List */}
          <Card className="w-72 md:w-80 flex-shrink-0 bg-hexa-card border-hexa-border">
            <CardContent className="p-0 h-full flex flex-col">
              <div className="p-4 border-b border-hexa-border">
                <h2 className="text-lg font-bold text-hexa-text-dark mb-3">
                  {getDashboardText("messages", language)}
                </h2>
                <div className="relative">
                  <Search className={`absolute top-1/2 transform -translate-y-1/2 text-hexa-text-light w-4 h-4 ${language === "ar" ? "right-3" : "left-3"}`} />
                  <Input
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={language === "en" ? "Search conversations..." : "البحث في المحادثات..."}
                    className={`${language === "ar" ? "pr-10" : "pl-10"} bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light h-10`}
                  />
                </div>
              </div>
              <ScrollArea className="flex-1">
                <div className="p-2">
                  {filteredChatRooms.length === 0 ? (
                    <p className="text-sm text-hexa-text-light text-center py-8">
                      {language === 'en' ? 'No conversations found' : 'لا توجد محادثات'}
                    </p>
                  ) : (
                    filteredChatRooms.map((room) => (
                      <div
                        key={room._id}
                        onClick={() => setSelectedChatRoom(room)}
                        className={`p-2 rounded-lg cursor-pointer transition-colors mb-1.5 ${
                          selectedChatRoom?._id === room._id
                            ? "bg-hexa-secondary/20 border border-hexa-secondary/40"
                            : "hover:bg-hexa-bg"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <Avatar className="w-9 h-9 flex-shrink-0">
                            <AvatarFallback className="bg-hexa-secondary text-black text-sm font-semibold">
                              {getChatRoomAvatar(room)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0 overflow-hidden">
                            <div className="flex items-center justify-between gap-1.5 mb-1">
                              <p className="font-semibold text-xs text-hexa-text-dark truncate flex-1 min-w-0">
                                {getChatRoomTitle(room)}
                              </p>
                              {room.lastMessage && (
                                <span className="text-[10px] text-hexa-text-light flex-shrink-0">
                                  {formatDistanceToNow(new Date(room.lastMessage.createdAt), { addSuffix: true })}
                                </span>
                              )}
                            </div>
                            {room.lastMessage && (
                              <p className="text-[11px] text-hexa-text-light truncate line-clamp-1 mb-0.5">
                                {room.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="flex-1 flex flex-col bg-hexa-card border-hexa-border">
            <CardContent className="p-0 h-full flex flex-col">
              {selectedChatRoom ? (
                <>
                  <div className="p-4 border-b border-hexa-border">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback className="bg-hexa-secondary text-black text-sm">
                          {getChatRoomAvatar(selectedChatRoom)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-hexa-text-dark text-sm">
                          {getChatRoomTitle(selectedChatRoom)}
                        </p>
                        <p className="text-xs text-hexa-text-light">
                          {selectedProjectRoom?.projectTitle}
                        </p>
                      </div>
                    </div>
                  </div>
                  {/* Admin Observer Banner - Show for group chats */}
                  {selectedChatRoom.type === 'group' && selectedChatRoom.adminObserver && (
                    <div className="flex-shrink-0 bg-blue-500/10 border-b border-blue-500/20 px-4 py-2">
                      <div className="flex items-center gap-2 text-blue-400 text-xs">
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>
                          {language === 'en' 
                            ? 'This chat is monitored by admin to ensure both parties\' rights' 
                            : 'يتم رؤية محتوى هذه الدردشة من قبل الإدارة لضمان حقوق الطرفين'}
                        </span>
                      </div>
                    </div>
                  )}
                  <ScrollArea className="flex-1 p-4" ref={messagesContainerRef}>
                    {loadingMessages && messages.length === 0 ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-hexa-secondary" />
                      </div>
                    ) : messages.length === 0 ? (
                      <div className="flex items-center justify-center py-8">
                        <p className="text-sm text-hexa-text-light">
                          {language === 'en' ? 'No messages yet' : 'لا توجد رسائل بعد'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {messages.map((msg) => {
                          const senderId = typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;
                          const senderName = typeof msg.sender === 'object' ? msg.sender?.name : 'Unknown';
                          const isMe = senderId === user?._id || senderId === user?.id;
                          
                          return (
                            <div
                              key={msg._id}
                              className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[75%] md:max-w-[70%] rounded-xl p-3 ${
                                  isMe
                                    ? "bg-hexa-secondary/40 text-hexa-text-dark font-semibold shadow-lg shadow-hexa-secondary/15 border border-hexa-secondary/30"
                                    : "bg-hexa-bg border border-hexa-border/50 text-hexa-text-dark shadow-md"
                                }`}
                              >
                                {!isMe && (
                                  <p className="text-xs font-semibold text-hexa-text-light mb-1">
                                    {senderName}
                                  </p>
                                )}
                                {msg.attachments && msg.attachments.length > 0 && (
                                  <div className="mt-2 space-y-1.5">
                                    {msg.attachments.map((att, attIdx) => {
                                      const isImage = att.type === 'image' || /\.(jpg|jpeg|png|gif|webp)$/i.test(att.filename || att.name || '');
                                      const isPDF = /\.pdf$/i.test(att.filename || att.name || '');
                                      const isDocument = /\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(att.filename || att.name || '');
                                      const fileSize = att.size ? (att.size > 1024 * 1024 
                                        ? `${(att.size / (1024 * 1024)).toFixed(2)} MB`
                                        : `${(att.size / 1024).toFixed(2)} KB`) : '';
                                      
                                      return (
                                        <a
                                          key={attIdx}
                                          href={att.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="flex items-center gap-2 p-2 bg-hexa-bg border border-hexa-border rounded-md hover:border-hexa-secondary/50 hover:bg-hexa-bg/70 transition-all group"
                                        >
                                          {isImage && <span className="text-lg">🖼️</span>}
                                          {isPDF && <span className="text-lg">📄</span>}
                                          {isDocument && <span className="text-lg">📝</span>}
                                          {!isImage && !isPDF && !isDocument && <span className="text-lg">📎</span>}
                                          <div className="flex-1 min-w-0">
                                            <p className="text-xs font-medium text-hexa-text-dark truncate group-hover:text-hexa-secondary transition-colors">
                                              {att.filename || att.name || 'File'}
                                            </p>
                                            {fileSize && (
                                              <p className="text-[10px] text-hexa-text-light">{fileSize}</p>
                                            )}
                                          </div>
                                          <span className="text-xs text-hexa-text-light group-hover:text-hexa-secondary/80">⬇️</span>
                                        </a>
                                      );
                                    })}
                                  </div>
                                )}
                                {msg.content && (
                                  <p className={`leading-relaxed text-sm ${
                                    isMe 
                                      ? "text-hexa-text-dark font-semibold" 
                                      : "text-hexa-text-dark font-normal"
                                  }`}>
                                    {msg.content}
                                  </p>
                                )}
                                <p className={`text-xs mt-2 ${
                                  isMe 
                                    ? "text-hexa-text-light font-semibold" 
                                    : "text-hexa-text-light font-normal"
                                }`}>
                                  {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                </p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>
                  <div className="p-4 border-t border-hexa-border">
                    {attachments.length > 0 && (
                      <div className="mb-2 flex flex-wrap gap-2">
                        {attachments.map((file, idx) => (
                          <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                            {file.name}
                            <button
                              onClick={() => removeAttachment(idx)}
                              className="ml-1 hover:text-red-500"
                            >
                              ×
                            </button>
                          </Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        multiple
                        accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-shrink-0"
                      >
                        <Paperclip className="w-4 h-4" />
                      </Button>
                      <Input
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={language === "en" ? "Type a message..." : "اكتب رسالة..."}
                        className="flex-1 bg-hexa-bg border-hexa-border text-hexa-text-dark placeholder:text-hexa-text-light h-11"
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey && !sending) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        disabled={sending}
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={sending || (!message.trim() && attachments.length === 0)}
                        className="bg-hexa-secondary hover:bg-hexa-secondary/90 text-black h-11 px-4"
                      >
                        {sending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-hexa-text-light">
                    {language === 'en' ? 'Select a conversation to start chatting' : 'اختر محادثة لبدء الدردشة'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ClientMessages;


