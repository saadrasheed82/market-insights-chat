import { useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ChatHeader from "@/components/ChatHeader";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import TypingIndicator from "@/components/TypingIndicator";
import EmptyState from "@/components/EmptyState";
import Sidebar from "@/components/Sidebar";
import { useChat } from "@/hooks/useChat";
import { useAuth } from "@/hooks/useAuth";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();
  const {
    messages,
    conversations,
    currentConversationId,
    isLoading,
    sendMessage,
    clearMessages,
    selectConversation,
    deleteConversation,
  } = useChat(user?.id);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      navigate("/auth");
    }
  };

  const handleNewChat = () => {
    clearMessages();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={selectConversation}
        onDeleteConversation={deleteConversation}
        onSignOut={handleSignOut}
        userEmail={user.email}
      />
      
      <div className="flex flex-col flex-1">
        <ChatHeader />
        
        <ScrollArea 
          ref={scrollRef}
          className="flex-1 scrollbar-thin"
        >
          {messages.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y divide-border">
              {messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  content={message.content}
                  isUser={message.isUser}
                  timestamp={message.timestamp}
                />
              ))}
              {isLoading && <TypingIndicator />}
            </div>
          )}
        </ScrollArea>
        
        <ChatInput onSend={sendMessage} disabled={isLoading} />
      </div>
    </div>
  );
};

export default Index;