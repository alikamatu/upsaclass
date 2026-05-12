import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { studentId, code, newPassword } = await req.json();

    if (!studentId || !code || !newPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      return NextResponse.json(
        { error: "Password must contain uppercase, lowercase, and a number" },
        { status: 400 }
      );
    }

    await dbConnect();

    const user = await User.findOne({ studentId });

    if (!user) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    if (user.resetPasswordCode !== code) {
      return NextResponse.json({ error: "Invalid reset code" }, { status: 400 });
    }

    if (!user.resetPasswordCodeExpiry || user.resetPasswordCodeExpiry < new Date()) {
      return NextResponse.json(
        { error: "Reset code has expired. Request a new one." },
        { status: 400 }
      );
    }

    user.passwordHash = await bcrypt.hash(newPassword, 12);
    user.resetPasswordCode = undefined;
    user.resetPasswordCodeExpiry = undefined;
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    await user.save();

    return NextResponse.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    return NextResponse.json({ error: "Reset failed. Try again." }, { status: 500 });
  }
}
