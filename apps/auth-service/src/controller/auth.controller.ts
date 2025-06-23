import { Response, Request, NextFunction } from "express";
import {
  checkOtpRestriction,
  sendOtp,
  trackOtpRequests,
  validateRegisterData,
} from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { ValidationError } from "@packages/error-handler";

// register a new user
export const userRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Validate the request body for user registration
  validateRegisterData(req.body, "user");

  // If validation passes, proceed to the next middleware or controller

  const { name, email } = req.body;

  const existingUser = await prisma.users.findUnique({
    where: { email },
  });

  if (existingUser) {
    return next(
      new ValidationError("User already exists", {
        details: { email: "Email is already registered" },
      })
    );
  }

  await checkOtpRestriction(email, next);
  await trackOtpRequests(email, next);
  await sendOtp(name,email,"user-activation-mail-template");

  return res.status(200).json({
    message: "OTP sent to your email. Please verify your email to complete registration.",
    status: true,
  });
  } catch (error) {

    console.error("Error in userRegister:", error);
    const errorMessage = (error instanceof Error) ? error.message : String(error);
    return next(
      new ValidationError("Failed to register user", {
        details: { error: errorMessage },
      })
    );
    
  }
};
