import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminTopBar } from "@/components/AdminTopBar";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, User, Briefcase, UserCheck } from "lucide-react";
import { toast } from "@/components/ui/sonner";
import { messagesApi, ProjectRoom, ChatRoom, Message } from "@/services/messagesApi";
import { socketService, SocketMessageEvent } from "@/services/socketService";
import { formatDistanceToNow } from "date-fns";
import { useUnreadMessagesCount } from "@/hooks/useUnreadMessagesCount";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { http } from "@/services/http";
import { ChatHeader } from "@/components/admin-messages/ChatHeader";
import { MessagesList } from "@/components/admin-messages/MessagesList";
import { MessageInput } from "@/components/admin-messages/MessageInput";
import { ChatRoomsList } from "@/components/admin-messages/ChatRoomsList";
import { ProjectRoomsList } from "@/components/admin-messages/ProjectRoomsList";
import { ViewModeToggle } from "@/components/admin-messages/ViewModeToggle";
import { ObserverBanner } from "@/components/admin-messages/ObserverBanner";

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
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [filter, setFilter] = useState<'all' | 'client' | 'engineer'>('all');
  const [viewMode, setViewMode] = useState<'all' | 'project'>('all'); // 'all' = show all chat rooms, 'project' = show by project
  const [startingChat, setStartingChat] = useState(false);
  
  // Unread messages count
  const { unreadCount } = useUnreadMessagesCount(60000); // Refresh every 60 seconds / 1 minute
  
  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedChatRoomRef = useRef<ChatRoom | null>(null);
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
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 50);
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

  // Load all chat rooms (Admin sees all chat rooms in the system)
  const loadAllChatRooms = React.useCallback(async () => {
    try {
      setLoading(true);
      const rooms = await messagesApi.getAllChatRooms();
      setChatRooms(rooms);
      setSelectedChatRoom((prev) => {
        if (!prev && rooms.length > 0) {
          return rooms[0];
        }
        return prev;
      });
    } catch (error: any) {
      console.error('Error loading all chat rooms:', error);
      if (error.response?.status !== 404) {
        toast.error(language === 'en' ? 'Failed to load chat rooms' : 'فشل تحميل غرف الدردشة');
      }
      setChatRooms([]);
    } finally {
      setLoading(false);
    }
  }, [language]);

  const loadChatRooms = React.useCallback(async (projectRoomId: string) => {
    try {
      const rooms = await messagesApi.getChatRooms(projectRoomId);
      if (!rooms || rooms.length === 0) {
        // Use mock data if API returns empty or 404
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
      // Handle other errors (not 404, as that's handled in messagesApi)
      if (error.code === 'ERR_NETWORK') {
        const mockRooms = getMockChatRooms(projectRoomId);
        setChatRooms(mockRooms);
        setSelectedChatRoom((prev) => {
          if (!prev && mockRooms.length > 0) {
            return mockRooms[0];
          }
          return prev;
        });
      } else {
        // Only show error for non-404 errors
        if (error.response?.status !== 404) {
          toast.error(language === 'en' ? 'Failed to load chats' : 'فشل تحميل المحادثات');
        }
        // Fallback to mock data
        const mockRooms = getMockChatRooms(projectRoomId);
        setChatRooms(mockRooms);
      }
    }
  }, [language]);

  const loadMessages = React.useCallback(async (chatRoomId: string, pageNum: number = 1, append: boolean = false) => {
    try {
      console.log('📥 [Admin] Loading messages for chatRoom:', chatRoomId, 'page:', pageNum);
      setLoadingMessages(true);
      
      // Add timeout to prevent hanging (10 seconds for admin)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          console.error('⏱️ [Admin] Request timeout after 10 seconds');
          reject(new Error('Request timeout'));
        }, 10000);
      });
      
      console.log('📥 [Admin] Calling messagesApi.getMessages...');
      const apiCall = messagesApi.getMessages(chatRoomId, pageNum, 50);
      console.log('📥 [Admin] API call started, waiting for response...');
      
      const result = await Promise.race([
        apiCall,
        timeoutPromise
      ]) as { messages: any[]; total: number; page: number; totalPages: number };
      
      console.log('📥 [Admin] Raw response from getMessages:', result);
      console.log('📥 [Admin] Response type:', typeof result);
      console.log('📥 [Admin] Has messages?', !!result?.messages);
      console.log('📥 [Admin] Messages is array?', Array.isArray(result?.messages));
      console.log('📥 [Admin] Messages loaded:', result?.messages?.length || 0, 'messages');
      
      if (!result) {
        console.error('❌ [Admin] No result returned from API');
        setMessages([]);
        setHasMore(false);
        setPage(pageNum);
        return;
      }
      
      if (!result.messages || !Array.isArray(result.messages)) {
        console.error('❌ [Admin] Invalid response structure:', {
          result,
          hasMessages: !!result.messages,
          isArray: Array.isArray(result.messages),
          type: typeof result.messages
        });
        setMessages([]);
        setHasMore(false);
        setPage(pageNum);
        return;
      }
      
      console.log('✅ [Admin] Valid response, processing', result.messages.length, 'messages');
      
      if (append) {
        // When appending (loading older messages), add them to the beginning
        setMessages((prev) => {
          const updated = [...result.messages, ...prev];
          console.log('📥 [Admin] Messages after append:', updated.length);
          return updated;
        });
      } else {
        // Messages come from backend oldest first, we want newest at bottom
        // So we keep them as is (oldest first = top to bottom, newest at bottom)
        console.log('📥 [Admin] Setting messages:', result.messages.length);
        console.log('📥 [Admin] First message (oldest):', result.messages[0]);
        console.log('📥 [Admin] Last message (newest):', result.messages[result.messages.length - 1]);
        setMessages(result.messages);
      }
      setHasMore(result.page < result.totalPages);
      setPage(result.page);
      if (!append) {
        // Scroll to bottom after messages are rendered
        setTimeout(() => {
          scrollToBottom();
        }, 200);
      }
    } catch (error: any) {
      console.error('❌ [Admin] Error loading messages:', error);
      console.error('❌ [Admin] Error details:', {
        message: error.message,
        name: error.name,
        stack: error.stack,
        response: error.response?.data,
        status: error.response?.status
      });
      
      // If timeout or network error, keep existing messages (from Socket.io)
      if (error.message === 'Request timeout' || error.code === 'ERR_NETWORK') {
        console.warn('⚠️ [Admin] Request timeout or network error, keeping existing messages');
        // Don't clear messages, just stop loading
        setHasMore(false);
      } else if (error.response?.status === 404) {
        console.log('⚠️ [Admin] No messages found (404), setting empty array');
        setMessages([]);
        setHasMore(false);
        setPage(1);
        setTimeout(() => scrollToBottom(), 100);
      } else {
        toast.error(language === 'en' ? 'Failed to load messages' : 'فشل تحميل الرسائل');
        // Only clear if we have no messages from Socket.io
        if (messages.length === 0) {
          setMessages([]);
        }
        setHasMore(false);
      }
    } finally {
      console.log('✅ [Admin] Finished loading messages, setting loadingMessages to false');
      setLoadingMessages(false);
    }
  }, [scrollToBottom, language]); // Remove messages.length to prevent infinite loops

  const handleSendMessage = async () => {
    if (!selectedChatRoom || (!message.trim() && attachments.length === 0)) return;
    
    // Prevent admin from sending messages in observer mode
    if (selectedChatRoom.type === 'group' && selectedChatRoom.adminObserver) {
      toast.error(
        language === 'en' 
          ? 'You are in observer mode and cannot send messages in this chat' 
          : 'أنت في وضع المراقبة ولا يمكنك إرسال رسائل في هذه الدردشة'
      );
      return;
    }
    
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
      const messageType = attachments.length > 0 ? 'file' : 'text';
      const messageContent = message.trim() || (attachments.length > 0 
        ? (language === 'en' ? `Sent ${attachments.length} file(s)` : `تم إرسال ${attachments.length} ملف(ات)`)
        : '');
      
      console.log('📤 Sending message:', {
        chatRoomId: selectedChatRoom._id,
        content: messageContent,
        type: messageType,
        attachmentsCount: attachments.length,
        fileNames: attachments.map(f => f.name)
      });
      
      const sentMessage = await messagesApi.sendMessage(
        selectedChatRoom._id,
        messageContent,
        messageType,
        attachments.length > 0 ? attachments : undefined
      );
      
      console.log('✅ Message sent successfully:', sentMessage);
      
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
            console.log('⚠️ Socket.io event not received, adding message optimistically');
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
      console.error('❌ Error sending message:', error);
      const errorMessage = error.response?.data?.message || error.message || 
        (language === 'en' ? 'Failed to send message' : 'فشل إرسال الرسالة');
      toast.error(errorMessage);
      setUploadProgress(0);
    } finally {
      setSending(false);
    }
  };

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

  // Start chat - Admin initiates conversation
  const handleStartChat = async () => {
    if (!selectedChatRoom) return;
    try {
      setStartingChat(true);
      const updatedChatRoom = await messagesApi.startChat(selectedChatRoom._id);
      
      // Update chat room in state
      setChatRooms((prev) =>
        prev.map((room) =>
          room._id === selectedChatRoom._id
            ? { ...room, ...updatedChatRoom, adminStartedChat: true }
            : room
        )
      );
      
      // Update selected chat room
      setSelectedChatRoom({ ...selectedChatRoom, ...updatedChatRoom, adminStartedChat: true });
      
      toast.success(
        language === 'en' 
          ? 'Chat started successfully' 
          : 'تم بدء الدردشة بنجاح'
      );
    } catch (error: any) {
      console.error('Error starting chat:', error);
      toast.error(
        language === 'en' 
          ? 'Failed to start chat' 
          : 'فشل بدء الدردشة'
      );
    } finally {
      setStartingChat(false);
    }
  };

  // Assign engineer from chat - Direct assignment
  const handleAssignEngineer = async () => {
    if (!selectedChatRoom || !selectedProjectRoom || (selectedChatRoom.type !== 'admin-engineer' && selectedChatRoom.type !== 'admin-company')) return;
    try {
      setAssigning(true);
      const engineerId = selectedChatRoom.engineer || 
                        selectedChatRoom.participants.find(p => p.role === 'engineer' || p.role === 'company')?.user;
      
      if (!engineerId) {
        toast.error(language === 'en' ? 'Engineer ID not found' : 'لم يتم العثور على معرف المهندس');
        return;
      }

      // Get engineer ID as string
      const engineerIdStr = typeof engineerId === 'string' ? engineerId : 
                           (typeof engineerId === 'object' && engineerId !== null ? (engineerId as any)._id || String(engineerId) : String(engineerId));

      // Call API directly
      const result = await messagesApi.assignEngineerFromChat(selectedChatRoom._id, engineerIdStr);
      
      toast.success(language === 'en' ? 'Engineer assigned successfully' : 'تم تعيين المهندس بنجاح');
      
      // Reload chat rooms to show the new group chat
      if (selectedProjectRoom) {
        await loadChatRooms(selectedProjectRoom._id);
      }
      
      // Optionally select the new group chat
      if (result.groupChatRoom) {
        setSelectedChatRoom(result.groupChatRoom as ChatRoom);
      }
      
      setShowAssignModal(false);
    } catch (error: any) {
      console.error('Error assigning engineer:', error);
      const errorMessage = error.response?.data?.message || 
                          (language === 'en' ? 'Failed to assign engineer' : 'فشل تعيين المهندس');
      toast.error(errorMessage);
    } finally {
      setAssigning(false);
    }
  };

  const handleRejectEngineer = async () => {
    if (!rejectReason.trim()) {
      toast.error(language === 'en' ? 'Please provide a rejection reason' : 'يرجى إدخال سبب الرفض');
      return;
    }
    
    try {
      if (!selectedChatRoom || !selectedProjectRoom || selectedChatRoom.type !== 'admin-engineer') return;
      
      setRejecting(true);
      const engineerId = selectedChatRoom.engineer || selectedChatRoom.participants.find(p => p.role === 'engineer')?.user;
      if (!engineerId) {
        toast.error(language === 'en' ? 'Engineer ID not found' : 'لم يتم العثور على معرف المهندس');
        return;
      }
      
      await http.post(`/projects/${selectedProjectRoom.project}/chat/${selectedChatRoom._id}/reject`, {
        reason: rejectReason,
        engineerId: engineerId,
      });
      
      toast.success(language === 'en' ? 'Engineer rejected successfully' : 'تم رفض المهندس بنجاح');
      setShowRejectModal(false);
      setRejectReason("");
      
      // Refresh chat rooms
      if (selectedProjectRoom) {
        loadChatRooms(selectedProjectRoom._id);
        // Clear selected chat room if it was rejected
        if (selectedChatRoom) {
          setSelectedChatRoom(null);
          setMessages([]);
        }
      }
    } catch (error: any) {
      console.error('Error rejecting engineer:', error);
      toast.error(language === 'en' ? 'Failed to reject engineer' : 'فشل رفض المهندس');
    } finally {
      setRejecting(false);
    }
  };

  const getChatRoomTitle = (chatRoom: ChatRoom): string => {
    if (chatRoom.type === 'admin-client') {
      const clientParticipant = chatRoom.participants.find((p) => p.role === 'client');
      const user = clientParticipant?.user;
      // Handle both string and object (populated) user
      if (typeof user === 'string') {
        return user;
      } else if (user && typeof user === 'object' && 'name' in user) {
        return (user as any).name || (language === 'en' ? 'Client' : 'العميل');
      }
      return language === 'en' ? 'Client' : 'العميل';
    }
    if (chatRoom.type === 'admin-engineer') {
      const engineerParticipant = chatRoom.participants.find((p) => p.role === 'engineer');
      const user = engineerParticipant?.user;
      // Handle both string and object (populated) user
      if (typeof user === 'string') {
        return user;
      } else if (user && typeof user === 'object' && 'name' in user) {
        return (user as any).name || (language === 'en' ? 'Engineer' : 'المهندس');
      }
      return language === 'en' ? 'Engineer' : 'المهندس';
    }
    return language === 'en' ? 'Chat' : 'محادثة';
  };

  const getProjectTitle = (chatRoom: ChatRoom): string => {
    if (typeof chatRoom.project === 'object' && chatRoom.project !== null) {
      return chatRoom.project.title || '';
    }
    if (typeof chatRoom.projectRoom === 'object' && chatRoom.projectRoom !== null) {
      return chatRoom.projectRoom.projectTitle || '';
    }
    // Fallback: try to find project from projectRooms
    const projectId = typeof chatRoom.project === 'string' ? chatRoom.project : '';
    const projectRoom = projectRooms.find(pr => pr.project === projectId);
    return projectRoom?.projectTitle || '';
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
    if (!unreadCount) return 0;
    const roomCount = unreadCount.unreadCounts.find(
      (uc) => uc.chatRoom === chatRoom._id
    );
    return roomCount?.count || 0;
  };

  const formatTime = (dateString: string): string => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  // Update ref when selectedChatRoom changes
  useEffect(() => {
    selectedChatRoomRef.current = selectedChatRoom;
  }, [selectedChatRoom]);

  // Effects
  useEffect(() => {
    if (viewMode === 'all') {
      loadAllChatRooms();
    } else {
      loadProjectRooms();
    }
    socketService.connect();
    const handleNewMessage = (data: SocketMessageEvent) => {
      console.log('📨 New message received:', data);
      const currentChatRoomId = selectedChatRoomRef.current?._id;
      console.log('📨 Current selectedChatRoom?._id:', currentChatRoomId);
      console.log('📨 Message chatRoomId:', data.chatRoomId);
      setMessages((prev) => {
        console.log('📨 Current messages count:', prev.length);
        // Check if message already exists (avoid duplicates)
        const exists = prev.some(m => m._id === data.message._id);
        if (exists) {
          console.log('⚠️ Message already exists, skipping');
          return prev;
        }
        
        if (data.chatRoomId === currentChatRoomId) {
          console.log('✅ Adding message to current chat room');
          // Add new message and sort by createdAt (oldest first)
          const updated = [...prev, data.message];
          const sorted = updated.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          console.log('✅ Messages after adding:', sorted.length);
          console.log('✅ New message in array:', sorted.find(m => m._id === data.message._id));
          return sorted;
        }
        console.log('ℹ️ Message for different chat room, not adding');
        return prev;
      });
      if (data.chatRoomId === currentChatRoomId) {
        setTimeout(() => scrollToBottom(), 100);
      }
      setChatRooms((prev) =>
        prev.map((room) => {
          if (room._id === data.chatRoomId) {
            const senderId = typeof data.message.sender === 'string' 
              ? data.message.sender 
              : (typeof data.message.sender === 'object' && data.message.sender !== null
                ? (data.message.sender._id || String(data.message.sender))
                : String(data.message.sender));
            return {
              ...room,
              lastMessage: {
                content: data.message.content,
                sender: senderId,
                createdAt: data.message.createdAt,
              },
            } as ChatRoom;
          }
          return room;
        })
      );
    };
    socketService.on('new_message', handleNewMessage);
    return () => {
      socketService.off('new_message', handleNewMessage);
    };
  }, [selectedChatRoom?._id, scrollToBottom, loadProjectRooms, loadAllChatRooms, viewMode]);

  useEffect(() => {
    if (viewMode === 'project' && selectedProjectRoom) {
      loadChatRooms(selectedProjectRoom._id);
    } else if (viewMode === 'all') {
      loadAllChatRooms();
    }
  }, [selectedProjectRoom?._id, loadChatRooms, viewMode, loadAllChatRooms]);

  // Use ref to prevent multiple loads for the same chat room
  const loadAttemptedRef = React.useRef<string | null>(null);
  
  useEffect(() => {
    if (selectedChatRoom) {
      const chatRoomId = selectedChatRoom._id;
      
      // Only load if we haven't loaded for this chat room yet
      if (loadAttemptedRef.current !== chatRoomId) {
        console.log('🔄 ChatRoom selected, loading messages:', chatRoomId);
        loadAttemptedRef.current = chatRoomId;
        setPage(1);
        setHasMore(true);
        setMessages([]); // Clear previous messages
        loadMessages(chatRoomId, 1);
        socketService.joinChatRoom(chatRoomId);
        messagesApi.markChatRoomAsRead(chatRoomId).catch(console.error);
      } else {
        console.log('⏭️ [Admin] Skipping load - already loaded for chat room:', chatRoomId);
      }
      
      return () => {
        socketService.leaveChatRoom(chatRoomId);
      };
    } else {
      // Reset ref when no chat room is selected
      loadAttemptedRef.current = null;
    }
  }, [selectedChatRoom?._id]); // Remove loadMessages from dependencies

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden h-full">
        <AdminTopBar />
          <main className="flex-1 overflow-hidden flex flex-col p-4 min-h-0">
           {/* Header */}
            <div className="mb-4 flex-shrink-0">
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
             {/* Left Sidebar - Projects or View Mode Toggle */}
             {viewMode === 'project' ? (
               <ProjectRoomsList
                 projectRooms={projectRooms}
                 selectedProjectRoom={selectedProjectRoom}
                 loading={loading}
                 language={language}
                 onSelectProjectRoom={setSelectedProjectRoom}
                 formatTime={formatTime}
               />
             ) : (
               <ViewModeToggle
                 viewMode={viewMode}
                 language={language}
                 onViewModeChange={setViewMode}
               />
             )}

             {/* Main Area - Chats & Messages */}
             <div className="flex-1 flex gap-2 overflow-hidden min-h-0">
               {/* Chat Rooms List */}
               <ChatRoomsList
                 chatRooms={chatRooms}
                 selectedChatRoom={selectedChatRoom}
                 selectedProjectRoom={selectedProjectRoom}
                 viewMode={viewMode}
                 filter={filter}
                 searchTerm={searchTerm}
                 language={language}
                 onSelectChatRoom={setSelectedChatRoom}
                 onFilterChange={setFilter}
                 onSearchChange={setSearchTerm}
                 getChatRoomTitle={getChatRoomTitle}
                 getChatRoomSubtitle={getChatRoomSubtitle}
                 getChatRoomTypeBadge={getChatRoomTypeBadge}
                 getChatRoomIcon={getChatRoomIcon}
                 getChatRoomStatus={getChatRoomStatus}
                 getProjectTitle={getProjectTitle}
                 getUnreadCount={getUnreadCount}
                 formatTime={formatTime}
               />

              {/* Messages Area */}
              <Card className="flex-1 flex flex-col overflow-hidden bg-black border-gray-800 h-full">
                {selectedChatRoom ? (
                  <>
                     {/* Chat Header */}
                     <ChatHeader
                       selectedChatRoom={selectedChatRoom}
                       selectedProjectRoom={selectedProjectRoom}
                       language={language}
                       startingChat={startingChat}
                       assigning={assigning}
                       onStartChat={handleStartChat}
                       onReject={() => setShowRejectModal(true)}
                       onAssign={handleAssignEngineer}
                       getChatRoomTitle={getChatRoomTitle}
                       getChatRoomSubtitle={getChatRoomSubtitle}
                     />

                     {/* Admin Observer Banner - Show for group chats */}
                     {selectedChatRoom.type === 'group' && selectedChatRoom.adminObserver && (
                       <ObserverBanner language={language} />
                     )}

                     {/* Messages */}
                     <MessagesList
                       messages={messages}
                       loadingMessages={loadingMessages}
                       page={page}
                       language={language}
                       messagesContainerRef={messagesContainerRef}
                       messagesEndRef={messagesEndRef}
                     />

                     {/* Message Input */}
                     <MessageInput
                       message={message}
                       setMessage={setMessage}
                       attachments={attachments}
                       sending={sending}
                       language={language}
                       fileInputRef={fileInputRef}
                       onFileSelect={handleFileSelect}
                       onRemoveAttachment={removeAttachment}
                       onSendMessage={handleSendMessage}
                     />
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

      {/* Reject Engineer Modal */}
      <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{language === 'en' ? 'Reject Engineer' : 'رفض المهندس'}</DialogTitle>
            <DialogDescription>
              {language === 'en' 
                ? 'Please provide a reason for rejecting this engineer.'
                : 'يرجى إدخال سبب رفض هذا المهندس.'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {language === 'en' ? 'Rejection Reason' : 'سبب الرفض'}
              </label>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder={language === 'en' ? 'Enter rejection reason...' : 'أدخل سبب الرفض...'}
                className="w-full min-h-[100px] p-3 border rounded-md bg-background text-foreground resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setShowRejectModal(false);
              setRejectReason("");
            }}>
              {language === 'en' ? 'Cancel' : 'إلغاء'}
            </Button>
            <Button 
              onClick={handleRejectEngineer}
              disabled={rejecting || !rejectReason.trim()}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {rejecting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {language === 'en' ? 'Rejecting...' : 'جاري الرفض...'}
                </>
              ) : (
                <>
                  {language === 'en' ? 'Reject Engineer' : 'رفض المهندس'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
