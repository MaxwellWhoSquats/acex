import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectMongoDB } from "../../../../lib/mongodb";
import User from "../../../../models/user";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectMongoDB();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ balance: user.balance }, { status: 200 });
  } catch (error) {
    console.error("Error fetching balance:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { balance } = await req.json();
    if (typeof balance !== 'number') {
      return NextResponse.json({ error: "Invalid balance value" }, { status: 400 });
    }

    await connectMongoDB();
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      { balance },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ balance: user.balance }, { status: 200 });
  } catch (error) {
    console.error("Error updating balance:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
