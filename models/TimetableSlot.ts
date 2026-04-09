import mongoose from "mongoose";

const TimetableSlotSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lecturerName: {
      type: String,
      required: true,
    },
    day: {
      type: String,
      enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    defaultHall: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LectureHall",
      required: true,
    },
    semester: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.TimetableSlot ||
  mongoose.model("TimetableSlot", TimetableSlotSchema);
