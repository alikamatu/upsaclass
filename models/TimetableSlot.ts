import mongoose from "mongoose";
import "./Course";
import "./Lecturer";
import "./LectureHall";

const TimetableSlotSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecturer",
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
    classGroup: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.models.TimetableSlot ||
  mongoose.model("TimetableSlot", TimetableSlotSchema);
