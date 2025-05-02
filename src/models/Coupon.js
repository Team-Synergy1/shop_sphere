import mongoose from "mongoose";

const couponSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			required: true,
			unique: true,
			uppercase: true,
			trim: true,
		},
		discountType: {
			type: String,
			required: true,
			enum: ["percentage", "fixed"],
			default: "percentage",
		},
		discountValue: {
			type: Number,
			required: true,
			min: 0,
		},
		minPurchase: {
			type: Number,
			default: 0,
			min: 0,
		},
		maxDiscount: {
			type: Number,
			min: 0,
		},
		startDate: {
			type: Date,
			default: Date.now,
		},
		endDate: {
			type: Date,
			required: true,
		},
		usageLimit: {
			type: Number,
			min: 0,
		},
		currentUsage: {
			type: Number,
			default: 0,
			min: 0,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		description: {
			type: String,
			trim: true,
		},
		appliesTo: {
			type: String,
			enum: ["all", "products", "categories"],
			default: "all",
		},
		applicationIds: [
			{
				type: mongoose.Schema.Types.ObjectId,
				refPath: "appliesTo",
			},
		],
	},
	{ timestamps: true }
);

// Add a method to check if a coupon is valid
couponSchema.methods.isValid = function () {
	const now = new Date();
	const startDate = new Date(this.startDate);
	const endDate = new Date(this.endDate);

	// Check if coupon is active
	if (!this.isActive) return false;

	// Check date validity
	if (now < startDate || now > endDate) return false;

	// Check if usage limit reached
	if (this.usageLimit && this.currentUsage >= this.usageLimit) return false;

	return true;
};

// Add a method to apply discount to a cart total
couponSchema.methods.applyDiscount = function (subtotal) {
	// Check if minimum purchase requirement is met
	if (subtotal < this.minPurchase) {
		return {
			discountApplied: false,
			discountAmount: 0,
			error: `Minimum purchase amount of ${this.minPurchase} required`,
		};
	}

	let discountAmount = 0;

	if (this.discountType === "percentage") {
		discountAmount = (subtotal * this.discountValue) / 100;

		// Apply max discount limit if set
		if (this.maxDiscount && discountAmount > this.maxDiscount) {
			discountAmount = this.maxDiscount;
		}
	} else {
		// fixed amount
		discountAmount = this.discountValue;

		// Don't allow discount greater than cart total
		if (discountAmount > subtotal) {
			discountAmount = subtotal;
		}
	}

	return {
		discountApplied: true,
		discountAmount,
		discountedTotal: subtotal - discountAmount,
	};
};

// Get a discount description string
couponSchema.methods.getDiscountDescription = function () {
	if (this.discountType === "percentage") {
		return `${this.discountValue}% off`;
	} else {
		return `৳${this.discountValue} off`;
	}
};

// Create models conditionally to prevent NextJS hot-reload issues
const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", couponSchema);

export default Coupon;
