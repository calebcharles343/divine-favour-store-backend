// models/StoreProductModel.ts
import mongoose, { Document, Schema } from "mongoose";
import {
  ProductCategory,
  MeasurementType,
  ContainerSize,
} from "../types/storeTypes";

export interface IStoreProduct extends Document {
  name: string;
  description?: string;
  category: ProductCategory;
  measurementType: MeasurementType;
  containerSize?: ContainerSize; // For vegetables and grains
  pricePerUnit: number;
  costPrice: number;
  currentStock: number;
  minStockLevel: number;
  supplier?: string;
  barcode?: string;
  isActive: boolean;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const storeProductSchema = new Schema<IStoreProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true, // Add text index here
    },
    description: {
      type: String,
      trim: true,
    },
    category: {
      type: String,
      enum: ["protein", "vegetable", "grain", "spice", "other"],
      required: true,
      index: true,
    },
    measurementType: {
      type: String,
      enum: ["scale", "container"],
      required: true,
    },
    containerSize: {
      type: String,
      enum: ["small", "medium", "large"],
      required: function (this: IStoreProduct) {
        return this.measurementType === "container";
      },
    },
    pricePerUnit: {
      type: Number,
      required: true,
      min: 0,
    },
    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    currentStock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    minStockLevel: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    supplier: {
      type: String,
      trim: true,
    },
    barcode: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for search functionality
storeProductSchema.index(
  { name: "text", description: "text" },
  { weights: { name: 3, description: 1 } } // Name is more important than description
);

// Create compound index for category and active status
storeProductSchema.index({ category: 1, isActive: 1 });

export default mongoose.model<IStoreProduct>(
  "StoreProduct",
  storeProductSchema
);
