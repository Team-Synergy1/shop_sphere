import mongoose from "mongoose";

const comparisonSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false // Allow anonymous comparisons
  },
  sessionId: {
    type: String,
    required: false
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400 // Automatically delete after 24 hours for anonymous users
  }
});

const Comparison = mongoose.models.Comparison || mongoose.model("Comparison", comparisonSchema);

export default Comparison;
