import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
    name: { type: String,  required: true},
    category: { type: String, required: true},
    subcategory: { type: String,},
    price: { type: Number, required: true},
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    description: { type: String, },
    stock: { type: Number, required: true},
    inStock: { type: Boolean, default: true },
    shipping: { type: String, default: "Standard shipping" },
    delivery: { type: String, default: "3-5 business days" },
    colors: { type: [String], default: [] },
    features: { type: [String], default: [] },
    specs: { type: String, default: [] },
    images: { type: [String], default: [] },
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
