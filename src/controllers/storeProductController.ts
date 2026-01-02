// controllers/storeProductController.ts
import { Request, Response } from "express";
import {
  getStoreProducts,
  createStoreProduct,
  getStoreProductById,
  updateStoreProduct,
  deleteStoreProduct,
  recordSale,
  getSalesStats,
  getProfitLossReport,
} from "../services/storeProductService";
import inventoryService from "../services/inventoryService";
import catchAsync from "../utils/catchAsync";
import handleResponse from "../utils/handleResponse";
import {
  productCreateSchema,
  productUpdateSchema,
  salesRecordSchema,
  salesStatsSchema,
  profitLossSchema,
  productQuerySchema,
  restockSchema,
  validate,
} from "../utils/validationSchemas";
import { IUser } from "../models/UserModel";

// Define authenticated request interface
interface AuthenticatedRequest extends Request {
  user: IUser;
  files?: Express.Multer.File[];
}

// Get all store products
const getAll = catchAsync(async (req: Request, res: Response) => {
  const validatedQuery = validate(productQuerySchema, req.query);
  const currentUser = (req as AuthenticatedRequest).user;

  const storeProducts = await getStoreProducts(validatedQuery, currentUser);

  handleResponse(
    res,
    200,
    "Store products fetched successfully",
    storeProducts
  );
});

// Create a new store product
const create = catchAsync(async (req: Request, res: Response) => {
  const validatedData = validate(productCreateSchema, req.body);
  const files = (req as AuthenticatedRequest).files || [];
  const currentUser = (req as AuthenticatedRequest).user;

  const storeProduct = await createStoreProduct(
    validatedData,
    files as Express.Multer.File[],
    currentUser
  );

  handleResponse(res, 201, "Store product created successfully", storeProduct);
});

// Get a single store product by ID
const getById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const storeProduct = await getStoreProductById(id);

  handleResponse(res, 200, "Store product fetched successfully", storeProduct);
});

// Update a store product
const update = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = validate(productUpdateSchema, req.body);
  const files = (req as AuthenticatedRequest).files || [];
  const currentUser = (req as AuthenticatedRequest).user;

  const storeProduct = await updateStoreProduct(
    id,
    validatedData,
    files as Express.Multer.File[],
    currentUser
  );

  handleResponse(res, 200, "Store product updated successfully", storeProduct);
});

// Delete a store product (soft delete)
const remove = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const storeProduct = await deleteStoreProduct(id);

  handleResponse(res, 200, "Store product deleted successfully", storeProduct);
});

// Record a sale
const recordSales = catchAsync(async (req: Request, res: Response) => {
  const validatedData = validate(salesRecordSchema, req.body);
  const currentUser = (req as AuthenticatedRequest).user;

  const salesTransaction = await recordSale(validatedData, currentUser);

  handleResponse(res, 201, "Sale recorded successfully", salesTransaction);
});

// Get sales statistics
const getSalesStatistics = catchAsync(async (req: Request, res: Response) => {
  const validatedQuery = validate(salesStatsSchema, req.query);
  const currentUser = (req as AuthenticatedRequest).user;

  const stats = await getSalesStats(validatedQuery.period, currentUser);

  handleResponse(res, 200, "Sales statistics fetched successfully", stats);
});

// Get profit and loss report
const getProfitLoss = catchAsync(async (req: Request, res: Response) => {
  const validatedQuery = validate(profitLossSchema, req.query);

  const report = await getProfitLossReport(
    new Date(validatedQuery.startDate),
    new Date(validatedQuery.endDate)
  );

  handleResponse(
    res,
    200,
    "Profit and loss report generated successfully",
    report
  );
});

// Get inventory report
const getInventoryReport = catchAsync(async (req: Request, res: Response) => {
  const report = await inventoryService.getInventoryReport();

  handleResponse(res, 200, "Inventory report generated successfully", report);
});

// Get best selling products
const getBestSellers = catchAsync(async (req: Request, res: Response) => {
  const { limit = "10", period } = req.query;

  const bestSellers = await inventoryService.getBestSellingProducts(
    parseInt(limit as string),
    period as any
  );

  handleResponse(
    res,
    200,
    "Best selling products fetched successfully",
    bestSellers
  );
});

// Restock a product
const restockProduct = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const validatedData = validate(restockSchema, req.body);

  const product = await inventoryService.restockProduct(
    id,
    validatedData.quantity,
    validatedData.newCostPrice,
    validatedData.newPricePerUnit
  );

  handleResponse(res, 200, "Product restocked successfully", product);
});

// Get stock movement history
const getStockMovement = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const { days = "30" } = req.query;

  const movement = await inventoryService.getStockMovement(
    id,
    parseInt(days as string)
  );

  handleResponse(
    res,
    200,
    "Stock movement history fetched successfully",
    movement
  );
});

export {
  getAll,
  create,
  getById,
  update,
  remove,
  recordSales,
  getSalesStatistics,
  getProfitLoss,
  getInventoryReport,
  getBestSellers,
  restockProduct,
  getStockMovement,
};
