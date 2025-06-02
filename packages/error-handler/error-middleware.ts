import { AppError } from "./index";
import { Request, Response } from "express";

export const errorMiddleware = (err: AppError, req: Request, res: Response) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  const details = err.details || null;

  if (err instanceof AppError) {
    // Log the error details for debugging
    console.log(`Error ${req.method} ${req.url} - ${statusCode}: ${message}`, {
      timestamp: err.timestamp || new Date().toISOString(),
      details,
    });

    // If the error is an instance of AppError, we can use its properties
    return res.status(statusCode).json({
      status: "error",
      statusCode,
      message,
      details,
      timestamp: err.timestamp || new Date().toISOString(),
    });
  } else {
    console.log(
      `Unexpected error ${req.method} ${req.url} - ${statusCode}: ${message}`
    );
    // For other errors, we can return a generic error response
    return res.status(statusCode).json({
      status: "error",
      statusCode: 500,
      message: "An unexpected error occurred",
      details: null,
      timestamp: new Date().toISOString(),
    });
  }
};
