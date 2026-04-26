"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { TimetableEvent } from "@/lib/timetableUtils";
import {
  Clock,
  MapPin,
  User,
  BookOpen,
  Building2,
  Users,
  RefreshCw,
  Hash,
} from "lucide-react";

interface EventModalProps {
  event: TimetableEvent | null;
  open: boolean;
  onClose: () => void;
}

export function EventModal({ event, open, onClose }: EventModalProps) {
  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm rounded-2xl">
        {event && (
          <>
            <DialogHeader>
              <div className="flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-xs font-mono bg-primary/10 text-primary px-2 py-0.5 rounded-full font-semibold">
                      {event.courseCode}
                    </span>
                    {event.isRescheduled && (
                      <Badge
                        variant="outline"
                        className="text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-900 bg-amber-50 dark:bg-amber-950/30 gap-1 text-[10px]"
                      >
                        <RefreshCw className="size-2.5" />
                        Rescheduled
                      </Badge>
                    )}
                  </div>
                  <DialogTitle className="text-sm font-semibold leading-snug">
                    {event.courseName}
                  </DialogTitle>
                </div>
              </div>
            </DialogHeader>

            <div className="grid gap-3 mt-1">
              <DetailRow
                icon={<User className="size-3.5 text-muted-foreground" />}
                label="Lecturer"
                value={event.lecturerName}
              />
              <DetailRow
                icon={<Clock className="size-3.5 text-muted-foreground" />}
                label="Time"
                value={`${event.day} · ${event.startTime} – ${event.endTime}`}
              />
              <DetailRow
                icon={<MapPin className="size-3.5 text-muted-foreground" />}
                label="Hall"
                value={`${event.hallName}${event.hallCode ? ` (${event.hallCode})` : ""}`}
              />
              <DetailRow
                icon={
                  <Building2 className="size-3.5 text-muted-foreground" />
                }
                label="Building"
                value={event.building}
              />
              <DetailRow
                icon={<Users className="size-3.5 text-muted-foreground" />}
                label="Capacity"
                value={`${event.capacity} seats`}
              />
              {event.department && (
                <DetailRow
                  icon={
                    <BookOpen className="size-3.5 text-muted-foreground" />
                  }
                  label="Department"
                  value={event.department}
                />
              )}
              {event.semester && (
                <DetailRow
                  icon={<Hash className="size-3.5 text-muted-foreground" />}
                  label="Semester"
                  value={event.semester}
                />
              )}
              {event.classGroup && (
                <DetailRow
                  icon={<Users className="size-3.5 text-muted-foreground" />}
                  label="Class Group"
                  value={event.classGroup}
                />
              )}
              {event.features && event.features.length > 0 && (
                <div className="flex gap-1.5 flex-wrap pt-0.5">
                  {event.features.map((f) => (
                    <Badge key={f} variant="secondary" className="text-xs">
                      {f}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="mt-0.5 shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">
          {label}
        </p>
        <p className="text-sm font-medium leading-snug">{value}</p>
      </div>
    </div>
  );
}
