import { BarChart3, Bitcoin, DollarSign, TrendingUp } from "lucide-react";

const EmptyState = () => {
  return (
    <div className="flex-1 flex items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="flex justify-center gap-4 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bitcoin className="w-6 h-6 text-primary" />
          </div>
          <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-success" />
          </div>
          <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-warning" />
          </div>
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-destructive" />
          </div>
        </div>
        
        <h2 className="text-xl font-semibold mb-2">
          Welcome to Crypto Analyst
        </h2>
        <p className="text-muted-foreground mb-6">
          Get real-time analysis on any cryptocurrency pair. Ask about any crypto to see detailed market data, order books, and candlestick patterns.
        </p>
        
        <div className="grid gap-3 text-left">
          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
            <p className="text-sm font-medium text-foreground mb-1">Try asking:</p>
            <p className="text-sm text-muted-foreground font-mono">"Give me details on BTCUSDT"</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50 border border-border">
            <p className="text-sm font-medium text-foreground mb-1">Or explore:</p>
            <p className="text-sm text-muted-foreground font-mono">"Analyze SOLUSDT market trends"</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;
