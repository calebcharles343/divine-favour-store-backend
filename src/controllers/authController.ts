// controllers/authController.ts
import { Request, Response } from "express";
import { register, login, updatePassword } from "../services/authService";
import { generateToken } from "../utils/jwtUtils";
import catchAsync from "../utils/catchAsync";
import handleResponse from "../utils/handleResponse";
import {
  userRegisterSchema,
  userLoginSchema,
  updatePasswordSchema,
  validate,
} from "../utils/validationSchemas";

const signup = catchAsync(async (req: Request, res: Response) => {
  const validatedData = validate(userRegisterSchema, req.body);

  const newUser = await register(validatedData);
  const token = generateToken(newUser._id.toString());

  handleResponse(res, 201, "User registered successfully", {
    user: newUser,
    token,
  });
});

const signin = catchAsync(async (req: Request, res: Response) => {
  const validatedData = validate(userLoginSchema, req.body);
  const { email, password } = validatedData;

  const user = await login(email, password);
  const token = generateToken(user._id.toString());

  handleResponse(res, 200, "Login successful", {
    user,
    token,
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return handleResponse(res, 401, "User not authenticated");
  }

  handleResponse(res, 200, "User data retrieved successfully", {
    user: req.user,
  });
});

const updateMyPassword = catchAsync(async (req: Request, res: Response) => {
  if (!req.user) {
    return handleResponse(res, 401, "User not authenticated");
  }

  const validatedData = validate(updatePasswordSchema, req.body);
  const { currentPassword, newPassword } = validatedData;

  const user = await updatePassword(
    req.user._id.toString(),
    currentPassword,
    newPassword
  );

  const token = generateToken(user._id.toString());

  handleResponse(res, 200, "Password updated successfully", {
    user,
    token,
  });
});

export { signup, signin, getMe, updateMyPassword };
