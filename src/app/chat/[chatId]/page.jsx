"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { initializeSocket } from "@/lib/socketClient";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ChatRoomPage() {
	const { chatId } = useParams();
	const { data: session } = useSession();
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(true);
	const socketRef = useRef(null);
	const messagesEndRef = useRef(null);

	useEffect(() => {
		if (!chatId || !session?.user) return;
		// Fetch chat messages
		const fetchMessages = async () => {
			try {
				setLoading(true);
				const res = await axios.get(`/api/chat/${chatId}`);
				setMessages(res.data.messages || []);
			} catch (e) {
				setMessages([]);
			} finally {
				setLoading(false);
			}
		};
		fetchMessages();
	}, [chatId, session]);

	useEffect(() => {
		if (!chatId || !session?.user) return;
		// Initialize socket and join room
		const socket = initializeSocket();
		socketRef.current = socket;
		socket.emit("join_room", chatId);
		socket.on("receive_message", (msg) => {
			setMessages((prev) => [...prev, msg]);
		});
		return () => {
			socket.off("receive_message");
			socket.emit("leave_room", chatId);
		};
	}, [chatId, session]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSend = async (e) => {
		e.preventDefault();
		if (!input.trim()) return;
		const msg = {
			content: input,
			chatId,
			sender: {
				_id: session.user.id,
				name: session.user.name,
				image: session.user.image,
			},
			timestamp: new Date().toISOString(),
		};
		socketRef.current.emit("send_message", { ...msg, roomId: chatId });
		setMessages((prev) => [...prev, msg]);
		setInput("");
		// Optionally, persist message to DB
		await axios.post(`/api/chat/${chatId}/message`, { content: msg.content });
	};

	return (
		<div className="max-w-2xl mx-auto py-8 flex flex-col h-[80vh]">
			<h1 className="text-2xl font-bold mb-4">Chat</h1>
			<div className="flex-1 overflow-y-auto border rounded p-4 bg-white">
				{loading ? (
					<p>Loading messages...</p>
				) : messages.length === 0 ? (
					<p className="text-muted-foreground">No messages yet.</p>
				) : (
					messages.map((msg, idx) => (
						<div
							key={idx}
							className={`mb-2 flex ${
								msg.sender._id === session.user.id
									? "justify-end"
									: "justify-start"
							}`}
						>
							<div
								className={`rounded px-3 py-2 ${
									msg.sender._id === session.user.id
										? "bg-orange-100"
										: "bg-gray-100"
								}`}
							>
								<div className="text-xs text-gray-500">{msg.sender.name}</div>
								<div>{msg.content}</div>
								<div className="text-[10px] text-gray-400">
									{new Date(msg.timestamp).toLocaleTimeString()}
								</div>
							</div>
						</div>
					))
				)}
				<div ref={messagesEndRef} />
			</div>
			<form onSubmit={handleSend} className="flex gap-2 mt-4">
				<Input
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Type your message..."
					autoComplete="off"
				/>
				<Button type="submit" disabled={!input.trim()}>
					Send
				</Button>
			</form>
		</div>
	);
}
