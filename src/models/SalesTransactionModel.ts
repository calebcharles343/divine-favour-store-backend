// models/SalesTransactionModel.ts
import mongoose, { Document, Schema } from "mongoose";

export interface ISalesItem {
  product: mongoose.Types.ObjectId;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  measurementType: "scale" | "container";
  containerSize?: "small" | "medium" | "large";
}

export interface ISalesTransaction extends Document {
  transactionId: string;
  items: ISalesItem[];
  totalAmount: number;
  totalCost: number;
  profit: number;
  paymentMethod: "cash" | "transfer" | "card" | "pos" | "credit";
  customerName?: string;
  customerPhone?: string;
  soldBy: mongoose.Types.ObjectId;
  createdAt: Date;
}

const salesItemSchema = new Schema<ISalesItem>({
  product: {
    type: Schema.Types.ObjectId,
    ref: "StoreProduct",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.01,
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  measurementType: {
    type: String,
    enum: ["scale", "container"],
    required: true,
  },
  containerSize: {
    type: String,
    enum: ["small", "medium", "large"],
  },
});

const salesTransactionSchema = new Schema<ISalesTransaction>(
  {
    transactionId: {
      type: String,
      unique: true,
      immutable: true, // 🔒 cannot change after creation
      index: true,
    },
    items: [salesItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalCost: {
      type: Number,
      required: true,
      min: 0,
    },
    profit: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "transfer", "card", "pos", "credit"],
      required: true,
    },
    customerName: {
      type: String,
      trim: true,
    },
    customerPhone: {
      type: String,
      trim: true,
    },
    soldBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Auto-generate transactionId ONLY once
 * Format: TXN-YYYYMMDD-HHMMSS-RND
 */
salesTransactionSchema.pre("validate", function (next) {
  if (!this.transactionId) {
    const date = new Date();
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const mi = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    const rnd = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");

    this.transactionId = `TXN-${yyyy}${mm}${dd}-${hh}${mi}${ss}-${rnd}`;
  }
  next();
});

// Indexes
salesTransactionSchema.index({ createdAt: -1 });
salesTransactionSchema.index({ soldBy: 1 });
salesTransactionSchema.index({ customerPhone: 1 });

export default mongoose.model<ISalesTransaction>(
  "SalesTransaction",
  salesTransactionSchema
);
