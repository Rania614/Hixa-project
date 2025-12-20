import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminTopBar } from "@/components/AdminTopBar";
import { useApp } from "@/context/AppContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Paperclip, Loader2, Briefcase, User, UserCheck, CheckCircle, Clock } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/sonner";
import { messagesApi, ProjectRoom, ChatRoom, Message } from "@/services/messagesApi";
import { socketService, SocketMessageEvent } from "@/services/socketService";
import { formatDistanceToNow } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { http } from "@/services/http";

const AdminMessages = () => {
  const { language } = useApp();
  const navigate = useNavigate();
  
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
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigning, setAssigning] = useState(false);
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

  // Mock Data
  const getMockProjectRooms = (): ProjectRoom[] => [
    {
      _id: '1',
      project: 'proj1',
      projectTitle: 'بناء مركز تجاري - الرياض',
      lastActivityAt: new Date().toISOString(),
      status: 'active',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      _id: '2',
      project: 'proj2',
      projectTitle: 'تصميم فيلا فاخرة - دبي',
      lastActivityAt: new Date(Date.now() - 3600000).toISOString(),
      status: 'active',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      _id: '3',
      project: 'proj3',
      projectTitle: 'New Villa Project',
      lastActivityAt: new Date(Date.now() - 7200000).toISOString(),
      status: 'active',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
    },
  ];

  const getMockChatRooms = (projectRoomId: string): ChatRoom[] => {
    if (projectRoomId === '1') {
      return [
        {
          _id: 'chat1',
          project: 'proj1',
          projectRoom: '1',
          type: 'admin-client',
          participants: [
            { user: 'أحمد السعيد', role: 'client', joinedAt: new Date().toISOString() },
            { user: 'Admin', role: 'admin', joinedAt: new Date().toISOString() },
          ],
          lastMessage: {
            content: language === 'en' ? 'Thank you for the update' : 'شكراً على التحديث',
            sender: 'client1',
            createdAt: new Date(Date.now() - 1800000).toISOString(),
          },
          status: 'active',
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          _id: 'chat2',
          project: 'proj1',
          projectRoom: '1',
          type: 'admin-engineer',
          engineer: 'eng1',
          participants: [
            { user: 'محمد علي', role: 'engineer', joinedAt: new Date().toISOString() },
            { user: 'Admin', role: 'admin', joinedAt: new Date().toISOString() },
          ],
          lastMessage: {
            content: language === 'en' ? 'I can start next week' : 'يمكنني البدء الأسبوع القادم',
            sender: 'eng1',
            createdAt: new Date(Date.now() - 3600000).toISOString(),
          },
          status: 'active',
          createdAt: new Date(Date.now() - 172800000).toISOString(),
        },
      ];
    }
    if (projectRoomId === '2') {
      return [
        {
          _id: 'chat3',
          project: 'proj2',
          projectRoom: '2',
          type: 'admin-client',
          participants: [
            { user: 'فاطمة الزهراء', role: 'client', joinedAt: new Date().toISOString() },
            { user: 'Admin', role: 'admin', joinedAt: new Date().toISOString() },
          ],
          lastMessage: {
            content: language === 'en' ? 'When can we meet?' : 'متى يمكننا الاجتماع؟',
            sender: 'client2',
            createdAt: new Date(Date.now() - 7200000).toISOString(),
          },
          status: 'active',
          createdAt: new Date(Date.now() - 259200000).toISOString(),
        },
      ];
    }
    if (projectRoomId === '3') {
      return [
        {
          _id: 'chat5',
          project: 'proj3',
          projectRoom: '3',
          type: 'admin-client',
          participants: [
            { user: 'John Smith', role: 'client', joinedAt: new Date().toISOString() },
            { user: 'Admin', role: 'admin', joinedAt: new Date().toISOString() },
          ],
          lastMessage: {
            content: 'I need to discuss the budget',
            sender: 'client3',
            createdAt: new Date(Date.now() - 14400000).toISOString(),
          },
          status: 'active',
          createdAt: new Date(Date.now() - 432000000).toISOString(),
        },
      ];
    }
    return [];
  };

  const getMockMessages = (chatRoomId: string): Message[] => {
    if (chatRoomId === 'chat1') {
      return [
        {
          _id: 'msg1',
          chatRoom: 'chat1',
          sender: 'admin',
          senderName: 'Admin',
          senderRole: 'admin',
          content: language === 'en' ? 'Hello, how can I help you with the project?' : 'مرحباً، كيف يمكنني مساعدتك في المشروع؟',
          type: 'text',
          readBy: [],
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          _id: 'msg2',
          chatRoom: 'chat1',
          sender: 'client1',
          senderName: 'أحمد السعيد',
          senderRole: 'client',
          content: language === 'en' ? 'I need to update the project requirements' : 'أحتاج تحديث متطلبات المشروع',
          type: 'text',
          readBy: [],
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
        {
          _id: 'msg3',
          chatRoom: 'chat1',
          sender: 'admin',
          senderName: 'Admin',
          senderRole: 'admin',
          content: language === 'en' ? 'Sure, please send me the updated requirements' : 'بالطبع، يرجى إرسال المتطلبات المحدثة',
          type: 'text',
          readBy: [],
          createdAt: new Date(Date.now() - 900000).toISOString(),
        },
        {
          _id: 'msg4',
          chatRoom: 'chat1',
          sender: 'client1',
          senderName: 'أحمد السعيد',
          senderRole: 'client',
          content: language === 'en' ? 'Thank you for the update' : 'شكراً على التحديث',
          type: 'text',
          readBy: [],
          createdAt: new Date(Date.now() - 300000).toISOString(),
        },
      ];
    }
    if (chatRoomId === 'chat2') {
      return [
        {
          _id: 'msg5',
          chatRoom: 'chat2',
          sender: 'eng1',
          senderName: 'محمد علي',
          senderRole: 'engineer',
          content: language === 'en' ? 'Hello, I am interested in this project' : 'مرحباً، أنا مهتم بهذا المشروع',
          type: 'text',
          readBy: [],
          createdAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          _id: 'msg6',
          chatRoom: 'chat2',
          sender: 'admin',
          senderName: 'Admin',
          senderRole: 'admin',
          content: language === 'en' ? 'Great! When can you start?' : 'رائع! متى يمكنك البدء؟',
          type: 'text',
          readBy: [],
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          _id: 'msg7',
          chatRoom: 'chat2',
          sender: 'eng1',
          senderName: 'محمد علي',
          senderRole: 'engineer',
          content: language === 'en' ? 'I can start next week' : 'يمكنني البدء الأسبوع القادم',
          type: 'text',
          readBy: [],
          createdAt: new Date(Date.now() - 1800000).toISOString(),
        },
      ];
    }
    return [];
  };

  // Functions
  const scrollToBottom = React.useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  const loadProjectRooms = React.useCallback(async () => {
    try {
      setLoading(true);
      const rooms = await messagesApi.getProjectRooms();
      if (!rooms || rooms.length === 0) {
        const mockRooms = getMockProjectRooms();
        setProjectRooms(mockRooms);
        setSelectedProjectRoom(mockRooms[0]);
      } else {
        setProjectRooms(rooms);
        setSelectedProjectRoom((prev) => {
          if (!prev && rooms.length > 0) {
            return rooms[0];
          }
          return prev;
        });
      }
    } catch (error: any) {
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        const mockRooms = getMockProjectRooms();
        setProjectRooms(mockRooms);
        setSelectedProjectRoom(mockRooms[0]);
      } else {
        toast.error(language === 'en' ? 'Failed to load projects' : 'فشل تحميل المشاريع');
      }
    } finally {
      setLoading(false);
    }
  }, [language]);

  const loadChatRooms = React.useCallback(async (projectRoomId: string) => {
    try {
      const rooms = await messagesApi.getChatRooms(projectRoomId);
      if (!rooms || rooms.length === 0) {
        const mockRooms = getMockChatRooms(projectRoomId);
        setChatRooms(mockRooms);
        setSelectedChatRoom((prev) => {
          if (!prev && mockRooms.length > 0) {
            return mockRooms[0];
          }
          return prev;
        });
      } else {
        setChatRooms(rooms);
        setSelectedChatRoom((prev) => {
          if (!prev && rooms.length > 0) {
            return rooms[0];
          }
          return prev;
        });
      }
    } catch (error: any) {
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        const mockRooms = getMockChatRooms(projectRoomId);
        setChatRooms(mockRooms);
        setSelectedChatRoom((prev) => {
          if (!prev && mockRooms.length > 0) {
            return mockRooms[0];
          }
          return prev;
        });
      } else {
        toast.error(language === 'en' ? 'Failed to load chats' : 'فشل تحميل المحادثات');
      }
    }
  }, [language]);

  const loadMessages = React.useCallback(async (chatRoomId: string, pageNum: number = 1, append: boolean = false) => {
    try {
      setLoadingMessages(true);
      const response = await messagesApi.getMessages(chatRoomId, pageNum, 50);
      if (append) {
        setMessages((prev) => [...prev, ...response.messages]);
      } else {
        setMessages(response.messages.reverse());
      }
      setHasMore(response.page < response.totalPages);
      setPage(pageNum);
      if (!append) {
        setTimeout(() => scrollToBottom(), 100);
      }
    } catch (error: any) {
      if (error.response?.status === 404 || error.code === 'ERR_NETWORK') {
        const mockMessages = getMockMessages(chatRoomId);
        setMessages(mockMessages.reverse());
        setHasMore(false);
        setPage(1);
        setTimeout(() => scrollToBottom(), 100);
      } else {
        toast.error(language === 'en' ? 'Failed to load messages' : 'فشل تحميل الرسائل');
      }
    } finally {
      setLoadingMessages(false);
    }
  }, [scrollToBottom, language]);

  const handleSendMessage = async () => {
    if (!selectedChatRoom || (!message.trim() && attachments.length === 0)) return;
    try {
      setSending(true);
      const messageType = attachments.length > 0 ? 'file' : 'text';
      await messagesApi.sendMessage(
        selectedChatRoom._id,
        message.trim() || (language === 'en' ? 'Sent file(s)' : 'تم إرسال ملف(ات)'),
        messageType,
        attachments.length > 0 ? attachments : undefined
      );
      setMessage("");
      setAttachments([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(language === 'en' ? 'Failed to send message' : 'فشل إرسال الرسالة');
    } finally {
      setSending(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachments((prev) => [...prev, ...files]);
  };

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAssignEngineer = async () => {
    if (!selectedChatRoom || !selectedProjectRoom || selectedChatRoom.type !== 'admin-engineer') return;
    try {
      setAssigning(true);
      const engineerId = selectedChatRoom.engineer || selectedChatRoom.participants.find(p => p.role === 'engineer')?.user;
      if (!engineerId) {
        toast.error(language === 'en' ? 'Engineer ID not found' : 'لم يتم العثور على معرف المهندس');
        return;
      }
      navigate(`/admin/projects/${selectedProjectRoom.project}`, {
        state: { 
          assignEngineer: true, 
          engineerId: engineerId,
          chatRoomId: selectedChatRoom._id
        }
      });
      toast.success(language === 'en' ? 'Redirecting to assign engineer...' : 'جاري التوجيه لتعيين المهندس...');
      setShowAssignModal(false);
    } catch (error: any) {
      console.error('Error assigning engineer:', error);
      toast.error(language === 'en' ? 'Failed to assign engineer' : 'فشل تعيين المهندس');
    } finally {
      setAssigning(false);
    }
  };

  const getChatRoomTitle = (chatRoom: ChatRoom): string => {
    if (chatRoom.type === 'admin-client') {
      const clientParticipant = chatRoom.participants.find((p) => p.role === 'client');
      return clientParticipant?.user || (language === 'en' ? 'Client' : 'العميل');
    }
    if (chatRoom.type === 'admin-engineer') {
      const engineerParticipant = chatRoom.participants.find((p) => p.role === 'engineer');
      return engineerParticipant?.user || (language === 'en' ? 'Engineer' : 'المهندس');
    }
    return language === 'en' ? 'Chat' : 'محادثة';
  };

  const getChatRoomSubtitle = (chatRoom: ChatRoom): string => {
    if (chatRoom.type === 'admin-client') {
      return language === 'en' ? 'Project Owner' : 'صاحب المشروع';
    }
    if (chatRoom.type === 'admin-engineer') {
      return language === 'en' ? 'Proposer / Engineer' : 'متقدم / مهندس';
    }
    return '';
  };

  const getChatRoomTypeBadge = (chatRoom: ChatRoom) => {
    if (chatRoom.type === 'admin-client') {
      return {
        label: language === 'en' ? 'Client' : 'عميل',
        className: 'bg-muted/50 text-foreground/70 border-0 text-[10px] px-2 py-0.5 h-5'
      };
    }
    if (chatRoom.type === 'admin-engineer') {
      return {
        label: language === 'en' ? 'Engineer' : 'مهندس',
        className: 'bg-yellow-400/10 text-yellow-400/80 border-0 text-[10px] px-2 py-0.5 h-5'
      };
    }
    return null;
  };

  const getChatRoomIcon = (chatRoom: ChatRoom) => {
    if (chatRoom.type === 'admin-client') return User;
    return Briefcase;
  };

  const getChatRoomStatus = (chatRoom: ChatRoom) => {
    if (chatRoom.status === 'archived') {
      return { label: language === 'en' ? 'Archived' : 'مؤرشف', className: 'text-muted-foreground/50' };
    }
    const unread = getUnreadCount(chatRoom);
    if (unread > 0) {
      return { label: language === 'en' ? 'Unread' : 'غير مقروء', className: 'text-yellow-400/80' };
    }
    return { label: language === 'en' ? 'Active' : 'نشط', className: 'text-muted-foreground/60' };
  };

  const getUnreadCount = (chatRoom: ChatRoom): number => {
    return 0; // Placeholder
  };

  const formatTime = (dateString: string): string => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  // Effects
  useEffect(() => {
    loadProjectRooms();
    socketService.connect();
    const handleNewMessage = (data: SocketMessageEvent) => {
      setMessages((prev) => {
        if (data.chatRoomId === selectedChatRoom?._id) {
          return [data.message, ...prev];
        }
        return prev;
      });
      if (data.chatRoomId === selectedChatRoom?._id) {
        setTimeout(() => scrollToBottom(), 100);
      }
      setChatRooms((prev) =>
        prev.map((room) =>
          room._id === data.chatRoomId
            ? {
                ...room,
                lastMessage: {
                  content: data.message.content,
                  sender: data.message.sender,
                  createdAt: data.message.createdAt,
                },
              }
            : room
        )
      );
    };
    socketService.on('newMessage', handleNewMessage);
    return () => {
      socketService.off('newMessage', handleNewMessage);
    };
  }, [selectedChatRoom?._id, scrollToBottom, loadProjectRooms]);

  useEffect(() => {
    if (selectedProjectRoom) {
      loadChatRooms(selectedProjectRoom._id);
    }
  }, [selectedProjectRoom?._id, loadChatRooms]);

  useEffect(() => {
    if (selectedChatRoom) {
      setPage(1);
      setHasMore(true);
      loadMessages(selectedChatRoom._id, 1);
      socketService.joinChatRoom(selectedChatRoom._id);
      messagesApi.markChatRoomAsRead(selectedChatRoom._id).catch(console.error);
    }
    return () => {
      if (selectedChatRoom) {
        socketService.leaveChatRoom(selectedChatRoom._id);
      }
    };
  }, [selectedChatRoom?._id, loadMessages]);

  const filteredChatRooms = chatRooms.filter((room) => {
    if (room.type === 'group') return false;
    const title = getChatRoomTitle(room).toLowerCase();
    return title.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="flex min-h-screen bg-background">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopBar />
          <main className="flex-1 overflow-hidden flex flex-col p-4">
           {/* Header */}
            <div className="mb-4">
             <h2 className="text-2xl font-bold mb-1">
                {language === "en" ? "Messages" : "الرسائل"}
              </h2>
             <p className="text-sm text-muted-foreground">
               {language === "en"
                 ? "Communicate with engineers and clients"
                 : "التواصل مع المهندسين والعملاء"}
              </p>
            </div>

           {/* Main Content - 2 Columns */}
           <div className="flex-1 flex gap-2 overflow-hidden min-h-0">
             {/* Left Sidebar - Projects */}
             <Card className="w-48 flex-shrink-0 flex flex-col overflow-hidden glass-card h-full">
               <CardHeader className="flex-shrink-0 pb-2 px-3 pt-3">
                 <CardTitle className="text-sm font-semibold">
                   {language === "en" ? "Projects" : "المشاريع"}
                 </CardTitle>
                 <div className="relative mt-2">
                   <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                         <Input
                     placeholder={language === "en" ? "Search..." : "بحث..."}
                     className="pl-7 h-7 text-xs"
                         />
                       </div>
               </CardHeader>
               <CardContent className="flex-1 overflow-hidden p-0 min-h-0">
                 <ScrollArea className="h-full">
                   <div className="p-2">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-4 w-4 animate-spin text-yellow-400/70" />
                    </div>
                  ) : projectRooms.length === 0 ? (
                    <p className="text-xs text-muted-foreground/70 text-center py-8">
                      {language === "en" ? "No projects" : "لا توجد مشاريع"}
                    </p>
                  ) : (
                     projectRooms.map((room) => (
                       <div
                         key={room._id}
                         onClick={() => setSelectedProjectRoom(room)}
                         className={`p-1 rounded-md cursor-pointer transition-all mb-0.5 ${
                           selectedProjectRoom?._id === room._id
                             ? "bg-yellow-400/8 border-l-2 border-yellow-400/50"
                             : "hover:bg-muted/40"
                         }`}
                       >
                         <p className="font-medium text-sm text-foreground/90 truncate leading-tight">
                           {room.projectTitle}
                         </p>
                         <p className="text-xs text-muted-foreground/60 mt-0.5">
                           {formatTime(room.lastActivityAt)}
                         </p>
                       </div>
                     ))
                  )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

             {/* Main Area - Chats & Messages */}
             <div className="flex-1 flex gap-2 overflow-hidden min-h-0">
               {/* Chat Rooms List */}
               <Card className="w-56 flex-shrink-0 flex flex-col overflow-hidden glass-card h-full">
                 <CardHeader className="flex-shrink-0 pb-2 px-3 pt-3">
                   <div className="flex items-center justify-between mb-2">
                     <CardTitle className="text-sm font-semibold truncate">
                       {selectedProjectRoom ? selectedProjectRoom.projectTitle : (language === "en" ? "Chats" : "المحادثات")}
                     </CardTitle>
                     {selectedProjectRoom && (
                       <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                         {filteredChatRooms.length}
                       </Badge>
                     )}
                   </div>
                      <div className="relative">
                     <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                        <Input
                       placeholder={language === "en" ? "Search chats..." : "البحث..."}
                       className="pl-7 h-7 text-xs"
                       value={searchTerm}
                       onChange={(e) => setSearchTerm(e.target.value)}
                        />
                      </div>
                 </CardHeader>
                 <CardContent className="flex-1 overflow-hidden p-0 min-h-0">
                   <ScrollArea className="h-full">
                      <div className="p-2">
                    {!selectedProjectRoom ? (
                      <p className="text-xs text-muted-foreground/70 text-center py-8">
                        {language === "en" ? "Select a project" : "اختر مشروع"}
                      </p>
                    ) : filteredChatRooms.length === 0 ? (
                      <p className="text-xs text-muted-foreground/70 text-center py-8">
                        {language === "en" ? "No chats" : "لا توجد محادثات"}
                      </p>
                    ) : (
                      filteredChatRooms.map((room) => {
                        const Icon = getChatRoomIcon(room);
                        const unread = getUnreadCount(room);
                        const typeBadge = getChatRoomTypeBadge(room);
                        const subtitle = getChatRoomSubtitle(room);
                        const status = getChatRoomStatus(room);
                        return (
                           <div
                             key={room._id}
                             className={`p-1 rounded-md transition-all mb-0.5 ${
                               selectedChatRoom?._id === room._id
                                 ? "bg-yellow-400/8 border-l-2 border-yellow-400/50"
                                 : "hover:bg-muted/40"
                             }`}
                           >
                             <div 
                               onClick={() => setSelectedChatRoom(room)}
                               className="flex items-start gap-1.5 cursor-pointer"
                             >
                               <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${
                                 room.type === 'admin-client' ? 'bg-muted/50' :
                                 'bg-yellow-400/10'
                               }`}>
                                 <Icon className={`h-2.5 w-2.5 ${
                                   room.type === 'admin-client' ? 'text-foreground/60' :
                                   'text-yellow-400/80'
                                 }`} />
                               </div>
                               <div className="flex-1 min-w-0">
                                 <div className="flex items-center gap-1 mb-0.5">
                                   <p className="font-medium text-sm text-foreground/90 truncate">
                                     {getChatRoomTitle(room)}
                                   </p>
                                   {typeBadge && (
                                     <Badge className={typeBadge.className}>
                                       {typeBadge.label}
                                     </Badge>
                                   )}
                                   {unread > 0 && (
                                     <span className="bg-yellow-400/80 text-foreground text-[10px] rounded-full min-w-[14px] h-3.5 px-1 flex items-center justify-center font-medium flex-shrink-0">
                                       {unread}
                                    </span>
                                  )}
                                </div>
                                 {subtitle && (
                                   <p className="text-xs text-muted-foreground/60 mb-0.5">
                                     {subtitle}
                                   </p>
                                 )}
                                 {room.lastMessage && (
                                   <>
                                     <p className="text-xs text-muted-foreground/70 truncate line-clamp-1 mb-0.5 leading-tight">
                                       {room.lastMessage.content}
                                     </p>
                                     <div className="flex items-center gap-1">
                                       <p className="text-[10px] text-muted-foreground/50">
                                         {formatTime(room.lastMessage.createdAt)}
                                       </p>
                                       <span className="text-[9px] text-muted-foreground/40">•</span>
                                       <p className={`text-[10px] ${status.className}`}>
                                         {status.label}
                                       </p>
                                     </div>
                                   </>
                                 )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>

              {/* Messages Area */}
              <Card className="flex-1 flex flex-col overflow-hidden glass-card h-full min-h-0">
                {selectedChatRoom ? (
                  <>
                     {/* Chat Header */}
                     <CardHeader className="flex-shrink-0 relative pb-2 px-3 pt-3">
                       {selectedChatRoom.type === 'admin-engineer' && (
                         <Button
                           onClick={() => setShowAssignModal(true)}
                           className="absolute top-2 left-2 bg-yellow-400/80 hover:bg-yellow-400/90 text-foreground h-6 px-2 text-[10px] flex-shrink-0 z-10"
                           size="sm"
                         >
                           <UserCheck className="h-3 w-3 mr-1" />
                           {language === 'en' ? 'Assign' : 'تعيين'}
                         </Button>
                       )}
                           <div className="flex items-center gap-2">
                         <div className={`w-8 h-8 rounded-md flex items-center justify-center flex-shrink-0 ${
                           selectedChatRoom.type === 'admin-client' ? 'bg-muted/50' :
                           'bg-yellow-400/20'
                         }`}>
                           {React.createElement(getChatRoomIcon(selectedChatRoom), {
                             className: `h-4 w-4 ${
                               selectedChatRoom.type === 'admin-client' ? 'text-foreground/60' :
                               'text-yellow-400/80'
                             }`
                           })}
                            </div>
                         <div className="flex-1 min-w-0">
                           <div className="flex items-center gap-1.5 mb-0.5">
                             <CardTitle className="text-sm font-semibold truncate">
                               {getChatRoomTitle(selectedChatRoom)}
                             </CardTitle>
                             {getChatRoomTypeBadge(selectedChatRoom) && (
                               <Badge className={getChatRoomTypeBadge(selectedChatRoom)!.className}>
                                 {getChatRoomTypeBadge(selectedChatRoom)!.label}
                            </Badge>
                             )}
                           </div>
                           <p className="text-xs text-muted-foreground truncate">
                             {getChatRoomSubtitle(selectedChatRoom)} • {selectedProjectRoom?.projectTitle}
                           </p>
                          </div>
                        </div>
                     </CardHeader>

                     {/* Messages */}
                     <CardContent className="flex-1 overflow-hidden p-0 min-h-0">
                       <ScrollArea
                         className="h-full px-3 py-2"
                         ref={messagesContainerRef}
                         onScroll={(e) => {
                           const target = e.target as HTMLElement;
                           if (target.scrollTop === 0 && hasMore) {
                             loadMoreMessages();
                           }
                         }}
                       >
                      {loadingMessages && page === 1 ? (
                        <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-5 w-5 animate-spin text-yellow-400/70" />
                        </div>
                      ) : (
                         <div className="space-y-1">
                           {messages.map((msg, idx) => {
                             const isAdmin = msg.senderRole === 'admin' || msg.type === 'system';
                             const isSystem = msg.type === 'system';
                             const isNewThread = idx === 0 || messages[idx - 1].sender !== msg.sender;
                             
                             return (
                               <div key={msg._id}>
                                 {isNewThread && idx > 0 && (
                                   <div className="my-1 border-t border-border/20"></div>
                                 )}
                                 <div className={`flex ${isAdmin ? "justify-end" : "justify-start"} ${isNewThread ? 'mt-1' : 'mt-0.5'}`}>
                                   <div
                                     className={`max-w-[75%] rounded-lg px-2 py-1 ${
                                       isAdmin
                                         ? "bg-yellow-400/10 text-foreground border border-yellow-400/20"
                                         : isSystem
                                         ? "bg-muted/30 text-muted-foreground text-center mx-auto"
                                         : "bg-muted/40 text-foreground border border-border/30"
                                     }`}
                                   >
                                     {!isSystem && (
                                       <p className="text-xs text-muted-foreground/70 mb-0.5 font-medium">
                                         {msg.senderName || msg.senderRole}
                                       </p>
                                     )}
                                     <p
                                       className={`text-sm leading-relaxed ${
                                         isAdmin
                                           ? "text-foreground"
                                           : isSystem
                                           ? "text-muted-foreground italic"
                                           : "text-foreground/90"
                                       }`}
                                     >
                                       {msg.content}
                                     </p>
                                     {msg.attachments && msg.attachments.length > 0 && (
                                       <div className="mt-1 space-y-0.5">
                                         {msg.attachments.map((att, attIdx) => (
                                           <a
                                             key={attIdx}
                                             href={att.url}
                                             target="_blank"
                                             rel="noopener noreferrer"
                                             className="block text-xs text-yellow-400/80 hover:text-yellow-400/90 hover:underline"
                                           >
                                             📎 {att.filename}
                                           </a>
                                         ))}
                                       </div>
                                     )}
                                     <p className={`text-[10px] mt-0.5 ${
                                       isAdmin ? 'text-muted-foreground/50' : 'text-muted-foreground/50'
                                     }`}>
                                       {formatTime(msg.createdAt)}
                                  </p>
                                </div>
                                 </div>
                               </div>
                             );
                           })}
                          <div ref={messagesEndRef} />
                        </div>
                      )}
                      </ScrollArea>
                    </CardContent>

                     {/* Message Input */}
                     <div className="px-3 py-2 border-t border-border/30 bg-muted/20 flex-shrink-0">
                       {attachments.length > 0 && (
                         <div className="mb-1.5 flex flex-wrap gap-1">
                           {attachments.map((file, idx) => (
                             <div
                               key={idx}
                               className="flex items-center gap-1 bg-background border border-border/30 px-1.5 py-0.5 rounded-md text-[9px]"
                             >
                               <span className="text-foreground/80">{file.name}</span>
                               <button
                                 onClick={() => removeAttachment(idx)}
                                 className="text-muted-foreground/60 hover:text-destructive text-xs leading-none"
                               >
                                 ×
                               </button>
                              </div>
                            ))}
                          </div>
                       )}
                           <div className="flex gap-1">
                         <input
                           ref={fileInputRef}
                           type="file"
                           multiple
                           className="hidden"
                           onChange={handleFileSelect}
                         />
                         <Button
                           variant="ghost"
                           size="sm"
                           onClick={() => fileInputRef.current?.click()}
                           className="h-7 w-7 p-0 border border-border/30 hover:bg-muted/50"
                         >
                           <Paperclip className="h-3 w-3" />
                         </Button>
                            <Input
                              value={message}
                              onChange={(e) => setMessage(e.target.value)}
                              placeholder={language === "en" ? "Type a message..." : "اكتب رسالة..."}
                           className="flex-1 h-7 bg-background border-border/30 focus:border-yellow-400/40 text-xs"
                              onKeyPress={(e) => {
                             if (e.key === "Enter" && !e.shiftKey) {
                               e.preventDefault();
                               handleSendMessage();
                             }
                           }}
                           disabled={sending}
                            />
                            <Button
                           onClick={handleSendMessage}
                           disabled={sending || (!message.trim() && attachments.length === 0)}
                           className="bg-yellow-400/80 hover:bg-yellow-400/90 text-foreground h-7 px-3 text-[10px]"
                         >
                           {sending ? (
                             <Loader2 className="w-3 h-3 animate-spin" />
                           ) : (
                               <Send className="w-3 h-3" />
                           )}
                            </Button>
                          </div>
                        </div>
                      </>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <p className="text-muted-foreground/70 mb-1">
                        {language === "en"
                          ? "Select a chat to start messaging"
                          : "اختر محادثة لبدء المراسلة"}
                      </p>
                      {selectedProjectRoom && (
                        <p className="text-xs text-muted-foreground/50">
                          {language === "en" ? "From" : "من"} {selectedProjectRoom.projectTitle}
                        </p>
                      )}
                    </div>
                  </div>
                )}
                </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Assign Engineer Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-yellow-400/80" />
              {language === 'en' ? 'Assign Engineer to Project' : 'تعيين المهندس للمشروع'}
            </DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? 'You will be redirected to the project details page to complete the assignment.'
                : 'سيتم توجيهك إلى صفحة تفاصيل المشروع لإكمال التعيين.'}
            </DialogDescription>
          </DialogHeader>
          {selectedChatRoom && selectedProjectRoom && (
            <div className="space-y-4">
              <div className="p-4 bg-muted/30 rounded-lg">
                <div className="space-y-2">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {language === 'en' ? 'Engineer:' : 'المهندس:'}
                    </p>
                    <p className="font-semibold">{getChatRoomTitle(selectedChatRoom)}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">
                      {language === 'en' ? 'Project:' : 'المشروع:'}
                    </p>
                    <p className="font-semibold">{selectedProjectRoom.projectTitle}</p>
                  </div>
                </div>
              </div>
              <div className="p-3 bg-yellow-400/8 border border-yellow-400/15 rounded-lg">
                <p className="text-sm text-yellow-400/80">
                  <strong>{language === 'en' ? 'Note:' : 'ملاحظة:'}</strong>{' '}
                  {language === 'en' 
                    ? 'You can review proposals and assign the engineer from the project details page.'
                    : 'يمكنك مراجعة العروض وتعيين المهندس من صفحة تفاصيل المشروع.'}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowAssignModal(false)}
            >
              {language === 'en' ? 'Cancel' : 'إلغاء'}
            </Button>
            <Button
              onClick={handleAssignEngineer}
              disabled={assigning}
              className="bg-yellow-400/80 hover:bg-yellow-400/90 text-foreground"
            >
              {assigning ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {language === 'en' ? 'Redirecting...' : 'جاري التوجيه...'}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {language === 'en' ? 'Go to Project' : 'الذهاب للمشروع'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMessages;
