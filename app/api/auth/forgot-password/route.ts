import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "crypto";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { identifier } = await req.json();

    if (!identifier) {
      return NextResponse.json({ error: "Student ID or email is required" }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({
      $or: [
        { studentId: identifier },
        { email: identifier.toLowerCase() },
      ],
    });

    // Always return success to avoid user enumeration
    if (!user || !user.email || !user.emailVerified) {
      return NextResponse.json({
        message: "If that account exists, a reset code has been sent.",
      });
    }

    // Rate-limit: block if last code was sent less than 60s ago
    if (user.resetPasswordCodeExpiry) {
      const elapsed = Date.now() - (user.resetPasswordCodeExpiry.getTime() - 15 * 60 * 1000);
      if (elapsed < 60 * 1000) {
        return NextResponse.json(
          { error: "Please wait before requesting another code" },
          { status: 429 }
        );
      }
    }

    const code = randomInt(100000, 999999).toString();
    user.resetPasswordCode = code;
    user.resetPasswordCodeExpiry = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    try {
      await sendPasswordResetEmail(user.email, code, user.fullName);
    } catch (emailErr) {
      console.error("Reset email failed:", emailErr);
      return NextResponse.json(
        { error: "Could not send reset email. Check SMTP configuration." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      message: "If that account exists, a reset code has been sent.",
      studentId: user.studentId,
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json({ error: "Request failed. Try again." }, { status: 500 });
  }
}
