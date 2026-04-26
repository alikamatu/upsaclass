import { NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import TimetableSlot from "@/models/TimetableSlot";
import Allocation from "@/models/Allocation";
import Course from "@/models/Course";
import Lecturer from "@/models/Lecturer";
import LectureHall from "@/models/LectureHall";
import Building from "@/models/Building";

// Public endpoint – no session required.
export async function GET() {
  try {
    await dbConnect();

    const slots = await TimetableSlot.find({})
      .populate({ path: "course", select: "courseCode courseName department" })
      .populate({ path: "lecturer", select: "fullName staffId" })
      .populate({
        path: "defaultHall",
        select: "hallCode name capacity building features",
      })
      .lean();

    // Active allocation overrides (hall swaps)
    const slotIds = slots.map((s: any) => s._id);
    let overrideMap: Record<string, any> = {};

    if (slotIds.length > 0) {
      const overrides = await Allocation.find({
        slot: { $in: slotIds },
        isActive: true,
      })
        .populate({
          path: "hall",
          select: "hallCode name capacity building features",
        })
        .lean();

      overrideMap = overrides.reduce((acc: any, o: any) => {
        acc[o.slot.toString()] = o;
        return acc;
      }, {});
    }

    const unresolvedBuildingIds = new Set<string>();

    slots.forEach((slot: any) => {
      const override = overrideMap[slot._id.toString()];
      const hall = override?.hall ?? slot.defaultHall;
      const buildingValue = hall?.building;
      if (
        typeof buildingValue === "string" &&
        /^[0-9a-fA-F]{24}$/.test(buildingValue)
      ) {
        unresolvedBuildingIds.add(buildingValue);
      }
    });

    const buildingDocs = unresolvedBuildingIds.size
      ? await Building.find({ _id: { $in: Array.from(unresolvedBuildingIds) } })
          .select("name")
          .lean()
      : [];

    const buildingMap = buildingDocs.reduce((acc: Record<string, string>, building: any) => {
      acc[building._id.toString()] = building.name;
      return acc;
    }, {});

    const events = slots.map((slot: any) => {
      const override = overrideMap[slot._id.toString()];
      const hall = override?.hall ?? slot.defaultHall;
      const buildingValue = hall?.building;
      const building = typeof buildingValue === "object"
        ? buildingValue?.name ?? String(buildingValue)
        : buildingMap[buildingValue] || String(buildingValue ?? "TBA");

      return {
        id: slot._id.toString(),
        courseCode: slot.course?.courseCode ?? "N/A",
        courseName: slot.course?.courseName ?? "Unknown Course",
        department: slot.course?.department ?? "",
        lecturerName: slot.lecturer?.fullName ?? "Unknown Lecturer",
        lecturerStaffId: slot.lecturer?.staffId ?? "",
        day: slot.day ?? "",
        startTime: slot.startTime ?? "",
        endTime: slot.endTime ?? "",
        hallCode: hall?.hallCode ?? "",
        hallName: hall?.name ?? "TBA",
        building,
        capacity: hall?.capacity ?? 0,
        features: hall?.features ?? [],
        semester: slot.semester ?? "",
        classGroup: slot.classGroup ?? "",
        isRescheduled: !!override,
      };
    });

    const buildings = [
      ...new Set(events.map((e) => e.building).filter((b) => b && b !== "TBA")),
    ].sort();

    const lecturers = [
      ...new Set(
        events
          .map((e) => e.lecturerName)
          .filter((l) => l && l !== "Unknown Lecturer")
      ),
    ].sort();

    return NextResponse.json({ events, buildings, lecturers });
  } catch (err: any) {
    console.error("[events] Query failed:", err);
    return NextResponse.json(
      { error: "Query failed", detail: err?.message },
      { status: 500 }
    );
  }
}
