import mongoose from "mongoose";

const AddressSchema = new mongoose.Schema(
	{
		street: {
			type: String,
			required: true,
		},
		city: {
			type: String,
			required: true,
		},
		state: {
			type: String,
			required: true,
		},
		postalCode: {
			type: String,
			required: true,
		},
		country: {
			type: String,
			required: true,
		},
		isDefault: {
			type: Boolean,
			default: false,
		},
	},
	{ _id: true, timestamps: true }
);

const UserSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Please provide a name"],
	},
	email: {
		type: String,
		required: [true, "Please provide an email"],
		unique: true,
		match: [
			/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
			"Please fill a valid email address",
		],
	},
	password: {
		type: String,
		required: [true, "Please provide a password"],
		minlength: 6,
	},
	addresses: [AddressSchema],
	role: {
		type: String,
		enum: ["user", "admin", "vendor"],
		default: "user",
	},
	image: {
		type: String,
		default: null,
	},
	loginAttempts: {
		type: Number,
		default: 0,
	},
	lockUntil: {
		type: Date,
		default: null,
	},
	resetPasswordToken: String,
	resetPasswordExpire: Date,
	createdAt: {
		type: Date,
		default: Date.now,
	},
	cart: {
		type: [Object],
		default: [],
	},
	wishlist: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product", // Assuming you have a Product model
		},
	],
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

export default User;
