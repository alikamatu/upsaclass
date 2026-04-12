import mongoose from "mongoose";

const CourseSchema = new mongoose.Schema(
  {
    courseCode: {
      type: String,
      required: true,
      unique: true,
    },
    courseName: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    level: {
      type: Number,
      required: true,
      default: 100,
    },
    creditHours: {
      type: Number,
      required: true,
    },
    enrollmentCount: {
      type: Number,
      required: true,
    },
    assignedLecturer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lecturer",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Course || mongoose.model("Course", CourseSchema);
