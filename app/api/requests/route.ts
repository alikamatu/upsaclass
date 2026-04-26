import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import ReassignmentRequest from "@/models/ReassignmentRequest";
import TimetableSlot from "@/models/TimetableSlot";
import User from "@/models/User";
import Course from "@/models/Course"; // Ensure Course is registered
import LectureHall from "@/models/LectureHall"; // Ensure LectureHall is registered
import Notification from "@/models/Notification";

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
        populate: [
          { path: "course", select: "courseCode courseName enrollmentCount" },
          { path: "lecturer", select: "fullName staffId" },
          { path: "defaultHall", select: "name hallCode capacity building" }
        ]
      })
      .populate("requestedBy", "fullName studentId role")
      .populate("preferredHall", "name hallCode capacity building")
      .populate("approvedNewHall", "name hallCode capacity building")
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
    const { slotId, preferredHallId, reason, requestedDate } = data;

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
      requestedDate: requestedDate || null,
      status: "pending"
    });

    const course = await Course.findById(slot.course).select("courseCode courseName");
    const courseLabel = course ? `${course.courseCode} - ${course.courseName}` : "your selected course";

    await Notification.create({
      user: (session.user as any).id,
      title: "Request Submitted",
      message: `Your reassignment request for ${courseLabel} has been submitted and is pending review.`,
      type: "info",
      relatedRequest: newRequest._id,
    });

    const admins = await User.find({ role: "admin" }).select("_id");
    if (admins.length > 0) {
      const adminNotifications = admins.map((admin) => ({
        user: admin._id,
        title: "New Reassignment Request",
        message: `A new reassignment request for ${courseLabel} has been submitted by ${session.user?.name || "a representative"}.`,
        type: "info",
        relatedRequest: newRequest._id,
      }));
      await Notification.insertMany(adminNotifications);
    }

    return NextResponse.json({ message: "Request created", request: newRequest }, { status: 201 });
  } catch (error) {
    console.error("Create request error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
