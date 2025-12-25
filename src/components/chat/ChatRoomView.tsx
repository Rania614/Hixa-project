import { useState, useEffect, useRef } from 'react';
import { ChatRoom } from '@/services/messagesApi';
import { useChat } from '@/hooks/useChat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ChatRoomViewProps {
  chatRoom: ChatRoom;
  onBack: () => void;
}

/**
 * ChatRoomView Component
 * 
 * Features:
 * - Displays messages (oldest to newest)
 * - Real-time message updates via Socket.io
 * - Send messages via REST API
 * - Typing indicators
 * - Pagination support
 * - Auto-scroll to bottom
 * 
 * Endpoints:
 * - GET /api/messages/room/:chatRoomId (paginated)
 * - POST /api/messages
 * 
 * Socket Events:
 * - join_room, leave_room
 * - new_message
 * - typing, user_typing
 */
export const ChatRoomView = ({ chatRoom, onBack }: ChatRoomViewProps) => {
  const [messageContent, setMessageContent] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const hasScrolledToBottomRef = useRef(true);

  const {
    messages,
    loading,
    error,
    sending,
    typingUsers,
    hasMore,
    sendMessage,
    loadMore,
    emitTyping,
    refetch,
  } = useChat({ chatRoomId: chatRoom._id, enabled: true });

  /**
   * Scroll to bottom of messages
   */
  const scrollToBottom = (smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
    }
  };

  /**
   * Handle scroll position to detect if user is at bottom
   */
  const handleScroll = () => {
    if (!scrollAreaRef.current) return;
    
    const element = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
    if (!element) return;

    const { scrollTop, scrollHeight, clientHeight } = element;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 100; // 100px threshold
    hasScrolledToBottomRef.current = isAtBottom;
  };

  /**
   * Auto-scroll to bottom when new messages arrive (if user is already at bottom)
   */
  useEffect(() => {
    if (hasScrolledToBottomRef.current && messages.length > 0) {
      // Small delay to ensure DOM is updated
      setTimeout(() => scrollToBottom(true), 100);
    }
  }, [messages.length]);

  /**
   * Handle typing indicator
   */
  const handleInputChange = (value: string) => {
    setMessageContent(value);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Emit typing start
    if (!isTyping && value.trim().length > 0) {
      setIsTyping(true);
      emitTyping(true);
    }

    // Emit typing stop after 1 second of no typing
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping) {
        setIsTyping(false);
        emitTyping(false);
      }
    }, 1000);
  };

  /**
   * Handle send message
   */
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageContent.trim() || sending) return;

    const content = messageContent.trim();
    setMessageContent('');
    
    // Stop typing indicator
    if (isTyping) {
      setIsTyping(false);
      emitTyping(false);
    }
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }

    try {
      await sendMessage(content, 'text');
      // Message will be added via Socket.io event
      // Scroll to bottom after sending
      setTimeout(() => scrollToBottom(true), 200);
    } catch (err) {
      // Error is handled by useChat hook
      console.error('Failed to send message:', err);
    }
  };

  /**
   * Cleanup typing indicator on unmount
   */
  useEffect(() => {
    return () => {
      if (isTyping) {
        emitTyping(false);
      }
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <CardTitle>
              {chatRoom.type.replace('-', ' ').toUpperCase()} Chat
            </CardTitle>
          </div>
          <div className="text-sm text-muted-foreground">
            {chatRoom.participants.length} participant{chatRoom.participants.length !== 1 ? 's' : ''}
          </div>
        </div>
      </CardHeader>

      {/* Messages Area */}
      <CardContent className="flex-1 p-0 overflow-hidden">
        {loading && messages.length === 0 ? (
          <div className="p-4 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-16 w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={refetch} className="mt-4" variant="outline">
              Retry
            </Button>
          </div>
        ) : (
          <ScrollArea 
            className="h-full p-4"
            ref={scrollAreaRef}
            onScrollCapture={handleScroll}
          >
            {/* Load More Button */}
            {hasMore && (
              <div className="flex justify-center mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load Older Messages'
                  )}
                </Button>
              </div>
            )}

            {/* Messages List */}
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className="flex gap-3 items-start"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>
                      {message.senderName?.[0]?.toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">
                        {message.senderName || 'Unknown User'}
                      </span>
                      {message.senderRole && (
                        <span className="text-xs text-muted-foreground">
                          ({message.senderRole})
                        </span>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(message.createdAt), 'HH:mm')}
                      </span>
                    </div>
                    <div className="text-sm bg-muted rounded-lg p-3">
                      {message.content}
                    </div>
                    {message.attachments && message.attachments.length > 0 && (
                      <div className="space-y-2 mt-2">
                        {message.attachments.map((attachment, idx) => (
                          <a
                            key={idx}
                            href={attachment.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-primary hover:underline"
                          >
                            📎 {attachment.filename}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Typing Indicators */}
            {typingUsers.length > 0 && (
              <div className="mt-4 flex gap-2 items-center text-sm text-muted-foreground">
                <span>
                  {typingUsers.map(u => u.userName || 'Someone').join(', ')}
                  {typingUsers.length === 1 ? ' is' : ' are'} typing...
                </span>
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            {/* Scroll anchor */}
            <div ref={messagesEndRef} />
          </ScrollArea>
        )}
      </CardContent>

      {/* Message Input */}
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={messageContent}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Type a message..."
            disabled={sending || loading}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage(e);
              }
            }}
          />
          <Button type="submit" disabled={!messageContent.trim() || sending}>
            {sending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
};

