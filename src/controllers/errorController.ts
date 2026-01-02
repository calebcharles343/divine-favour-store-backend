// controllers/errorController.ts
import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";

// Define error types
interface MongoCastError extends Error {
  path: string;
  value: any;
}

interface MongoDuplicateError extends Error {
  keyValue?: Record<string, any>;
  errorResponse?: {
    keyValue: Record<string, any>;
  };
}

interface MongoValidationError extends Error {
  errors: Record<string, { message: string }>;
}

interface JWTError extends Error {
  name: "JsonWebTokenError" | "TokenExpiredError";
}

interface CustomError extends Error {
  statusCode?: number;
  status?: string;
  isOperational?: boolean;
  path?: string;
  value?: any;
  code?: number;
  keyValue?: Record<string, any>;
  errors?: Record<string, { message: string }>;
}

// Handle invalid Mongo ObjectId error (e.g. findById with bad ID)
const handleCastErrorDB = (err: MongoCastError): AppError => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

// Handle duplicate fields error (e.g. unique email)
const handleDuplicateFieldsDB = (err: MongoDuplicateError): AppError => {
  const keyValue = err.errorResponse?.keyValue || err.keyValue;
  const key = keyValue ? Object.keys(keyValue)[0] : "field";
  const message = `This ${key} already exists`;
  return new AppError(message, 400);
};

// Handle validation errors (e.g. missing required fields)
const handleValidationErrorDB = (err: MongoValidationError): AppError => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data. ${errors.join(". ")}`;
  return new AppError(message, 400);
};

// Handle invalid JWT
const handleJWTError = (): AppError =>
  new AppError("Invalid token. Please log in again!", 401);

// Handle expired JWT
const handleJWTExpiredError = (): AppError =>
  new AppError("Your token has expired! Please log in again.", 401);

// Development error output
const sendErrorDev = (err: CustomError, req: Request, res: Response): void => {
  if (req.originalUrl.startsWith("/api")) {
    res.status(err.statusCode || 500).json({
      status: err.status || "error",
      error: err,
      message: err.message,
      stack: err.stack,
    });
    return;
  }

  console.error("ERROR 💥", err);

  res.status(err.statusCode || 500).render("error", {
    title: "Something went wrong!",
    msg: err.message,
  });
};

// Production error output
const sendErrorProd = (err: CustomError, req: Request, res: Response): void => {
  const showFullError = process.env.SHOW_FULL_ERRORS === "true";

  if (req.originalUrl.startsWith("/api")) {
    if (err.isOperational) {
      res.status(err.statusCode || 500).json({
        status: err.status || "error",
        message: err.message,
      });
      return;
    }

    console.error("ERROR 💥💥", err);

    if (showFullError) {
      res.status(err.statusCode || 500).json({
        status: "error",
        message: err.message,
        error: err,
        stack: err.stack,
        name: err.name,
        code: err.code,
        value: err.value,
        path: err.path,
      });
      return;
    }

    res.status(500).json({
      status: "error",
      message: "Something went wrong.",
    });
    return;
  }

  if (err.isOperational) {
    res.status(err.statusCode || 500).render("error", {
      title: "Something went wrong!",
      msg: err.message,
    });
    return;
  }

  console.error("ERROR 💥💥💥", err);

  res.status(err.statusCode || 500).render("error", {
    title: "Something went wrong!",
    msg: showFullError ? err.message : "Please try again later.",
  });
};

// Main error handling middleware
const errorController = (
  err: CustomError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    sendErrorDev(err, req, res);
  } else if (process.env.NODE_ENV?.trim() === "production") {
    let error: CustomError = { ...err };
    error.message = err.message;

    if (error.name === "CastError")
      error = handleCastErrorDB(error as MongoCastError);
    if (error.code === 11000)
      error = handleDuplicateFieldsDB(error as MongoDuplicateError);
    if (error.name === "ValidationError")
      error = handleValidationErrorDB(error as MongoValidationError);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};

export default errorController;
