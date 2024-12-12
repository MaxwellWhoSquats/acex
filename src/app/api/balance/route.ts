import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectMongoDB } from "../../../../lib/mongodb";
import User, { IUser } from "../../../../models/user";
import { authOptions } from "@/lib/authOptions";

// GET Balance and Net Balance
export async function GET() {
  try {
    // Retrieve the session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Connect to MongoDB
    await connectMongoDB();

    // Find the user by email
    const user = await User.findOne<IUser>({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Return balance information
    return NextResponse.json(
      { balance: user.balance, netBalance: user.netBalance },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching balance:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH Update Balance (Increment/Decrement)
export async function PATCH(req: NextRequest) {
  try {
    // Retrieve the session
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { amount } = await req.json();

    if (typeof amount !== "number" || !isFinite(amount)) {
      return NextResponse.json(
        { error: "Invalid amount value" },
        { status: 400 }
      );
    }

    // Connect to MongoDB
    await connectMongoDB();

    const isDebit = amount < 0;
    const debitAmount = Math.abs(amount);

    const query: { email: string; balance?: { $gte: number } } = { email: session.user.email };
    if (isDebit) {
      query['balance'] = { $gte: debitAmount };
    }

    const update = {
      $inc: { balance: amount, netBalance: amount },
    };

    // Atomic update to prevent race conditions and ensure balance doesn't go negative
    const updatedUser = await User.findOneAndUpdate<IUser>(
      query,
      update,
      { new: true }
    );

    if (!updatedUser) {
      const errorMsg = isDebit
        ? "Insufficient balance."
        : "User not found.";
      return NextResponse.json(
        { error: errorMsg },
        { status: isDebit ? 400 : 404 }
      );
    }

    return NextResponse.json(
      { balance: updatedUser.balance, netBalance: updatedUser.netBalance },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating balance:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}