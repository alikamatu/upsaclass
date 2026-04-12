import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Building from "@/models/Building";
import LectureHall from "@/models/LectureHall";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

interface Params {
  id: string;
}

// PUT /api/admin/buildings/[id] - Update Building details
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
      return NextResponse.json({ error: "Invalid building ID" }, { status: 400 });
    }

    const body = await req.json();
    const { name, code, address } = body;

    await dbConnect();

    const building = await Building.findById(id);
    if (!building) {
      return NextResponse.json({ error: "Building not found" }, { status: 404 });
    }

    if (code && code !== building.code) {
      const existing = await Building.findOne({ code, _id: { $ne: id } });
      if (existing) {
        return NextResponse.json({ error: "Building code already exists" }, { status: 409 });
      }
    }

    if (name) building.name = name;
    if (code) building.code = code;
    if (address !== undefined) building.address = address;

    await building.save();

    return NextResponse.json(
      {
        success: true,
        message: "Building updated successfully",
        data: building,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating building:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/buildings/[id] - Remove Building
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
      return NextResponse.json({ error: "Invalid building ID" }, { status: 400 });
    }

    await dbConnect();

    const building = await Building.findById(id);
    if (!building) {
      return NextResponse.json({ error: "Building not found" }, { status: 404 });
    }
    
    // Check if building has associated lecture halls
    const associatedHalls = await LectureHall.findOne({ building: new Types.ObjectId(id) });
    if (associatedHalls) {
      return NextResponse.json({ 
        error: "Cannot delete building that contains lecture halls. Reassign or delete halls first." 
      }, { status: 409 });
    }

    await Building.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "Building removed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting building:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
