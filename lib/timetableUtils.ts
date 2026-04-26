// Maps day abbreviations to offset from today for FullCalendar date strings
export const DAY_MAP: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

export interface TimetableEvent {
  id: string;
  courseCode: string;
  courseName: string;
  department: string;
  lecturerName: string;
  lecturerStaffId: string;
  day: string;
  startTime: string;
  endTime: string;
  hallCode: string;
  hallName: string;
  building: string;
  capacity: number;
  features: string[];
  semester: string;
  classGroup: string;
  isRescheduled: boolean;
}

export interface FilterState {
  building: string;
  lecturer: string;
  capacity: string;
  timeOfDay: string;
  day: string;
}

export const DEFAULT_FILTERS: FilterState = {
  building: "",
  lecturer: "",
  capacity: "",
  timeOfDay: "all",
  day: "",
};

/**
 * Returns an ISO date string (YYYY-MM-DD) for the nearest occurrence of the given
 * day abbreviation relative to today (current week, starting Monday).
 */
export function getDateForDay(dayAbbr: string): string {
  const today = new Date();
  const todayDay = today.getDay(); // 0=Sun
  const targetDay = DAY_MAP[dayAbbr] ?? todayDay;
  const diff = targetDay - todayDay;
  const target = new Date(today);
  target.setDate(today.getDate() + diff);
  return target.toISOString().split("T")[0];
}

/** Converts timetable events into FullCalendar event objects with weekly recurrence */
export function toFullCalendarEvents(events: TimetableEvent[]): object[] {
  return events.map((e) => {
    return {
      id: e.id,
      title: e.courseCode,
      daysOfWeek: [DAY_MAP[e.day]], // 0=Sun, 1=Mon, etc.
      startTime: e.startTime,
      endTime: e.endTime,
      extendedProps: e,
      backgroundColor: e.isRescheduled ? "#f59e0b" : "#3b82f6",
      borderColor: e.isRescheduled ? "#d97706" : "#2563eb",
      textColor: "#ffffff",
    };
  });
}

/** Client-side filter logic combining search + all filter dimensions */
export function filterEvents(
  events: TimetableEvent[],
  search: string,
  filters: FilterState
): TimetableEvent[] {
  const q = search.toLowerCase().trim();

  return events.filter((e) => {
    // Full-text search across key fields
    if (q) {
      const haystack = [
        e.courseCode,
        e.courseName,
        e.lecturerName,
        e.hallName,
        e.hallCode,
        e.building,
        e.department,
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    if (filters.building && e.building !== filters.building) return false;
    if (filters.lecturer && e.lecturerName !== filters.lecturer) return false;

    if (filters.capacity) {
      const min = parseInt(filters.capacity, 10);
      if (e.capacity < min) return false;
    }

    if (filters.timeOfDay && filters.timeOfDay !== "all") {
      const hour = parseInt(e.startTime.split(":")[0], 10);
      if (filters.timeOfDay === "morning" && hour >= 12) return false;
      if (filters.timeOfDay === "afternoon" && (hour < 12 || hour >= 17))
        return false;
      if (filters.timeOfDay === "evening" && hour < 17) return false;
    }

    if (filters.day && e.day !== filters.day) return false;

    return true;
  });
}

/** Generates an ICS file string from a list of timetable events */
export function generateICS(events: TimetableEvent[]): string {
  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//UpsaClass//Schedule//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
  ];

  events.forEach((e) => {
    const date = getDateForDay(e.day).replace(/-/g, "");
    const startStr = e.startTime.replace(":", "");
    const endStr = e.endTime.replace(":", "");
    lines.push(
      "BEGIN:VEVENT",
      `UID:${e.id}@upsaclass`,
      `SUMMARY:${e.courseCode} - ${e.courseName}`,
      `DTSTART:${date}T${startStr}00`,
      `DTEND:${date}T${endStr}00`,
      `LOCATION:${e.hallName}, ${e.building}`,
      `DESCRIPTION:Lecturer: ${e.lecturerName}\\nDept: ${e.department}\\nCapacity: ${e.capacity}`,
      "END:VEVENT"
    );
  });

  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}
