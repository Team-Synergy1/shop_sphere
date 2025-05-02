import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
	product: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Product",
		required: true,
	},
	name: {
		type: String,
		required: true,
	},
	price: {
		type: Number,
		required: true,
	},
	quantity: {
		type: Number,
		required: true,
		min: 1,
	},
	subtotal: {
		type: Number,
		required: true,
	},
});

const CouponDetailsSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			required: true,
		},
		discountType: {
			type: String,
			enum: ["percentage", "fixed"],
			required: true,
		},
		discountValue: {
			type: Number,
			required: true,
		},
		discountAmount: {
			type: Number,
			required: true,
		},
	},
	{ _id: false }
);

const OrderSchema = new mongoose.Schema(
	{
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		orderNumber: {
			type: String,
			required: true,
			unique: true,
		},
		items: [OrderItemSchema],
		subtotalAmount: {
			type: Number,
			required: true,
		},
		discountAmount: {
			type: Number,
			default: 0,
		},
		totalAmount: {
			type: Number,
			required: true,
		},
		coupon: CouponDetailsSchema,
		shippingAddress: {
			street: { type: String },
			city: { type: String },
			state: { type: String },
			postalCode: { type: String },
			country: { type: String },
		},
		paymentMethod: {
			type: String,
			enum: ["cod", "card"],
			required: true,
		},
		paymentStatus: {
			type: String,
			enum: ["pending", "paid", "failed"],
			default: "pending",
		},
		status: {
			type: String,
			enum: ["processing", "shipped", "delivered", "cancelled"],
			default: "processing",
		},
	},
	{ timestamps: true }
);

// Check if model already exists to prevent overwriting
const Order = mongoose.models.Order || mongoose.model("Order", OrderSchema);

export default Order;
