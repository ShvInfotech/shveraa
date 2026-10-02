import mongoose from "mongoose"

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
      required: true,
    },
    type: {
      type: String,
      enum: ["forward", "return", "rto"],
      default: "forward"
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },

    waybill: {
      type: String,
      default: "",
    },

    address: {
      addressline: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      country: { type: String, default: "" },
      pincode: { type: String, default: "" },
      phone: { type: String, default: "" },
    },

    items: {
      type: Array,
      default: [],
    },

    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupons",
      default: null,
    },

    discount: {
      type: Number,
      default: 0,
    },

    shippingcharges: {
      type: Number,
      default: 0,
    },

    amount: {
      type: Number,
      required: true,
    },

    totalAmount: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "processing",
        "shipped",
        "out_for_delivery",
        "delivered",
        "cancelled",
      ],
      default: "pending",
    },

    picuprequestId: {
      type: String,
      default: "",
    },

    payment: {
      method: {
        type: String,
        enum: ["razorpay", "cod"],
        default: "razorpay",
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        default: "pending",
      },
      orderId: {
        type: String,
        default: "",
      },
      paymentId: {
        type: String,
        default: "",
      },
    },

    completeAt: {
      type: Date,
      default: null,
    },

    rtoData: {
      type: {
        waybill: String,
        status: String,
      },
      default: null,
    },

    returnData: {
      type: {
        waybill: {type:String},
        status:{ type:String},
        reason: {type: String},
      },
      default: null,
    },

    refundData: {
      type: {
        method: {
          type: String,
          enum: ["razorpay", "cod"],
          default: "razorpay"
        },
        status: {
          type: String,
          enum: ["pending", "refunded", "failed"],
          default: "pending"
        },
        refundId: {
          type: String,
          default: ""
        },
        
        accountDetails: {
          type: {
            accountHolderName: { type: String },
            accountNumber: { type: String },
            ifscCode: { type: String, },
            accountType: { type: String, enum: ["savings", "current"] }
          },
          default: null
        },
        refundedAt:{type: Date, default: null},
      },
      default: null
    }

  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.model("Orders", orderSchema);