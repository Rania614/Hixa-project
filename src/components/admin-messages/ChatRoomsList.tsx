import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search } from "lucide-react";
import { ChatRoom, ProjectRoom } from "@/services/messagesApi";

interface ChatRoomsListProps {
  chatRooms: ChatRoom[];
  selectedChatRoom: ChatRoom | null;
  selectedProjectRoom: ProjectRoom | null;
  viewMode: 'all' | 'project';
  filter: 'all' | 'client' | 'engineer';
  searchTerm: string;
  language: string;
  onSelectChatRoom: (room: ChatRoom) => void;
  onFilterChange: (filter: 'all' | 'client' | 'engineer') => void;
  onSearchChange: (term: string) => void;
  getChatRoomTitle: (room: ChatRoom) => string;
  getChatRoomSubtitle: (room: ChatRoom) => string;
  getChatRoomTypeBadge: (room: ChatRoom) => { label: string; className: string } | null;
  getChatRoomIcon: (room: ChatRoom) => React.ComponentType<{ className?: string }>;
  getChatRoomStatus: (room: ChatRoom) => { label: string; className: string };
  getProjectTitle: (room: ChatRoom) => string;
  getUnreadCount: (room: ChatRoom) => number;
  formatTime: (dateString: string) => string;
}

export const ChatRoomsList: React.FC<ChatRoomsListProps> = ({
  chatRooms,
  selectedChatRoom,
  selectedProjectRoom,
  viewMode,
  filter,
  searchTerm,
  language,
  onSelectChatRoom,
  onFilterChange,
  onSearchChange,
  getChatRoomTitle,
  getChatRoomSubtitle,
  getChatRoomTypeBadge,
  getChatRoomIcon,
  getChatRoomStatus,
  getProjectTitle,
  getUnreadCount,
  formatTime,
}) => {
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
    <Card className="w-56 flex-shrink-0 flex flex-col overflow-hidden glass-card h-full">
      <CardHeader className="flex-shrink-0 pb-2 px-3 pt-3">
        <div className="flex items-center justify-between mb-2">
          <CardTitle className="text-sm font-semibold truncate">
            {viewMode === 'all' 
              ? (language === "en" ? "All Chats" : "جميع المحادثات")
              : (selectedProjectRoom ? selectedProjectRoom.projectTitle : (language === "en" ? "Chats" : "المحادثات"))}
          </CardTitle>
          <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
            {filteredChatRooms.length}
          </Badge>
        </div>
        {/* Filter Buttons */}
        <div className="flex gap-1 mb-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange('all')}
            className="h-6 text-[10px] px-2 flex-1"
          >
            {language === "en" ? "All" : "الكل"}
          </Button>
          <Button
            variant={filter === 'client' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange('client')}
            className="h-6 text-[10px] px-2 flex-1"
          >
            {language === "en" ? "Clients" : "العملاء"}
          </Button>
          <Button
            variant={filter === 'engineer' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange('engineer')}
            className="h-6 text-[10px] px-2 flex-1"
          >
            {language === "en" ? "Engineers" : "المهندسين"}
          </Button>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder={language === "en" ? "Search chats..." : "البحث..."}
            className="pl-7 h-7 text-xs"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-2">
            {viewMode === 'project' && !selectedProjectRoom ? (
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
                      onClick={() => onSelectChatRoom(room)}
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
                        {viewMode === 'all' && (
                          <p className="text-xs text-muted-foreground/50 mb-0.5 truncate">
                            {getProjectTitle(room)}
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
  );
};

