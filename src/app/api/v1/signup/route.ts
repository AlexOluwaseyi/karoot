import prisma from "@/app/lib/prisma";
import ErrorHandler from "@/app/lib/ErrorHandler";
import { NextResponse } from "next/server";
import { hashPassword } from "@/app/lib/auth/password";
import { SignUpSchema } from "@/app/lib/zodSchema";

// // Define signup validation schema
// const SignUpSchema = z.object({
//     email: z.string().email("Invalid email address"),
//     phone: z.string().min(10, "Phone number must be at least 10 characters"),
//     username: z.string().min(3, "Username must be at least 3 characters"),
//     password: z.string().min(8, "Password must be at least 8 characters"),
//     fullname: z.string().optional(),
// });

export async function POST(request: Request): Promise<Response> {
    try {
        // Parse the request body as JSON
        const body = await request.json();

        // Validate request data
        const result = SignUpSchema.safeParse(body);

        if (!result.success) {
            const formattedErrors = result.error.format();
            return NextResponse.json(
                { message: "Validation failed", errors: formattedErrors },
                { status: 400 }
            );
        }

        // Extract validated data
        const { email, phone, username, password, fullname } = result.data;

        // Check if user already exists
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username },
                    { phone }
                ]
            }
        });

        if (existingUser) {
            // Determine which field caused the conflict
            let field = "User";
            if (existingUser.email === email) field = "Email";
            if (existingUser.username === username) field = "Username";
            if (existingUser.phone === phone) field = "Phone number";

            return NextResponse.json(
                { message: `${field} already in use.` },
                { status: 409 } // Conflict status code
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create new user
        const newUser = await prisma.user.create({
            data: {
                email,
                phone,
                username,
                hashedPassword,
                fullname: fullname || null // Optional field
            }
        });

        // Return success response without exposing sensitive data
        return NextResponse.json({
            message: "User registered successfully",
            user: {
                userId: newUser.userId,
                email: newUser.email,
                username: newUser.username
            }
        }, { status: 201 });

    } catch (error) {
        const errorResponse = ErrorHandler(error);
        return NextResponse.json(
            { message: errorResponse.message },
            { status: errorResponse.status || 500 }
        );
    }
}
