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
    creditHours: {
      type: Number,
      required: true,
    },
    enrollmentCount: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Course || mongoose.model("Course", CourseSchema);
