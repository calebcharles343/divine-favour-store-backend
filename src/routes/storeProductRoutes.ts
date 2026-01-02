// routes/storeProductRoutes.ts - FIXED VERSION
import express from "express";
import {
  create,
  getAll,
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
} from "../controllers/storeProductController";
import {
  getLowStock,
  getOutOfStock,
  bulkUpdateStock,
  getExpectedProfit,
} from "../controllers/inventoryController";
import protect from "../middleware/protect";
import restrictTo from "../middleware/restrictTo";
import { upload } from "../controllers/fileController";

const storeProductRouter = express.Router();

// Protect all routes after this middleware
storeProductRouter.use(protect);

// CRUD Routes (in specific order)
storeProductRouter.post(
  "/",
  restrictTo("SUPER-ADMIN", "ADMIN", "MANAGER"),
  upload.array("files", 10),
  create
);

storeProductRouter.get("/", getAll);

storeProductRouter.put(
  "/:id",
  restrictTo("SUPER-ADMIN", "ADMIN", "MANAGER"),
  upload.array("files", 10),
  update
);

storeProductRouter.delete("/:id", restrictTo("SUPER-ADMIN", "ADMIN"), remove);

storeProductRouter.get("/:id", getById);

storeProductRouter.patch(
  "/:id/restock",
  restrictTo("SUPER-ADMIN", "ADMIN", "MANAGER"),
  restockProduct
);

storeProductRouter.get("/:id/stock-movement", getStockMovement);

// SALES ROUTES - Must be before /sales/* routes
storeProductRouter.post(
  "/sales/record",
  restrictTo("SUPER-ADMIN", "ADMIN", "MANAGER", "STAFF"),
  recordSales
);

storeProductRouter.get(
  "/sales/stats",
  restrictTo("SUPER-ADMIN", "ADMIN", "MANAGER"),
  getSalesStatistics
);

// REPORTS ROUTES
storeProductRouter.get(
  "/reports/profit-loss",
  restrictTo("SUPER-ADMIN", "ADMIN", "MANAGER"),
  getProfitLoss
);

storeProductRouter.get(
  "/reports/inventory",
  restrictTo("SUPER-ADMIN", "ADMIN", "MANAGER"),
  getInventoryReport
);

storeProductRouter.get(
  "/reports/best-sellers",
  restrictTo("SUPER-ADMIN", "ADMIN", "MANAGER"),
  getBestSellers
);

storeProductRouter.get(
  "/reports/expected-profit",
  restrictTo("SUPER-ADMIN", "ADMIN", "MANAGER"),
  getExpectedProfit
);

// INVENTORY ROUTES
storeProductRouter.get(
  "/inventory/low-stock",
  restrictTo("SUPER-ADMIN", "ADMIN", "MANAGER"),
  getLowStock
);

storeProductRouter.get(
  "/inventory/out-of-stock",
  restrictTo("SUPER-ADMIN", "ADMIN", "MANAGER"),
  getOutOfStock
);

storeProductRouter.post(
  "/inventory/bulk-update",
  restrictTo("SUPER-ADMIN", "ADMIN", "MANAGER"),
  bulkUpdateStock
);

export default storeProductRouter;
