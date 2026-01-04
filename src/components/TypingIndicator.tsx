import { Bot } from "lucide-react";

const TypingIndicator = () => {
  return (
    <div className="flex gap-4 p-4 bg-chat-bot animate-slide-up">
      <div className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center bg-primary/20">
        <Bot className="w-4 h-4 text-primary" />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-2">
          <span className="font-medium text-sm">Trading Analyst</span>
        </div>
        
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-primary animate-typing" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-typing" style={{ animationDelay: '0.2s' }} />
          <div className="w-2 h-2 rounded-full bg-primary animate-typing" style={{ animationDelay: '0.4s' }} />
          <span className="text-sm text-muted-foreground ml-2">Analyzing markets...</span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
