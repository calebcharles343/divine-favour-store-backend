// controllers/inventoryController.ts
import { Request, Response } from "express";
import inventoryService from "../services/inventoryService";
import catchAsync from "../utils/catchAsync";
import handleResponse from "../utils/handleResponse";

// Get low stock items
const getLowStock = catchAsync(async (req: Request, res: Response) => {
  const lowStockItems = await inventoryService.checkLowStock();

  handleResponse(
    res,
    200,
    "Low stock items fetched successfully",
    lowStockItems
  );
});

// Get out of stock items
const getOutOfStock = catchAsync(async (req: Request, res: Response) => {
  const outOfStockItems = await inventoryService.getOutOfStock();

  handleResponse(
    res,
    200,
    "Out of stock items fetched successfully",
    outOfStockItems
  );
});

// Bulk update stock levels
const bulkUpdateStock = catchAsync(async (req: Request, res: Response) => {
  const { updates } = req.body;

  if (!Array.isArray(updates) || updates.length === 0) {
    return handleResponse(res, 400, "Updates array is required");
  }

  await inventoryService.updateStockLevels(updates);

  handleResponse(res, 200, "Stock levels updated successfully");
});

export { getLowStock, getOutOfStock, bulkUpdateStock };
