import mongoose from "mongoose";
import "./User";
import "./TimetableSlot";
import "./LectureHall";

const ReassignmentRequestSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimetableSlot",
      required: true,
    },
    preferredHall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LectureHall",
    },
    reason: {
      type: String,
      required: true,
    },
    requestedDate: {
      type: String, // YYYY-MM-DD
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    adminComment: {
      type: String,
      default: null,
    },
    approvedNewHall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LectureHall",
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.ReassignmentRequest ||
  mongoose.model("ReassignmentRequest", ReassignmentRequestSchema);
