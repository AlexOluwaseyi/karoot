import dotenv from "dotenv"
import bcrypt from "bcrypt"
import prisma from "../prisma";

dotenv.config()


const saltRounds = parseInt(process.env.saltRounds || '10');


// Password hashing utility
export const hashPassword = async (password: string): Promise<string> => {
    try {
        const salt = await bcrypt.genSalt(saltRounds);
        const hashedPassword = await bcrypt.hash(password, salt);
        if (!hashedPassword) {
            throw new Error("Password hashing failed.");
        }
        return hashedPassword;
    } catch (error) {
        throw new Error(`Password hashing failed: ${error}`);
    }
};

// Hashed password checking utility
export const checkPassword = async (userId: string, password: string): Promise<boolean> => {
    try {
        const currentUser = await prisma.user.findUnique({
            where: { userId: userId }
        });
        if (!currentUser) {
            throw new Error("User not found.");
        }
        const match = await bcrypt.compare(password, currentUser.hashedPassword);
        return match;
    } catch (error) {
        throw new Error(`Password checking failed: ${error}`);
    }
};