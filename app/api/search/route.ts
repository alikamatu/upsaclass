import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Course from "@/models/Course";
import TimetableSlot from "@/models/TimetableSlot";
import Allocation from "@/models/Allocation";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    await dbConnect();

    // 1. Find matching courses
    const courses = await Course.find({
      $or: [
        { courseCode: { $regex: query, $options: "i" } },
        { courseName: { $regex: query, $options: "i" } },
      ],
    }).lean();

    const courseIds = courses.map((c: any) => c._id);

    if (courseIds.length === 0) {
      return NextResponse.json({ results: [] });
    }

    // 2. Find timetable slots for those courses
    const slots = await TimetableSlot.find({ course: { $in: courseIds } })
      .populate({ path: "course", select: "courseCode courseName" })
      .populate({ path: "defaultHall", select: "hallCode name" })
      .lean();

    // 3. Find active allocations
    const slotIds = slots.map((s: any) => s._id);
    const overrides = await Allocation.find({ slot: { $in: slotIds }, isActive: true })
      .populate({ path: "hall", select: "hallCode name" })
      .lean();

    const overrideMap = overrides.reduce((acc: any, override: any) => {
      acc[override.slot.toString()] = override;
      return acc;
    }, {});

    // 4. Combine
    const searchResults = slots.map((slot: any) => {
      const override = overrideMap[slot._id.toString()];
      return {
        _id: slot._id,
        courseCode: slot.course?.courseCode,
        courseName: slot.course?.courseName,
        lecturerName: slot.lecturerName,
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        hallCode: override ? override.hall?.hallCode : slot.defaultHall?.hallCode,
        isRescheduled: !!override,
      };
    });

    return NextResponse.json({ results: searchResults });
  } catch (error) {
    console.error("Search error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
