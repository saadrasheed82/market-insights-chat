import { useState, useCallback } from "react";
import { toast } from "sonner";

export interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const WEBHOOK_URL = "https://n8n.srv1245507.hstgr.cloud/webhook-test/f452eb55-a1ef-4f86-861c-0fe04c8341c4";

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      content,
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const url = new URL(WEBHOOK_URL);
      url.searchParams.set("message", content);
      
      const response = await fetch(url.toString(), {
        method: "GET",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.text();
      
      // Parse response - could be JSON or plain text
      let responseContent: string;
      try {
        const jsonData = JSON.parse(data);
        responseContent = jsonData.output || jsonData.message || jsonData.response || JSON.stringify(jsonData, null, 2);
      } catch {
        responseContent = data;
      }

      const botMessage: Message = {
        id: crypto.randomUUID(),
        content: responseContent,
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
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
  }, []);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
  };
};
