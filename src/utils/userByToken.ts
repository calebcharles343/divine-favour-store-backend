import { Request, Response } from "express";

import handleResponse from "./handleResponse";
import { protect } from "../services/authService";
// import { getUserByIdService } from "../services/authService";

const userByToken = async (req: Request, res: Response) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return handleResponse(res, 401, "Invalid Token");
  }

  const currentUser = await protect(token);

  if (!currentUser) {
    return handleResponse(res, 401, "station no longer exists");
  }

  return currentUser;
};

export default userByToken;
