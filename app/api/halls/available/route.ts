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
    const dateStr = searchParams.get("date"); // YYYY-MM-DD
    const startTime = searchParams.get("startTime");
    const endTime = searchParams.get("endTime");

    if (!dateStr || !startTime || !endTime) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    await dbConnect();

    // Determine the day from the date
    const dateObj = new Date(dateStr);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const day = days[dateObj.getDay()];

    // 1. Get all halls
    const allHalls = await LectureHall.find({}).lean();
    
    // 2. Find any slots happening on this day of the week that overlap
    const conflictingSlots = await TimetableSlot.find({
      day,
      $or: [
        { startTime: { $lt: endTime, $gte: startTime } },
        { endTime: { $gt: startTime, $lte: endTime } },
        { startTime: { $lte: startTime }, endTime: { $gte: endTime } }
      ]
    }).lean();

    // 3. Get active overrides for this specific date OR permanent overrides
    // Permanent overrides are those where specificDate is null or matches dateStr
    const overrides = await Allocation.find({ 
      isActive: true,
      $or: [
        { specificDate: dateStr },
        { specificDate: null }
      ]
    }).lean();
    
    const occupiedHallIds = new Set<string>();

    // Check default halls and overrides for conflicting slots
    for (const slot of conflictingSlots) {
      // Find override for this specific slot on this date
      const overrideForSlot = overrides.find((o: any) => 
        o.slot.toString() === slot._id.toString() && 
        (o.specificDate === dateStr || o.specificDate === null)
      );

      if (overrideForSlot) {
        // This slot has been moved TO a new hall
        if (overrideForSlot.hall) {
          occupiedHallIds.add(overrideForSlot.hall.toString());
        }
        // Note: The defaultHall of this slot is now FREE (handled by not adding it)
      } else {
        // No override, default hall is taken
        if (slot.defaultHall) {
          occupiedHallIds.add(slot.defaultHall.toString());
        }
      }
    }

    // 4. Check for any overrides for OTHER slots that moved INTO a hall at this time
    // This is already covered by the loop above if those slots were on the same day.
    // What if a slot from a DIFFERENT day was moved into THIS date?
    // Our UI usually keeps the day consistent, but to be safe:
    for (const override of overrides) {
      const slot = await TimetableSlot.findById(override.slot);
      if (slot && slot.day !== day) {
        // This check would be for arbitrary rescheduling across days
        // For now, assume rescheduling stays within the same slot time/day but changes hall
      }
    }

    const availableHalls = allHalls.filter((hall: any) => !occupiedHallIds.has(hall._id.toString()));

    return NextResponse.json({ success: true, data: availableHalls });
  } catch (error) {
    console.error("Availability error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
