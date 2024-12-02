import { NextRequest, NextResponse } from "next/server";
import { connectMongoDB } from "../../../../lib/mongodb";
import User from "../../../../models/user";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Save user to database
    const hashedPassword = await bcrypt.hash(password, 10);
    await connectMongoDB();
    await User.create({ email, password: hashedPassword });

    
    return NextResponse.json(
      { message: "User successfully registered" },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error parsing JSON:", error);
    return NextResponse.json({ error: "Error, please try again." }, { status: 500 });
  }
}
