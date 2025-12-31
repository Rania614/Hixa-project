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
import { Search, Send, Paperclip, Loader2 } from "lucide-react";
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

const CompanyMessages = () => {
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
      console.log('📥 Loading project rooms for company...');
      const rooms = await messagesApi.getProjectRooms();
      console.log('📥 Received project rooms from API:', rooms.length, rooms);
      // Filter: Company sees only project rooms for projects they submitted proposals for
      // Backend should already filter this, but we add extra safety
      setProjectRooms(rooms);
      if (rooms.length > 0 && !selectedProjectRoom) {
        setSelectedProjectRoom(rooms[0]);
        console.log('✅ Selected first project room:', rooms[0]._id);
      } else if (rooms.length === 0) {
        console.log('⚠️ No project rooms found - company has not submitted any proposals yet');
      }
    } catch (error: any) {
      console.error('❌ Error loading project rooms:', error);
      if (error.response?.status !== 404) {
        toast.error(language === 'en' ? 'Failed to load projects' : 'فشل تحميل المشاريع');
      }
      setProjectRooms([]);
    } finally {
      setLoading(false);
    }
  }, [language, selectedProjectRoom]);

  // Load Chat Rooms (filter: admin-company/admin-engineer and group only)
  const loadChatRooms = useCallback(async (projectRoomId: string) => {
    try {
      console.log('📥 Loading chat rooms for projectRoom:', projectRoomId);
      const rooms = await messagesApi.getChatRooms(projectRoomId);
      console.log('📥 Raw chat rooms from API:', rooms);
      console.log('📥 Current user:', user?._id || user?.id);
      
      // Filter: Company sees only admin-company/admin-engineer (their own) and group chat rooms
      const filteredRooms = rooms.filter(room => {
        console.log('🔍 Checking room:', room._id, 'type:', room.type);
        
        // Group rooms: include if company is a participant
        if (room.type === 'group') {
          const isParticipant = room.participants?.some(p => {
            const participantId = typeof p.user === 'string' 
              ? p.user 
              : (typeof p.user === 'object' && p.user !== null 
                ? (p.user._id || p.user.id || p.user) 
                : p.user);
            const userId = user?._id || user?.id;
            const matches = participantId?.toString() === userId?.toString();
            return matches;
          });
          console.log('🔍 Group room participant check:', isParticipant);
          return isParticipant;
        }
        
        // Admin-engineer/admin-company rooms: include if company is participant OR engineer field matches
        if (room.type === 'admin-engineer' || room.type === 'admin-company') {
          const userId = user?._id || user?.id;
          
          // Check if this company is a participant in this chat room
          const isParticipant = room.participants?.some(p => {
            const participantId = typeof p.user === 'string' 
              ? p.user 
              : (typeof p.user === 'object' && p.user !== null 
                ? (p.user._id || p.user.id || p.user) 
                : p.user);
            const matches = participantId?.toString() === userId?.toString();
            console.log('🔍 Participant check:', { 
              participantId: participantId?.toString(), 
              userId: userId?.toString(), 
              matches 
            });
            return matches;
          }) || false;
          
          // Also check if engineer/company field matches
          let engineerMatches = false;
          if (room.engineer) {
            const engineerId = typeof room.engineer === 'string' 
              ? room.engineer 
              : (typeof room.engineer === 'object' && room.engineer !== null
                ? (room.engineer._id || room.engineer.id || room.engineer)
                : room.engineer);
            engineerMatches = engineerId?.toString() === userId?.toString();
            console.log('🔍 Engineer field check:', { 
              engineerId: engineerId?.toString(), 
              userId: userId?.toString(), 
              matches: engineerMatches 
            });
          }
          
          const shouldInclude = isParticipant || engineerMatches;
          console.log('🔍 Company/Engineer final check:', { 
            isParticipant, 
            engineerMatches, 
            shouldInclude,
            roomType: room.type 
          });
          return shouldInclude;
        }
        
        console.log('❌ Room type not allowed, excluding:', room.type);
        return false;
      });
      
      console.log('📥 Filtered chat rooms:', filteredRooms);
      setChatRooms(filteredRooms);
      if (filteredRooms.length > 0 && !selectedChatRoom) {
        console.log('✅ Setting selected chat room:', filteredRooms[0]._id);
        setSelectedChatRoom(filteredRooms[0]);
      } else if (filteredRooms.length === 0) {
        console.log('⚠️ No chat rooms found after filtering');
      }
    } catch (error: any) {
      console.error('❌ Error loading chat rooms:', error);
      if (error.response?.status !== 404) {
        toast.error(language === 'en' ? 'Failed to load chats' : 'فشل تحميل المحادثات');
      }
      setChatRooms([]);
    }
  }, [language, selectedChatRoom, user]);

  // Load Messages
  const loadMessages = useCallback(async (chatRoomId: string, pageNum: number = 1, append: boolean = false) => {
    try {
      console.log('📥 Loading messages for chatRoom:', chatRoomId, 'page:', pageNum);
      setLoadingMessages(true);
      
      // Add timeout to prevent hanging (reduced to 5 seconds)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 5000); // 5 seconds timeout
      });
      
      const response = await Promise.race([
        messagesApi.getMessages(chatRoomId, pageNum, 50),
        timeoutPromise
      ]) as any;
      
      console.log('📥 Raw response from getMessages:', response);
      console.log('📥 Messages loaded:', response.messages?.length || 0, 'messages');
      
      if (!response || !response.messages) {
        console.warn('⚠️ Invalid response structure:', response);
        setMessages([]);
        setHasMore(false);
        setPage(pageNum);
        setLoadingMessages(false);
        return;
      }
      
      if (append) {
        console.log('📥 Appending messages to existing list');
        setMessages((prev) => {
          const updated = [...prev, ...response.messages];
          console.log('📥 Messages after append:', updated.length);
          return updated;
        });
      } else {
        // Messages come from backend oldest first, we want newest at bottom
        // So we keep them as is (oldest first = top to bottom)
        console.log('📥 Setting messages:', response.messages.length);
        console.log('📥 First message (oldest):', response.messages[0]);
        console.log('📥 Last message (newest):', response.messages[response.messages.length - 1]);
        setMessages(response.messages);
      }
      setHasMore(response.page < response.totalPages);
      setPage(pageNum);
      if (!append) {
        // Scroll to bottom after messages are rendered
        setTimeout(() => {
          scrollToBottom();
        }, 200);
      }
    } catch (error: any) {
      console.error('❌ Error loading messages:', error);
      console.error('❌ Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // If timeout or network error, don't clear messages - keep existing ones
      if (error.message === 'Request timeout' || error.code === 'ERR_NETWORK') {
        console.warn('⚠️ Request timeout or network error, keeping existing messages');
        // Don't clear messages, just stop loading
      } else if (error.response?.status !== 404) {
        toast.error(language === 'en' ? 'Failed to load messages' : 'فشل تحميل الرسائل');
        // Only clear messages if it's not a timeout/network error
        if (messages.length === 0) {
          setMessages([]);
        }
      } else {
        // 404 - no messages yet, that's okay
        setMessages([]);
      }
      setHasMore(false);
    } finally {
      console.log('✅ Finished loading messages, setting loadingMessages to false');
      setLoadingMessages(false);
    }
  }, [scrollToBottom, language, messages.length]);

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
    // Scroll to bottom when new message arrives
    setTimeout(() => {
      scrollToBottom();
    }, 150);
  }, [scrollToBottom]);

  // Get Chat Room Title
  const getChatRoomTitle = (chatRoom: ChatRoom): string => {
    if (chatRoom.type === 'admin-engineer' || chatRoom.type === 'admin-company') {
      return language === 'en' ? 'Admin' : 'المسؤول';
    } else if (chatRoom.type === 'group') {
      return language === 'en' ? 'Group Chat' : 'الدردشة الجماعية';
    }
    return language === 'en' ? 'Chat' : 'محادثة';
  };

  // Get Chat Room Avatar
  const getChatRoomAvatar = (chatRoom: ChatRoom): string => {
    if (chatRoom.type === 'admin-engineer' || chatRoom.type === 'admin-company') {
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

  // Track if we've already tried to load messages for this chat room
  const loadAttemptedRef = useRef<string | null>(null);
  
  useEffect(() => {
    if (selectedChatRoom) {
      const chatRoomId = selectedChatRoom._id;
      
      // Only load messages if we haven't tried for this chat room yet
      if (loadAttemptedRef.current !== chatRoomId) {
        console.log('🔄 ChatRoom selected, loading messages:', chatRoomId);
        selectedChatRoomRef.current = selectedChatRoom;
        loadAttemptedRef.current = chatRoomId;
        setMessages([]);
        setPage(1);
        
        // Try to load messages, but don't block if it fails
        loadMessages(chatRoomId, 1, false).catch(() => {
          console.warn('⚠️ Failed to load messages, will rely on Socket.io');
        });
      }
      
      // Mark chat room as read
      messagesApi.markChatRoomAsRead(chatRoomId).catch(console.error);
      // Join Socket.io room
      socketService.joinRoom(chatRoomId);
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
    <DashboardLayout userType="company">
      <div className="space-y-4 mb-4">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href="/company/dashboard"
                className="text-hexa-text-light hover:text-hexa-secondary transition-colors"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/company/dashboard");
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
          <Card className="flex-1 flex flex-col bg-hexa-card border-hexa-border min-h-0">
            <CardContent className="p-0 h-full flex flex-col min-h-0">
              {selectedChatRoom ? (
                <>
                  <div className="p-4 border-b border-hexa-border flex-shrink-0">
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
                  <ScrollArea className="flex-1 min-h-0" ref={messagesContainerRef}>
                    <div className="p-4 pb-6">
                      {loadingMessages && messages.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="w-6 h-6 animate-spin text-hexa-secondary" />
                        </div>
                      ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center py-12">
                          <p className="text-sm text-hexa-text-light">
                            {language === 'en' ? 'No messages yet' : 'لا توجد رسائل بعد'}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {messages.map((msg, idx) => {
                            const senderId = typeof msg.sender === 'string' ? msg.sender : msg.sender?._id;
                            const senderName = typeof msg.sender === 'object' ? msg.sender?.name : 'Unknown';
                            const senderAvatar = typeof msg.sender === 'object' ? msg.sender?.name?.charAt(0) : 'U';
                            const senderRole = msg.senderRole || (typeof msg.sender === 'object' ? msg.sender?.role : null);
                            
                            // Determine if message is from company (me) or from admin/system
                            const isMe = senderId === user?._id || senderId === user?.id;
                            const isSystem = msg.type === 'system';
                            const isAdmin = senderRole === 'admin' || (typeof msg.sender === 'object' && msg.sender?.role === 'admin');
                            const isFromAdminOrSystem = isAdmin || isSystem;
                            
                            // Check if previous message is from same sender (for grouping)
                            const prevMsg = idx > 0 ? messages[idx - 1] : null;
                            const prevSenderId = prevMsg ? (typeof prevMsg.sender === 'string' ? prevMsg.sender : prevMsg.sender?._id) : null;
                            const isSameSender = prevSenderId === senderId;
                            const showAvatar = !isMe && !isSameSender;
                            const showSenderName = !isMe && !isSameSender;
                            
                            return (
                              <div
                                key={msg._id}
                                className={`flex items-end gap-2.5 ${isMe ? "justify-end" : "justify-start"} ${isSameSender ? 'mt-1' : 'mt-4'}`}
                              >
                                {/* Avatar for received messages (left side) - Admin/System */}
                                {!isMe && (
                                  <Avatar className={`w-8 h-8 flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                    <AvatarFallback className={isFromAdminOrSystem ? "bg-blue-600 text-white text-xs font-semibold" : "bg-blue-500/20 text-blue-300 border border-blue-500/30 text-xs font-semibold"}>
                                      {senderAvatar.toUpperCase()}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                                
                                <div className={`flex flex-col gap-1 ${isMe ? "items-end" : "items-start"} max-w-[75%] md:max-w-[70%]`}>
                                  {/* Message bubble */}
                                  <div
                                    className={`rounded-2xl px-4 py-2.5 ${
                                      isMe
                                        ? "bg-blue-600/80 text-white rounded-br-sm"
                                        : isFromAdminOrSystem
                                        ? "bg-blue-600/80 text-white rounded-bl-sm"
                                        : "bg-slate-700/50 border border-slate-600/50 text-slate-100 rounded-bl-sm"
                                    }`}
                                  >
                                    {msg.attachments && msg.attachments.length > 0 && (
                                      <div className="space-y-1.5 mb-2">
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
                                              className={`flex items-center gap-2 p-2.5 rounded-lg hover:opacity-80 transition-all group ${
                                                isMe || isFromAdminOrSystem
                                                  ? "bg-blue-500/20 border border-blue-400/30" 
                                                  : "bg-slate-600/30 border border-slate-500/40"
                                              }`}
                                            >
                                              {isImage && <span className="text-lg">🖼️</span>}
                                              {isPDF && <span className="text-lg">📄</span>}
                                              {isDocument && <span className="text-lg">📝</span>}
                                              {!isImage && !isPDF && !isDocument && <span className="text-lg">📎</span>}
                                              <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-medium truncate ${
                                                  isMe || isFromAdminOrSystem ? "text-blue-100" : "text-slate-200"
                                                }`}>
                                                  {att.filename || att.name || 'File'}
                                                </p>
                                                {fileSize && (
                                                  <p className={`text-[10px] opacity-70 ${
                                                    isMe || isFromAdminOrSystem ? "text-blue-200/70" : "text-slate-300/70"
                                                  }`}>{fileSize}</p>
                                                )}
                                              </div>
                                              <span className={`text-xs opacity-60 ${
                                                isMe || isFromAdminOrSystem ? "text-blue-200" : "text-slate-300"
                                              }`}>⬇️</span>
                                            </a>
                                          );
                                        })}
                                      </div>
                                    )}
                                    
                                    {msg.content && (
                                      <p className={`leading-relaxed text-sm whitespace-pre-wrap break-words text-white ${
                                        isMe || isFromAdminOrSystem ? "font-medium" : ""
                                      }`}>
                                        {msg.content}
                                      </p>
                                    )}
                                  </div>
                                  
                                  {/* Timestamp - below message */}
                                  <p className={`text-[10px] text-gray-400/70 px-1 ${
                                    isMe ? "text-right" : "text-left"
                                  }`}>
                                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                  </p>
                                </div>
                                
                                {/* Avatar for sent messages (right side) - Engineer */}
                                {isMe && (
                                  <Avatar className={`w-8 h-8 flex-shrink-0 ml-2 ${!isSameSender ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                                    <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
                                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                                    </AvatarFallback>
                                  </Avatar>
                                )}
                              </div>
                            );
                          })}
                          <div ref={messagesEndRef} className="h-1" />
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t border-hexa-border flex-shrink-0">
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

export default CompanyMessages;


