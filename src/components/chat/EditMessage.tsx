import React, { useState } from 'react';
import { Message } from '@/services/messagesApi';
import { messagesApi } from '@/services/messagesApi';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EditMessageProps {
  message: Message;
  currentUserId: string;
  onUpdate: (updatedMessage: Message) => void;
  onCancel: () => void;
}

/**
 * EditMessage Component
 * 
 * Allows users to edit their own messages
 * - Only the sender can edit
 * - Max 5000 characters
 * - Shows loading state
 * - Handles errors
 */
export const EditMessage: React.FC<EditMessageProps> = ({
  message,
  currentUserId,
  onUpdate,
  onCancel,
}) => {
  const [content, setContent] = useState(message.content);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if user is the sender
  const senderId = typeof message.sender === 'string' 
    ? message.sender 
    : message.sender._id;
  const canEdit = senderId === currentUserId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!canEdit) {
      setError('غير مسموح لك بتعديل هذه الرسالة');
      return;
    }

    if (content.trim() === message.content.trim()) {
      onCancel(); // No changes
      return;
    }

    if (content.trim().length === 0) {
      setError('لا يمكن ترك الرسالة فارغة');
      return;
    }

    if (content.length > 5000) {
      setError('الرسالة طويلة جداً (الحد الأقصى: 5000 حرف)');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updatedMessage = await messagesApi.updateMessage(message._id, content.trim());
      onUpdate(updatedMessage);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'فشل في تحديث الرسالة';
      setError(errorMessage);
      console.error('Error updating message:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!canEdit) {
    return null;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <Textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        maxLength={5000}
        rows={3}
        disabled={loading}
        className="resize-none"
        placeholder="عدّل الرسالة..."
      />
      
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {content.length}/5000
        </span>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onCancel}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-1" />
            إلغاء
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={loading || !content.trim() || content.trim() === message.content.trim()}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              'حفظ'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

