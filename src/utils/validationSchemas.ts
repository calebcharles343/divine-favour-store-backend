// utils/validationSchemas.ts
import Joi from "joi";
import {
  ProductCategory,
  MeasurementType,
  ContainerSize,
  PaymentMethod,
} from "../types/storeTypes";

// User Validation
export const userRegisterSchema = Joi.object({
  firstName: Joi.string().min(2).max(50).required(),
  lastName: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string()
    .valid("SUPER-ADMIN", "ADMIN", "MANAGER", "STAFF", "CUSTOMER")
    .default("STAFF"),
  position: Joi.string().max(100),
  phone: Joi.string().pattern(/^[0-9]{10,15}$/),
});

export const userLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const updatePasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().min(6).required(),
});

// Product Validation
export const productCreateSchema = Joi.object({
  name: Joi.string().min(2).max(200).required(),
  description: Joi.string().max(1000),
  category: Joi.string()
    .valid(
      ...Object.values(["protein", "vegetable", "grain", "spice", "other"])
    )
    .required(),
  measurementType: Joi.string().valid("scale", "container").required(),
  containerSize: Joi.when("measurementType", {
    is: "container",
    then: Joi.string().valid("small", "medium", "large").required(),
    otherwise: Joi.forbidden(),
  }),
  pricePerUnit: Joi.number().min(0).required(),
  costPrice: Joi.number().min(0).required(),
  currentStock: Joi.number().min(0).default(0),
  minStockLevel: Joi.number().min(0).default(0),
  supplier: Joi.string().max(200),
  barcode: Joi.string().max(100),
  isActive: Joi.boolean().default(true),
});

export const productUpdateSchema = Joi.object({
  name: Joi.string().min(2).max(200),
  description: Joi.string().max(1000),
  category: Joi.string().valid(
    "protein",
    "vegetable",
    "grain",
    "spice",
    "other"
  ),
  measurementType: Joi.string().valid("scale", "container"),
  containerSize: Joi.when("measurementType", {
    is: "container",
    then: Joi.string().valid("small", "medium", "large"),
    otherwise: Joi.forbidden(),
  }),
  pricePerUnit: Joi.number().min(0),
  costPrice: Joi.number().min(0),
  currentStock: Joi.number().min(0),
  minStockLevel: Joi.number().min(0),
  supplier: Joi.string().max(200),
  barcode: Joi.string().max(100),
  isActive: Joi.boolean(),
}).min(1);

// Sales Validation
export const salesRecordSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().hex().length(24).required(),
        quantity: Joi.number().min(0.01).required(),
      })
    )
    .min(1)
    .required(),
  paymentMethod: Joi.string()
    .valid("cash", "transfer", "card", "pos", "credit")
    .required(),
  customerName: Joi.string().max(100),
  customerPhone: Joi.string().pattern(/^[0-9]{10,15}$/),
});

// File Validation
export const fileUploadSchema = Joi.object({
  modelName: Joi.string().required(),
  documentId: Joi.string().hex().length(24).required(),
  fieldName: Joi.string(),
});

// Query Validation
export const productQuerySchema = Joi.object({
  search: Joi.string(),
  sort: Joi.string(),
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  category: Joi.string().valid(
    "protein",
    "vegetable",
    "grain",
    "spice",
    "other"
  ),
  measurementType: Joi.string().valid("scale", "container"),
  lowStock: Joi.string().valid("true", "false"),
});

export const salesStatsSchema = Joi.object({
  period: Joi.string()
    .valid("daily", "weekly", "monthly", "yearly")
    .default("weekly"),
});

export const profitLossSchema = Joi.object({
  startDate: Joi.date().required(),
  endDate: Joi.date().required().greater(Joi.ref("startDate")),
});

// Inventory Validation
export const restockSchema = Joi.object({
  quantity: Joi.number().min(1).required(),
  newCostPrice: Joi.number().min(0),
  newPricePerUnit: Joi.number().min(0),
});

export const validate = (schema: Joi.Schema, data: any) => {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    throw new Error(`Validation failed: ${errors.join(", ")}`);
  }

  return value;
};
