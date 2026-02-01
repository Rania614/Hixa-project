import React, { useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronUp } from "lucide-react";
import { Message } from "@/services/messagesApi";
import { MessageItem } from "./MessageItem";

interface MessagesListProps {
  messages: Message[];
  loadingMessages: boolean;
  page: number;
  language: string;
  messagesContainerRef: React.RefObject<HTMLDivElement>;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  hasMore?: boolean;
  onLoadMore?: () => void;
}

export const MessagesList: React.FC<MessagesListProps> = ({
  messages,
  loadingMessages,
  page,
  language,
  messagesContainerRef,
  messagesEndRef,
  hasMore = false,
  onLoadMore,
}) => {
  return (
    <div className="flex-1 overflow-hidden flex flex-col bg-black min-h-0">
      <ScrollArea
        className="flex-1 min-h-0"
        ref={messagesContainerRef}
      >
        <div className="px-4 py-4" dir={language === "ar" ? "rtl" : "ltr"}>
          {loadingMessages && page === 1 ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-5 w-5 animate-spin text-yellow-400" />
            </div>
          ) : (
            <div className="space-y-2 pb-6">
              {hasMore && onLoadMore && (
                <div className="flex justify-center py-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs border-gray-600 text-gray-300 hover:bg-gray-800"
                    onClick={onLoadMore}
                    disabled={loadingMessages}
                  >
                    {loadingMessages && page > 1 ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    ) : (
                      <ChevronUp className="h-3.5 w-3.5 mr-1.5" />
                    )}
                    {language === "en" ? "Load older messages" : "تحميل رسائل أقدم"}
                  </Button>
                </div>
              )}
              {messages.length === 0 ? (
                <div className="flex items-center justify-center py-12 text-gray-400">
                  {language === 'en' ? 'No messages yet' : 'لا توجد رسائل بعد'}
                </div>
              ) : (
                messages.map((msg, idx) => {
                  // Determine if message is from admin
                  const senderObj = typeof msg.sender === 'object' ? msg.sender : null;
                  const senderRole = msg.senderRole || senderObj?.role || (senderObj as any)?.role;
                  // Check if sender is admin - also check if sender name contains admin or if it's a system message
                  const isAdmin = senderRole === 'admin' ||
                    (senderObj as any)?.role === 'admin' ||
                    msg.type === 'system' ||
                    (msg.senderName && typeof msg.senderName === 'string' && msg.senderName.toLowerCase().includes('admin'));
                  const isSystem = msg.type === 'system';

                  // Handle sender comparison (can be string or object)
                  const prevSender = idx > 0 ? (typeof messages[idx - 1].sender === 'object'
                    ? (messages[idx - 1].sender as any)?._id
                    : messages[idx - 1].sender) : null;
                  const currentSender = typeof msg.sender === 'object'
                    ? (msg.sender as any)?._id
                    : msg.sender;
                  const isSameSender = prevSender === currentSender;
                  const rawName = msg.senderName || (typeof msg.sender === 'object' ? (msg.sender as any)?.name : null) || '';
                  const isPlaceholderName = !rawName || typeof rawName !== 'string' || rawName.trim() === '' || rawName === 'اسم المستخدم';
                  const senderName = isAdmin && isPlaceholderName
                    ? (language === 'en' ? 'Admin' : 'الأدمن')
                    : isSystem
                      ? (language === 'en' ? 'System' : 'نظام')
                      : (rawName || (language === 'en' ? 'Unknown' : 'غير معروف'));
                  const senderAvatar = typeof senderName === 'string' ? senderName.charAt(0) : 'U';
                  const showAvatar = !isAdmin && !isSystem && !isSameSender;

                  return (
                    <MessageItem
                      key={msg._id}
                      msg={msg}
                      isAdmin={isAdmin}
                      isSystem={isSystem}
                      isSameSender={isSameSender}
                      showAvatar={showAvatar}
                      senderAvatar={senderAvatar}
                      senderDisplayName={senderName}
                      language={language}
                    />
                  );
                })
              )}
              <div ref={messagesEndRef} className="h-1" />
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

