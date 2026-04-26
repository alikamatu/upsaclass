import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import Course from "@/models/Course"; // Ensure Course is registered for population
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// GET /api/admin/reps - View all course representatives
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    await dbConnect();

    const reps = await User.find({ role: "rep" })
      .populate("courseRepFor", "courseName courseCode")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(
      {
        success: true,
        data: reps,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching reps:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/reps - Create a course representative
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { studentId, fullName, courseIds, password } = body;
    const courses = Array.isArray(courseIds) ? courseIds : courseIds ? [courseIds] : [];

    if (!studentId || !fullName || courses.length === 0 || !password) {
      return NextResponse.json(
        { error: "Missing required fields: studentId, fullName, courseIds, password" },
        { status: 400 }
      );
    }

    await dbConnect();

    const existingUser = await User.findOne({ studentId });
    if (existingUser) {
      return NextResponse.json(
        { error: "Student ID already exists" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newRep = new User({
      studentId,
      fullName,
      passwordHash: hashedPassword,
      role: "rep",
      courseRepFor: courses,
      enrolledCourses: courses, // Auto-enroll in the courses they represent
    });

    await newRep.save();

    return NextResponse.json(
      {
        success: true,
        message: "Course representative created successfully",
        data: newRep,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating rep:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
