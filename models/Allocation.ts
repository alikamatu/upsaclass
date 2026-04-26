import mongoose from "mongoose";
import "./TimetableSlot";
import "./LectureHall";

const AllocationSchema = new mongoose.Schema(
  {
    slot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TimetableSlot",
      required: true,
    },
    hall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LectureHall",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    effectiveFrom: {
      type: Date,
      default: Date.now,
    },
    effectiveUntil: {
      type: Date,
      default: null,
    },
    isOneTime: {
      type: Boolean,
      default: false,
    },
    specificDate: {
      type: String, // YYYY-MM-DD
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Allocation ||
  mongoose.model("Allocation", AllocationSchema);
