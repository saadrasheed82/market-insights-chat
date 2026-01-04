import { Plus, MessageSquare, Trash2, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Conversation } from "@/hooks/useChat";
import { cn } from "@/lib/utils";

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string | null;
  onNewChat: () => void;
  onSelectConversation: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onSignOut: () => void;
  userEmail?: string;
}

const Sidebar = ({
  conversations,
  currentConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onSignOut,
  userEmail,
}: SidebarProps) => {
  return (
    <div className="w-64 bg-muted/30 border-r border-border flex flex-col h-full">
      <div className="p-4">
        <Button onClick={onNewChat} className="w-full gap-2" variant="outline">
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <ScrollArea className="flex-1 px-2">
        <div className="space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                "group flex items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer hover:bg-accent transition-colors",
                currentConversationId === conversation.id && "bg-accent"
              )}
              onClick={() => onSelectConversation(conversation.id)}
            >
              <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate flex-1">{conversation.title}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conversation.id);
                }}
              >
                <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground truncate mb-2">
          {userEmail}
        </div>
        <Button
          onClick={onSignOut}
          variant="ghost"
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;