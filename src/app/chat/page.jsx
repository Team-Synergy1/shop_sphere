"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { initializeSocket } from "@/lib/socketClient";

export default function ChatPage() {
  const { data: session } = useSession();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize socket connection
    initializeSocket();
    
    // Fetch chats
    const fetchChats = async () => {
      try {
        setLoading(true);
        const response = await axios.get("/api/chat");
        setChats(response.data.chats);
      } catch (error) {
        console.error("Error fetching chats:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchChats();
    }
  }, [session]);

  const getOtherParticipant = (chat) => {
    if (!session?.user) return null;
    const otherParticipant = chat.participants.find(
      (participant) => participant._id !== session.user.id
    );
    return otherParticipant;
  };

  const getUnreadCount = (chat) => {
    if (!session?.user) return 0;
    return chat.messages.filter(
      (message) => !message.isRead && message.sender._id !== session.user.id
    ).length;
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Messages</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading chats...</p>
        </div>
      ) : chats.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No messages yet</h3>
              <p className="text-muted-foreground mt-2">
                Your conversations with vendors and other users will appear here.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {chats.map((chat) => {
            const otherParticipant = getOtherParticipant(chat);
            const lastMessage = chat.messages[chat.messages.length - 1];
            const unreadCount = getUnreadCount(chat);
            
            return (
              <Link href={`/chat/${chat._id}`} key={chat._id}>
                <Card className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={otherParticipant?.image} />
                        <AvatarFallback>
                          {otherParticipant?.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold">
                            {otherParticipant?.name}
                            {otherParticipant?.isVendor && (
                              <Badge variant="outline" className="ml-2">
                                Vendor
                              </Badge>
                            )}
                          </h3>
                          {lastMessage && (
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(lastMessage.timestamp), {
                                addSuffix: true,
                              })}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {lastMessage
                            ? `${lastMessage.sender._id === session?.user?.id ? "You: " : ""}${lastMessage.content}`
                            : "Start a conversation..."}
                        </p>
                      </div>
                      {unreadCount > 0 && (
                        <Badge className="rounded-full px-2 py-1 text-xs">
                          {unreadCount}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}