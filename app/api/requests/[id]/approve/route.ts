import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import ReassignmentRequest from "@/models/ReassignmentRequest";
import Allocation from "@/models/Allocation";
import Notification from "@/models/Notification";
import TimetableSlot from "@/models/TimetableSlot";
import User from "@/models/User";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { newHallId, adminComment } = await req.json();
    if (!newHallId) {
      return NextResponse.json({ error: "Missing new hall assignment" }, { status: 400 });
    }

    await dbConnect();
    
    // params is technically a Promise in Next.js 15+, but since this is 14 we can access directly
    // to be safe let's assume it's synchronous but we handle either way
    const id = params.id;

    const request = await ReassignmentRequest.findById(id).populate("slot");
    if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });
    if (request.status !== "pending") return NextResponse.json({ error: "Request is not pending" }, { status: 400 });

    // Mark request as approved
    request.status = "approved";
    request.adminComment = adminComment;
    request.approvedNewHall = newHallId;
    await request.save();

    // Create allocation map for the override
    await Allocation.create({
      slot: request.slot._id,
      hall: newHallId,
      isActive: true,
      effectiveFrom: new Date(),
    });

    // Notify all students in the course
    const course = request.slot.course;
    const students = await User.find({ enrolledCourses: course });
    
    const notifications = students.map(student => ({
      user: student._id,
      message: `Your class for course ${course} has been moved to a new hall. Please check your schedule.`,
      isRead: false,
      relatedRequest: request._id
    }));
    
    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    return NextResponse.json({ message: "Approved successfully" });
  } catch (error) {
    console.error("Approve error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
