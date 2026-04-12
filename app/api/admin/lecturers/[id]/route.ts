import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Lecturer from "@/models/Lecturer";
import Course from "@/models/Course";
import TimetableSlot from "@/models/TimetableSlot";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

interface Params {
  id: string;
}

// PUT /api/admin/lecturers/[id] - Update Lecturer details
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
      return NextResponse.json({ error: "Invalid lecturer ID" }, { status: 400 });
    }

    const body = await req.json();
    const { staffId, fullName, email, department, phoneNumber } = body;

    await dbConnect();

    const lecturer = await Lecturer.findById(id);
    if (!lecturer) {
      return NextResponse.json({ error: "Lecturer not found" }, { status: 404 });
    }

    if (staffId && staffId !== lecturer.staffId) {
      const existing = await Lecturer.findOne({ staffId, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json({ error: "Staff ID already exists" }, { status: 409 });
      }
    }

    if (email && email !== lecturer.email) {
      const existing = await Lecturer.findOne({ email, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json({ error: "Email already exists" }, { status: 409 });
      }
    }

    if (staffId) lecturer.staffId = staffId;
    if (fullName) lecturer.fullName = fullName;
    if (email) lecturer.email = email;
    if (department) lecturer.department = department;
    if (phoneNumber !== undefined) lecturer.phoneNumber = phoneNumber;

    await lecturer.save();

    return NextResponse.json(
      {
        success: true,
        message: "Lecturer updated successfully",
        data: lecturer,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating lecturer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/lecturers/[id] - Remove Lecturer
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
      return NextResponse.json({ error: "Invalid lecturer ID" }, { status: 400 });
    }

    await dbConnect();

    const lecturer = await Lecturer.findById(id);
    if (!lecturer) {
      return NextResponse.json({ error: "Lecturer not found" }, { status: 404 });
    }
    
    // Check if lecturer has associated courses
    const associatedCourses = await Course.findOne({ assignedLecturer: new Types.ObjectId(id) });
    if (associatedCourses) {
      return NextResponse.json({ 
        error: "Cannot delete lecturer assigned to courses. Reassign courses first." 
      }, { status: 409 });
    }

    // Check if lecturer is strictly mapped to timetable slots
    const activeSlots = await TimetableSlot.findOne({ lecturer: new Types.ObjectId(id) });
    if (activeSlots) {
       return NextResponse.json({
         error: "Cannot delete lecturer with active master timetable slots. Remove slots first."
       }, { status: 409 });
    }

    await Lecturer.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "Lecturer removed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting lecturer:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
