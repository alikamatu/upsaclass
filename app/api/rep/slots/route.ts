import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import TimetableSlot from "@/models/TimetableSlot";
import User from "@/models/User";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "rep") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await dbConnect();

    const user = await User.findById((session.user as any).id);
    if (!user || !user.courseRepFor || user.courseRepFor.length === 0) {
      return NextResponse.json({ error: "No courses assigned to this representative" }, { status: 404 });
    }

    const slots = await TimetableSlot.find({ course: { $in: user.courseRepFor } })
      .populate({ path: "course", select: "courseCode courseName" })
      .populate({ path: "defaultHall", select: "hallCode name capacity" })
      .lean();

    return NextResponse.json({ slots });
  } catch (error) {
    console.error("Fetch rep slots error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
