import React from "react";
import { MessageSquare } from "lucide-react";

interface ObserverBannerProps {
  language: string;
}

export const ObserverBanner: React.FC<ObserverBannerProps> = ({ language }) => {
  return (
    <div className="flex-shrink-0 bg-blue-500/10 border-b border-blue-500/20 px-4 py-2.5">
      <div className="flex items-center gap-2 text-blue-400 text-xs">
        <MessageSquare className="h-3.5 w-3.5 flex-shrink-0" />
        <span>
          {language === 'en' 
            ? 'This chat is monitored by admin to ensure both parties\' rights' 
            : 'يتم رؤية محتوى هذه الدردشة من قبل الإدارة لضمان حقوق الطرفين'}
        </span>
      </div>
    </div>
  );
};

