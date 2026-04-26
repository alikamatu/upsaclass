import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import ReassignmentRequest from "@/models/ReassignmentRequest";
import Allocation from "@/models/Allocation";
import Notification from "@/models/Notification";
import TimetableSlot from "@/models/TimetableSlot";
import LectureHall from "@/models/LectureHall";
import User from "@/models/User";
import Course from "@/models/Course";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { hallId, adminNotes, isOneTime, specificDate } = await req.json();
    if (!hallId) {
      return NextResponse.json({ error: "Missing hall assignment" }, { status: 400 });
    }

    await dbConnect();
    const { id } = await context.params;

    const request = await ReassignmentRequest.findById(id).populate({
      path: "slot",
      populate: { path: "course" }
    });
    
    if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });
    if (request.status !== "pending") return NextResponse.json({ error: "Request is already processed" }, { status: 400 });

    const targetHall = await LectureHall.findById(hallId);
    if (!targetHall) return NextResponse.json({ error: "Target hall not found" }, { status: 404 });

    // 1. Update request status
    request.status = "approved";
    request.adminComment = adminNotes || "Approved";
    request.approvedNewHall = hallId;
    await request.save();

    // 2. Create allocation override
    await Allocation.create({
      slot: request.slot._id,
      hall: hallId,
      isActive: true,
      effectiveFrom: new Date(),
      isOneTime: !!isOneTime,
      specificDate: specificDate || null,
    });

    // 3. Notify enrolled students
    const course = request.slot.course;
    const courseCode = (course as any).courseCode;
    const students = await User.find({ enrolledCourses: course._id });
    
    const notificationMessage = isOneTime 
      ? `ATTENTION: Your ${courseCode} lecture on ${specificDate} has been moved to ${targetHall.name}.`
      : `UPDATE: Your ${courseCode} recurring lecture has been moved to ${targetHall.name} effective immediately.`;

    const notifications = students.map(student => ({
      user: student._id,
      title: "Class Rescheduled",
      message: notificationMessage,
      type: "alert",
      isRead: false,
      relatedRequest: request._id
    }));
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    await Notification.create({
      user: request.requestedBy,
      title: "Request Approved",
      message: `Your reassignment request for ${courseCode} has been approved and assigned to ${targetHall.name}.`,
      type: "success",
      relatedRequest: request._id,
    });

    return NextResponse.json({ 
      success: true, 
      message: "Approved and students notified",
      allocation: { hall: targetHall.name, isOneTime, specificDate }
    });
  } catch (error) {
    console.error("Approve error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// Support for PUT as well if frontend uses it
export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  return POST(req, context);
}
