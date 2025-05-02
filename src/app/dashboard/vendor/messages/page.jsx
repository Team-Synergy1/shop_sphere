"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import { initializeSocket } from "@/lib/socketClient";

export default function VendorMessages() {
  const { data: session } = useSession();
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize socket connection
    initializeSocket();
    
    // Fetch vendor chats
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

  const getTotalUnreadCount = () => {
    if (!chats.length) return 0;
    return chats.reduce((total, chat) => total + getUnreadCount(chat), 0);
  };

  return (
    <div className="container p-4">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Customer Messages</h1>
        <Badge variant="outline" className="px-3 py-1">
          {getTotalUnreadCount()} Unread
        </Badge>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading conversations...</p>
        </div>
      ) : chats.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <MessageSquare className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No messages yet</h3>
              <p className="text-muted-foreground mt-2">
                Conversations with your customers will appear here
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {chats.map((chat) => {
            const customer = getOtherParticipant(chat);
            const lastMessage = chat.messages[chat.messages.length - 1];
            const unreadCount = getUnreadCount(chat);
            
            return (
              <Link href={`/chat/${chat._id}`} key={chat._id}>
                <Card className={`cursor-pointer hover:shadow-md transition-shadow ${unreadCount > 0 ? 'border-primary border-l-4' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={customer?.image} />
                        <AvatarFallback>
                          {customer?.name?.charAt(0) || "C"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold">
                            {customer?.name || "Customer"}
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

      <div className="mt-8">
        <h2 className="text-lg font-semibold mb-4">Tips for Effective Customer Communication</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Response Time Matters</h3>
              <p className="text-sm text-muted-foreground">
                Try to respond to customer queries within 24 hours. Quick responses lead to higher customer satisfaction.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Be Professional & Friendly</h3>
              <p className="text-sm text-muted-foreground">
                Keep communications friendly but professional. Use proper grammar and avoid slang or abbreviations.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Provide Clear Information</h3>
              <p className="text-sm text-muted-foreground">
                When answering product questions, be as specific and clear as possible to avoid misunderstandings.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <h3 className="font-medium mb-2">Document Conversations</h3>
              <p className="text-sm text-muted-foreground">
                For important decisions or agreements, summarize them at the end of your conversation for clarity.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}