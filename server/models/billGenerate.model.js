import mongoose from "mongoose";

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
