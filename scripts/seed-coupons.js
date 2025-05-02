import { connectDB } from "../src/lib/db";
import Coupon from "../src/models/Coupon";
import mongoose from "mongoose";

// Sample coupon data
const sampleCoupons = [
	{
		code: "WELCOME25",
		discountType: "percentage",
		discountValue: 25,
		minPurchase: 1000,
		maxDiscount: 500,
		startDate: new Date(),
		endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
		isActive: true,
		description: "Welcome offer: 25% off your first purchase",
	},
	{
		code: "SUMMER2025",
		discountType: "percentage",
		discountValue: 15,
		minPurchase: 500,
		maxDiscount: 300,
		startDate: new Date(),
		endDate: new Date(new Date().setMonth(new Date().getMonth() + 3)),
		isActive: true,
		description: "Summer Sale: 15% off all purchases",
	},
	{
		code: "FLAT200",
		discountType: "fixed",
		discountValue: 200,
		minPurchase: 1000,
		startDate: new Date(),
		endDate: new Date(new Date().setMonth(new Date().getMonth() + 2)),
		isActive: true,
		description: "Flat ৳200 off on orders above ৳1000",
	},
	{
		code: "FLASH50",
		discountType: "percentage",
		discountValue: 50,
		minPurchase: 2000,
		maxDiscount: 1000,
		startDate: new Date(),
		endDate: new Date(new Date().setDate(new Date().getDate() + 3)),
		isActive: true,
		usageLimit: 100,
		description: "Flash Sale: 50% off (max ৳1000) for limited time",
	},
	{
		code: "SPECIALOFFER",
		discountType: "percentage",
		discountValue: 20,
		minPurchase: 0,
		startDate: new Date(),
		endDate: new Date(new Date().setMonth(new Date().getMonth() + 6)),
		isActive: true,
		description: "Special offer: 20% off any purchase",
	},
];

async function seedCoupons() {
	try {
		await connectDB();
		console.log("Connected to MongoDB");

		// Delete existing coupons (optional)
		await Coupon.deleteMany({});
		console.log("Deleted existing coupons");

		// Insert sample coupons
		const result = await Coupon.insertMany(sampleCoupons);
		console.log(`Successfully seeded ${result.length} coupons`);

		// Log the coupons that were created
		result.forEach((coupon) => {
			console.log(`Created coupon: ${coupon.code} - ${coupon.description}`);
		});

		// Close the MongoDB connection
		await mongoose.connection.close();
		console.log("MongoDB connection closed");

		process.exit(0);
	} catch (error) {
		console.error("Error seeding coupons:", error);
		process.exit(1);
	}
}

// Run the seeder
seedCoupons();
