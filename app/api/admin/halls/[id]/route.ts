import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import LectureHall from "@/models/LectureHall";
import Allocation from "@/models/Allocation";
import { NextRequest, NextResponse } from "next/server";
import mongoose, { Types } from "mongoose";

interface Params {
  id: string;
}

// PUT /api/admin/halls/[id] - Edit hall details
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
    console.log("Hall ID:", id);

    // Validate ID format
    if (!Types.ObjectId.isValid(id)) {
      console.log("Invalid ObjectId:", id);
      return NextResponse.json({ error: "Invalid hall ID" }, { status: 400 });
    }

    const body = await req.json();
    const { hallCode, name, capacity, building, features } = body;

    // Validate at least one field is provided
    if (!hallCode && !name && !capacity && !building && !features) {
      return NextResponse.json(
        { error: "At least one field must be provided for update" },
        { status: 400 }
      );
    }

    // Validate capacity if provided
    if (capacity && (typeof capacity !== "number" || capacity <= 0)) {
      return NextResponse.json(
        { error: "Capacity must be a positive number" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if hall exists
    const hall = await LectureHall.findById(id);
    if (!hall) {
      return NextResponse.json({ error: "Hall not found" }, { status: 404 });
    }

    // If hallCode is being updated, check for uniqueness (excluding current hall)
    if (hallCode && hallCode !== hall.hallCode) {
      const existingHall = await LectureHall.findOne({
        hallCode,
        _id: { $ne: id },
      });
      if (existingHall) {
        return NextResponse.json(
          { error: "Hall code already exists" },
          { status: 409 }
        );
      }
    }

    // Update hall fields
    if (hallCode) hall.hallCode = hallCode;
    if (name) hall.name = name;
    if (capacity) hall.capacity = capacity;
    if (building !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(building)) {
         return NextResponse.json({ error: "Invalid building ID provided" }, { status: 400 });
      }
      hall.building = building;
    }
    if (features !== undefined) hall.features = features;

    await hall.save();

    return NextResponse.json(
      {
        success: true,
        message: "Lecture hall updated successfully",
        data: hall,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating hall:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/halls/[id] - Delete a hall
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<Params> }
) {
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
    console.log("Hall ID:", id);

    // Validate ID format
    if (!Types.ObjectId.isValid(id)) {
      console.log("Invalid ObjectId:", id);
      return NextResponse.json({ error: "Invalid hall ID" }, { status: 400 });
    }

    await dbConnect();

    // Check if hall exists
    const hall = await LectureHall.findById(id);
    if (!hall) {
      return NextResponse.json({ error: "Hall not found" }, { status: 404 });
    }

    // Check if hall is referenced in active allocations
    const activeAllocations = await Allocation.findOne({
      hall: new Types.ObjectId(id),
      isActive: true,
    });

    if (activeAllocations) {
      return NextResponse.json(
        {
          error:
            "Cannot delete hall: it is referenced in active allocations. Deactivate allocations first.",
        },
        { status: 409 }
      );
    }

    // Delete the hall
    await LectureHall.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "Lecture hall deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting hall:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
