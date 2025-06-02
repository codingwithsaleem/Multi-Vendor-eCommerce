import { Response , Request , NextFunction } from "express"
import { validateRegisterData } from "../utils/auth.helper"
import prisma from "../../../../packages/libs/prisma";
import { ValidationError } from "../../../../packages/error-handler";


// register a new user
export const userRegister = async (req:Request , res: Response, next: NextFunction)=>{

// Validate the request body for user registration
    validateRegisterData(req.body, "user");

    // If validation passes, proceed to the next middleware or controller

    const { name, email, password, country } = req.body;

    const existingUser = await prisma.users.findUnique({
        where: { email }
    });

    if(existingUser){
        return next(new ValidationError("User already exists", {
            details: { email: "Email is already registered" }
        }));
    }

}




