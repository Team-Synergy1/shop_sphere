import mongoose from "mongoose";

const WishlistSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product"
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Wishlist = mongoose.models.Wishlist || mongoose.model("Wishlist", WishlistSchema);

export default Wishlist;