"use client";

import { useEffect, useState } from "react";
import { TimetableSkeleton } from "@/components/ui/LoadingSkeleton";
import { StaggerList, StaggerItem } from "@/components/ui/StaggerList";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

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
        setSchedule(data.schedule || []);
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
    return (
      <Card className="flex flex-col items-center justify-center py-12 text-center border-dashed border-2">
        <p className="text-slate-500 font-medium">No classes scheduled for today.</p>
        <p className="text-sm text-slate-400 mt-1">Enjoy your free time!</p>
      </Card>
    );
  }

  return (
    <StaggerList className="grid gap-4">
      {schedule.map((item) => (
        <StaggerItem key={item._id}>
          <motion.div
            whileHover={{ y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <Card className="overflow-hidden border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-md transition-all duration-300">
              <div className="flex flex-col md:flex-row">
                <div className="w-1.5 bg-blue-500" />
                <div className="flex-1 p-5 flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">
                        {item.courseCode}
                      </span>
                      {item.isRescheduled && (
                        <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 rounded-full font-medium">
                          Rescheduled
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 text-lg">
                      {item.courseName}
                    </h3>
                    <div className="flex items-center gap-4 text-slate-500 dark:text-slate-400 text-sm">
                      <div className="flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        <span>{item.lecturerName}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium whitespace-nowrap">
                      <Clock className="h-4 w-4 text-blue-500" />
                      <span>{item.startTime} - {item.endTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold bg-blue-50/50 dark:bg-blue-900/20 px-3 py-1.5 rounded-xl border border-blue-100/50 dark:border-blue-800/50">
                      <MapPin className="h-4 w-4" />
                      <span>{item.hallCode}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </StaggerItem>
      ))}
    </StaggerList>
  );
}
