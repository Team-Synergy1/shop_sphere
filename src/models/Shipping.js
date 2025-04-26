import mongoose from "mongoose";

const shippingMethodSchema = new mongoose.Schema(
	{
		vendor: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		name: {
			type: String,
			required: true,
		},
		description: String,
		price: {
			type: Number,
			required: true,
			min: 0,
		},
		estimatedDays: {
			type: Number,
			required: true,
			min: 1,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		regions: [
			{
				type: String,
			},
		],
	},
	{
		timestamps: true,
	}
);

const ShippingMethod =
	mongoose.models.ShippingMethod ||
	mongoose.model("ShippingMethod", shippingMethodSchema);
export default ShippingMethod;
