import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import LectureHall from "@/models/LectureHall";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/halls - View all lecture halls
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

    const halls = await LectureHall.find({}).sort({ hallCode: 1 });

    return NextResponse.json(
      {
        success: true,
        data: halls,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching halls:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/halls - Add a new lecture hall
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
    const { hallCode, name, capacity, building, features } = body;

    if (!hallCode || !name || !capacity || !building) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (typeof capacity !== "number" || capacity <= 0) {
      return NextResponse.json(
        { error: "Capacity must be a positive number" },
        { status: 400 }
      );
    }

    await dbConnect();

    const existingHall = await LectureHall.findOne({ hallCode });
    if (existingHall) {
      return NextResponse.json(
        { error: "Hall code already exists" },
        { status: 409 }
      );
    }

    const newHall = new LectureHall({
      hallCode,
      name,
      capacity,
      building,
      features: features || [],
    });

    await newHall.save();

    return NextResponse.json(
      {
        success: true,
        message: "Lecture hall created successfully",
        data: newHall,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating hall:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
