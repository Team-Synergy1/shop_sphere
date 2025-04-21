import mongoose from "mongoose";

const dealSchema = new mongoose.Schema(
	{
		code: {
			type: String,
			required: true,
			unique: true,
		},
		discount: {
			type: String,
			required: true,
		},
		limit: {
			type: String,
			required: true,
		},
		progress: {
			type: Number,
			required: true,
			min: 0,
			max: 100,
		},
		startTime: {
			type: Date,
			required: true,
		},
		endTime: {
			type: Date,
			required: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
	},
	{ timestamps: true }
);

const Deal = mongoose.models.Deal || mongoose.model("Deal", dealSchema);
export default Deal;
