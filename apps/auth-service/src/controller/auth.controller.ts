import { Response, Request, NextFunction } from "express";
import {
  checkOtpRestriction,
  generateAccessToken,
  generateRefreshToken,
  handleForgotPassword,
  sendOtp,
  trackOtpRequests,
  validateRegisterData,
  verifyOtp,
} from "../utils/auth.helper";
import prisma from "@packages/libs/prisma";
import { ValidationError, UnauthorizedError } from "@packages/error-handler";
import bcrypt from "bcryptjs";
import { setCookies } from "../utils/cookies/setCookies";

// register a new user
/**
 * Register a new user
 * @param {Object} req.body - The request body
 * @param {string} req.body.name - User's full name
 * @param {string} req.body.email - User's email address
 * @returns {Object} 200 - Success response with OTP sent message
 * @returns {Object} 400 - Validation error response
 */
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
      message:
        "OTP sent to your email. Please verify your email to complete registration.",
      status: true,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return next(
      new ValidationError(`Failed to register user ,${errorMessage}`, {
        details: { error: errorMessage },
      })
    );
  }
};

// Verify user registration
/**
 * Verify user registration using OTP
 * @param {Object} req.body - The request body
 * @param {string} req.body.name - User's full name
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password
 * @param {string} req.body.otp - OTP received via email
 * @returns {Object} 200 - Success response with verification message
 * @returns {Object} 400 - Validation error or invalid OTP response
 */
export const verifyUserRegisteration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, password, name } = req.body;

    // Validate the OTP and email
    if (!email || !otp || !password || !name) {
      return next(
        new ValidationError(
          "Email, OTP, password, and name are required for verification",
          {
            details: {
              email: !email ? "Email is required" : undefined,
              otp: !otp ? "OTP is required" : undefined,
              password: !password ? "Password is required" : undefined,
              name: !name ? "Name is required" : undefined,
            },
          }
        )
      );
    }

    // check existing user

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
  } catch (error: any) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return next(
      new ValidationError(
        `Failed to verify user registration: ${errorMessage}`,
        {
          details: { error: errorMessage },
        }
      )
    );
  }
};

// Login User

export const userLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;

    // Validate the request body for user login
    if (!email || !password) {
      return next(
        new ValidationError("Email and password are required for login", {
          details: {
            email: !email ? "Email is required" : undefined,
            password: !password ? "Password is required" : undefined,
          },
        })
      );
    }

    // Check if the user exists
    const user = await prisma.users.findUnique({
      where: { email },
    });

    if (!user) {
      return next(
        new UnauthorizedError("Invalid email or password", {
          details: { email: "Email not found" },
        })
      );
    }

    // Verify the password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return next(
        new UnauthorizedError("Invalid email or password", {
          details: { password: "Incorrect password" },
        })
      );
    }

    // Generate a Access Token and Refresh Token uisng the JWT helper function
    const accessToken = await generateAccessToken(user.id, user.email, "user");
    const refreshToken = await generateRefreshToken(user.id, user.name, "user");

    // Set the refresh token in a secure, HttpOnly cookie

    setCookies(res, "refreshToken", refreshToken);
    setCookies(res, "accessToken", accessToken);

    return res.status(200).json({
      message: "User logged in successfully",
      status: true,
      data: {
        accessToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: "user",
        },
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new ValidationError(`Failed to login user: ${errorMessage}`, {
      details: { error: errorMessage },
    });
  }
};

//  Forgot Password

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email } = req.body;

    // Validate the request body for forgot password
    if (!email) {
      return next(
        new ValidationError("Email is required for password reset", {
          details: { email: "Email is required" },
        })
      );
    }

    await handleForgotPassword(email, "user", res, next);

    // Respond with success message

    res.status(200).json({
      message:
        "Password reset successfully. Check your email for the new password.",
      status: true,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new ValidationError(
      `Failed to send OTP for password reset: ${errorMessage}`,
      {
        details: { error: errorMessage },
      }
    );
  }
};

// verify forgot password OTP

export const verifyForgotPasswordOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp } = req.body;

    // Validate the request body for OTP verification
    if (!email || !otp) {
      return next(
        new ValidationError("Email and OTP are required for verification", {
          details: {
            email: !email ? "Email is required" : undefined,
            otp: !otp ? "OTP is required" : undefined,
          },
        })
      );
    }

    // Verify the OTP
    await verifyOtp(email, otp, next);

    return res.status(200).json({
      message: "OTP verified successfully",
      status: true,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new ValidationError(`Failed to verify OTP: ${errorMessage}`, {
      details: { error: errorMessage },
    });
  }
};


// Reset Password 

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, otp, newPassword } = req.body;

    // Validate the request body for reset password
    if (!email || !otp || !newPassword) {
      return next(
        new ValidationError("Email, OTP, and new password are required", {
          details: {
            email: !email ? "Email is required" : undefined,
            otp: !otp ? "OTP is required" : undefined,
            newPassword: !newPassword ? "New password is required" : undefined,
          },
        })
      );
    }

    // check if user exists
    const user = await prisma.users.findUnique({  
      where: { email },
    });

    if (!user) {
      return next(
        new UnauthorizedError("User not found", {
          details: { email: "User with this email does not exist" },
        })
      );
    }

    // compare the new password with the existing password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);

    if (isSamePassword) {
      return next(
        new ValidationError("New password cannot be the same as the old one", {
          details: { newPassword: "New password must be different" },
        })
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await prisma.users.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return res.status(200).json({
      message: "Password reset successfully",
      status: true,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new ValidationError(`Failed to reset password: ${errorMessage}`, {
      details: { error: errorMessage },
    });
  }
};