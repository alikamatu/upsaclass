"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { TimetableEvent, generateICS } from "@/lib/timetableUtils";

export function ExportButton({ events }: { events: TimetableEvent[] }) {
  const handleExport = () => {
    const ics = generateICS(events);
    const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "upsaclass-schedule.ics";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      className="gap-1.5 rounded-lg"
    >
      <Download className="size-3.5" />
      Export .ics
    </Button>
  );
}
