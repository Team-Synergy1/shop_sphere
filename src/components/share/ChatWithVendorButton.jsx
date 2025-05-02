"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { toast } from "sonner";

export default function ChatWithVendorButton({
	vendorId,
	vendorName,
	className,
}) {
	const { data: session } = useSession();
	const router = useRouter();

	const [loading, setLoading] = useState(false);

	const handleChatWithVendor = async () => {
		// Redirect to login if not authenticated
		if (!session?.user) {
			router.push(
				`/login?callbackUrl=${encodeURIComponent(window.location.href)}`
			);
			return;
		}

		try {
			setLoading(true);

			// Create or get existing chat with this vendor
			const response = await axios.post("/api/chat", {
				participantId: vendorId,
			});

			// Redirect to the chat page
			router.push(`/chat/${response.data.chatId}`);
		} catch (error) {
			console.error("Error starting chat with vendor:", error);
			toast.error("Could not start chat with vendor. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	return (
		<Button
			onClick={handleChatWithVendor}
			variant="outline"
			className={className}
			disabled={loading}
		>
			<MessageSquare className="mr-2 h-4 w-4" />
			{loading ? "Loading..." : `Chat with ${vendorName || "Vendor"}`}
		</Button>
	);
}
