import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import TimetableSlot from "@/models/TimetableSlot";
import Allocation from "@/models/Allocation";
import Course from "@/models/Course";
import LectureHall from "@/models/LectureHall";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Find student's enrolled courses
    const user = await User.findById((session.user as any).id);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const enrolledCourseIds = user.enrolledCourses || [];
    const managedCourseIds = user.courseRepFor || [];
    
    const allRelevantCourseIds = Array.from(new Set([
      ...enrolledCourseIds.map((id: any) => id.toString()),
      ...managedCourseIds.map((id: any) => id.toString())
    ]));

    const slots = await TimetableSlot.find({ course: { $in: allRelevantCourseIds } })
      .populate({ path: "course", select: "courseCode courseName" })
      .populate({ path: "lecturer", select: "fullName" })
      .populate({ path: "defaultHall", select: "hallCode name" })
      .lean();

    // Check for any active allocations/overrides
    const slotIds = slots.map((s: any) => s._id);
    const overrides = await Allocation.find({ slot: { $in: slotIds }, isActive: true })
      .populate({ path: "hall", select: "hallCode name" })
      .lean();

    const overrideMap = overrides.reduce((acc: any, override: any) => {
      acc[override.slot.toString()] = override;
      return acc;
    }, {});

    // Combine slots with potential overrides
    const combinedSchedule = slots.map((slot: any) => {
      const override = overrideMap[slot._id.toString()];
      const hall = override ? override.hall : slot.defaultHall;
      const buildingValue = hall?.building;
      const building = typeof buildingValue === "object"
        ? buildingValue?.name ?? String(buildingValue)
        : String(buildingValue ?? "");
      return {
        _id: slot._id,
        courseCode: slot.course?.courseCode,
        courseName: slot.course?.courseName,
        lecturerName: slot.lecturer?.fullName || "TBA",
        day: slot.day,
        startTime: slot.startTime,
        endTime: slot.endTime,
        hallCode: hall?.hallCode,
        building,
        classGroup: slot.classGroup || "",
        isRescheduled: !!override,
      };
    });

    return NextResponse.json({ schedule: combinedSchedule });
  } catch (error) {
    console.error("Timetable error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
