import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import ReassignmentRequest from "@/models/ReassignmentRequest";
import TimetableSlot from "@/models/TimetableSlot";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const userRole = (session.user as any).role;
    const userId = (session.user as any).id;

    let filter = {};
    if (userRole !== "admin") {
      filter = { requestedBy: userId };
    }

    const requests = await ReassignmentRequest.find(filter)
      .populate({
        path: "slot",
        populate: { path: "course", select: "courseCode courseName" }
      })
      .populate("requestedBy", "fullName studentId")
      .populate("preferredHall", "name hallCode")
      .populate("approvedNewHall", "name hallCode")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ requests });
  } catch (error) {
    console.error("Fetch requests error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "rep") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await req.json();
    const { slotId, preferredHallId, reason } = data;

    if (!slotId || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await dbConnect();

    // Verify the slot exists
    const slot = await TimetableSlot.findById(slotId);
    if (!slot) return NextResponse.json({ error: "Slot not found" }, { status: 404 });

    const newRequest = await ReassignmentRequest.create({
      requestedBy: (session.user as any).id,
      slot: slotId,
      preferredHall: preferredHallId || null,
      reason,
      status: "pending"
    });

    return NextResponse.json({ message: "Request created", request: newRequest }, { status: 201 });
  } catch (error) {
    console.error("Create request error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
