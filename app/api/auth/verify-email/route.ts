import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { sendWelcomeEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { studentId, code } = await req.json();

    if (!studentId || !code) {
      return NextResponse.json({ error: "Student ID and code are required" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ studentId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "Email already verified" });
    }

    if (user.verificationCode !== code) {
      return NextResponse.json({ error: "Invalid verification code" }, { status: 400 });
    }

    if (!user.verificationCodeExpiry || user.verificationCodeExpiry < new Date()) {
      return NextResponse.json(
        { error: "Verification code has expired. Request a new one." },
        { status: 400 }
      );
    }

    user.emailVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpiry = undefined;
    await user.save();

    if (user.email) {
      await sendWelcomeEmail(user.email, user.fullName).catch(() => {});
    }

    return NextResponse.json({ message: "Email verified! You can now log in." });
  } catch (err) {
    console.error("Verification error:", err);
    return NextResponse.json({ error: "Verification failed. Try again." }, { status: 500 });
  }
}
