import crypto from "crypto";
import { ValidationError } from "../../../../packages/error-handler";
import { NextFunction } from "express";

// validate the register user data

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/; // At least 6 characters, one uppercase, one lowercase, and one number
const phoneRegex = /^\+?[1-9]\d{1,14}$/;

export const validateRegisterData = (
    data: any,
    userType: "user" | "seller"
) => {
    const { name, email, password, phone_number, country } = data;

    if (
        !name ||
        !email ||
        !password ||
        (userType === "seller" && !phone_number) ||
        !country
    ) {
        throw new ValidationError("All fields are required", {
            details: {
                name: !name ? "Name is required" : undefined,
                email: !email ? "Email is required" : undefined,
                password: !password ? "Password is required" : undefined,
                phone_number:
                    userType === "seller" && !phone_number
                        ? "Phone number is required"
                        : undefined,
                country:
                    userType === "seller" && !country ? "Country is required" : undefined,
            },
        });
    }

    if (!emailRegex.test(email)) {
        throw new ValidationError("Invalid email format", {
            details: { email: "Email must be a valid email address" },
        });
    }

    if (!passwordRegex.test(password)) {
        throw new ValidationError(
            "Password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, and one number",
            { details: { password: "Invalid password format" } }
        );
    }
    if (userType === "seller" && !phoneRegex.test(phone_number)) {
        throw new ValidationError("Invalid phone number format", {
            details: { phone_number: "Phone number must be a valid international format" },
        });
    }
};



// check otp restriction

export const checkOtpRestriction = (email: string , next: NextFunction)=>{

}

// send otp

export const sendOtp = async (name: string , email: string, template: string) => {

    const otp = crypto.randomInt(10000, 99999).toString();
}
