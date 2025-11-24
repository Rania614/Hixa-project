import { useState, useRef, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HexagonIcon } from '@/components/ui/hexagon-icon';
import { Send, MessageCircle, X, Bot, User } from 'lucide-react';
// Import the FAQ knowledge base
import faqData from '@/data/faq-knowledge-base.json';
// Using direct path to public images directory
const roboticIcon = '/images/robotic.png';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}
export const Chatbot = () => {
  const { language } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        setMessages([
          {
            id: '1',
            text: language === 'en' 
              ? 'Hello! I\'m your HIXA assistant. How can I help you today?' 
              : 'مرحبًا! أنا مساعدك في HIXA. كيف يمكنني مساعدتك اليوم؟',
            sender: 'bot',
            timestamp: new Date(),
          }
        ]);
      }, 500);
    }
  }, [isOpen, messages.length, language]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollViewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollViewport) {
        scrollViewport.scrollTop = scrollViewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSend = () => {
    if (inputValue.trim() === '') return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');

    // Simulate bot response after a delay
    setTimeout(() => {
      let response = language === 'en' 
        ? 'Thank you for your message. How else can I assist you?' 
        : 'شكرًا على رسالتك. كيف يمكنني مساعدتك أكثر؟';

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        sender: 'bot',
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, botMessage]);
    }, 1000);
  };


  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Chatbot Toggle Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 rounded-full w-14 h-14 p-0 shadow-lg z-50 bg-gradient-to-r from-cyan to-cyan-light hover:from-cyan-dark hover:to-cyan hover:scale-110 transition-transform duration-200"
        aria-label={language === 'en' ? "Open chat" : "فتح الدردشة"}
      >
        <img 
          src={roboticIcon} 
          alt={language === 'en' ? "Chatbot" : "الدردشة الآلية"}
          className="w-10 h-10 object-contain"
        />
      </Button>

      {/* Chatbot Window */}
      {isOpen && (
        <div 
          className="fixed bottom-24 right-6 w-full max-w-md h-[80vh] max-h-[700px] flex flex-col bg-background border border-border rounded-lg shadow-xl z-50"
          dir={language === 'ar' ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-secondary">
            <div className="flex items-center gap-3">
              <img 
                src={roboticIcon} 
                alt={language === 'en' ? "Chatbot" : "الدردشة الآلية"}
                className="w-8 h-8 object-contain"
              />
              <div>
                <h3 className="font-semibold">
                  {language === 'en' ? 'HIXA Assistant' : 'مساعد HIXA'}
                </h3>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-muted-foreground">
                    {language === 'en' ? (isOnline ? 'Online' : 'Offline') : (isOnline ? 'متصل' : 'غير متصل')}
                  </span>
                </div>
              </div>
            </div>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              aria-label={language === 'en' ? "Close chat" : "إغلاق الدردشة"}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-hidden flex flex-col">

            {/* Messages Area - Only show when there are messages */}
            {messages.length > 0 && (
              <>
                <div className="border-t border-border bg-secondary/50 p-2">
                  <div className="text-xs text-muted-foreground text-center">
                    {language === 'en' ? "Chat conversation" : "محادثة الدردشة"}
                  </div>
                </div>
                <ScrollArea className="flex-1 p-4 min-h-[200px]" ref={scrollAreaRef}>
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.sender === 'user' ? (language === 'ar' ? 'justify-start' : 'justify-end') : (language === 'ar' ? 'justify-end' : 'justify-start')}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.sender === 'user'
                              ? 'bg-cyan text-white rounded-br-none'
                              : 'bg-muted text-foreground rounded-bl-none'
                          } ${language === 'ar' ? (message.sender === 'user' ? 'rounded-bl-none rounded-br-lg' : 'rounded-br-none rounded-bl-lg') : ''}`}
                        >
                          <div className={`flex items-start gap-2 ${language === 'ar' ? 'flex-row-reverse' : ''}`}>
                            {message.sender === 'bot' && (
                              <img 
                                src={roboticIcon} 
                                alt={language === 'en' ? "Bot" : "الروبوت"}
                                className="w-5 h-5 object-contain mt-0.5 flex-shrink-0"
                              />
                            )}
                            <div>
                              <p className="text-sm">{message.text}</p>
                              <p className="text-xs opacity-70 mt-1">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                            {message.sender === 'user' && (
                              <HexagonIcon size="sm" className="text-white mt-0.5 flex-shrink-0">
                                <User className="h-3 w-3" />
                              </HexagonIcon>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </>
            )}
          </div>

          {/* FAQ Buttons Section */}
          <div className="px-4 py-2 border-t border-border bg-secondary/50">
            <ScrollArea className="h-20">
              <div className="flex flex-wrap gap-2 pb-2">
                {(faqData.faqData as any[]).map((faq, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const question = faq.question[language];
                      const answer = faq.answer[language];
                      
                      // Add user question
                      const userMessage: Message = {
                        id: Date.now().toString(),
                        text: question,
                        sender: 'user',
                        timestamp: new Date(),
                      };
                      
                      setMessages(prev => [...prev, userMessage]);
                      
                      // Add bot answer after a short delay
                      setTimeout(() => {
                        const botMessage: Message = {
                          id: (Date.now() + 1).toString(),
                          text: answer,
                          sender: 'bot',
                          timestamp: new Date(),
                        };
                        
                        setMessages(prev => [...prev, botMessage]);
                      }, 500);
                    }}
                    className="text-xs bg-transparent border border-cyan text-cyan hover:bg-cyan/10 rounded-full px-3 py-1 transition-colors whitespace-nowrap"
                  >
                    {faq.question[language]}
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-border">
            <div className="flex gap-2">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={language === 'en' ? "Type your message..." : "اكتب رسالتك..."}
                className="flex-1 px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gold"
                aria-label={language === 'en' ? "Type your message" : "اكتب رسالتك"}
              />
              <Button
                onClick={handleSend}
                disabled={inputValue.trim() === ''}
                className="bg-gold hover:bg-gold-dark text-black"
                aria-label={language === 'en' ? "Send message" : "إرسال الرسالة"}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-2">
              {language === 'en' 
                ? "Press Enter to send, Shift+Enter for new line" 
                : "اضغط Enter للإرسال، Shift+Enter لسطر جديد"}
            </p>
          </div>
        </div>
      )}
    </>
  );
};