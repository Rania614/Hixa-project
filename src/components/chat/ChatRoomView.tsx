import { useState, useEffect, useRef } from 'react';
import { ChatRoom, Message } from '@/services/messagesApi';
import { useChat } from '@/hooks/useChat';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, ArrowLeft, Send, Loader2, Edit2, Search } from 'lucide-react';
import { format } from 'date-fns';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { EditMessage } from './EditMessage';
import { DeleteMessageButton } from './DeleteMessageButton';
import { ReactionPicker } from './ReactionPicker';
import { SearchMessages } from './SearchMessages';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

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
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const hasScrolledToBottomRef = useRef(true);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());

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

  // Get current user ID from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUserId(user._id || user.id || null);
      } catch (e) {
        console.error('Error parsing user from localStorage:', e);
      }
    }
  }, []);

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
   * Handle message update (after edit)
   */
  const handleUpdateMessage = (updatedMessage: Message) => {
    refetch(); // Refetch messages to get updated data
    setEditingMessageId(null);
  };

  /**
   * Handle message delete
   */
  const handleDeleteMessage = (messageId: string) => {
    refetch(); // Refetch messages to remove deleted message
  };

  /**
   * Handle reaction toggle
   */
  const handleReactionToggle = (updatedMessage: Message) => {
    refetch(); // Refetch messages to get updated reactions
  };

  /**
   * Handle search message click - scroll to message
   */
  const handleSearchMessageClick = (message: Message) => {
    setShowSearch(false);
    // Scroll to message
    const messageElement = messageRefs.current.get(message._id);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight message briefly
      messageElement.classList.add('ring-2', 'ring-primary');
      setTimeout(() => {
        messageElement.classList.remove('ring-2', 'ring-primary');
      }, 2000);
    }
  };

  /**
   * Get sender name from message
   */
  const getSenderName = (message: Message): string => {
    if (typeof message.sender === 'string') {
      return message.senderName || 'Unknown';
    }
    return message.sender.name || 'Unknown';
  };

  /**
   * Get sender avatar from message
   */
  const getSenderAvatar = (message: Message): string | undefined => {
    if (typeof message.sender === 'string') {
      return undefined;
    }
    return message.sender.avatar?.url;
  };

  /**
   * Check if message is from current user
   */
  const isOwnMessage = (message: Message): boolean => {
    if (!currentUserId) return false;
    const senderId = typeof message.sender === 'string' 
      ? message.sender 
      : message.sender._id;
    return senderId === currentUserId;
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
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSearch(true)}
              title="بحث في الرسائل"
            >
              <Search className="h-4 w-4" />
            </Button>
            <div className="text-sm text-muted-foreground">
              {chatRoom.participants.length} participant{chatRoom.participants.length !== 1 ? 's' : ''}
            </div>
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
              {messages
                .filter((message) => !message.isDeleted) // Filter out deleted messages
                .map((message) => {
                  const isOwn = isOwnMessage(message);
                  const isEditing = editingMessageId === message._id;

                  return (
                    <div
                      key={message._id}
                      ref={(el) => {
                        if (el) {
                          messageRefs.current.set(message._id, el);
                        } else {
                          messageRefs.current.delete(message._id);
                        }
                      }}
                      className={`flex gap-3 items-start ${isOwn ? 'flex-row-reverse' : ''}`}
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={getSenderAvatar(message)} 
                          alt={getSenderName(message)} 
                        />
                        <AvatarFallback>
                          {getSenderName(message)?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <div className={`flex-1 space-y-1 ${isOwn ? 'items-end' : ''}`}>
                        <div className={`flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : ''}`}>
                          <span className="font-semibold text-sm">
                            {getSenderName(message)}
                          </span>
                          {message.senderRole && (
                            <span className="text-xs text-muted-foreground">
                              ({message.senderRole})
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(message.createdAt), 'HH:mm')}
                          </span>
                          {message.isEdited && (
                            <span className="text-xs text-muted-foreground italic">
                              (تم التعديل)
                            </span>
                          )}
                        </div>

                        {isEditing && currentUserId ? (
                          <EditMessage
                            message={message}
                            currentUserId={currentUserId}
                            onUpdate={handleUpdateMessage}
                            onCancel={() => setEditingMessageId(null)}
                          />
                        ) : (
                          <>
                            <div className={`text-sm rounded-lg p-3 ${
                              isOwn 
                                ? 'bg-primary text-primary-foreground' 
                                : 'bg-muted'
                            }`}>
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

                            {/* Reactions */}
                            {message.reactions && message.reactions.length > 0 && (
                              <div className="flex items-center gap-1 flex-wrap mt-2">
                                {Array.from(
                                  new Set(message.reactions.map((r) => r.emoji))
                                ).map((emoji) => {
                                  const usersWithEmoji = message.reactions!.filter(
                                    (r) => r.emoji === emoji
                                  );
                                  return (
                                    <div
                                      key={emoji}
                                      className="flex items-center gap-1 px-2 py-1 rounded-md bg-muted text-xs"
                                      title={usersWithEmoji
                                        .map((r) => 
                                          typeof r.user === 'string' 
                                            ? r.user 
                                            : r.user.name
                                        )
                                        .join(', ')}
                                    >
                                      <span>{emoji}</span>
                                      <span>{usersWithEmoji.length}</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Message Actions */}
                            {currentUserId && (
                              <div className="flex items-center gap-1 mt-2">
                                {isOwn && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => setEditingMessageId(message._id)}
                                      title="تعديل الرسالة"
                                    >
                                      <Edit2 className="h-3 w-3" />
                                    </Button>
                                    <DeleteMessageButton
                                      message={message}
                                      currentUserId={currentUserId}
                                      onDelete={handleDeleteMessage}
                                    />
                                  </>
                                )}
                                <ReactionPicker
                                  message={message}
                                  currentUserId={currentUserId}
                                  onReactionToggle={handleReactionToggle}
                                />
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
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
            placeholder="اكتب رسالة..."
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

      {/* Search Dialog */}
      <Dialog open={showSearch} onOpenChange={setShowSearch}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>بحث في الرسائل</DialogTitle>
          </DialogHeader>
          <SearchMessages
            chatRoomId={chatRoom._id}
            onMessageClick={handleSearchMessageClick}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

