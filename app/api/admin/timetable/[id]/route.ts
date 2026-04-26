import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import TimetableSlot from "@/models/TimetableSlot";
import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

interface Params {
  id: string;
}

// PUT /api/admin/timetable/[id] - Update Timetable Slot
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
      return NextResponse.json({ error: "Invalid slot ID" }, { status: 400 });
    }

    const body = await req.json();
    const { course, lecturer, day, startTime, endTime, defaultHall, semester, classGroup } = body;

    await dbConnect();

    const slot = await TimetableSlot.findById(id);
    if (!slot) {
      return NextResponse.json({ error: "Timetable slot not found" }, { status: 404 });
    }
    
    // Conflict Prevention Logic (if time/day/hall/lecturer is changing)
    const newDay = day || slot.day;
    const newSemester = semester || slot.semester;
    const newStartTime = startTime || slot.startTime;
    const newEndTime = endTime || slot.endTime;
    const newHall = defaultHall || slot.defaultHall;
    const newLecturer = lecturer || slot.lecturer;
    
    if (newStartTime >= newEndTime) {
       return NextResponse.json({ error: "Start time must be before end time" }, { status: 400 });
    }

    const overlappingSlot = await TimetableSlot.findOne({
      _id: { $ne: id }, // exclude self
      day: newDay,
      semester: newSemester,
      $and: [
        { startTime: { $lt: newEndTime } },
        { endTime: { $gt: newStartTime } }
      ],
      $or: [
        { defaultHall: newHall }, 
        { lecturer: newLecturer }     
      ]
    });

    if (overlappingSlot) {
      if (overlappingSlot.defaultHall.toString() === newHall.toString()) {
        return NextResponse.json({ error: `Conflict: Hall is already booked during this time on ${newDay}` }, { status: 409 });
      }
      if (overlappingSlot.lecturer.toString() === newLecturer.toString()) {
        return NextResponse.json({ error: `Conflict: Lecturer is already scheduled for another class during this time on ${newDay}` }, { status: 409 });
      }
    }

    // Update fields
    if (course) slot.course = course;
    if (lecturer) slot.lecturer = lecturer;
    if (day) slot.day = day;
    if (startTime) slot.startTime = startTime;
    if (endTime) slot.endTime = endTime;
    if (defaultHall) slot.defaultHall = defaultHall;
    if (semester) slot.semester = semester;
    if (classGroup !== undefined) slot.classGroup = classGroup;

    await slot.save();

    // Population requires re-querying or use populate on doc
    const populatedSlot = await TimetableSlot.findById(slot._id)
      .populate("course")
      .populate("lecturer")
      .populate("defaultHall");

    return NextResponse.json(
      {
        success: true,
        message: "Timetable slot updated successfully",
        data: populatedSlot,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating timetable slot:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE /api/admin/timetable/[id] - Remove Timetable Slot
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
      return NextResponse.json({ error: "Invalid slot ID" }, { status: 400 });
    }

    await dbConnect();

    const slot = await TimetableSlot.findById(id);
    if (!slot) {
      return NextResponse.json({ error: "Timetable slot not found" }, { status: 404 });
    }

    await TimetableSlot.findByIdAndDelete(id);

    return NextResponse.json(
      {
        success: true,
        message: "Timetable slot removed successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting timetable slot:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
