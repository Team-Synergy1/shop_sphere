import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { connectDB } from "@/lib/db";
import StoreSettings from "@/models/StoreSettings";

export async function GET(request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		if (session.user.role !== "vendor") {
			return NextResponse.json(
				{ error: "Access denied. Vendor privileges required." },
				{ status: 403 }
			);
		}

		await connectDB();

		let settings = await StoreSettings.findOne({ vendor: session.user.id });

		if (!settings) {
			// Create default settings if none exist
			settings = await StoreSettings.create({
				vendor: session.user.id,
				storeName: session.user.name + "'s Store",
				email: session.user.email,
				preferences: {
					minOrderAmount: 0,
					taxRate: 0,
					autoAcceptOrders: true,
					notifyNewOrders: true,
					notifyLowStock: true,
					lowStockThreshold: 5,
					allowReviews: true,
					requireApproval: true,
				},
			});
		}

		// Flatten the response structure to match the frontend expectations
		const flattenedSettings = {
			...settings.toObject(),
			...settings.socialMedia,
			...settings.preferences,
		};
		delete flattenedSettings.socialMedia;
		delete flattenedSettings.preferences;

		return NextResponse.json({
			success: true,
			settings: flattenedSettings,
		});
	} catch (error) {
		console.error("Error fetching store settings:", error);
		return NextResponse.json(
			{ error: "Failed to fetch store settings" },
			{ status: 500 }
		);
	}
}

export async function PATCH(request) {
	try {
		const session = await getServerSession(authOptions);
		if (!session?.user) {
			return NextResponse.json(
				{ error: "Authentication required" },
				{ status: 401 }
			);
		}

		if (session.user.role !== "vendor") {
			return NextResponse.json(
				{ error: "Access denied. Vendor privileges required." },
				{ status: 403 }
			);
		}

		await connectDB();
		const data = await request.json();

		// Restructure data to match the schema
		const updateData = {
			storeName: data.storeName,
			description: data.description,
			logo: data.logo,
			banner: data.banner,
			address: data.address,
			city: data.city,
			state: data.state,
			postalCode: data.postalCode,
			country: data.country,
			phone: data.phone,
			email: data.email,
			website: data.website,
			socialMedia: {
				facebook: data.facebook,
				instagram: data.instagram,
				twitter: data.twitter,
			},
			preferences: {
				minOrderAmount: parseFloat(data.minOrderAmount) || 0,
				taxRate: parseFloat(data.taxRate) || 0,
				autoAcceptOrders: data.autoAcceptOrders,
				notifyNewOrders: data.notifyNewOrders,
				notifyLowStock: data.notifyLowStock,
				lowStockThreshold: parseInt(data.lowStockThreshold) || 5,
				allowReviews: data.allowReviews,
				requireApproval: data.requireApproval,
			},
		};

		const settings = await StoreSettings.findOneAndUpdate(
			{ vendor: session.user.id },
			{ $set: updateData },
			{ new: true, upsert: true }
		);

		// Flatten the response structure to match the frontend expectations
		const flattenedSettings = {
			...settings.toObject(),
			...settings.socialMedia,
			...settings.preferences,
		};
		delete flattenedSettings.socialMedia;
		delete flattenedSettings.preferences;

		return NextResponse.json({
			success: true,
			settings: flattenedSettings,
		});
	} catch (error) {
		console.error("Error updating store settings:", error);
		return NextResponse.json(
			{ error: "Failed to update store settings" },
			{ status: 500 }
		);
	}
}
