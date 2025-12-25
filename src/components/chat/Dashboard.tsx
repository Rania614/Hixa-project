import { useState, useEffect } from 'react';
import { messagesApi, ProjectRoom } from '@/services/messagesApi';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, MessageSquare } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface DashboardProps {
  onSelectProjectRoom: (projectRoom: ProjectRoom) => void;
}

/**
 * Dashboard Component
 * 
 * Displays all ProjectRooms with:
 * - projectTitle
 * - lastActivityAt
 * 
 * Endpoint: GET /api/project-rooms
 */
export const Dashboard = ({ onSelectProjectRoom }: DashboardProps) => {
  const [projectRooms, setProjectRooms] = useState<ProjectRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProjectRooms = async () => {
      try {
        setLoading(true);
        setError(null);
        const rooms = await messagesApi.getProjectRooms();
        setProjectRooms(rooms);
      } catch (err: any) {
        setError(err.response?.data?.message || err.message || 'Failed to fetch project rooms');
        console.error('Error fetching project rooms:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProjectRooms();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32 mt-2" />
            </CardHeader>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (projectRooms.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <MessageSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground">No project rooms found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Project Rooms</h2>
      {projectRooms.map((room) => (
        <Card
          key={room._id}
          className="cursor-pointer hover:bg-accent transition-colors"
          onClick={() => onSelectProjectRoom(room)}
        >
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>{room.projectTitle}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                room.status === 'active' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
              }`}>
                {room.status}
              </span>
            </CardTitle>
            <CardDescription>
              Last activity: {room.lastActivityAt 
                ? formatDistanceToNow(new Date(room.lastActivityAt), { addSuffix: true })
                : 'Never'}
            </CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
};

