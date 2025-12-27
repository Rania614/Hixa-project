import React, { useState } from 'react';
import { Message } from '@/services/messagesApi';
import { ReactionButton } from './ReactionButton';
import { Button } from '@/components/ui/button';
import { Smile, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ReactionPickerProps {
  message: Message;
  currentUserId: string;
  onReactionToggle: (updatedMessage: Message) => void;
}

const COMMON_EMOJIS = ['👍', '❤️', '😊', '🎉', '🔥', '👏', '💯', '😮', '😂', '😢'];

/**
 * ReactionPicker Component
 * 
 * Provides UI for adding/removing reactions on messages
 * - Shows common emojis in a popover
 * - Displays existing reactions
 * - Allows toggling reactions
 */
export const ReactionPicker: React.FC<ReactionPickerProps> = ({
  message,
  currentUserId,
  onReactionToggle,
}) => {
  const [open, setOpen] = useState(false);

  // Get unique emojis from existing reactions
  const existingEmojis = new Set(
    message.reactions?.map((r) => r.emoji) || []
  );

  // Combine common emojis with existing ones
  const allEmojis = Array.from(new Set([...COMMON_EMOJIS, ...existingEmojis]));

  return (
    <div className="flex items-center gap-1">
      {/* Existing Reactions */}
      {message.reactions && message.reactions.length > 0 && (
        <div className="flex items-center gap-1 flex-wrap">
          {Array.from(existingEmojis).map((emoji) => (
            <ReactionButton
              key={emoji}
              message={message}
              emoji={emoji}
              currentUserId={currentUserId}
              onReactionToggle={(updated) => {
                onReactionToggle(updated);
                setOpen(false);
              }}
            />
          ))}
        </div>
      )}

      {/* Reaction Picker Popover */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="إضافة تفاعل"
          >
            <Smile className="h-4 w-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex flex-wrap gap-1">
            {allEmojis.map((emoji) => (
              <ReactionButton
                key={emoji}
                message={message}
                emoji={emoji}
                currentUserId={currentUserId}
                onReactionToggle={(updated) => {
                  onReactionToggle(updated);
                  // Keep popover open for multiple reactions
                }}
              />
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

