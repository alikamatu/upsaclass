import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import ReassignmentRequest from "@/models/ReassignmentRequest";
import Notification from "@/models/Notification";

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { adminNotes } = await req.json();

    await dbConnect();
    const { id } = await context.params;

    const request = await ReassignmentRequest.findById(id).populate({
      path: "slot",
      populate: { path: "course" }
    });
    
    if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });
    if (request.status !== "pending") return NextResponse.json({ error: "Request is already processed" }, { status: 400 });

    request.status = "rejected";
    request.adminComment = adminNotes || "Rejected";
    await request.save();

    // Notify the rep who submitted it
    const courseCode = (request.slot as any)?.course?.courseCode || "your course";
    
    await Notification.create({
      user: request.requestedBy,
      title: "Request Rejected",
      message: `Your reassignment request for ${courseCode} was rejected. ${adminNotes ? `Reason: ${adminNotes}` : ""}`,
      type: "alert",
      isRead: false,
      relatedRequest: request._id
    });

    return NextResponse.json({ success: true, message: "Rejected successfully" });
  } catch (error) {
    console.error("Reject error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
  return POST(req, context);
}
