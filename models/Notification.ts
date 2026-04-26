import mongoose from "mongoose";
import "./User";
import "./ReassignmentRequest";

const NotificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      default: "Notification",
    },
    type: {
      type: String,
      enum: ["info", "success", "warning", "error", "alert"],
      default: "info",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedRequest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ReassignmentRequest",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
