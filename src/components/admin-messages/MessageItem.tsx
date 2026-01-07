import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Message } from "@/services/messagesApi";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

interface MessageItemProps {
  msg: Message;
  isAdmin: boolean;
  isSystem: boolean;
  isSameSender: boolean;
  showAvatar: boolean;
  senderAvatar: string;
  language: string;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  msg,
  isAdmin,
  isSystem,
  isSameSender,
  showAvatar,
  senderAvatar,
  language,
}) => {
  const isRTL = language === "ar";
  const dateLocale = isRTL ? ar : enUS;

  // في واجهة الأدمن: isAdmin يعني "أنا" (المرسل)، وغير ذلك يعني "الطرف الآخر" (المستقبل)
  const isMe = isAdmin;

  if (isSystem) {
    return (
      <div className="flex justify-center my-4 w-full">
        <div className="bg-gray-800/40 text-gray-400 text-[11px] px-4 py-1 rounded-full border border-gray-700/50 italic">
          {msg.content}
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`flex w-full ${isSameSender ? 'mt-1' : 'mt-4'} ${isMe ? 'justify-end' : 'justify-start'}`}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className={`flex items-end max-w-[85%] md:max-w-[75%] gap-2`}>
        
        {/* أفاتار الطرف الآخر (يظهر فقط في رسائل العميل/المهندس) */}
        {!isMe && (
          <Avatar className={`w-8 h-8 mb-5 flex-shrink-0 transition-opacity ${showAvatar ? 'opacity-100' : 'opacity-0'}`}>
            <AvatarFallback className="bg-blue-600 text-white text-[10px] font-bold">
              {senderAvatar ? senderAvatar.toUpperCase() : 'U'}
            </AvatarFallback>
          </Avatar>
        )}

        <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
          {/* اسم المرسل - يظهر فقط عند أول رسالة في المجموعة */}
          {!isSameSender && !isMe && (
            <span className={`text-[10px] text-gray-500 mb-1 ${isRTL ? 'mr-2' : 'ml-2'}`}>
              {msg.senderName}
            </span>
          )}

          {/* فقاعة الرسالة */}
          <div
            className={`relative px-4 py-2.5 shadow-sm transition-all ${
              isMe
                ? `bg-yellow-400 text-black ${
                    isRTL ? 'rounded-2xl rounded-bl-none' : 'rounded-2xl rounded-br-none'
                  }`
                : `bg-gray-800 text-gray-100 ${
                    isRTL ? 'rounded-2xl rounded-br-none' : 'rounded-2xl rounded-bl-none'
                  }`
            }`}
          >
            {msg.content && (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words font-medium">
                {msg.content}
              </p>
            )}
            
            {/* المرفقات داخل الفقاعة */}
            {msg.attachments && msg.attachments.length > 0 && (
              <div className="space-y-2 mt-2 border-t border-black/5 pt-2">
                {msg.attachments.map((att, idx) => (
                   <FileAttachment key={idx} att={att} isMe={isMe} />
                ))}
              </div>
            )}
          </div>

          {/* وقت الرسالة */}
          <p className="text-[9px] text-gray-500 mt-1 px-1">
            {formatDistanceToNow(new Date(msg.createdAt), { 
              addSuffix: true,
              locale: dateLocale 
            })}
          </p>
        </div>

        {/* أفاتار الأدمن (أنت) - يظهر في جهة الإرسال */}
        {isMe && (
          <Avatar className={`w-8 h-8 mb-5 flex-shrink-0 transition-opacity ${!isSameSender ? 'opacity-100' : 'opacity-0'}`}>
            <AvatarFallback className="bg-amber-700 text-white text-[10px] font-bold">
              {typeof msg.senderName === 'string' ? msg.senderName.charAt(0).toUpperCase() : 'A'}
            </AvatarFallback>
          </Avatar>
        )}
      </div>
    </div>
  );
};

/**
 * مكون فرعي لعرض المرفقات بشكل أنيق
 */
const FileAttachment = ({ att, isMe }: { att: any, isMe: boolean }) => {
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(att.filename || '');
  
  return (
    <a
      href={att.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center gap-3 p-2 rounded-lg transition-colors group ${
        isMe 
          ? "bg-black/10 hover:bg-black/20 text-black" 
          : "bg-white/5 hover:bg-white/10 text-white"
      }`}
    >
      <div className="text-lg">
        {isImage ? '🖼️' : '📄'}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-bold truncate">{att.filename || 'File'}</p>
        {att.size && (
           <p className="text-[9px] opacity-60">
             {(att.size / (1024 * 1024)).toFixed(2)} MB
           </p>
        )}
      </div>
      <div className="opacity-40 group-hover:opacity-100 transition-opacity text-xs">
        ⬇️
      </div>
    </a>
  );
};