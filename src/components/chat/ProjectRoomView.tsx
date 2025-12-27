import { useState, useEffect } from 'react';
import { messagesApi, ChatRoom, ProjectRoom } from '@/services/messagesApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, MessageSquare, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ProjectRoomViewProps {
  projectRoom: ProjectRoom;
  onBack: () => void;
  onSelectChatRoom: (chatRoom: ChatRoom) => void;
}

/**
 * ProjectRoomView Component
 * 
 * Displays all ChatRooms for a selected ProjectRoom with:
 * - lastMessage
 * - participants
 * 
 * Endpoint: GET /api/chat-rooms/project-room/:projectRoomId
 */
export const ProjectRoomView = ({ projectRoom, onBack, onSelectChatRoom }: ProjectRoomViewProps) => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChatRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        const rooms = await messagesApi.getChatRooms(projectRoom._id);
        setChatRooms(rooms);
        
        // 404 is expected when chat rooms don't exist yet - not an error
        if (rooms.length === 0) {
          // Silently handle empty result - this is normal for new projects
        }
      } catch (err: any) {
        // Only show error for non-404 errors
        if (err.response?.status !== 404) {
          setError(err.response?.data?.message || err.message || 'Failed to fetch chat rooms');
          console.error('Error fetching chat rooms:', err);
        } else {
          // 404 is expected - set empty array
          setChatRooms([]);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchChatRooms();
  }, [projectRoom._id]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4 mb-4">
          <Skeleton className="h-10 w-24" />
          <Skeleton className="h-8 flex-1" />
        </div>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64 mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold">{projectRoom.projectTitle}</h2>
      </div>

      {chatRooms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No chat rooms found in this project</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {chatRooms.map((room) => (
            <Card
              key={room._id}
              className="cursor-pointer hover:bg-accent transition-colors"
              onClick={() => onSelectChatRoom(room)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    {room.type.replace('-', ' ').toUpperCase()}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    room.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                  }`}>
                    {room.status}
                  </span>
                </CardTitle>
                <CardDescription className="space-y-1">
                  {room.lastMessage && (
                    <div>
                      <p className="truncate">
                        <span className="font-medium">Last message: </span>
                        {room.lastMessage.content}
                      </p>
                      <p className="text-xs">
                        {formatDistanceToNow(new Date(room.lastMessage.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Users className="h-3 w-3" />
                    <span className="text-xs">
                      {room.participants.length} participant{room.participants.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

