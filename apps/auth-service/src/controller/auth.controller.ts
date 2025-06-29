import { Response, Request, NextFunction } from "express";
import {
  checkOtpRestriction,
  sendOtp,
  trackOtpRequests,
  validateRegisterData,
  verifyOtp,
} from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { ValidationError } from "@packages/error-handler";
import bcrypt from "bcryptjs";


// register a new user
export const userRegister = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {


    // If validation passes, proceed to the next middleware or controller

    const { name, email } = req.body;

    // Validate the request body for user registration
    validateRegisterData(req.body, "user");

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
    await sendOtp(name, email, "user-activation-mail-template");

    return res.status(200).json({
      message: "OTP sent to your email. Please verify your email to complete registration.",
      status: true,
    });
  } catch (error) {
    const errorMessage = (error instanceof Error) ? error.message : String(error);
    return next(
      new ValidationError("Failed to register user", {
        details: { error: errorMessage },
      })
    );

  }
};


// Verify user registration

export const verifyUserRegisteration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    const { email, otp, password, name } = req.body;

    // Validate the OTP and email
    if (!email || !otp || !password || !name) {

      throw new ValidationError("Email and OTP are required for verification", {
        details: { email: "Email is required", otp: "OTP is required" },
      })

    }

    // check existing user

    const existingUser = await prisma.users.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ValidationError("User already exists", {
        details: { email: "Email is already registered" },
      })
    }

    // Verify the OTP

    await verifyOtp(email, otp, next);

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user in the database

    await prisma.users.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    return res.status(200).json({
      message: "User registration verified successfully",
      status: true,
    });
  } catch (error: string | any) {

    throw new ValidationError("Failed to verify user registration", {
      details: { error: error.message },
    })

  }
}
