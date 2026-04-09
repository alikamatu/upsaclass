import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import "dotenv/config";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error("MONGODB_URI is required in .env");
}

const hallSchema = new mongoose.Schema({
  hallCode: String,
  name: String,
  capacity: Number,
  building: String,
  features: [String],
});
const LectureHall = mongoose.models.LectureHall || mongoose.model("LectureHall", hallSchema);

const courseSchema = new mongoose.Schema({
  courseCode: String,
  courseName: String,
  department: String,
  creditHours: Number,
  enrollmentCount: Number,
});
const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);

const userSchema = new mongoose.Schema({
  studentId: String,
  passwordHash: String,
  fullName: String,
  role: String,
  courseRepFor: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
});
const User = mongoose.models.User || mongoose.model("User", userSchema);

const slotSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
  lecturerName: String,
  day: String,
  startTime: String,
  endTime: String,
  defaultHall: { type: mongoose.Schema.Types.ObjectId, ref: "LectureHall" },
  semester: String,
});
const TimetableSlot = mongoose.models.TimetableSlot || mongoose.model("TimetableSlot", slotSchema);

async function seed() {
  await mongoose.connect(MONGODB_URI as string);
  console.log("Connected to MongoDB");

  // Clear existing data
  await LectureHall.deleteMany({});
  await Course.deleteMany({});
  await User.deleteMany({});
  await TimetableSlot.deleteMany({});
  console.log("Cleared existing data");

  // 1. Halls
  const halls = await LectureHall.insertMany([
    { hallCode: "LT001", name: "Nelson Mandela Lecture Theatre", capacity: 120, building: "Faculty Block A", features: ["projector", "ac", "whiteboard"] },
    { hallCode: "LT002", name: "Kofi Annan Hall", capacity: 80, building: "Faculty Block A", features: ["whiteboard"] },
    { hallCode: "LT003", name: "LBC VIP Hall", capacity: 200, building: "LBC Block", features: ["projector", "ac", "whiteboard", "pa_system"] },
  ]);

  // 2. Courses
  const courses = await Course.insertMany([
    { courseCode: "CSC301", courseName: "Web Development", department: "Computer Science", creditHours: 3, enrollmentCount: 85 },
    { courseCode: "CSC305", courseName: "Databases", department: "Computer Science", creditHours: 3, enrollmentCount: 85 },
    { courseCode: "MGT201", courseName: "Principles of Management", department: "Business", creditHours: 3, enrollmentCount: 150 },
  ]);

  // 3. Timetable Slots
  const slots = await TimetableSlot.insertMany([
    { course: courses[0]._id, lecturerName: "Dr. Adjei", day: "Mon", startTime: "10:00", endTime: "12:00", defaultHall: halls[0]._id, semester: "2025-1" },
    { course: courses[1]._id, lecturerName: "Prof. Mensah", day: "Tue", startTime: "13:00", endTime: "15:00", defaultHall: halls[1]._id, semester: "2025-1" },
  ]);

  // 4. Users
  const passwordHash = await bcrypt.hash("password123", 10);
  await User.insertMany([
    { studentId: "ADMIN001", passwordHash, fullName: "System Admin", role: "admin", enrolledCourses: [] },
    { studentId: "2024CS001", passwordHash, fullName: "Kofi Mensah", role: "student", enrolledCourses: [courses[0]._id, courses[1]._id] },
    { studentId: "2024CSREP", passwordHash, fullName: "Ama Serwaa", role: "rep", courseRepFor: courses[0]._id, enrolledCourses: [courses[0]._id, courses[1]._id] },
  ]);

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seeding failed", err);
  process.exit(1);
});
