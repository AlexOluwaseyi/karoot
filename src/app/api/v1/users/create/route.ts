import prisma from "@/app/lib/prisma";
import ErrorHandler from "@/app/lib/ErrorHandler";
import { NextResponse } from "next/server";
// import { Request, Response } from "express";

export async function POST(request: Request): Promise<Response> {
    try {
        // Parse the request body as JSON
        const body = await request.json();
    
        // Check if the request body is empty
        if (!body) {
          return NextResponse.json(
            { message: "Data not sent in request." },
            { status: 400 }
          );
        }

        if (!body.email || !body.phone || !body.username || !body.hashedPassword) {
            return NextResponse.json(
              { message: "Required fields missing." },
              { status: 400 }
            );
        }

        const newUser = await prisma.user.create({
            data: {
                email: body.email,
                phone: body.phone,
                username: body.username,
                hashedPassword: body.hashedPassword,
            }
        });

        console.log(newUser);
        return NextResponse.json({ message: "Data received.", data: newUser }, { status: 200 });
    } catch(error){
        const { status, message } = ErrorHandler(error);
        return NextResponse.json({ message: message }, { status });
    }
}
