import { cn } from "@/lib/utils";
import { Bot, User, TrendingUp, TrendingDown, BarChart3, CandlestickChart, BookOpen } from "lucide-react";

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface ParsedData {
  symbol?: string;
  exchange?: string;
  price?: {
    last?: string;
    bidAsk?: string;
    change?: string;
  };
  stats24h?: {
    high?: string;
    low?: string;
    volume?: string;
    turnover?: string;
  };
  orderBook?: {
    bids?: string;
    asks?: string;
  };
  candles?: {
    interval?: string;
    data?: string[];
  };
  rawText?: string;
}

const parseTradeData = (text: string): ParsedData => {
  const result: ParsedData = {};
  
  // Try to extract symbol and exchange
  const symbolMatch = text.match(/^([A-Z0-9]+)\s*[—-]\s*(.+?)(?:\n|$)/m);
  if (symbolMatch) {
    result.symbol = symbolMatch[1];
    result.exchange = symbolMatch[2].trim();
  }

  // Extract Price section
  const priceSection = text.match(/Price[\s\S]*?(?=24h Stats|Order Book|Candles|$)/i);
  if (priceSection) {
    const lastMatch = priceSection[0].match(/Last:\s*([\d,]+\.?\d*)/);
    const bidAskMatch = priceSection[0].match(/Best Bid\s*\/\s*Ask:\s*([\d,]+\.?\d*)\s*\/\s*([\d,]+\.?\d*)/);
    const changeMatch = priceSection[0].match(/Change.*?:\s*([+-]?[\d.]+%)/);
    
    result.price = {
      last: lastMatch?.[1],
      bidAsk: bidAskMatch ? `${bidAskMatch[1]} / ${bidAskMatch[2]}` : undefined,
      change: changeMatch?.[1],
    };
  }

  // Extract 24h Stats
  const statsSection = text.match(/24h Stats[\s\S]*?(?=Order Book|Candles|$)/i);
  if (statsSection) {
    const highMatch = statsSection[0].match(/High:\s*([\d,]+\.?\d*)/);
    const lowMatch = statsSection[0].match(/Low:\s*([\d,]+\.?\d*)/);
    const volumeMatch = statsSection[0].match(/Volume.*?:\s*([\d,]+\.?\d*\s*[A-Z]*)/);
    const turnoverMatch = statsSection[0].match(/Turnover.*?:\s*([\d,]+\.?\d*\s*[A-Z]*)/);
    
    result.stats24h = {
      high: highMatch?.[1],
      low: lowMatch?.[1],
      volume: volumeMatch?.[1],
      turnover: turnoverMatch?.[1],
    };
  }

  // Extract Order Book
  const orderSection = text.match(/Order Book[\s\S]*?(?=Candles|$)/i);
  if (orderSection) {
    const bidsMatch = orderSection[0].match(/Bids?:\s*(.+?)(?=\n|Asks|$)/i);
    const asksMatch = orderSection[0].match(/Asks?:\s*(.+?)(?=\n|$)/i);
    
    result.orderBook = {
      bids: bidsMatch?.[1]?.trim(),
      asks: asksMatch?.[1]?.trim(),
    };
  }

  // Extract Candles
  const candleSection = text.match(/Candles[\s\S]*$/i);
  if (candleSection) {
    const intervalMatch = candleSection[0].match(/Interval:\s*(.+?)(?=\n|$)/);
    const candleData = candleSection[0].match(/\d+\)\s*O:[\s\S]+?C:\s*[\d,]+\.?\d*/g);
    
    result.candles = {
      interval: intervalMatch?.[1]?.trim(),
      data: candleData || [],
    };
  }

  // If no structured data found, keep raw text
  if (!result.symbol && !result.price && !result.stats24h) {
    result.rawText = text;
  }

  return result;
};

const DataCard = ({ title, icon: Icon, children, className }: { 
  title: string; 
  icon: React.ElementType; 
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={cn("bg-secondary/50 rounded-lg p-4 border border-border", className)}>
    <div className="flex items-center gap-2 mb-3 text-primary">
      <Icon className="w-4 h-4" />
      <span className="text-sm font-semibold uppercase tracking-wide">{title}</span>
    </div>
    {children}
  </div>
);

const StatItem = ({ label, value, highlight }: { label: string; value?: string; highlight?: 'positive' | 'negative' }) => {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className={cn(
        "font-mono text-sm font-medium",
        highlight === 'positive' && "text-success",
        highlight === 'negative' && "text-destructive",
        !highlight && "text-foreground"
      )}>
        {value}
      </span>
    </div>
  );
};

const FormattedResponse = ({ content }: { content: string }) => {
  const data = parseTradeData(content);

  // If it's just raw text (no trading data found), show as plain text
  if (data.rawText) {
    return (
      <div className="text-sm text-foreground/90 whitespace-pre-wrap">
        {data.rawText}
      </div>
    );
  }

  const isPositiveChange = data.price?.change?.startsWith('+');
  const isNegativeChange = data.price?.change?.startsWith('-');

  return (
    <div className="space-y-4">
      {/* Header with symbol */}
      {data.symbol && (
        <div className="flex items-center gap-3 pb-3 border-b border-border">
          <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center">
            <span className="text-primary font-bold text-sm">
              {data.symbol.slice(0, 3)}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-foreground">{data.symbol}</h3>
            {data.exchange && (
              <p className="text-sm text-muted-foreground">{data.exchange}</p>
            )}
          </div>
          {data.price?.change && (
            <div className={cn(
              "ml-auto flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold",
              isPositiveChange && "bg-success/20 text-success",
              isNegativeChange && "bg-destructive/20 text-destructive"
            )}>
              {isPositiveChange ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
              {data.price.change}
            </div>
          )}
        </div>
      )}

      {/* Price Card */}
      {data.price && (data.price.last || data.price.bidAsk) && (
        <DataCard title="Price" icon={TrendingUp}>
          <div className="space-y-1">
            <StatItem label="Last Price" value={data.price.last} />
            <StatItem label="Bid / Ask" value={data.price.bidAsk} />
            <StatItem 
              label="24h Change" 
              value={data.price.change} 
              highlight={isPositiveChange ? 'positive' : isNegativeChange ? 'negative' : undefined}
            />
          </div>
        </DataCard>
      )}

      {/* 24h Stats Card */}
      {data.stats24h && (data.stats24h.high || data.stats24h.volume) && (
        <DataCard title="24h Statistics" icon={BarChart3}>
          <div className="grid grid-cols-2 gap-x-4">
            <StatItem label="High" value={data.stats24h.high} highlight="positive" />
            <StatItem label="Low" value={data.stats24h.low} highlight="negative" />
            <StatItem label="Volume" value={data.stats24h.volume} />
            <StatItem label="Turnover" value={data.stats24h.turnover} />
          </div>
        </DataCard>
      )}

      {/* Order Book Card */}
      {data.orderBook && (data.orderBook.bids || data.orderBook.asks) && (
        <DataCard title="Order Book (Top 5)" icon={BookOpen}>
          <div className="space-y-3">
            {data.orderBook.bids && (
              <div>
                <span className="text-xs text-success font-medium uppercase tracking-wide">Bids</span>
                <p className="text-xs font-mono text-foreground/80 mt-1 break-all">
                  {data.orderBook.bids}
                </p>
              </div>
            )}
            {data.orderBook.asks && (
              <div>
                <span className="text-xs text-destructive font-medium uppercase tracking-wide">Asks</span>
                <p className="text-xs font-mono text-foreground/80 mt-1 break-all">
                  {data.orderBook.asks}
                </p>
              </div>
            )}
          </div>
        </DataCard>
      )}

      {/* Candles Card */}
      {data.candles && data.candles.data && data.candles.data.length > 0 && (
        <DataCard title={`Candles ${data.candles.interval ? `(${data.candles.interval})` : ''}`} icon={CandlestickChart}>
          <div className="space-y-2">
            {data.candles.data.map((candle, index) => {
              const parsed = candle.match(/O:\s*([\d,]+\.?\d*)\s*H:\s*([\d,]+\.?\d*)\s*L:\s*([\d,]+\.?\d*)\s*C:\s*([\d,]+\.?\d*)/);
              if (!parsed) return <p key={index} className="text-xs font-mono">{candle}</p>;
              
              return (
                <div key={index} className="grid grid-cols-4 gap-2 text-xs font-mono bg-background/50 rounded p-2">
                  <div>
                    <span className="text-muted-foreground">O:</span>{' '}
                    <span className="text-foreground">{parsed[1]}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">H:</span>{' '}
                    <span className="text-success">{parsed[2]}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">L:</span>{' '}
                    <span className="text-destructive">{parsed[3]}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">C:</span>{' '}
                    <span className="text-foreground">{parsed[4]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </DataCard>
      )}
    </div>
  );
};

const ChatMessage = ({ content, isUser, timestamp }: ChatMessageProps) => {
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
        <div className="flex items-center gap-2 mb-3">
          <span className="font-medium text-sm">
            {isUser ? "You" : "Trading Analyst"}
          </span>
          <span className="text-xs text-muted-foreground">
            {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
        
        {isUser ? (
          <p className="text-sm">{content}</p>
        ) : (
          <FormattedResponse content={content} />
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
