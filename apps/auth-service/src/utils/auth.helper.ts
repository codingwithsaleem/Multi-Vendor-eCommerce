import crypto from "crypto";
import { ValidationError } from "../../../../packages/error-handler";
import { NextFunction } from "express";
import redis from "../../../../packages/libs/redis";
import { sendEmail } from "./sendMail";

// validate the register user data

// const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;
// const phoneRegex = /^\+?[1-9]\d{1,14}$/;

export const validateRegisterData = (
    data: any,
    userType: "user" | "seller"
) => {
    const { name, email, password, phone_number, country } = data;
     console.log(password, "password");
    if (
        !name ||
        !email ||
        !password ||
        (userType === "seller" && (!phone_number || !country))
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

    // if (!emailRegex.test(email)) {
    //     throw new ValidationError("Invalid email format", {
    //         details: { email: "Email must be a valid email address" },
    //     });
    // }

    // if (!passwordRegex.test(password)) {
    //     throw new ValidationError(
    //         "Password must be at least 6 characters long, contain at least one uppercase letter, one lowercase letter, and one number",
    //         { details: { password: "Invalid password format" } }
    //     );
    // }

    // if (userType === "seller" && !phoneRegex.test(phone_number)) {
    //     throw new ValidationError("Invalid phone number format", {
    //         details: { phone_number: "Phone number must be a valid international format" },
    //     });
    // }
};



// check otp restriction

export const checkOtpRestriction = async (email: string , next: NextFunction)=>{

    if(await redis.get(`otp_cooldown:${email}`)){
       return next ( new ValidationError("You have to wait 60 seconds before sending another OTP", {
            details: { email: "You have to wait 60 seconds before sending another OTP" },
        }));
    }

    if(await redis.get(`opt_lock:${email}`)){
        return next (new ValidationError ("Account is locked due to too many failed OTP attempts! Try again after 30 minutes", {
            details: { email: "Account is locked due to too many failed OTP attempts! Try again after 30 minutes" },
        }))
    }

    if(await redis.get(`otp_spam_lock:${email}`)){
        return next (new ValidationError ("Too many OTPs requests! Please wait one hour before requesitng again.", {
            details: { email: "Too many OTPs requests! Please wait one hour before requesitng again." },
        }))
    }



}


// track otp requests

export const trackOtpRequests = async (email: string , next: NextFunction)=>{
    // const otpRequests = await redis.incr(`otp_requests:${email}`);

    // if (otpRequests === 1) {
    //     await redis.expire(`otp_requests:${email}`, 3600); // Set expiration to 1 hour
    // }

    // if (otpRequests > 10) {
    //     await redis.set(`otp_spam_lock:${email}`, "true", "EX", 3600); // Lock for 1 hour
    //     return next(new ValidationError("Too many OTP requests! Please try again later.", {
    //         details: { email: "Too many OTP requests! Please try again later." },
    //     }));
    // }


    const otpRequestsKey = `otp_request_count:${email}`;

    let otpRequests = parseInt(await redis.get(otpRequestsKey) || "0", 10);

    if(otpRequests >= 2){
        await redis.set(`otp_spam_lock:${email}`, "true", "EX", 3600); // Lock for 1 hour
        return next(new ValidationError("Too many OTP requests! Please try again later.", {
            details: { email: "Too many OTP requests! Please try again later." },
        }));
    }

    await redis.set(otpRequestsKey, (otpRequests + 1).toString(), "EX", 3600); // Increment request count and set expiration to 1 hour

}

// send otp

export const sendOtp = async (name: string , email: string, template: string) => {

    const otp = crypto.randomInt(10000, 99999).toString();
    
    await sendEmail(
        email,
        "Verify Your Email",
        template,
        {
            name,
            otp,
        }
    )
    await redis.set(`otp:${email}`, otp, "EX", 300); // Store OTP in Redis for 5 minutes
    await redis.set(`otp_cooldown:${email}`, "true", "EX", 60); // you have to wait 60 seconds before sending another otp
}
