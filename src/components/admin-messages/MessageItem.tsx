import React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Message } from "@/services/messagesApi";
import { formatDistanceToNow } from "date-fns";

interface MessageItemProps {
  msg: Message;
  isAdmin: boolean;
  isSystem: boolean;
  isSameSender: boolean;
  showAvatar: boolean;
  senderAvatar: string;
  senderDisplayName?: string;
  language: string;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  msg,
  isAdmin,
  isSystem,
  isSameSender,
  showAvatar,
  senderAvatar,
  senderDisplayName,
  language,
}) => {
  const displayName = senderDisplayName || (typeof msg.sender === 'object' ? (msg.sender as any)?.name : null) || msg.senderName || (language === 'en' ? 'Unknown' : 'غير معروف');
  const avatarLetter = displayName && displayName !== 'اسم المستخدم' ? displayName.charAt(0) : senderAvatar;
  return (
    <div className={`${isSameSender ? 'mt-1' : 'mt-4'}`}>
      <div className={`flex items-end gap-2.5 ${isAdmin
          ? (language === "ar" ? "justify-start flex-row-reverse" : "justify-end")
          : (language === "ar" ? "justify-end flex-row-reverse" : "justify-start")
        }`}>
        {/* Avatar for received messages (left side in LTR, right side in RTL) */}
        {!isAdmin && !isSystem && (
          <Avatar className={`w-8 h-8 flex-shrink-0 ${showAvatar ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <AvatarFallback className="bg-blue-600 text-white text-xs font-semibold">
              {senderAvatar.toUpperCase()}
            </AvatarFallback>
          </Avatar>
        )}

        {/* Avatar for sent messages (right side in LTR, left side in RTL) - Admin */}
        {isAdmin && !isSystem && (
          <Avatar className={`w-8 h-8 flex-shrink-0 ${!isSameSender ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <AvatarFallback className="bg-amber-700 text-white text-xs font-semibold">
              {avatarLetter ? String(avatarLetter).toUpperCase() : 'A'}
            </AvatarFallback>
          </Avatar>
        )}

        <div className={`flex flex-col gap-1 ${isAdmin
            ? (language === "ar" ? "items-start" : "items-end")
            : (language === "ar" ? "items-end" : "items-start")
          } max-w-[75%] md:max-w-[70%]`}>
          {/* Message bubble */}
          <div
            className={`rounded-2xl px-4 py-2.5 ${isAdmin
                ? language === "ar"
                  ? "bg-yellow-400 text-black rounded-bl-sm"
                  : "bg-yellow-400 text-black rounded-br-sm"
                : isSystem
                  ? "bg-gray-800/50 text-gray-300 text-center mx-auto rounded-lg"
                  : language === "ar"
                    ? "bg-gray-800/80 text-gray-100 rounded-br-sm"
                    : "bg-gray-800/80 text-gray-100 rounded-bl-sm"
              }`}
          >
            {msg.content && (
              <p
                className={`text-sm leading-relaxed whitespace-pre-wrap break-words ${isAdmin
                    ? "text-black font-medium"
                    : isSystem
                      ? "text-gray-300 italic"
                      : "text-gray-100"
                  }`}
              >
                {msg.content}
              </p>
            )}

            {msg.attachments && msg.attachments.length > 0 && (
              <div className="space-y-1.5 mb-2 mt-2">
                {msg.attachments.map((att, attIdx) => {
                  const isImage = att.type === 'image' || /\.(jpg|jpeg|png|gif|webp)$/i.test(att.filename || '');
                  const isPDF = /\.pdf$/i.test(att.filename || '');
                  const isDocument = /\.(doc|docx|xls|xlsx|ppt|pptx)$/i.test(att.filename || '');
                  const fileSize = att.size ? (att.size > 1024 * 1024
                    ? `${(att.size / (1024 * 1024)).toFixed(2)} MB`
                    : `${(att.size / 1024).toFixed(2)} KB`) : '';

                  return (
                    <a
                      key={attIdx}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex items-center gap-2 p-2.5 rounded-lg hover:opacity-80 transition-all group ${isAdmin
                          ? "bg-yellow-300/30 border border-yellow-400/40"
                          : "bg-gray-700/50 border border-gray-600/50"
                        }`}
                    >
                      {isImage && <span className="text-lg">🖼️</span>}
                      {isPDF && <span className="text-lg">📄</span>}
                      {isDocument && <span className="text-lg">📝</span>}
                      {!isImage && !isPDF && !isDocument && <span className="text-lg">📎</span>}
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium truncate ${isAdmin ? "text-black/90" : "text-gray-200"
                          }`}>
                          {att.filename || 'File'}
                        </p>
                        {fileSize && (
                          <p className={`text-[10px] opacity-70 ${isAdmin ? "text-black/70" : "text-gray-300/70"
                            }`}>{fileSize}</p>
                        )}
                      </div>
                      <span className={`text-xs opacity-60 ${isAdmin ? "text-black/70" : "text-gray-300"
                        }`}>⬇️</span>
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          {/* Timestamp - below message */}
          <p className={`text-[10px] text-gray-400/70 px-1 ${isAdmin
              ? (language === "ar" ? "text-left" : "text-right")
              : (language === "ar" ? "text-right" : "text-left")
            }`}>
            {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
          </p>
        </div>
      </div>
    </div>
  );
};
