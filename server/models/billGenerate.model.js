import mongoose from "mongoose";

const billItemSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      default: 1,
      min: 1,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  { _id: false }
);

const billGenerateSchema = new mongoose.Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      trim: true,
      default: "",
    },
    customerPhone: {
      type: String,
      required: true,
      trim: true,
    },
    customerAddress: {
      type: String,
      required: true,
      trim: true,
    },
    // Multiple Products support
    items: {
      type: [billItemSchema],
      default: [],
    },
    // Primary / Summary product name for backward compatibility
    productName: {
      type: String,
      required: true,
      trim: true,
    },
    // Price / Subtotal
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      default: 0,
      min: 0,
    },
    discountType: {
      type: String,
      enum: ["fixed", "percentage"],
      default: "fixed",
    },
    discountValue: {
      type: Number,
      default: 0,
      min: 0,
    },
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    shippingCharge: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    hallmarkNumber: {
      type: String,
      default: "123456789123456789",
      trim: true,
    },
    status: {
      type: String,
      enum: ["generated", "paid", "cancelled"],
      default: "generated",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Helpful index for sorting and search
billGenerateSchema.index({ createdAt: -1 });
billGenerateSchema.index({ customerName: "text", productName: "text", invoiceNumber: "text" });

const BillGenerate =
  mongoose.models.BillGenerate ||
  mongoose.model("BillGenerate", billGenerateSchema);

export default BillGenerate;
