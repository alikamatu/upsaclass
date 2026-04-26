import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import TimetableSlot from "@/models/TimetableSlot";
import { NextRequest, NextResponse } from "next/server";

// GET /api/admin/timetable - View all timetable slots
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

    // Populate course, lecturer, and defaultHall references
    const slots = await TimetableSlot.find({})
      .populate("course")
      .populate("lecturer")
      .populate("defaultHall")
      .sort({ day: 1, startTime: 1 });

    return NextResponse.json(
      {
        success: true,
        data: slots,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching timetable slots:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/admin/timetable - Create a new timetable slot
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
    const { course, lecturer, day, startTime, endTime, defaultHall, semester, classGroup } = body;

    // Validate required fields
    if (!course || !lecturer || !day || !startTime || !endTime || !defaultHall || !semester) {
      return NextResponse.json(
        {
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }
    
    // Ensure startTime is before endTime lexicographically for basic 24h format "HH:MM"
    if (startTime >= endTime) {
       return NextResponse.json({ error: "Start time must be before end time" }, { status: 400 });
    }

    await dbConnect();
    
    // Conflict Prevention Logic
    // We check if there is ANY slot on the same day where its time overlaps with [startTime, endTime].
    // Overlap condition: `newStart < existingEnd` AND `newEnd > existingStart`
    const overlappingSlot = await TimetableSlot.findOne({
      day,
      semester,
      $and: [
        { startTime: { $lt: endTime } },
        { endTime: { $gt: startTime } }
      ],
      $or: [
        { defaultHall }, // Hall double-booked
        { lecturer }     // Lecturer double-booked
      ]
    });

    if (overlappingSlot) {
      // Determine exactly what caused the conflict for a clean user message
      if (overlappingSlot.defaultHall.toString() === defaultHall.toString()) {
        return NextResponse.json({ error: `Conflict: Hall is already booked during this time on ${day}` }, { status: 409 });
      }
      if (overlappingSlot.lecturer.toString() === lecturer.toString()) {
        return NextResponse.json({ error: `Conflict: Lecturer is already scheduled for another class during this time on ${day}` }, { status: 409 });
      }
    }

    // Create new timetable slot
    const newSlot = new TimetableSlot({
      course,
      lecturer,
      day,
      startTime,
      endTime,
      defaultHall,
      semester,
      classGroup: classGroup || "",
    });

    await newSlot.save();

    // Return the created slot with populated fields
    const populatedSlot = await TimetableSlot.findById(newSlot._id)
      .populate("course")
      .populate("lecturer")
      .populate("defaultHall");

    return NextResponse.json(
      {
        success: true,
        message: "Timetable slot created successfully",
        data: populatedSlot,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating timetable slot:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
