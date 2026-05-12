import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "crypto";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { sendVerificationEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { studentId } = await req.json();

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ studentId });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: "Email already verified" });
    }

    // Rate-limit: block resend if last code was sent less than 60s ago
    if (user.verificationCodeExpiry) {
      const elapsed = Date.now() - (user.verificationCodeExpiry.getTime() - 10 * 60 * 1000);
      if (elapsed < 60 * 1000) {
        return NextResponse.json(
          { error: "Please wait before requesting another code" },
          { status: 429 }
        );
      }
    }

    const code = randomInt(100000, 999999).toString();
    user.verificationCode = code;
    user.verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);
    await user.save();

    try {
      await sendVerificationEmail(user.email, code, user.fullName);
    } catch (emailErr) {
      console.error("Resend email failed:", emailErr);
      return NextResponse.json(
        { error: "Could not send email. Check SMTP configuration." },
        { status: 502 }
      );
    }

    return NextResponse.json({ message: "Verification code resent." });
  } catch (err) {
    console.error("Resend error:", err);
    return NextResponse.json({ error: "Failed to resend. Try again." }, { status: 500 });
  }
}
