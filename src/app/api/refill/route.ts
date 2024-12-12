import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectMongoDB } from "../../../../lib/mongodb";
import User from "../../../../models/user";
import { authOptions } from "@/lib/authOptions";

export async function POST() {
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
    const refillAmount = 10000; // $100 in cents
    user.balance += refillAmount; // Add to balance
    user.netBalance += refillAmount; // Update netBalance
    user.lastRefilled = now;
    await user.save();

    return NextResponse.json({ balance: user.balance, netBalance: user.netBalance, message: "Refill successful!" }, { status: 200 });
  } else {
    // Refill not available yet
    const timeElapsed = now.getTime() - user.lastRefilled.getTime();
    const timeRemaining = oneHour - timeElapsed;
    return NextResponse.json({ error: "Refill not yet available", timeRemaining, netBalance: user.netBalance }, { status: 400 });
  }
}
