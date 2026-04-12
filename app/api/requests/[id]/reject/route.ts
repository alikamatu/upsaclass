import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import ReassignmentRequest from "@/models/ReassignmentRequest";
import Notification from "@/models/Notification";

export async function PUT(req: Request, context: { params: Promise<{ id: string }> | { id: string } }) {
  try {
    const params = await context.params;
    const session = await getServerSession(authOptions);
    if (!session || (session.user as any).role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { adminComment } = await req.json();

    await dbConnect();
    const id = params.id;

    const request = await ReassignmentRequest.findById(id);
    if (!request) return NextResponse.json({ error: "Request not found" }, { status: 404 });
    if (request.status !== "pending") return NextResponse.json({ error: "Request is not pending" }, { status: 400 });

    request.status = "rejected";
    request.adminComment = adminComment;
    await request.save();

    // Optionally notify the rep who submitted it
    await Notification.create({
      user: request.requestedBy,
      message: `Your hall reassignment request was rejected. ${adminComment ? `Reason: ${adminComment}` : ""}`,
      isRead: false,
      relatedRequest: request._id
    });

    return NextResponse.json({ message: "Rejected successfully" });
  } catch (error) {
    console.error("Reject error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
