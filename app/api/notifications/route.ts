import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import dbConnect from "@/lib/db";
import Notification from "@/models/Notification";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await dbConnect();
    const userId = (session.user as any).id;

    const notifications = await Notification.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("Notifications GET error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "Notification ID missing" }, { status: 400 });

    await dbConnect();
    const userId = (session.user as any).id;

    const notification = await Notification.findOneAndUpdate(
      { _id: id, user: userId },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, notification });
  } catch (error) {
    console.error("Notifications PUT error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
