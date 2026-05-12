import { NextRequest, NextResponse } from "next/server";
import { randomInt } from "crypto";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email";

const ALLOWED_DOMAIN = "@upsamail.edu.gh";

function generateCode() {
  return randomInt(100000, 999999).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { studentId, fullName, email, password } = await req.json();

    if (!studentId || !fullName || !email || !password) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }

    if (!email.toLowerCase().endsWith(ALLOWED_DOMAIN)) {
      return NextResponse.json(
        { error: `Only ${ALLOWED_DOMAIN} email addresses are allowed` },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json(
        { error: "Password must contain uppercase, lowercase, and a number" },
        { status: 400 }
      );
    }

    await dbConnect();

    const [existingById, existingByEmail] = await Promise.all([
      User.findOne({ studentId }),
      User.findOne({ email: email.toLowerCase() }),
    ]);

    if (existingById) {
      return NextResponse.json({ error: "Student ID already registered" }, { status: 409 });
    }

    if (existingByEmail) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const verificationCode = generateCode();
    const verificationCodeExpiry = new Date(Date.now() + 10 * 60 * 1000);

    await User.create({
      studentId,
      fullName,
      email: email.toLowerCase(),
      passwordHash,
      emailVerified: false,
      verificationCode,
      verificationCodeExpiry,
      role: "student",
    });

    let emailSent = true;
    try {
      await sendVerificationEmail(email.toLowerCase(), verificationCode, fullName);
    } catch (emailErr) {
      emailSent = false;
      console.error("Email send failed:", emailErr);
    }

    return NextResponse.json(
      {
        message: emailSent
          ? "Account created. Check your email for the verification code."
          : "Account created but email could not be sent. Use the resend option on the next page.",
        studentId,
        emailSent,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: "Registration failed. Try again." }, { status: 500 });
  }
}
