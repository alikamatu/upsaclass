"use client";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import listPlugin from "@fullcalendar/list";
import { EventClickArg } from "@fullcalendar/core";

interface CalendarWrapperProps {
  events: object[];
  onEventClick: (info: EventClickArg) => void;
}

export default function CalendarWrapper({
  events,
  onEventClick,
}: CalendarWrapperProps) {
  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, listPlugin]}
      initialView="timeGridDay"
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "timeGridDay,timeGridWeek,dayGridMonth,listWeek",
      }}
      buttonText={{
        today: "Today",
        day: "Day",
        week: "Week",
        month: "Month",
        list: "List",
      }}
      events={events}
      eventClick={onEventClick}
      nowIndicator={true}
      height="auto"
      slotMinTime="07:00:00"
      slotMaxTime="22:00:00"
      allDaySlot={false}
      eventTimeFormat={{
        hour: "2-digit",
        minute: "2-digit",
        meridiem: "short",
      }}
      eventContent={(info) => {
        const props = info.event.extendedProps as any;
        return (
          <div className="px-1.5 py-1 overflow-hidden h-full">
            <div className="flex items-center gap-1 overflow-hidden">
              <p className="font-semibold text-[11px] leading-none truncate">
                {info.event.title}
              </p>
              {props.isRescheduled && (
                <span className="text-[10px] bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 p-0.5 rounded-sm shrink-0">
                  🔄
                </span>
              )}
            </div>
            {props.classGroup && (
              <p className="text-[10px] text-slate-600 dark:text-slate-300 truncate mt-0.5">
                Group: {props.classGroup}
              </p>
            )}
            <p className="text-[10px] opacity-80 truncate mt-0.5">
              {props.hallName}
            </p>
            <p className="text-[10px] opacity-70 truncate">
              {props.lecturerName}
            </p>
          </div>
        );
      }}
    />
  );
}
