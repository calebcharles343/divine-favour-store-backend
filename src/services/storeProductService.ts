// services/storeProductService.ts
import StoreProduct, { IStoreProduct } from "../models/StoreProductModel";
import SalesTransaction from "../models/SalesTransactionModel";
import buildQuery from "../utils/buildQuery";
import buildSortQuery from "../utils/buildSortQuery";
import paginate from "../utils/paginate";
import fileService from "./fileService";
import handleFileUploads from "../utils/handleFileUploads";
import { normalizeId, normalizeFiles } from "../utils/normalizeData";
import { Types } from "mongoose";

const populateOptions = [
  { path: "createdBy", select: "email firstName lastName role position" },
];

// Reusable product validation
const validateProductData = (data: any) => {
  const validatedData = { ...data };

  if (validatedData.measurementType === "scale") {
    validatedData.containerSize = undefined;
  } else if (
    validatedData.measurementType === "container" &&
    !validatedData.containerSize
  ) {
    throw new Error("Container size is required for container-based products");
  }

  // Ensure price and cost are numbers
  if (validatedData.pricePerUnit) {
    validatedData.pricePerUnit = Number(validatedData.pricePerUnit);
  }

  if (validatedData.costPrice) {
    validatedData.costPrice = Number(validatedData.costPrice);
  }

  return validatedData;
};

// Get all store products
const getStoreProducts = async (queryParams: any, currentUser: any) => {
  const {
    search,
    sort,
    page = 1,
    limit = 10,
    category,
    measurementType,
    lowStock,
  } = queryParams;

  const searchFields = [
    "name",
    "description",
    "category",
    "supplier",
    "barcode",
  ];
  const searchTerms = search ? search.trim().split(/\s+/) : [];
  let query = buildQuery(searchTerms, searchFields) as any;

  // Apply filters
  if (category) query.category = category;
  if (measurementType) query.measurementType = measurementType;
  if (lowStock === "true") {
    query.$expr = { $lte: ["$currentStock", "$minStockLevel"] };
  }
  query.isActive = true;

  const sortQuery = buildSortQuery(sort);

  const {
    results: storeProducts,
    total,
    totalPages,
    currentPage,
  } = await paginate(
    StoreProduct,
    query,
    { page, limit },
    sortQuery,
    populateOptions
  );

  // Fetch associated files
  const storeProductsWithFiles = await Promise.all(
    storeProducts.map(async (product: IStoreProduct) => {
      const files = await fileService.getFilesByDocument(
        "StoreProduct",
        product._id.toString()
      );
      return {
        ...product.toJSON(),
        files: normalizeFiles(files),
      };
    })
  );

  return {
    storeProducts: storeProductsWithFiles,
    total,
    totalPages,
    currentPage,
  };
};

// Create a new store product
const createStoreProduct = async (
  data: any,
  files: Express.Multer.File[] = [],
  currentUser: any
) => {
  data.createdBy = currentUser._id;
  const validatedData = validateProductData(data);

  const storeProduct = await StoreProduct.create(validatedData);

  // Handle file uploads if any
  if (files.length > 0) {
    await handleFileUploads({
      files,
      requestId: storeProduct._id.toString(),
      modelName: "StoreProduct",
    });
  }

  return storeProduct;
};

// Get a single store product by ID
const getStoreProductById = async (id: string) => {
  const product = await StoreProduct.findById(id)
    .populate(populateOptions)
    .lean();

  if (!product) {
    throw new Error("Store product not found");
  }

  const files = await fileService.getFilesByDocument("StoreProduct", id);
  return normalizeId({
    ...product,
    files: normalizeFiles(files),
  });
};

// Update a store product
const updateStoreProduct = async (
  id: string,
  data: any,
  files: Express.Multer.File[] = [],
  currentUser: any
) => {
  const validatedData = validateProductData(data);
  const updatedProduct = await StoreProduct.findByIdAndUpdate(
    id,
    validatedData,
    { new: true }
  );

  if (!updatedProduct) {
    throw new Error("Store product not found");
  }

  // Handle file uploads if any
  if (files.length > 0) {
    await handleFileUploads({
      files,
      requestId: updatedProduct._id.toString(),
      modelName: "StoreProduct",
    });
  }

  return updatedProduct;
};

// Delete a store product (soft delete)
const deleteStoreProduct = async (id: string) => {
  const product = await StoreProduct.findById(id);

  if (!product) {
    throw new Error("Store product not found");
  }

  // Delete associated files
  await fileService.deleteFilesByDocument("StoreProduct", id);

  // Soft delete the product
  product.isActive = false;
  return await product.save();
};

// Record a sale - FIXED: Changed item.productId to item.product
const recordSale = async (saleData: any, currentUser: any) => {
  const { items, paymentMethod, customerName, customerPhone } = saleData;

  let totalAmount = 0;
  let totalCost = 0;
  const salesItems = [];

  // Process each item in the sale
  for (const item of items) {
    // Fixed: Use item.product instead of item.productId
    const product = await StoreProduct.findById(item.product);

    if (!product) {
      throw new Error(`Product with ID ${item.product} not found`);
    }

    if (product.currentStock < item.quantity) {
      throw new Error(
        `Insufficient stock for ${product.name}. Available: ${product.currentStock}`
      );
    }

    const unitPrice = product.pricePerUnit;
    const itemTotalPrice = unitPrice * item.quantity;
    const itemCost = product.costPrice * item.quantity;

    totalAmount += itemTotalPrice;
    totalCost += itemCost;

    salesItems.push({
      product: product._id,
      quantity: item.quantity,
      unitPrice,
      totalPrice: itemTotalPrice,
      measurementType: product.measurementType,
      containerSize: product.containerSize,
    });

    // Update product stock
    product.currentStock -= item.quantity;
    await product.save();
  }

  const profit = totalAmount - totalCost;

  const salesTransaction = new SalesTransaction({
    items: salesItems,
    totalAmount,
    totalCost,
    profit,
    paymentMethod,
    customerName,
    customerPhone,
    soldBy: currentUser._id,
  });

  return await salesTransaction.save();
};

// Get sales statistics
const getSalesStats = async (
  period: "daily" | "weekly" | "monthly" | "yearly",
  currentUser: any
) => {
  const now = new Date();
  let startDate = new Date();

  switch (period) {
    case "daily":
      startDate.setHours(0, 0, 0, 0);
      break;
    case "weekly":
      startDate.setDate(now.getDate() - 7);
      break;
    case "monthly":
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "yearly":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 7); // Default to weekly
  }

  const stats = await SalesTransaction.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: null,
        totalSales: { $sum: "$totalAmount" },
        totalCost: { $sum: "$totalCost" },
        totalProfit: { $sum: "$profit" },
        transactionCount: { $sum: 1 },
      },
    },
  ]);

  const lowStockProducts = await StoreProduct.find({
    $expr: { $lte: ["$currentStock", "$minStockLevel"] },
    isActive: true,
  }).select("name currentStock minStockLevel");

  return {
    period,
    totalSales: stats[0]?.totalSales || 0,
    totalCost: stats[0]?.totalCost || 0,
    totalProfit: stats[0]?.totalProfit || 0,
    transactionCount: stats[0]?.transactionCount || 0,
    lowStockProducts,
  };
};

// Get profit and loss report
const getProfitLossReport = async (startDate: Date, endDate: Date) => {
  const report = await SalesTransaction.aggregate([
    { $match: { createdAt: { $gte: startDate, $lte: endDate } } },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: "$totalAmount" },
        totalCostOfGoods: { $sum: "$totalCost" },
        grossProfit: { $sum: "$profit" },
        totalTransactions: { $sum: 1 },
      },
    },
  ]);

  return (
    report[0] || {
      totalRevenue: 0,
      totalCostOfGoods: 0,
      grossProfit: 0,
      totalTransactions: 0,
    }
  );
};

export {
  getStoreProducts,
  createStoreProduct,
  getStoreProductById,
  updateStoreProduct,
  deleteStoreProduct,
  recordSale,
  getSalesStats,
  getProfitLossReport,
};
