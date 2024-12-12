import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { connectMongoDB } from "../../../../lib/mongodb";
import User from "../../../../models/user";
import { authOptions } from "@/lib/authOptions";

export async function GET() {
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
  const oneHour = 60 * 60 * 1000; // 1 hour in ms

  if (!user.lastRefilled || now.getTime() - user.lastRefilled.getTime() > oneHour) {
    // Refill available now
    return NextResponse.json({ canRefill: true }, { status: 200 });
  } else {
    const timeRemaining = oneHour - (now.getTime() - user.lastRefilled.getTime());
    return NextResponse.json({ canRefill: false, timeRemaining }, { status: 200 });
  }
}
