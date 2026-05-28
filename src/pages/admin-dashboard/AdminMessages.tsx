import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminTopBar } from "@/components/AdminTopBar";
import { useApp } from "@/context/AppContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Paperclip, Loader2, Briefcase, User, Users, UserCheck, CheckCircle, Clock, X, MessageSquare } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/sonner";
import { messagesApi, ProjectRoom, ChatRoom, Message } from "@/services/messagesApi";
import { projectsApi, Project } from "@/services/projectsApi";
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
  const [project, setProject] = useState<Project | null>(null);
  const [loadingProject, setLoadingProject] = useState(false);

  // Unread messages count
  const { unreadCount } = useUnreadMessagesCount(60000); // Refresh every 60 seconds / 1 minute

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedChatRoomRef = useRef<ChatRoom | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);

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
        setProjectRooms([]);
        setSelectedProjectRoom(null);
      } else {
        setProjectRooms(rooms);
        setSelectedProjectRoom((prev) => {
          if (!prev && rooms.length > 0) return rooms[0];
          return prev;
        });
      }
    } catch (error: any) {
      setProjectRooms([]);
      setSelectedProjectRoom(null);
      if (error.response?.status !== 404 && error.code !== 'ERR_NETWORK') {
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
        setChatRooms([]);
        setSelectedChatRoom((prev) => (prev ? prev : null));
      } else {
        setChatRooms(rooms);
        setSelectedChatRoom((prev) => {
          if (!prev && rooms.length > 0) return rooms[0];
          return prev;
        });
      }
    } catch (error: any) {
      setChatRooms([]);
      if (error.response?.status !== 404 && error.code !== 'ERR_NETWORK') {
        toast.error(language === 'en' ? 'Failed to load chats' : 'فشل تحميل المحادثات');
      }
    }
  }, [language]);

  const loadMessages = React.useCallback(async (chatRoomId: string, pageNum: number = 1, append: boolean = false) => {
    try {
      
      setLoadingMessages(true);

      // Add timeout to prevent hanging (10 seconds for admin)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          
          reject(new Error('Request timeout'));
        }, 10000);
      });

      
      const apiCall = messagesApi.getMessages(chatRoomId, pageNum, 50);
      

      const result = await Promise.race([
        apiCall,
        timeoutPromise
      ]) as { messages: any[]; total: number; page: number; totalPages: number };


      if (!result) {
        
        setMessages([]);
        setHasMore(false);
        setPage(pageNum);
        return;
      }

      if (!result.messages || !Array.isArray(result.messages)) {
        
        setMessages([]);
        setHasMore(false);
        setPage(pageNum);
        return;
      }

      

      // Only apply result if still viewing this chat room (avoid showing wrong room messages)
      const currentRoomId = selectedChatRoomRef.current?._id;
      if (currentRoomId !== chatRoomId) {
        return;
      }

      if (append) {
        // When appending (loading older messages), add them to the beginning
        setMessages((prev) => {
          const updated = [...result.messages, ...prev];
          
          return updated;
        });
      } else {
        // Messages come from backend oldest first, we want newest at bottom
        setMessages(result.messages);
      }
      setHasMore(result.page < result.totalPages);
      setPage(result.page);
      if (!append) {
        setTimeout(() => scrollToBottom(), 200);
      }
    } catch (error: any) {


      // If timeout or network error, keep existing messages (from Socket.io)
      if (error.message === 'Request timeout' || error.code === 'ERR_NETWORK') {
        
        // Don't clear messages, just stop loading
        setHasMore(false);
      } else if (error.response?.status === 404) {
        
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

      

      const sentMessage = await messagesApi.sendMessage(
        selectedChatRoom._id,
        messageContent,
        messageType,
        attachments.length > 0 ? attachments : undefined
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
    if (!selectedChatRoom || !selectedProjectRoom) {
      toast.error(language === 'en' ? 'Please select a chat room and project' : 'يرجى اختيار غرفة محادثة ومشروع');
      return;
    }

    if (selectedChatRoom.type !== 'admin-engineer' && selectedChatRoom.type !== 'admin-company') {
      toast.error(language === 'en' ? 'Can only assign from engineer/company chat' : 'يمكن التعيين فقط من محادثة المهندس/الشركة');
      return;
    }

    try {
      setAssigning(true);

      // Try to get engineer ID from multiple sources
      let engineerId: any = selectedChatRoom.engineer;

      // If engineer field is populated (object), extract _id
      if (engineerId && typeof engineerId === 'object' && engineerId !== null) {
        engineerId = (engineerId as any)._id || (engineerId as any).id || engineerId;
      }

      // If engineer field is not available, try to get from participants
      if (!engineerId && selectedChatRoom.participants && selectedChatRoom.participants.length > 0) {
        const engineerParticipant = selectedChatRoom.participants.find(
          p => p.role === 'engineer' || p.role === 'company'
        );
        if (engineerParticipant) {
          engineerId = engineerParticipant.user;
          // If participant.user is populated (object), extract _id
          if (engineerId && typeof engineerId === 'object' && engineerId !== null) {
            engineerId = (engineerId as any)._id || (engineerId as any).id || engineerId;
          }
        }
      }

      // Log for debugging
      

      if (!engineerId) {
        toast.error(language === 'en' ? 'Engineer ID not found in chat room' : 'لم يتم العثور على معرف المهندس في غرفة المحادثة');
        setAssigning(false);
        return;
      }

      // Get engineer ID as string (final conversion)
      const engineerIdStr = typeof engineerId === 'string'
        ? engineerId
        : String(engineerId);

      

      // Call API directly
      const result = await messagesApi.assignEngineerFromChat(selectedChatRoom._id, engineerIdStr);

      

      toast.success(language === 'en' ? 'Engineer assigned successfully' : 'تم تعيين المهندس بنجاح');

      // Reload chat rooms to show the new group chat
      if (selectedProjectRoom) {
        await loadChatRooms(selectedProjectRoom._id);
      }

      // Optionally select the new group chat
      if (result?.groupChatRoom) {
        setSelectedChatRoom(result.groupChatRoom as ChatRoom);
      }

      setShowAssignModal(false);
    } catch (error: any) {
      
      

      const errorMessage = error.response?.data?.message ||
        error.message ||
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
      if (
        !selectedChatRoom ||
        (selectedChatRoom.type !== 'admin-engineer' && selectedChatRoom.type !== 'admin-company')
      ) {
        return;
      }

      setRejecting(true);
      let engineerId: any = selectedChatRoom.engineer || selectedChatRoom.participants.find(
        (p) => p.role === 'engineer' || p.role === 'company'
      )?.user;
      if (!engineerId) {
        toast.error(language === 'en' ? 'Engineer ID not found' : 'لم يتم العثور على معرف المهندس');
        return;
      }
      const engineerIdStr = typeof engineerId === 'object' && engineerId !== null
        ? (engineerId._id || engineerId.id || engineerId).toString()
        : String(engineerId);

      await messagesApi.rejectEngineerFromChat(
        selectedChatRoom._id,
        rejectReason.trim(),
        engineerIdStr
      );

      toast.success(language === 'en' ? 'Engineer rejected successfully' : 'تم رفض المهندس بنجاح');
      setShowRejectModal(false);
      setRejectReason('');

      if (selectedProjectRoom) {
        if (viewMode === 'project') {
          loadChatRooms(selectedProjectRoom._id);
        } else {
          loadAllChatRooms();
        }
        setSelectedChatRoom(null);
        setMessages([]);
      }
    } catch (error: any) {
      
      const msg = error.response?.data?.message || error.message;
      toast.error(msg || (language === 'en' ? 'Failed to reject engineer' : 'فشل رفض المهندس'));
    } finally {
      setRejecting(false);
    }
  };

  const getChatRoomTitle = (chatRoom: ChatRoom): string => {
    // Use server-provided displayTitle first (actual client/engineer names)
    if (chatRoom.displayTitle && typeof chatRoom.displayTitle === 'string' && chatRoom.displayTitle.trim() !== '') {
      return chatRoom.displayTitle.trim();
    }
    if (chatRoom.type === 'group') {
      return language === 'en' ? 'Group Chat' : 'الدردشة الجماعية';
    }
    if (chatRoom.type === 'admin-client') {
      const clientParticipant = chatRoom.participants.find((p) => p.role === 'client');
      const user = clientParticipant?.user;
      if (user && typeof user === 'object' && 'name' in user) {
        const userName = (user as any).name;
        if (userName && typeof userName === 'string' && userName.trim() !== '') return userName;
      }
      const roomProject = chatRoom.project;
      if (roomProject && typeof roomProject === 'object' && roomProject.client) {
        const client = roomProject.client;
        const clientName = typeof client === 'object' && client !== null && 'name' in client ? (client as any).name : null;
        if (clientName && typeof clientName === 'string' && clientName.trim() !== '') return clientName;
      }
      if (project && project.client) {
        const clientName = typeof project.client === 'object' ? project.client.name : null;
        if (clientName && typeof clientName === 'string' && clientName.trim() !== '') return clientName;
      }
      return language === 'en' ? 'Client' : 'العميل';
    }
    if (chatRoom.type === 'admin-engineer' || chatRoom.type === 'admin-company') {
      const engineerParticipant = chatRoom.participants.find((p) => p.role === 'engineer' || p.role === 'company');
      const user = engineerParticipant?.user;
      if (user && typeof user === 'object' && 'name' in user) {
        const userName = (user as any).name;
        if (userName && typeof userName === 'string' && userName.trim() !== '') return userName;
      }
      if (chatRoom.engineer && typeof chatRoom.engineer === 'object' && chatRoom.engineer !== null) {
        const engineer = (chatRoom.engineer as { name?: string }).name;
        if (engineer && typeof engineer === 'string' && engineer.trim() !== '') return engineer;
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
    if (chatRoom.type === 'group') {
      return language === 'en' ? 'Client & Engineer' : 'العميل والمهندس';
    }
    if (chatRoom.type === 'admin-client') {
      return language === 'en' ? 'Project Owner' : 'صاحب المشروع';
    }
    if (chatRoom.type === 'admin-engineer') {
      return language === 'en' ? 'Proposer / Engineer' : 'متقدم / مهندس';
    }
    return '';
  };

  const getChatRoomTypeBadge = (chatRoom: ChatRoom) => {
    if (chatRoom.type === 'group') {
      return {
        label: language === 'en' ? 'Group' : 'جماعي',
        className: 'bg-blue-500/10 text-blue-400/80 border-0 text-[10px] px-2 py-0.5 h-5'
      };
    }
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
    if (chatRoom.type === 'group') return Users;
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

  // Clear messages as soon as the selected room changes (so we never show previous room's messages)
  useEffect(() => {
    setMessages([]);
  }, [selectedChatRoom?._id]);

  // Load project info when chat room is selected
  useEffect(() => {
    const loadProjectInfo = async () => {
      if (!selectedChatRoom) {
        setProject(null);
        return;
      }

      // Get project ID from chat room
      const projectId = typeof selectedChatRoom.project === 'string'
        ? selectedChatRoom.project
        : selectedChatRoom.project?._id;

      if (!projectId) {
        setProject(null);
        return;
      }

      try {
        setLoadingProject(true);
        const projectData = await projectsApi.getProjectById(projectId);
        setProject(projectData);
      } catch (error: any) {
        
        setProject(null);
      } finally {
        setLoadingProject(false);
      }
    };

    loadProjectInfo();
  }, [selectedChatRoom]);

  // Check if engineer is assigned to the project
  const isEngineerAssigned = (chatRoom: ChatRoom): boolean => {
    if (!project || !project.assignedEngineer) return false;

    // Get engineer ID from chat room
    let engineerId: any = chatRoom.engineer;
    if (engineerId && typeof engineerId === 'object' && engineerId !== null) {
      engineerId = (engineerId as any)._id || (engineerId as any).id || engineerId;
    }

    if (!engineerId && chatRoom.participants && chatRoom.participants.length > 0) {
      const engineerParticipant = chatRoom.participants.find(
        p => p.role === 'engineer' || p.role === 'company'
      );
      if (engineerParticipant) {
        engineerId = engineerParticipant.user;
        if (engineerId && typeof engineerId === 'object' && engineerId !== null) {
          engineerId = (engineerId as any)._id || (engineerId as any).id || engineerId;
        }
      }
    }

    if (!engineerId) return false;

    const assignedEngineerId = typeof project.assignedEngineer === 'string'
      ? project.assignedEngineer
      : project.assignedEngineer?._id;

    return String(engineerId) === String(assignedEngineerId);
  };

  // Effects
  useEffect(() => {
    if (viewMode === 'all') {
      loadAllChatRooms();
    } else {
      loadProjectRooms();
    }
    socketService.connect();
    const handleNewMessage = (data: SocketMessageEvent) => {
      
      const currentChatRoomId = selectedChatRoomRef.current?._id;
      
      
      setMessages((prev) => {
        
        // Check if message already exists (avoid duplicates)
        const exists = prev.some(m => m._id === data.message._id);
        if (exists) {
          
          return prev;
        }

        if (data.chatRoomId === currentChatRoomId) {
          
          // Add new message and sort by createdAt (oldest first)
          const updated = [...prev, data.message];
          const sorted = updated.sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
          
          
          return sorted;
        }
        
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
        
        loadAttemptedRef.current = chatRoomId;
        setPage(1);
        setHasMore(true);
        setMessages([]); // Clear previous messages
        loadMessages(chatRoomId, 1);
        socketService.joinChatRoom(chatRoomId);
        messagesApi.markChatRoomAsRead(chatRoomId).catch(() => {});
      } else {
        
      }

      return () => {
        socketService.leaveChatRoom(chatRoomId);
      };
    } else {
      // Reset ref when no chat room is selected
      loadAttemptedRef.current = null;
    }
  }, [selectedChatRoom?._id]); // Remove loadMessages from dependencies

  // Show only messages that belong to the current chat room (avoid wrong room messages)
  const messagesToShow = selectedChatRoom
    ? messages.filter((m) => {
        const msgRoomId = typeof m.chatRoom === 'string' ? m.chatRoom : (m.chatRoom as any)?._id;
        return String(msgRoomId) === String(selectedChatRoom._id);
      })
    : [];

  const filteredChatRooms = chatRooms.filter((room) => {
    // Filter by type
    if (filter === 'client' && room.type !== 'admin-client') return false;
    if (filter === 'engineer' && room.type !== 'admin-engineer') return false;
    // Group chats should be visible to admin (they can observe but not participate)
    // Only filter out group chats if filter is set to 'client' or 'engineer'
    if (filter !== 'all' && room.type === 'group') return false;

    // Filter by search term
    const title = getChatRoomTitle(room);
    if (!title || typeof title !== 'string') return true; // Include if title is invalid
    return title.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
                    <div className="flex-shrink-0 border-b border-gray-800 bg-gray-900/50 px-4 py-3">
                      <div className="flex items-center justify-between">
                        {/* Left Side - Action Buttons */}
                        <div className="flex gap-2">
                          {/* Start Chat Button - Show if chat hasn't started yet */}
                          {!selectedChatRoom.adminStartedChat && selectedChatRoom.type !== 'group' && (
                            <Button
                              onClick={handleStartChat}
                              disabled={startingChat}
                              className="bg-green-500 hover:bg-green-600 text-white h-7 px-3 text-xs font-medium rounded"
                              size="sm"
                            >
                              {startingChat ? (
                                <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                              ) : (
                                <MessageSquare className="h-3.5 w-3.5 mr-1.5" />
                              )}
                              {language === 'en' ? 'Start Chat' : 'بدء الدردشة'}
                            </Button>
                          )}

                          {/* Assign/Reject Buttons - Show only for admin-engineer/admin-company chats after chat started */}
                          {selectedChatRoom.adminStartedChat && (selectedChatRoom.type === 'admin-engineer' || selectedChatRoom.type === 'admin-company') && (
                            <>
                              {isEngineerAssigned(selectedChatRoom) ? (
                                // Show badge if engineer is assigned
                                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs px-3 py-1 h-7 flex items-center gap-1.5">
                                  <CheckCircle className="h-3.5 w-3.5" />
                                  {language === 'en' ? 'Assigned - Working on Project' : 'معيّن - يعمل على المشروع'}
                                </Badge>
                              ) : (
                                // Show assign/reject buttons if engineer is not assigned
                                <>
                                  <Button
                                    onClick={() => setShowRejectModal(true)}
                                    className="bg-red-500 hover:bg-red-600 text-white h-7 px-3 text-xs font-medium rounded"
                                    size="sm"
                                  >
                                    <X className="h-3.5 w-3.5 mr-1.5" />
                                    {language === 'en' ? 'Reject' : 'رفض'}
                                  </Button>
                                  <Button
                                    onClick={handleAssignEngineer}
                                    disabled={assigning || loadingProject}
                                    className="bg-yellow-400 hover:bg-yellow-500 text-black h-7 px-3 text-xs font-medium rounded"
                                    size="sm"
                                  >
                                    {assigning || loadingProject ? (
                                      <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                                    ) : (
                                      <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                                    )}
                                    {language === 'en' ? 'Assign' : 'تعيين'}
                                  </Button>
                                </>
                              )}
                            </>
                          )}

                          {selectedChatRoom.type === 'admin-client' && <div />}
                        </div>

                        {/* Right Side - Participant Info */}
                        <div className="flex items-center gap-3">
                          {selectedChatRoom.type === 'admin-engineer' && (
                            <>
                              <Badge className="bg-yellow-400/20 text-yellow-400 border-0 text-xs px-2.5 py-1 h-6">
                                {language === 'en' ? 'Engineer' : 'مهندس'}
                              </Badge>
                              <div className="flex flex-col items-end">
                                <span className="text-sm font-semibold text-white">
                                  {getChatRoomTitle(selectedChatRoom)}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {getChatRoomSubtitle(selectedChatRoom)} • {selectedProjectRoom?.projectTitle}
                                </span>
                              </div>
                              <div className="w-8 h-8 rounded-md bg-yellow-400/20 flex items-center justify-center">
                                <Briefcase className="h-4 w-4 text-yellow-400/80" />
                              </div>
                            </>
                          )}
                          {selectedChatRoom.type === 'admin-client' && (
                            <>
                              <div className="flex flex-col items-end">
                                <span className="text-sm font-semibold text-white">
                                  {getChatRoomTitle(selectedChatRoom)}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {getChatRoomSubtitle(selectedChatRoom)} • {selectedProjectRoom?.projectTitle}
                                </span>
                              </div>
                              <div className="w-8 h-8 rounded-md bg-gray-700 flex items-center justify-center">
                                <User className="h-4 w-4 text-gray-300" />
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Admin Observer Banner - Show for group chats */}
                    {selectedChatRoom.type === 'group' && selectedChatRoom.adminObserver && (
                      <ObserverBanner language={language} />
                    )}

                    {/* Messages */}
                    <MessagesList
                      messages={messagesToShow}
                      loadingMessages={loadingMessages}
                      page={page}
                      language={language}
                      messagesContainerRef={messagesContainerRef}
                      messagesEndRef={messagesEndRef}
                      hasMore={hasMore}
                      onLoadMore={
                        selectedChatRoom && hasMore && !loadingMessages
                          ? () => loadMessages(selectedChatRoom._id, page + 1, true)
                          : undefined
                      }
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
