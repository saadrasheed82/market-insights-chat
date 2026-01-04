import { Activity, Zap } from "lucide-react";

const ChatHeader = () => {
  return (
    <header className="border-b border-border bg-card px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center glow-primary">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-lg flex items-center gap-2">
              Market Analyst
              <span className="flex items-center gap-1 text-xs font-normal text-success bg-success/10 px-2 py-0.5 rounded-full">
                <Zap className="w-3 h-3" />
                Live
              </span>
            </h1>
            <p className="text-sm text-muted-foreground">
              AI-powered trading analysis for crypto, forex & stocks
            </p>
          </div>
        </div>
        
        <div className="hidden sm:flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
            <span>Connected</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default ChatHeader;
