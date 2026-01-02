// routes/storeProductRoutes.ts
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
} from "../controllers/inventoryController";
import protect from "../middleware/protect";
import restrictTo from "../middleware/restrictTo";
import { upload } from "../controllers/fileController";

const storeProductRouter = express.Router();

// Protect all routes after this middleware
storeProductRouter.use(protect);

// Product Management Routes
storeProductRouter.post(
  "/",
  restrictTo("SUPER-ADMIN", "ADMIN", "MANAGER"),
  upload.array("files", 10),
  create
);

storeProductRouter.put(
  "/:id",
  restrictTo("SUPER-ADMIN", "ADMIN", "MANAGER"),
  upload.array("files", 10),
  update
);

storeProductRouter.delete("/:id", restrictTo("SUPER-ADMIN", "ADMIN"), remove);

storeProductRouter.patch(
  "/:id/restock",
  restrictTo("SUPER-ADMIN", "ADMIN", "MANAGER"),
  restockProduct
);

// Read Access Routes (all authenticated users)
storeProductRouter.get("/", getAll);
storeProductRouter.get("/:id", getById);
storeProductRouter.get("/:id/stock-movement", getStockMovement);

// Sales Routes
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

// Reports Routes
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

// Inventory Management Routes
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
