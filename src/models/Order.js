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
		totalAmount: {
			type: Number,
			required: true,
		},
		shippingAddress: {
			street: { type: String, required: true },
			city: { type: String, required: true },
			state: { type: String, required: true },
			postalCode: { type: String, required: true },
			country: { type: String, required: true },
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
