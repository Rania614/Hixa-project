import React, { useState, useEffect, useRef } from 'react';
import { messagesApi, Message } from '@/services/messagesApi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, X } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { format } from 'date-fns';

interface SearchMessagesProps {
  chatRoomId: string;
  onMessageClick: (message: Message) => void;
}

/**
 * SearchMessages Component
 * 
 * Search functionality for messages in a chat room
 * - Debounced search input
 * - Shows search results
 * - Click to navigate to message
 */
export const SearchMessages: React.FC<SearchMessagesProps> = ({
  chatRoomId,
  onMessageClick,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [meta, setMeta] = useState<{
    total: number;
    page: number;
    limit: number;
    pages: number;
  } | null>(null);
  
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim() || !chatRoomId) {
      setResults([]);
      setMeta(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await messagesApi.searchMessages(
        chatRoomId,
        searchQuery.trim(),
        1,
        20
      );
      setResults(result.data || []);
      setMeta(result.meta);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'فشل في البحث';
      setError(errorMessage);
      setResults([]);
      setMeta(null);
      console.error('Error searching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  // Debounce search
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (query.trim()) {
      debounceTimerRef.current = setTimeout(() => {
        handleSearch(query);
      }, 500); // Wait 500ms after user stops typing
    } else {
      setResults([]);
      setMeta(null);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [query, chatRoomId]);

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setMeta(null);
    setError(null);
  };

  const getSenderName = (message: Message): string => {
    if (typeof message.sender === 'string') {
      return message.senderName || 'Unknown';
    }
    return message.sender.name || 'Unknown';
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder="بحث في الرسائل..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9 pr-9"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
            onClick={clearSearch}
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center p-4">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          <span className="text-sm text-muted-foreground">جاري البحث...</span>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {meta && (
            <div className="text-xs text-muted-foreground px-2">
              تم العثور على {meta.total} رسالة
            </div>
          )}
          <ScrollArea className="h-[300px]">
            <div className="space-y-2 p-2">
              {results.map((message) => (
                <div
                  key={message._id}
                  onClick={() => onMessageClick(message)}
                  className="p-3 rounded-lg border cursor-pointer hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold">
                      {getSenderName(message)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(message.createdAt), 'dd/MM/yyyy HH:mm')}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground line-clamp-2">
                    {message.content}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {query.trim() && !loading && results.length === 0 && !error && (
        <div className="text-center text-sm text-muted-foreground p-4">
          لا توجد نتائج
        </div>
      )}
    </div>
  );
};

