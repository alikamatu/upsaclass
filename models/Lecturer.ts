import mongoose from "mongoose";

const LecturerSchema = new mongoose.Schema(
  {
    staffId: {
      type: String,
      required: true,
      unique: true,
    },
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    department: {
      type: String,
      required: true,
    },
    phoneNumber: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Lecturer || mongoose.model("Lecturer", LecturerSchema);
