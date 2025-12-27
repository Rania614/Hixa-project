import React, { useState } from 'react';
import { Message } from '@/services/messagesApi';
import { messagesApi } from '@/services/messagesApi';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface ReactionButtonProps {
  message: Message;
  emoji: string;
  currentUserId: string;
  onReactionToggle: (updatedMessage: Message) => void;
}

/**
 * ReactionButton Component
 * 
 * Toggle reaction on a message
 * - Shows emoji and count
 * - Highlights if user has reacted
 * - Handles loading state
 */
export const ReactionButton: React.FC<ReactionButtonProps> = ({
  message,
  emoji,
  currentUserId,
  onReactionToggle,
}) => {
  const [loading, setLoading] = useState(false);

  // Check if current user has this reaction
  const hasReaction = message.reactions?.some(
    (r) => {
      const userId = typeof r.user === 'string' ? r.user : r.user._id;
      return userId === currentUserId && r.emoji === emoji;
    }
  ) || false;

  // Count of users who used this emoji
  const reactionCount = message.reactions?.filter((r) => r.emoji === emoji).length || 0;

  const handleToggle = async () => {
    setLoading(true);

    try {
      const updatedMessage = await messagesApi.toggleReaction(message._id, emoji);
      onReactionToggle(updatedMessage);
    } catch (error) {
      console.error('Error toggling reaction:', error);
      // Error is handled silently - user can try again
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleToggle}
      disabled={loading}
      variant={hasReaction ? 'default' : 'outline'}
      size="sm"
      className={`h-8 px-2 ${hasReaction ? 'bg-primary' : ''}`}
      title={hasReaction ? 'إزالة التفاعل' : 'إضافة تفاعل'}
    >
      {loading ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : (
        <>
          <span className="text-sm">{emoji}</span>
          {reactionCount > 0 && (
            <span className="ml-1 text-xs">{reactionCount}</span>
          )}
        </>
      )}
    </Button>
  );
};

