// controllers/salesController.ts - COMPLETE VERSION
import { Request, Response } from "express";
import SalesTransaction from "../models/SalesTransactionModel";
import catchAsync from "../utils/catchAsync";
import handleResponse from "../utils/handleResponse";
import buildQuery from "../utils/buildQuery";
import buildSortQuery from "../utils/buildSortQuery";
import paginate from "../utils/paginate";

export const getAllSales = catchAsync(async (req: Request, res: Response) => {
  const {
    search,
    sort = "-createdAt",
    page = 1,
    limit = 20,
    startDate,
    endDate,
    paymentMethod,
    customerName,
  } = req.query;

  // Build query
  let query: any = {};

  // Text search
  if (search) {
    const searchTerms = (search as string).trim().split(/\s+/);
    const searchFields = ["transactionId", "customerName", "customerPhone"];
    const searchQuery = buildQuery(searchTerms, searchFields);
    query = { ...query, ...searchQuery };
  }

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) {
      const start = new Date(startDate as string);
      start.setHours(0, 0, 0, 0);
      query.createdAt.$gte = start;
    }
    if (endDate) {
      const end = new Date(endDate as string);
      end.setHours(23, 59, 59, 999);
      query.createdAt.$lte = end;
    }
  }

  // Payment method filter
  if (paymentMethod) {
    const methods = (paymentMethod as string).split(",");
    query.paymentMethod = { $in: methods };
  }

  // Customer name filter
  if (customerName) {
    query.customerName = { $regex: customerName, $options: "i" };
  }

  const sortQuery = buildSortQuery(sort as string);

  const populateOptions = [
    { path: "soldBy", select: "firstName lastName email" },
    {
      path: "items.product",
      select:
        "name category pricePerUnit costPrice measurementType containerSize",
      match: { isActive: true }, // Only include active products
    },
  ];

  const {
    results: sales,
    total,
    totalPages,
    currentPage,
  } = await paginate(
    SalesTransaction,
    query,
    { page: Number(page), limit: Number(limit) },
    sortQuery,
    populateOptions
  );

  // Format response
  const formattedSales = sales.map((sale: any) => ({
    _id: sale._id,
    transactionId: sale.transactionId,
    items: sale.items.map((item: any) => ({
      product: item.product
        ? {
            _id: item.product._id,
            name: item.product.name,
            category: item.product.category,
            pricePerUnit: item.product.pricePerUnit,
            costPrice: item.product.costPrice,
            measurementType: item.product.measurementType,
            containerSize: item.product.containerSize,
          }
        : null,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      measurementType: item.measurementType,
      containerSize: item.containerSize,
    })),
    totalAmount: sale.totalAmount,
    totalCost: sale.totalCost,
    profit: sale.profit,
    paymentMethod: sale.paymentMethod,
    customerName: sale.customerName,
    customerPhone: sale.customerPhone,
    soldBy: sale.soldBy,
    createdAt: sale.createdAt,
    updatedAt: sale.updatedAt,
  }));

  handleResponse(res, 200, "Sales fetched successfully", {
    sales: formattedSales,
    total,
    totalPages,
    currentPage,
  });
});
