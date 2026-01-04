import { cn } from "@/lib/utils";
import { Bot, User } from "lucide-react";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const ChatMessage = ({ content, isUser, timestamp }: ChatMessageProps) => {
  const formatContent = (text: string) => {
    // Split by lines and format
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      // Highlight positive percentages
      const formattedLine = line
        .replace(/(\+[\d.]+%)/g, '<span class="text-success font-semibold">$1</span>')
        .replace(/(-[\d.]+%)/g, '<span class="text-destructive font-semibold">$1</span>')
        .replace(/([\d,]+\.\d+)/g, '<span class="font-mono text-primary">$1</span>')
        .replace(/^(•\s)/g, '<span class="text-primary">$1</span>')
        .replace(/^([A-Z][A-Z0-9]+\s—)/g, '<span class="text-primary font-bold text-lg">$1</span>');

      // Headers
      if (line.match(/^(Price|24h Stats|Order Book|Candles)/)) {
        return (
          <div key={index} className="text-primary font-semibold mt-4 mb-2 text-sm uppercase tracking-wide">
            {line}
          </div>
        );
      }

      return (
        <div 
          key={index} 
          className="leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedLine || '&nbsp;' }}
        />
      );
    });
  };

  return (
    <div 
      className={cn(
        "flex gap-4 p-4 animate-slide-up",
        isUser ? "bg-chat-user" : "bg-chat-bot"
      )}
    >
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center",
        isUser ? "bg-secondary" : "bg-primary/20"
      )}>
        {isUser ? (
          <User className="w-4 h-4 text-foreground" />
        ) : (
          <Bot className="w-4 h-4 text-primary" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-sm">
            {isUser ? "You" : "Trading Analyst"}
          </span>
          <span className="text-xs text-muted-foreground">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        <div className={cn(
          "text-sm",
          !isUser && "font-mono-data text-foreground/90"
        )}>
          {isUser ? content : formatContent(content)}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
