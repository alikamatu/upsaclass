# Database Documentation

This document lists the Mongoose models (collections) used in the Classroom Allocation and Rescheduling System.

## Collections and Files

| Collection Name | Model File | Description |
| :--- | :--- | :--- |
| **Allocation** | [Allocation.ts](file:///Users/osamaalikamatu/Documents/GitHub/upsaclass/models/Allocation.ts) | Tracks the assignment of slots to lecture halls, including one-time changes. |
| **Building** | [Building.ts](file:///Users/osamaalikamatu/Documents/GitHub/upsaclass/models/Building.ts) | Stores information about campus buildings. |
| **Course** | [Course.ts](file:///Users/osamaalikamatu/Documents/GitHub/upsaclass/models/Course.ts) | Contains course details like code, name, department, and enrollment. |
| **LectureHall** | [LectureHall.ts](file:///Users/osamaalikamatu/Documents/GitHub/upsaclass/models/LectureHall.ts) | Lists available lecture halls, their capacity, and features. |
| **Lecturer** | [Lecturer.ts](file:///Users/osamaalikamatu/Documents/GitHub/upsaclass/models/Lecturer.ts) | Stores details of teaching staff. |
| **Notification** | [Notification.ts](file:///Users/osamaalikamatu/Documents/GitHub/upsaclass/models/Notification.ts) | Stores system notifications for users. |
| **ReassignmentRequest** | [ReassignmentRequest.ts](file:///Users/osamaalikamatu/Documents/GitHub/upsaclass/models/ReassignmentRequest.ts) | Tracks requests from course reps for hall or time changes. |
| **TimetableSlot** | [TimetableSlot.ts](file:///Users/osamaalikamatu/Documents/GitHub/upsaclass/models/TimetableSlot.ts) | Defines the recurring weekly schedule for courses. |
| **User** | [User.ts](file:///Users/osamaalikamatu/Documents/GitHub/upsaclass/models/User.ts) | Manages user accounts (students, course reps, admins). |

## Detailed Schemas

### Allocation
- `slot`: Reference to `TimetableSlot`
- `hall`: Reference to `LectureHall`
- `isActive`: Boolean
- `effectiveFrom`: Date
- `effectiveUntil`: Date
- `isOneTime`: Boolean
- `specificDate`: String (YYYY-MM-DD)

### Building
- `name`: String
- `code`: String (Unique)
- `address`: String

### Course
- `courseCode`: String (Unique)
- `courseName`: String
- `department`: String
- `level`: Number
- `creditHours`: Number
- `enrollmentCount`: Number
- `assignedLecturer`: Reference to `Lecturer`

### LectureHall
- `hallCode`: String (Unique)
- `name`: String
- `capacity`: Number
- `building`: String
- `features`: Array of Strings

### Lecturer
- `staffId`: String (Unique)
- `fullName`: String
- `email`: String (Unique)
- `department`: String
- `phoneNumber`: String

### Notification
- `user`: Reference to `User`
- `message`: String
- `title`: String
- `type`: Enum (info, success, warning, error, alert)
- `isRead`: Boolean
- `relatedRequest`: Reference to `ReassignmentRequest`

### ReassignmentRequest
- `requestedBy`: Reference to `User`
- `slot`: Reference to `TimetableSlot`
- `preferredHall`: Reference to `LectureHall`
- `reason`: String
- `requestedDate`: String (YYYY-MM-DD)
- `status`: Enum (pending, approved, rejected)
- `adminComment`: String
- `approvedNewHall`: Reference to `LectureHall`

### TimetableSlot
- `course`: Reference to `Course`
- `lecturer`: Reference to `Lecturer`
- `day`: Enum (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
- `startTime`: String
- `endTime`: String
- `defaultHall`: Reference to `LectureHall`
- `semester`: String
- `classGroup`: String

### User
- `studentId`: String (Unique)
- `passwordHash`: String
- `fullName`: String
- `email`: String (Unique)
- `role`: Enum (student, rep, admin)
- `courseRepFor`: Array of References to `Course`
- `enrolledCourses`: Array of References to `Course`
