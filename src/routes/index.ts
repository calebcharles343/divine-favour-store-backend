// routes/index.ts
import express from "express";
import authRouter from "./authRoutes";
import storeProductRouter from "./storeProductRoutes";
import salesRouter from "./salesRoutes";
// import fileRouter from "./fileRoutes"; // If you create file routes

const router = express.Router();

// Public routes
router.use("/auth", authRouter);

// Protected routes
router.use("/store-products", storeProductRouter);
router.use("/store-products/reports", storeProductRouter);
router.use("/sales", salesRouter);

// File routes (optional - if you need separate file endpoints)
// router.use("/files", fileRouter);

// Health check route (public)
router.get("/health", (req, res) => {
  res.status(200).json({
    status: "success",
    message: "Nigerian Store API is running healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

// API documentation route (public)
router.get("/", (req, res) => {
  res.json({
    name: "Nigerian Store API",
    description: "A simple bookkeeping system for Nigerian stores",
    version: "1.0.0",
    endpoints: {
      auth: {
        signup: "POST /api/v1/auth/signup",
        signin: "POST /api/v1/auth/signin",
        me: "GET /api/v1/auth/me (protected)",
      },
      products: {
        getAll: "GET /api/v1/store-products",
        create: "POST /api/v1/store-products (admin/manager)",
        getOne: "GET /api/v1/store-products/:id",
        update: "PUT /api/v1/store-products/:id (admin/manager)",
        delete: "DELETE /api/v1/store-products/:id (admin)",
      },
      sales: {
        record: "POST /api/v1/store-products/sales/record",
        stats: "GET /api/v1/store-products/sales/stats",
      },
      reports: {
        profitLoss: "GET /api/v1/store-products/reports/profit-loss",
        inventory: "GET /api/v1/store-products/reports/inventory",
        bestSellers: "GET /api/v1/store-products/reports/best-sellers",
      },
    },
  });
});

export default router;
