// routes/salesRoutes.ts - NEW FILE
import express from "express";
import { getAllSales } from "../controllers/salesController";
import protect from "../middleware/protect";
import restrictTo from "../middleware/restrictTo";

const salesRouter = express.Router();

// Protect all routes
salesRouter.use(protect);

// Get all sales with filters and pagination
salesRouter.get(
  "/",
  restrictTo("SUPER-ADMIN", "ADMIN", "MANAGER"),
  getAllSales
);

export default salesRouter;
