"use client";

import { useEffect, useState } from "react";
import { TimetableSkeleton } from "@/components/ui/LoadingSkeleton";
import { StaggerList, StaggerItem } from "@/components/ui/StaggerList";
import { Badge } from "@/components/ui/badge";

type ScheduleItem = {
  _id: string;
  courseCode: string;
  courseName: string;
  lecturerName: string;
  day: string;
  startTime: string;
  endTime: string;
  hallCode: string;
  isRescheduled: boolean;
};

export function TimetableGrid() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTimetable() {
      try {
        const res = await fetch("/api/timetable");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setSchedule(data.schedule);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchTimetable();
  }, []);

  if (loading) {
    return <TimetableSkeleton />;
  }

  if (schedule.length === 0) {
    return <div className="text-center py-8 text-slate-500">No classes scheduled.</div>;
  }

  return (
    <StaggerList className="flex flex-col gap-3">
      {schedule.map((item) => (
        <StaggerItem key={item._id}>
          <div className="border rounded-xl p-4 flex flex-col md:flex-row justify-between md:items-center bg-white hover:bg-slate-50 transition-colors shadow-sm">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-semibold text-slate-900">{item.courseCode}</h3>
                {item.isRescheduled && (
                  <Badge variant="destructive" className="bg-red-500 text-white rounded-full">
                    Rescheduled
                  </Badge>
                )}
              </div>
              <p className="text-sm text-slate-600">{item.courseName}</p>
              <p className="text-xs text-slate-400 mt-1">{item.lecturerName}</p>
            </div>
            <div className="mt-4 md:mt-0 md:text-right">
              <p className="font-medium text-slate-900">{item.day}, {item.startTime} - {item.endTime}</p>
              <p className="text-sm text-blue-600 font-semibold">{item.hallCode}</p>
            </div>
          </div>
        </StaggerItem>
      ))}
    </StaggerList>
  );
}
