import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Lecturer from "@/models/Lecturer";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/lecturers - View all lecturers
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

    const lecturers = await Lecturer.find({}).sort({ fullName: 1 });

    return NextResponse.json(
      {
        success: true,
        data: lecturers,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching lecturers:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/lecturers - Create a lecturer
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
    const { staffId, fullName, email, department, phoneNumber } = body;

    if (!staffId || !fullName || !email || !department) {
      return NextResponse.json(
        { error: "Missing required fields: staffId, fullName, email, department" },
        { status: 400 }
      );
    }

    await dbConnect();

    const existingStaffId = await Lecturer.findOne({ staffId });
    if (existingStaffId) {
      return NextResponse.json(
        { error: "Staff ID already exists" },
        { status: 409 }
      );
    }
    
    const existingEmail = await Lecturer.findOne({ email });
    if (existingEmail) {
      return NextResponse.json(
        { error: "Email already exists" },
        { status: 409 }
      );
    }

    const newLecturer = new Lecturer({ staffId, fullName, email, department, phoneNumber });
    await newLecturer.save();

    return NextResponse.json(
      {
        success: true,
        message: "Lecturer created successfully",
        data: newLecturer,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating lecturer:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
