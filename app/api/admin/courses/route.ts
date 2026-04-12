import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
// GET /api/admin/courses - View All Courses
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

    const courses = await Course.find({}).populate("assignedLecturer").sort({ courseCode: 1 });

    return NextResponse.json(
      {
        success: true,
        data: courses,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/courses - Register New Course
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
    const { courseCode, courseName, department, level, creditHours, enrollmentCount, assignedLecturer } = body;

    // Validate required fields
    if (!courseCode || !courseName || !department || !creditHours || !enrollmentCount) {
      return NextResponse.json(
        {
          error: "Missing required fields: courseCode, courseName, department, creditHours, enrollmentCount",
        },
        { status: 400 }
      );
    }
    
    if (assignedLecturer && !mongoose.Types.ObjectId.isValid(assignedLecturer)) {
       return NextResponse.json(
         { error: "Invalid assignedLecturer ID provided" },
         { status: 400 }
       );
    }

    await dbConnect();

    // Check if courseCode already exists
    const existingCourse = await Course.findOne({ courseCode });
    if (existingCourse) {
      return NextResponse.json(
        { error: "Course code already exists" },
        { status: 409 }
      );
    }

    // Create new course
    const newCourse = new Course({
      courseCode,
      courseName,
      department,
      level,
      creditHours,
      enrollmentCount,
      assignedLecturer,
    });

    await newCourse.save();
    
    const populatedCourse = await Course.findById(newCourse._id).populate("assignedLecturer");

    return NextResponse.json(
      {
        success: true,
        message: "Course registered successfully",
        data: populatedCourse,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
