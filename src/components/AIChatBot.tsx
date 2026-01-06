import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Send, Bot, User, Sparkles, X } from 'lucide-react';
import { ChatMessage } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { aiService } from '@/services/aiService';
import ReactMarkdown from 'react-markdown';

export interface AIChatBotRef {
  sendMessage: (message: string) => void;
}

interface AIChatBotProps {
  isOpen: boolean;
  onClose: () => void;
}

const sampleResponses = [
  "Based on the current data, the North America cluster shows the highest revenue growth at 15% YoY, primarily driven by Tech Giants Inc account.",
  "The margin analysis indicates that 3 accounts are below the 30% threshold: Healthcare Solutions (28.5%), Retail Global (25.2%), and Manufacturing Plus (22.8%). Consider reviewing cost structures for these accounts.",
  "Looking at the utilization trends, Q4 2024 showed an average of 82.3% across all projects, which is above industry standard of 75-80%. This indicates healthy resource allocation.",
  "The top performing project by margin is 'Digital Transformation' at Tech Giants Inc with a 42% gross margin, followed by 'Cloud Migration' at 38%.",
  "Revenue forecasting based on historical data suggests a potential 12% increase in Q1 2025, with the strongest growth expected in the Asia Pacific cluster.",
];

const AIChatBot = forwardRef<AIChatBotRef, AIChatBotProps>(({ isOpen, onClose }, ref) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm your FinSight AI assistant. I can help you analyze P&L data, understand trends, and answer questions about your financial performance. What would you like to know?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 300); // Wait for animation
    }
  }, [isOpen]);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    
    // Only clear input if we used the input state
    if (!messageText) {
        setInput('');
    }
    
    setIsLoading(true);

    const aiMessageId = (Date.now() + 1).toString();
    const aiMessage: ChatMessage = {
        id: aiMessageId,
        role: 'assistant',
        content: '',
        timestamp: new Date(),
    };
    
    setMessages((prev) => [...prev, aiMessage]);

    try {
      await aiService.sendMessageStream(userMessage.content, (chunk) => {
        setMessages((prev) => 
            prev.map(msg => 
                msg.id === aiMessageId 
                    ? { ...msg, content: msg.content + chunk }
                    : msg
            )
        );
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useImperativeHandle(ref, () => ({
    sendMessage: (message: string) => {
      // Small delay to ensure state updates if it was just opened
      setTimeout(() => handleSend(message), 100);
    }
  }));

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "What's the overall margin trend?",
    "Which accounts need attention?",
    "Show top performing projects",
  ];

  return (
    <>
      {/* Backdrop for mobile or focus */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={onClose}
        />
      )}
      
      <div
        className={cn(
          'fixed top-0 right-0 h-full w-[450px] bg-background border-l shadow-2xl z-50 flex flex-col transition-transform duration-300 ease-in-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary-foreground/20 rounded-lg">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="font-semibold font-display text-base">FinSight AI</h3>
              <p className="text-xs text-primary-foreground/70">Ask anything about your data</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20"
              onClick={onClose}
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-3 animate-fade-in',
                  message.role === 'user' ? 'flex-row-reverse' : ''
                )}
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
                    message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted border border-border'
                  )}
                >
                  {message.role === 'user' ? <User size={16} /> : <Bot size={16} className="text-foreground" />}
                </div>
                <div
                  className={cn(
                    'max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm',
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-card border text-card-foreground rounded-tl-sm'
                  )}
                >
                    <ReactMarkdown
                      components={{
                        p: ({children}) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                        ul: ({children}) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                        ol: ({children}) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                        li: ({children}) => <li className="mb-1">{children}</li>,
                        strong: ({children}) => <span className="font-bold">{children}</span>,
                        em: ({children}) => <span className="italic">{children}</span>,
                        pre: ({children}) => (
                          <pre className={cn(
                            "rounded-lg p-3 my-2 overflow-x-auto",
                            message.role === 'user' 
                              ? "bg-black/20 text-white" 
                              : "bg-muted text-foreground"
                          )}>
                            {children}
                          </pre>
                        ),
                        code: ({children}) => (
                          <code className={cn(
                            "px-1.5 py-0.5 rounded text-xs font-mono",
                            // Only apply background if not inside pre (simple heuristic or just apply mild style)
                            // For simplicity, we'll apply a robust style that works for inline.
                            // Blocks are usually handled by 'pre', and 'code' inside 'pre' inherits.
                            message.role === 'user' 
                              ? "bg-black/10" 
                              : "bg-muted"
                          )}>
                            {children}
                          </code>
                        )
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-full flex items-center justify-center bg-muted border border-border shrink-0">
                  <Bot size={16} className="text-foreground" />
                </div>
                <div className="bg-card border rounded-2xl rounded-tl-sm px-4 py-4 shadow-sm">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Quick Questions */}
        {messages.length <= 2 && (
          <div className="px-4 pb-2">
            <p className="text-xs text-muted-foreground mb-2 font-medium">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q) => (
                <button
                  key={q}
                  onClick={() => setInput(q)}
                  className="text-xs px-3 py-2 bg-muted hover:bg-muted/80 text-foreground border rounded-lg transition-colors text-left"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              size="icon"
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="shrink-0"
            >
              <Send size={18} />
            </Button>
          </div>
          <div className="text-[10px] text-center text-muted-foreground mt-2">
            AI can make mistakes. Please verify important information.
          </div>
        </div>
      </div>
    </>
  );
});

AIChatBot.displayName = 'AIChatBot';

export default AIChatBot;
