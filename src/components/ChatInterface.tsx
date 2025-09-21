import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Send, MessageCircle, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface ChatInterfaceProps {
  documentName?: string;
  onSendMessage: (message: string) => Promise<string>;
}

export const ChatInterface = ({ documentName, onSendMessage }: ChatInterfaceProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (documentName && messages.length === 0) {
      // Add welcome message when document is uploaded
      setMessages([{
        id: '1',
        type: 'assistant',
        content: `Hi! I've analyzed your document "${documentName}". I can answer questions about its contents, explain legal terms, clarify clauses, and help you understand any risks. What would you like to know?`,
        timestamp: new Date()
      }]);
    }
  }, [documentName, messages.length]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Add typing indicator
    const typingMessage: Message = {
      id: (Date.now() + 1).toString(),
      type: 'assistant',
      content: '',
      timestamp: new Date(),
      isTyping: true
    };
    setMessages(prev => [...prev, typingMessage]);

    try {
      const response = await onSendMessage(inputValue);
      
      // Remove typing indicator and add actual response
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => !msg.isTyping);
        return [...withoutTyping, {
          id: (Date.now() + 2).toString(),
          type: 'assistant',
          content: response,
          timestamp: new Date()
        }];
      });
    } catch (error) {
      // Remove typing indicator and add error message
      setMessages(prev => {
        const withoutTyping = prev.filter(msg => !msg.isTyping);
        // Optionally, you can show a generic error or nothing at all
        return [...withoutTyping];
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const suggestedQuestions = [
    'What are the key obligations for each party?',
    'Are there any concerning termination clauses?',
    'What are the payment terms and conditions?',
    'Are there any liability limitations I should know about?'
  ];

  return (
    <Card className="card-shadow flex h-[600px] flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-primary">
          <MessageCircle className="h-5 w-5" />
          Document Q&A
          {documentName && (
            <Badge variant="outline" className="ml-2">
              {documentName}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="flex flex-1 flex-col space-y-4 p-4">
        {/* Messages Area */}
        <div className="flex-1 space-y-4 overflow-y-auto rounded-lg bg-muted/20 p-4">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <Bot className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-lg font-semibold">Ready to Help!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload a document to start asking questions about its contents
              </p>
              {!documentName && (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Try asking about:</p>
                  <div className="flex flex-wrap gap-2">
                    {suggestedQuestions.slice(0, 2).map((question, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {question}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
                >
                  <div className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    message.type === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                  }`}>
                    {message.type === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div className={`max-w-[80%] rounded-lg p-3 ${
                    message.type === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-background border'
                  }`}>
                    {message.isTyping ? (
                      <div className="flex items-center gap-1">
                        <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground"></div>
                        <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" style={{animationDelay: '0.1s'}}></div>
                        <div className="h-2 w-2 animate-pulse rounded-full bg-muted-foreground" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed">{message.content}</p>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Questions */}
        {documentName && messages.length === 1 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Suggested questions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestedQuestions.map((question, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputValue(question)}
                  className="h-auto p-2 text-xs"
                  disabled={isLoading}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="flex gap-2">
          <Input
            placeholder={documentName ? "Ask me anything about your document..." : "Upload a document to start chatting..."}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={!documentName || isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!inputValue.trim() || !documentName || isLoading}
            size="icon"
            className="legal-shadow hover:scale-105 smooth-transition"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};