import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Building from "@/models/Building";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/buildings - View all buildings
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

    const buildings = await Building.find({}).sort({ name: 1 });

    return NextResponse.json(
      {
        success: true,
        data: buildings,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching buildings:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/buildings - Create a building
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
    const { name, code, address } = body;

    if (!name || !code) {
      return NextResponse.json(
        { error: "Missing required fields: name, code" },
        { status: 400 }
      );
    }

    await dbConnect();

    const existingBuilding = await Building.findOne({ code });
    if (existingBuilding) {
      return NextResponse.json(
        { error: "Building code already exists" },
        { status: 409 }
      );
    }

    const newBuilding = new Building({ name, code, address });
    await newBuilding.save();

    return NextResponse.json(
      {
        success: true,
        message: "Building created successfully",
        data: newBuilding,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating building:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
