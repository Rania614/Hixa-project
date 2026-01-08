import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2, Search } from "lucide-react";
import { ProjectRoom } from "@/services/messagesApi";

interface ProjectRoomsListProps {
  projectRooms: ProjectRoom[];
  selectedProjectRoom: ProjectRoom | null;
  loading: boolean;
  language: string;
  onSelectProjectRoom: (room: ProjectRoom) => void;
  formatTime: (dateString: string) => string;
}

export const ProjectRoomsList: React.FC<ProjectRoomsListProps> = ({
  projectRooms,
  selectedProjectRoom,
  loading,
  language,
  onSelectProjectRoom,
  formatTime,
}) => {
  return (
    <Card className="w-48 flex-shrink-0 flex flex-col overflow-hidden glass-card h-full">
      <CardHeader className="flex-shrink-0 pb-2 px-3 pt-3">
        <CardTitle className="text-sm font-semibold">
          {language === "en" ? "Projects" : "المشاريع"}
        </CardTitle>
        <div className="relative mt-2">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
          <Input
            placeholder={language === "en" ? "Search..." : "بحث..."}
            className="pl-7 h-7 text-xs"
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0 min-h-0">
        <ScrollArea className="h-full">
          <div className="p-2">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-4 w-4 animate-spin text-yellow-400/70" />
              </div>
            ) : projectRooms.length === 0 ? (
              <p className="text-xs text-muted-foreground/70 text-center py-8">
                {language === "en" ? "No projects" : "لا توجد مشاريع"}
              </p>
            ) : (
              projectRooms.map((room) => (
                <div
                  key={room._id}
                  onClick={() => onSelectProjectRoom(room)}
                  className={`p-1 rounded-md cursor-pointer transition-all mb-0.5 ${
                    selectedProjectRoom?._id === room._id
                      ? "bg-yellow-400/8 border-l-2 border-yellow-400/50"
                      : "hover:bg-muted/40"
                  }`}
                >
                  <p className="font-medium text-sm text-foreground/90 truncate leading-tight">
                    {room.projectTitle}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-0.5">
                    {formatTime(room.lastActivityAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

