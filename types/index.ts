export type UserRole = "student" | "rep" | "admin";

export interface User {
  _id: string;
  studentId: string;
  fullName: string;
  role: UserRole;
  courseRepFor?: string[] | any;
  enrolledCourses: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Building {
  _id: string;
  name: string;
  code: string;
  address?: string;
}

export interface Lecturer {
  _id: string;
  staffId: string;
  fullName: string;
  email: string;
  department: string;
  phoneNumber?: string;
}

export interface LectureHall {
  _id: string;
  name: string;
  capacity: number;
  building: string | Building | any;
  features: string[];
  isAvailable: boolean;
  hallCode: string;
}

export interface Course {
  _id: string;
  courseCode: string;
  courseName: string;
  department: string;
  level: number;
  creditHours: number;
  enrollmentCount: number;
  assignedLecturer?: string | Lecturer | any;
}

export type RequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface ReassignmentRequest {
  _id: string;
  courseId: string | any;
  requestedBy: string | User | any;
  slot: string | TimetableSlot | any;
  preferredHall?: string | LectureHall | any;
  reason: string;
  requestedDate?: string | null;
  status: string; // PENDING, APPROVED, REJECTED
  adminComment?: string;
  approvedNewHall?: string | LectureHall | any;
  createdAt: string;
  updatedAt: string;
}

export interface TimetableSlot {
  _id: string;
  course: string | Course | any;
  lecturer: string | Lecturer | any;
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  defaultHall: string | LectureHall | any;
  semester: string;
  classGroup?: string;
}

export interface Allocation {
  _id: string;
  slot: string | TimetableSlot | any;
  hall: string | LectureHall | any;
  isActive: boolean;
  effectiveFrom: string;
  effectiveUntil?: string | null;
  isOneTime?: boolean;
  specificDate?: string | null;
}

export interface Notification {
  _id: string;
  user: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  relatedRequest?: string;
  createdAt: string;
}
