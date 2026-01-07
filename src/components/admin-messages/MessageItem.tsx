import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminTopBar } from "@/components/AdminTopBar";
import { useApp } from "@/context/AppContext";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Send, Paperclip, Loader2, UserCheck, X, MessageSquare, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/components/ui/sonner";
import { messagesApi, ProjectRoom, ChatRoom, Message } from "@/services/messagesApi";
import { socketService, SocketMessageEvent } from "@/services/socketService";
import { MessageItem } from "./MessageItem"; // تأكدي من استيراد المكون الذي عدلناه سابقاً
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
  const isRTL = language === 'ar';
  
  // State
  const [projectRooms, setProjectRooms] = useState<ProjectRoom[]>([]);
  const [selectedChatRoom, setSelectedChatRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedChatRoomRef = useRef<ChatRoom | null>(null);

  // تحديث المرجع عند تغيير الغرفة
  useEffect(() => {
    selectedChatRoomRef.current = selectedChatRoom;
    if (selectedChatRoom) {
      loadMessages(selectedChatRoom._id);
    }
  }, [selectedChatRoom]);

  // تحميل الغرف عند البداية
  useEffect(() => {
    loadAllChatRooms();
    socketService.connect();

    const handleNewMessage = (data: SocketMessageEvent) => {
      if (data.chatRoomId === selectedChatRoomRef.current?._id) {
        setMessages((prev) => {
          if (prev.some(m => m._id === data.message._id)) return prev;
          return [...prev, data.message].sort(
            (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        });
        setTimeout(() => scrollToBottom(), 100);
      }
    };

    socketService.on('new_message', handleNewMessage);
    return () => { socketService.off('new_message', handleNewMessage); };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadAllChatRooms = async () => {
    try {
      setLoading(true);
      const rooms = await messagesApi.getAllChatRooms();
      setChatRooms(rooms);
      if (rooms.length > 0 && !selectedChatRoom) {
        setSelectedChatRoom(rooms[0]);
      }
    } catch (error) {
      toast.error(isRTL ? 'فشل تحميل المحادثات' : 'Failed to load chats');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (chatRoomId: string) => {
    try {
      setLoadingMessages(true);
      const result = await messagesApi.getMessages(chatRoomId, 1, 50);
      setMessages(result.messages || []);
      setTimeout(() => scrollToBottom(), 200);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleSendMessage = async () => {
    if (!selectedChatRoom || (!message.trim() && attachments.length === 0)) return;
    
    try {
      setSending(true);
      const type = attachments.length > 0 ? 'file' : 'text';
      const content = message.trim() || (isRTL ? 'أرسل ملفاً' : 'Sent a file');
      
      const sentMsg = await messagesApi.sendMessage(selectedChatRoom._id, content, type, attachments);
      
      setMessage("");
      setAttachments([]);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // التحديث المحلي احتياطاً
      setMessages(prev => [...prev, sentMsg]);
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      toast.error(isRTL ? 'فشل الإرسال' : 'Failed to send');
    } finally {
      setSending(false);
    }
  };

  const handleAssignEngineer = async () => {
    if (!selectedChatRoom) return;
    try {
      setAssigning(true);
      const engineerId = selectedChatRoom.participants.find(p => p.role === 'engineer' || p.role === 'company')?.user;
      const engineerIdStr = typeof engineerId === 'object' ? (engineerId as any)._id : engineerId;
      
      await messagesApi.assignEngineerFromChat(selectedChatRoom._id, engineerIdStr);
      toast.success(isRTL ? 'تم التعيين بنجاح' : 'Assigned successfully');
      setShowAssignModal(false);
      loadAllChatRooms();
    } catch (error) {
      toast.error(isRTL ? 'فشل التعيين' : 'Assignment failed');
    } finally {
      setAssigning(false);
    }
  };

  return (
    <div className="flex h-screen bg-background" dir={isRTL ? 'rtl' : 'ltr'}>
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminTopBar />
        
        <main className="flex-1 flex overflow-hidden p-4 gap-4">
          {/* قائمة المحادثات */}
          <Card className="w-80 flex flex-col shrink-0">
            <div className="p-4 border-b">
              <div className="relative">
                <Search className="absolute right-3 top-2.5 h-4 h-4 text-muted-foreground" />
                <Input placeholder={isRTL ? "بحث..." : "Search..."} className={isRTL ? "pr-9" : "pl-9"} />
              </div>
            </div>
            <ScrollArea className="flex-1">
              {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
              ) : (
                chatRooms.map((room) => (
                  <div
                    key={room._id}
                    onClick={() => setSelectedChatRoom(room)}
                    className={`p-4 cursor-pointer hover:bg-muted/50 border-b transition-colors ${
                      selectedChatRoom?._id === room._id ? 'bg-muted border-r-4 border-r-yellow-400' : ''
                    }`}
                  >
                    <p className="font-bold text-sm truncate">{room.projectRoom?.projectTitle || 'Project'}</p>
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {room.participants.find(p => p.role !== 'admin')?.user?.name || 'User'}
                    </p>
                  </div>
                ))
              )}
            </ScrollArea>
          </Card>

          {/* منطقة الدردشة */}
          <Card className="flex-1 flex flex-col overflow-hidden relative">
            {selectedChatRoom ? (
              <>
                {/* شريط الإجراءات العلوي (تعيين/رفض) */}
                {(selectedChatRoom.type === 'admin-engineer' || selectedChatRoom.type === 'admin-company') && (
                  <div className="bg-yellow-400/10 p-3 border-b flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-2 text-yellow-700">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs font-bold">{isRTL ? 'إجراءات المهندس المقترح' : 'Proposed Engineer Actions'}</span>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="h-8 text-red-600 border-red-200" onClick={() => setShowRejectModal(true)}>
                        <X className="w-3 h-3 ml-1" /> {isRTL ? 'رفض' : 'Reject'}
                      </Button>
                      <Button size="sm" className="h-8 bg-green-600 hover:bg-green-700 text-white" onClick={() => setShowAssignModal(true)}>
                        <UserCheck className="w-3 h-3 ml-1" /> {isRTL ? 'تعيين' : 'Assign'}
                      </Button>
                    </div>
                  </div>
                )}

                <ScrollArea className="flex-1 p-4 bg-slate-50/30">
                  {loadingMessages ? (
                    <div className="flex justify-center py-10"><Loader2 className="animate-spin text-yellow-500" /></div>
                  ) : (
                    <div className="space-y-1">
                      {messages.map((msg, idx) => (
                        <MessageItem
                          key={msg._id}
                          msg={msg}
                          isAdmin={msg.senderRole === 'admin'}
                          isSystem={msg.type === 'system'}
                          isSameSender={idx > 0 && messages[idx-1].sender === msg.sender}
                          showAvatar={true}
                          senderAvatar={msg.senderName?.charAt(0) || 'U'}
                          language={language}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </ScrollArea>

                {/* صندوق الإرسال - مفتوح دائماً */}
                <div className="p-4 border-t bg-white">
                  <div className="flex items-end gap-2">
                    <input type="file" ref={fileInputRef} hidden onChange={(e) => setAttachments(Array.from(e.target.files || []))} multiple />
                    <Button variant="ghost" size="icon" onClick={() => fileInputRef.current?.click()} disabled={sending}>
                      <Paperclip className="w-5 h-5" />
                    </Button>
                    <Input
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder={isRTL ? "اكتب رسالة..." : "Type a message..."}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1"
                    />
                    <Button onClick={handleSendMessage} disabled={sending || (!message.trim() && attachments.length === 0)} className="bg-yellow-400 text-black hover:bg-yellow-500">
                      {sending ? <Loader2 className="animate-spin w-4 h-4" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </div>
                  {attachments.length > 0 && (
                    <div className="flex gap-2 mt-2">
                      {attachments.map((f, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px] py-0">
                          {f.name} <X className="w-3 h-3 cursor-pointer ml-1" onClick={() => setAttachments(prev => prev.filter((_, idx) => idx !== i))} />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
                <MessageSquare className="w-12 h-12 mb-4 opacity-20" />
                <p>{isRTL ? "اختر محادثة للبدء" : "Select a chat to start"}</p>
              </div>
            )}
          </Card>
        </main>
      </div>

      {/* مودال التعيين */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isRTL ? 'تعيين المهندس' : 'Assign Engineer'}</DialogTitle>
            <DialogDescription>
              {isRTL ? 'هل أنت متأكد من تعيين هذا المهندس لهذا المشروع؟ سيتم إنشاء مجموعة عمل رسمية.' : 'Are you sure you want to assign this engineer? A formal work group will be created.'}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAssignModal(false)}>{isRTL ? 'إلغاء' : 'Cancel'}</Button>
            <Button onClick={handleAssignEngineer} disabled={assigning} className="bg-green-600 text-white">
              {assigning ? <Loader2 className="animate-spin w-4 h-4" /> : (isRTL ? 'تأكيد التعيين' : 'Confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMessages;