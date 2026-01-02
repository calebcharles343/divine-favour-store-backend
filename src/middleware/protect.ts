// middleware/protect.ts
import { Request, Response, NextFunction } from "express";
import { protect as authProtect } from "../services/authService";
import handleResponse from "../utils/handleResponse";
import { IUser } from "../models/UserModel";

// Define a custom interface that extends Express Request
interface AuthenticatedRequest extends Request {
  user?: IUser;
}

const protect = async (req: Request, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return handleResponse(
      res,
      401,
      "You are not logged in! Please log in to get access."
    );
  }

  try {
    const currentUser = await authProtect(token);

    // Type assertion to set user property
    (req as AuthenticatedRequest).user = currentUser;

    next();
  } catch (error) {
    return handleResponse(res, 401, "Invalid token or user not found");
  }
};

export default protect;
