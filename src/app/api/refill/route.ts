import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectMongoDB } from "../../../../lib/mongodb";
import User from "../../../../models/user";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectMongoDB();
  const user = await User.findOne({ email: session.user.email });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const now = new Date();
  const oneHour = 60 * 60 * 1000;

  if (!user.lastRefilled || now.getTime() - user.lastRefilled.getTime() > oneHour) {
    // Perform the refill
    user.balance += 100000; // Add $1000 (in cents)
    user.lastRefilled = now;
    await user.save();

    return NextResponse.json({ balance: user.balance, message: "Refill successful!" }, { status: 200 });
  } else {
    // Refill not available yet
    const timeRemaining = oneHour - (now.getTime() - user.lastRefilled.getTime());
    return NextResponse.json({ error: "Refill not yet available", timeRemaining }, { status: 400 });
  }
}
