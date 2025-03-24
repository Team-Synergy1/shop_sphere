import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
	name: { type: String, required: true },
	category: { type: String, required: true },
	subcategory: { type: String },
	price: { type: Number, required: true },
	rating: { type: Number },
	reviewCount: { type: Number },
	description: { type: String },
	stock: { type: Number, required: true },
	inStock: { type: Boolean },
	shipping: { type: String },
	delivery: { type: String },
	colors: [{ type: String }],
	features: [{ type: String }],
	specs: { type: mongoose.Schema.Types.Mixed },
	images: [{ type: String }],
	vendor: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User", 
		required: true,
	},
});

const Product =
	mongoose.models.Product || mongoose.model("Product", productSchema);
export default Product;
