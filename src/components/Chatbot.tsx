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

  const whatsappNumber = '00966504131885';
  const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/^00/, '')}`;

  return (
    <>
      {/* WhatsApp Floating Button */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={`fixed bottom-6 ${language === 'ar' ? 'left-6' : 'right-24'} rounded-full w-14 h-14 p-0 shadow-lg z-50 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 hover:scale-110 transition-transform duration-200 flex items-center justify-center`}
        aria-label={language === 'en' ? "Contact us on WhatsApp" : "تواصل معنا على واتساب"}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-8 h-8 text-white"
        >
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.375a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
        </svg>
      </a>

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