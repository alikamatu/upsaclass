import mongoose from "mongoose";

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
