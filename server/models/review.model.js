import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },

    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Products",
      required: true,
    },

    // The delivered order this review was written for (enforces the
    // "review only after delivery" rule and lets My Orders show it back).
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Orders",
      default: null,
    },

    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    title: { type: String, default: "", trim: true },
    comment: { type: String, default: "", trim: true },
    name: { type: String, default: "", trim: true },
    city: { type: String, default: "", trim: true },

    verified: { type: Boolean, default: true },
    helpful: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false }
);

// One review per customer per product — re-submitting updates the existing one.
reviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.model("Reviews", reviewSchema);
