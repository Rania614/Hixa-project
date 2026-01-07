import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Paperclip, Send, Loader2 } from "lucide-react";

interface MessageInputProps {
  message: string;
  setMessage: (value: string) => void;
  attachments: File[];
  sending: boolean;
  language: string;
  fileInputRef: React.RefObject<HTMLInputElement>;
  onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveAttachment: (index: number) => void;
  onSendMessage: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  message,
  setMessage,
  attachments,
  sending,
  language,
  fileInputRef,
  onFileSelect,
  onRemoveAttachment,
  onSendMessage,
}) => {
  return (
    <div className="flex-shrink-0 px-4 py-3 border-t border-gray-800 bg-gray-900/50">
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1.5">
          {attachments.map((file, idx) => {
            const fileSize = file.size > 1024 * 1024 
              ? `${(file.size / (1024 * 1024)).toFixed(2)} MB`
              : `${(file.size / 1024).toFixed(2)} KB`;
            const fileType = file.type || 'application/octet-stream';
            const isImage = fileType.startsWith('image/');
            const isPDF = fileType === 'application/pdf';
            const isDocument = fileType.includes('word') || fileType.includes('excel') || fileType.includes('powerpoint');
            
            return (
              <div
                key={idx}
                className="flex items-center gap-1.5 bg-gray-800 border border-gray-700 px-2 py-1.5 rounded-md text-xs shadow-sm"
              >
                {isImage && <span className="text-yellow-400">🖼️</span>}
                {isPDF && <span className="text-red-400">📄</span>}
                {isDocument && <span className="text-blue-400">📝</span>}
                {!isImage && !isPDF && !isDocument && <span className="text-gray-400">📎</span>}
                <div className="flex flex-col min-w-0 flex-1">
                  <span className="text-gray-200 font-medium truncate max-w-[150px]" title={file.name}>
                    {file.name}
                  </span>
                  <span className="text-[10px] text-gray-400">{fileSize}</span>
                </div>
                <button
                  onClick={() => onRemoveAttachment(idx)}
                  className="text-gray-400 hover:text-red-400 text-sm leading-none p-0.5 rounded hover:bg-red-500/10 transition-colors"
                  title={language === 'en' ? 'Remove file' : 'إزالة الملف'}
                >
                  ×
                </button>
              </div>
            );
          })}
        </div>
      )}
      <div className="flex gap-1.5 items-center">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
          className="hidden"
          onChange={onFileSelect}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="h-8 w-8 p-0 border border-gray-700 hover:bg-gray-800 hover:border-gray-600 text-gray-400 transition-colors"
          title={language === 'en' ? 'Attach file' : 'إرفاق ملف'}
        >
          <Paperclip className="h-4 w-4" />
        </Button>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={language === "en" ? "Type a message..." : "اكتب رسالة..."}
          className="flex-1 h-8 bg-gray-800 border-gray-700 text-gray-100 placeholder:text-gray-500 focus:border-yellow-400/50 text-sm"
          onKeyPress={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              onSendMessage();
            }
          }}
          disabled={sending}
        />
        <Button
          onClick={onSendMessage}
          disabled={sending || (!message.trim() && attachments.length === 0)}
          className="bg-yellow-400 hover:bg-yellow-500 text-black h-8 px-4 text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {sending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

