import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(request) {
	try {
		const { searchParams } = new URL(request.url);
		const sessionId = searchParams.get("session_id");

		if (!sessionId) {
			return NextResponse.json(
				{ error: "Session ID is required" },
				{ status: 400 }
			);
		}

		const session = await stripe.checkout.sessions.retrieve(sessionId);

		if (session.payment_status !== "paid") {
			return NextResponse.json(
				{ error: "Payment not completed" },
				{ status: 400 }
			);
		}

		return NextResponse.json({
			success: true,
			session,
		});
	} catch (error) {
		console.error("Error verifying Stripe session:", error);
		return NextResponse.json(
			{ error: "Failed to verify payment" },
			{ status: 500 }
		);
	}
}
