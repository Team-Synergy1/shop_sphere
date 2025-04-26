import mongoose from "mongoose";

const storeSettingsSchema = new mongoose.Schema(
	{
		vendor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
		},
		storeName: {
			type: String,
			required: true,
		},
		description: String,
		logo: String,
		banner: String,
		address: String,
		city: String,
		state: String,
		postalCode: String,
		country: String,
		phone: String,
		email: {
			type: String,
			required: true,
		},
		website: String,
		socialMedia: {
			facebook: String,
			instagram: String,
			twitter: String,
		},
		preferences: {
			minOrderAmount: {
				type: Number,
				default: 0,
			},
			taxRate: {
				type: Number,
				default: 0,
			},
			autoAcceptOrders: {
				type: Boolean,
				default: true,
			},
			notifyNewOrders: {
				type: Boolean,
				default: true,
			},
			notifyLowStock: {
				type: Boolean,
				default: true,
			},
			lowStockThreshold: {
				type: Number,
				default: 5,
			},
			allowReviews: {
				type: Boolean,
				default: true,
			},
			requireApproval: {
				type: Boolean,
				default: true,
			},
		},
	},
	{
		timestamps: true,
	}
);

const StoreSettings =
	mongoose.models.StoreSettings ||
	mongoose.model("StoreSettings", storeSettingsSchema);
export default StoreSettings;
