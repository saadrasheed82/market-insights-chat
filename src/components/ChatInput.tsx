import { useState, KeyboardEvent } from "react";
import { Send, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const suggestions = [
    "Analyze BTCUSDT",
    "Give me details on ETHUSDT",
    "Check SOLUSDT trends",
    "Analyze XRPUSDT",
  ];

  return (
    <div className="border-t border-border bg-card p-4">
      {/* Quick suggestions */}
      <div className="flex flex-wrap gap-2 mb-3">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => onSend(suggestion)}
            disabled={disabled}
            className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>
      
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about any trading pair... (e.g., 'Give me details on BTCUSDT')"
            disabled={disabled}
            className="min-h-[52px] max-h-32 resize-none bg-secondary border-border focus:border-primary focus:ring-primary/20 pr-12"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </div>
        </div>
        
        <Button
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="h-[52px] w-[52px] bg-primary hover:bg-primary/90 text-primary-foreground glow-primary"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};

export default ChatInput;
