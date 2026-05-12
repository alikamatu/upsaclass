import mongoose from "mongoose";
import "./Course";

const UserSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    fullName: { type: String, required: true },
    email: { type: String, unique: true, sparse: true, lowercase: true, trim: true },
    emailVerified: { type: Boolean, default: false },
    verificationCode: String,
    verificationCodeExpiry: Date,
    resetPasswordCode: String,
    resetPasswordCodeExpiry: Date,
    failedLoginAttempts: { type: Number, default: 0 },
    lockedUntil: Date,
    role: {
      type: String,
      enum: ["student", "rep", "admin"],
      default: "student",
    },
    courseRepFor: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
