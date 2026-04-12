import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import { NextRequest, NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";

interface Params {
  id: string;
}

// PUT /api/admin/courses/[id] - Update Course details
export async function PUT(req: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const { id } = resolvedParams;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
    }

    const body = await req.json();
    const { courseCode, courseName, department, level, creditHours, enrollmentCount, assignedLecturer } = body;

    await dbConnect();

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    // Check courseCode uniqueness if updated
    if (courseCode && courseCode !== course.courseCode) {
      const existing = await Course.findOne({ courseCode, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json({ error: "Course code already exists" }, { status: 409 });
      }
    }

    // Update fields
    if (courseCode) course.courseCode = courseCode;
    if (courseName) course.courseName = courseName;
    if (department) course.department = department;
    if (level !== undefined) course.level = level;
    if (creditHours !== undefined) course.creditHours = creditHours;
    if (enrollmentCount !== undefined) course.enrollmentCount = enrollmentCount;
    if (assignedLecturer !== undefined) {
      if (assignedLecturer && !mongoose.Types.ObjectId.isValid(assignedLecturer)) {
         return NextResponse.json({ error: "Invalid assignedLecturer ID provided" }, { status: 400 });
      }
      course.assignedLecturer = assignedLecturer || null;
    }

    await course.save();
    
    const populatedCourse = await Course.findById(course._id).populate("assignedLecturer");

    return NextResponse.json(
      {
        success: true,
        message: "Course updated successfully",
        data: populatedCourse,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating course:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/courses/[id] - Remove Course
export async function DELETE(req: NextRequest, { params }: { params: Promise<Params> }) {
  try {
    const resolvedParams = await params;
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const { id } = resolvedParams;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid course ID" }, { status: 400 });
    }

    await dbConnect();

    const course = await Course.findById(id);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }

    await Course.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "Course removed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting course:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
