import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
}

export const useChat = (userId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load conversations for the user
  const loadConversations = useCallback(async () => {
    if (!userId) return;
    
    const { data, error } = await supabase
      .from("chat_conversations")
      .select("*")
      .order("updated_at", { ascending: false });

    if (error) {
      console.error("Error loading conversations:", error);
      return;
    }

    setConversations(
      data.map((conv) => ({
        id: conv.id,
        title: conv.title,
        createdAt: new Date(conv.created_at),
        updatedAt: new Date(conv.updated_at),
      }))
    );
  }, [userId]);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    const { data, error } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error loading messages:", error);
      return;
    }

    setMessages(
      data.map((msg) => ({
        id: msg.id,
        content: msg.content,
        isUser: msg.is_user,
        timestamp: new Date(msg.created_at),
      }))
    );
    setCurrentConversationId(conversationId);
  }, []);

  // Create a new conversation
  const createConversation = useCallback(async (title: string = "New Chat") => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from("chat_conversations")
      .insert({ user_id: userId, title })
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      return null;
    }

    const newConversation: Conversation = {
      id: data.id,
      title: data.title,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    };

    setConversations((prev) => [newConversation, ...prev]);
    setCurrentConversationId(data.id);
    setMessages([]);
    return data.id;
  }, [userId]);

  // Save a message to the database
  const saveMessage = useCallback(async (conversationId: string, content: string, isUser: boolean) => {
    if (!userId) return;

    const { error } = await supabase
      .from("chat_messages")
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        content,
        is_user: isUser,
      });

    if (error) {
      console.error("Error saving message:", error);
    }
  }, [userId]);

  // Update conversation title based on first message
  const updateConversationTitle = useCallback(async (conversationId: string, title: string) => {
    const truncatedTitle = title.length > 50 ? title.substring(0, 50) + "..." : title;
    
    const { error } = await supabase
      .from("chat_conversations")
      .update({ title: truncatedTitle })
      .eq("id", conversationId);

    if (error) {
      console.error("Error updating conversation title:", error);
      return;
    }

    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === conversationId ? { ...conv, title: truncatedTitle } : conv
      )
    );
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    let conversationId = currentConversationId;

    // Create a new conversation if needed
    if (!conversationId && userId) {
      conversationId = await createConversation(content);
      if (!conversationId) {
        toast.error("Failed to create conversation");
        return;
      }
    } else if (!conversationId) {
      // For non-authenticated users, just use local state
    }

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    // Save user message if authenticated
    if (conversationId && userId) {
      await saveMessage(conversationId, content, true);
      
      // Update title if this is the first message
      if (messages.length === 0) {
        await updateConversationTitle(conversationId, content);
      }
    }

    try {
      const { data, error } = await supabase.functions.invoke("n8n-proxy", {
        body: { message: content },
      });

      if (error) {
        throw new Error(error.message);
      }

      const responseContent = data.response || "No response received";

      const botMessage: Message = {
        id: crypto.randomUUID(),
        content: responseContent,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);

      // Save bot message if authenticated
      if (conversationId && userId) {
        await saveMessage(conversationId, responseContent, false);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to get analysis. Please try again.");
      
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        content: "Sorry, I couldn't connect to the trading analysis service. Please check your connection and try again.",
        isUser: false,
        timestamp: new Date(),
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [currentConversationId, userId, createConversation, saveMessage, updateConversationTitle, messages.length]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setCurrentConversationId(null);
  }, []);

  const selectConversation = useCallback(async (conversationId: string) => {
    await loadMessages(conversationId);
  }, [loadMessages]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    const { error } = await supabase
      .from("chat_conversations")
      .delete()
      .eq("id", conversationId);

    if (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete conversation");
      return;
    }

    setConversations((prev) => prev.filter((c) => c.id !== conversationId));
    
    if (currentConversationId === conversationId) {
      setMessages([]);
      setCurrentConversationId(null);
    }
  }, [currentConversationId]);

  // Load conversations on mount
  useEffect(() => {
    if (userId) {
      loadConversations();
    }
  }, [userId, loadConversations]);

  return {
    messages,
    conversations,
    currentConversationId,
    isLoading,
    sendMessage,
    clearMessages,
    createConversation,
    selectConversation,
    deleteConversation,
    loadConversations,
  };
};