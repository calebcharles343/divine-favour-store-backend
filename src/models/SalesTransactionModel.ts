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
      required: true,
      unique: true,
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

// Generate transaction ID before saving
salesTransactionSchema.pre("save", async function (next) {
  if (!this.transactionId) {
    const date = new Date();
    const timestamp = date.getTime();
    const random = Math.floor(Math.random() * 1000);
    this.transactionId = `TXN-${timestamp}-${random}`;
  }
  next();
});

export default mongoose.model<ISalesTransaction>(
  "SalesTransaction",
  salesTransactionSchema
);
