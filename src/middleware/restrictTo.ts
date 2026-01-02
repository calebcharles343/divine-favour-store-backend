// middleware/restrictTo.ts
import { Request, Response, NextFunction } from "express";
import handleResponse from "../utils/handleResponse";

const restrictTo = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;

    if (!roles.includes(user.role)) {
      return handleResponse(
        res,
        403,
        "You do not have permission to perform this action"
      );
    }

    next();
  };
};

export default restrictTo;
