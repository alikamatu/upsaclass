import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import LectureHall from "@/models/LectureHall";
import TimetableSlot from "@/models/TimetableSlot";
import Allocation from "@/models/Allocation";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const day = searchParams.get("day");
    const startTime = searchParams.get("startTime");
    const endTime = searchParams.get("endTime");

    if (!day || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    await dbConnect();

    // 1. Get all halls
    const allHalls = await LectureHall.find({}).lean();
    
    // 2. Find any slots happening at this time to see which halls are booked by default
    const conflictingSlots = await TimetableSlot.find({
      day,
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    }).lean();

    const conflictingSlotIds = conflictingSlots.map((s: any) => s._id);

    // 3. Get active overrides to see if any halls were freed or taken
    const overrides = await Allocation.find({ isActive: true }).lean();
    
    // A hall is occupied if:
    // It's the default hall for a conflicting slot AND there's no override for that slot
    // OR it's the overridden hall for ANY conflicting slot
    
    const occupiedHallIds = new Set<string>();

    for (const slot of conflictingSlots) {
      const overrideForSlot = overrides.find((o: any) => o.slot.toString() === slot._id.toString());
      if (overrideForSlot) {
        // The override hall is taken
        if (overrideForSlot.hall) {
          occupiedHallIds.add(overrideForSlot.hall.toString());
        }
      } else {
        // The default hall is taken
        if (slot.defaultHall) {
          occupiedHallIds.add(slot.defaultHall.toString());
        }
      }
    }

    // Identify intersecting active overrides from other slots at the same time? 
    // Wait, the logic above covers overrides for conflicting slots. But what if a non-conflicting slot was overridden to happen at this time?
    // In our simplified model, overrides don't change the TIME, only the HALL. So we only check conflicting slots.

    const availableHalls = allHalls.filter((hall: any) => !occupiedHallIds.has(hall._id.toString()));

    return NextResponse.json({ availableHalls });
  } catch (error) {
    console.error("Availability error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
