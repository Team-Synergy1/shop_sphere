import mongoose from "mongoose";

const vendorPaymentSchema = new mongoose.Schema(
	{
		vendor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		bankAccountName: {
			type: String,
			required: true,
		},
		bankAccountNumber: {
			type: String,
			required: true,
		},
		bankName: {
			type: String,
			required: true,
		},
		branchName: {
			type: String,
			required: true,
		},
		routingNumber: {
			type: String,
			required: true,
		},
		paypalEmail: String,
	},
	{
		timestamps: true,
	}
);

const transactionSchema = new mongoose.Schema(
	{
		vendor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		type: {
			type: String,
			enum: ["payout", "earning"],
			required: true,
		},
		amount: {
			type: Number,
			required: true,
		},
		description: {
			type: String,
			required: true,
		},
		status: {
			type: String,
			enum: ["pending", "completed", "failed"],
			default: "pending",
		},
		date: {
			type: Date,
			default: Date.now,
		},
		reference: {
			type: String,
		},
		order: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Order",
		},
	},
	{
		timestamps: true,
	}
);

export const VendorPayment =
	mongoose.models.VendorPayment ||
	mongoose.model("VendorPayment", vendorPaymentSchema);
export const Transaction =
	mongoose.models.Transaction ||
	mongoose.model("Transaction", transactionSchema);
