import React, { useState } from 'react';
import { Message } from '@/services/messagesApi';
import { messagesApi } from '@/services/messagesApi';
import { Button } from '@/components/ui/button';
import { Trash2, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DeleteMessageButtonProps {
  message: Message;
  currentUserId: string;
  onDelete: (messageId: string) => void;
}

/**
 * DeleteMessageButton Component
 * 
 * Allows users to delete their own messages
 * - Only the sender can delete
 * - Shows confirmation dialog
 * - Handles errors
 */
export const DeleteMessageButton: React.FC<DeleteMessageButtonProps> = ({
  message,
  currentUserId,
  onDelete,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is the sender
  const senderId = typeof message.sender === 'string' 
    ? message.sender 
    : message.sender._id;
  const canDelete = senderId === currentUserId;

  const handleDelete = async () => {
    setLoading(true);
    setError(null);

    try {
      await messagesApi.deleteMessage(message._id);
      onDelete(message._id);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'فشل في حذف الرسالة';
      setError(errorMessage);
      console.error('Error deleting message:', err);
      setLoading(false);
    }
  };

  if (!canDelete) {
    return null;
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          title="حذف الرسالة"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>حذف الرسالة</AlertDialogTitle>
          <AlertDialogDescription>
            هل أنت متأكد من حذف هذه الرسالة؟ لا يمكن التراجع عن هذا الإجراء.
          </AlertDialogDescription>
        </AlertDialogHeader>
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>إلغاء</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                جاري الحذف...
              </>
            ) : (
              'حذف'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

