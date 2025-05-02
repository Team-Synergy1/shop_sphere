"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { 
  joinChatRoom, 
  sendMessage, 
  listenForMessages, 
  indicateTyping, 
  listenForTyping 
} from "@/lib/socketClient";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatRelative } from "date-fns";
import { ArrowLeft, Send } from "lucide-react";

export default function ChatRoom() {
  const { chatId } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [chat, setChat] = useState(null);
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [userTyping, setUserTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Fetch chat data
  useEffect(() => {
    const fetchChat = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/chat/${chatId}`);
        setChat(response.data.chat);
      } catch (error) {
        console.error("Error fetching chat:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user && chatId) {
      fetchChat();
    }
  }, [chatId, session]);

  // Join chat room when chat data is loaded
  useEffect(() => {
    if (chat) {
      const roomId = chat.participants.map(p => p._id).sort().join('-');
      joinChatRoom(roomId);
    }
  }, [chat]);

  // Listen for incoming messages
  useEffect(() => {
    if (!chat || !session?.user) return;

    const roomId = chat.participants.map(p => p._id).sort().join('-');
    
    const cleanup = listenForMessages((data) => {
      // Update our chat state with the new message
      setChat(prevChat => {
        if (!prevChat) return prevChat;
        
        return {
          ...prevChat,
          messages: [
            ...prevChat.messages,
            {
              _id: data._id || Date.now().toString(),
              content: data.content,
              sender: data.sender,
              timestamp: data.timestamp || new Date().toISOString(),
              isRead: false
            }
          ]
        };
      });
    });

    // Listen for typing indicators
    const typingCleanup = listenForTyping((data) => {
      if (data.userId !== session.user.id) {
        setUserTyping(true);
        
        // Clear the typing indicator after 2 seconds
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        
        typingTimeoutRef.current = setTimeout(() => {
          setUserTyping(false);
        }, 2000);
      }
    });

    return () => {
      cleanup();
      typingCleanup();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [chat, session]);

  // Scroll to bottom when messages change
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chat?.messages]);

  // Handle typing indicator
  const handleTyping = () => {
    if (!chat || !session?.user) return;
    
    const roomId = chat.participants.map(p => p._id).sort().join('-');
    indicateTyping(roomId, { userId: session.user.id, name: session.user.name });
  };

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !chat || !session?.user || sending) return;
    
    try {
      setSending(true);
      const roomId = chat.participants.map(p => p._id).sort().join('-');
      
      // Send message to server via API
      const response = await axios.post(`/api/chat/${chatId}`, {
        content: messageInput
      });
      
      // Emit message via socket
      sendMessage(roomId, {
        _id: response.data.message._id,
        content: messageInput,
        sender: {
          _id: session.user.id,
          name: session.user.name,
          image: session.user.image
        },
        timestamp: new Date().toISOString()
      });
      
      // Update local state
      setChat(prevChat => ({
        ...prevChat,
        messages: [
          ...prevChat.messages,
          response.data.message
        ]
      }));
      
      // Clear input
      setMessageInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const getOtherParticipant = () => {
    if (!chat || !session?.user) return null;
    return chat.participants.find(p => p._id !== session.user.id);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Loading chat...</p>
      </div>
    );
  }

  if (!chat) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h3 className="mt-4 text-lg font-semibold">Chat not found</h3>
              <Button 
                className="mt-4" 
                onClick={() => router.push('/chat')}
              >
                Back to chats
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const otherParticipant = getOtherParticipant();

  return (
    <div className="container mx-auto py-4 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex items-center gap-4 mb-4">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => router.push('/chat')}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={otherParticipant?.image} />
            <AvatarFallback>
              {otherParticipant?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-lg flex items-center gap-2">
              {otherParticipant?.name}
              {otherParticipant?.isVendor && (
                <Badge variant="outline">Vendor</Badge>
              )}
            </h2>
            {userTyping && (
              <p className="text-xs text-muted-foreground">typing...</p>
            )}
          </div>
        </div>
      </div>
      
      <Card className="flex-1 flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {chat.messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <p>No messages yet. Start the conversation!</p>
              </div>
            ) : (
              chat.messages.map((message) => {
                const isCurrentUser = message.sender._id === session?.user?.id;
                return (
                  <div
                    key={message._id}
                    className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-4 py-2 rounded-lg ${
                        isCurrentUser
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      <p>{message.content}</p>
                      <div
                        className={`text-xs mt-1 ${
                          isCurrentUser
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground"
                        }`}
                      >
                        {formatRelative(new Date(message.timestamp), new Date())}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
        
        <CardContent className="p-4 border-t">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={handleTyping}
              placeholder="Type a message..."
              disabled={sending}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!messageInput.trim() || sending}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}