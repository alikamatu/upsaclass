import mongoose from "mongoose";

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
