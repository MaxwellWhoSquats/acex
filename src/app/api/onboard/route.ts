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

    await connectMongoDB();

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: "User already exists" },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the user
    const user = await User.create({ email, password: hashedPassword });
    
    return NextResponse.json(
      { message: "User successfully registered", user: { email: user.email, balance: user.balance } },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error parsing JSON:", error);
    return NextResponse.json({ error: "Error, please try again." }, { status: 500 });
  }
}