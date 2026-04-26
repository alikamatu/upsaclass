import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import User from "@/models/User";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// PUT /api/admin/reps/[id] - Update a course representative (specifically password)
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { id } = await params;

    await dbConnect();

    // Check if this is a password update or general update
    if (body.password) {
      // Password update
      const hashedPassword = await bcrypt.hash(body.password, 10);
      
      const updatedRep = await User.findByIdAndUpdate(
        id,
        { passwordHash: hashedPassword },
        { new: true }
      );

      if (!updatedRep) {
        return NextResponse.json(
          { error: "Course representative not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Password updated successfully",
        },
        { status: 200 }
      );
    } else {
      // General update (name, studentId, courses)
      const { studentId, fullName, courseIds } = body;

      if (!studentId || !fullName) {
        return NextResponse.json(
          { error: "Missing required fields: studentId and fullName" },
          { status: 400 }
        );
      }

      // Check if studentId is already taken by another user
      const existingUser = await User.findOne({ 
        studentId, 
        _id: { $ne: id } 
      });

      if (existingUser) {
        return NextResponse.json(
          { error: "Student ID already exists" },
          { status: 400 }
        );
      }

      const updateData: any = {
        studentId,
        fullName,
      };

      if (courseIds !== undefined) {
        updateData.courseRepFor = Array.isArray(courseIds) ? courseIds : [courseIds];
      }

      const updatedRep = await User.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true }
      ).populate("courseRepFor", "courseName courseCode");

      if (!updatedRep) {
        return NextResponse.json(
          { error: "Course representative not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(
        {
          success: true,
          message: "Representative updated successfully",
          data: updatedRep,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Error updating rep:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/reps/[id] - Delete a course representative
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    await dbConnect();
    const { id } = await params;

    const deletedRep = await User.findByIdAndDelete(id);

    if (!deletedRep) {
      return NextResponse.json(
        { error: "Course representative not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: "Course representative deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting rep:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
