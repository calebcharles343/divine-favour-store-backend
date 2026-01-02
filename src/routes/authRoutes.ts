// routes/authRoutes.ts
import express from "express";
import {
  signup,
  signin,
  getMe,
  updateMyPassword,
} from "../controllers/authController";
import protect from "../middleware/protect";

const authRouter = express.Router();

// Public routes
authRouter.post("/signup", signup);
authRouter.post("/signin", signin);

// Protected routes (require authentication)
authRouter.use(protect);

authRouter.get("/me", getMe);
authRouter.patch("/update-password", updateMyPassword);

export default authRouter;
