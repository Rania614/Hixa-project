import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, X, UserCheck, Briefcase, User } from "lucide-react";
import { ChatRoom, ProjectRoom } from "@/services/messagesApi";

interface ChatHeaderProps {
  selectedChatRoom: ChatRoom | null;
  selectedProjectRoom: ProjectRoom | null;
  language: string;
  startingChat: boolean;
  assigning: boolean;
  onStartChat: () => void;
  onReject: () => void;
  onAssign: () => void;
  getChatRoomTitle: (room: ChatRoom) => string;
  getChatRoomSubtitle: (room: ChatRoom) => string;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  selectedChatRoom,
  selectedProjectRoom,
  language,
  startingChat,
  assigning,
  onStartChat,
  onReject,
  onAssign,
  getChatRoomTitle,
  getChatRoomSubtitle,
}) => {
  if (!selectedChatRoom) return null;

  return (
    <div className="flex-shrink-0 border-b border-gray-800 bg-gray-900/50 px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left Side - Action Buttons */}
        <div className="flex gap-2">
          {/* Start Chat Button - Show if chat hasn't started yet */}
          {!selectedChatRoom.adminStartedChat && selectedChatRoom.type !== 'group' && (
            <Button
              onClick={onStartChat}
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
              <Button
                onClick={onReject}
                className="bg-red-500 hover:bg-red-600 text-white h-7 px-3 text-xs font-medium rounded"
                size="sm"
              >
                <X className="h-3.5 w-3.5 mr-1.5" />
                {language === 'en' ? 'Reject' : 'رفض'}
              </Button>
              <Button
                onClick={onAssign}
                disabled={assigning}
                className="bg-yellow-400 hover:bg-yellow-500 text-black h-7 px-3 text-xs font-medium rounded"
                size="sm"
              >
                {assigning ? (
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                ) : (
                  <UserCheck className="h-3.5 w-3.5 mr-1.5" />
                )}
                {language === 'en' ? 'Assign' : 'تعيين'}
              </Button>
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
  );
};

