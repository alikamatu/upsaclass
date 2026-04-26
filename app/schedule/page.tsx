"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  SlidersHorizontal,
  Calendar,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EventModal } from "@/components/schedule/EventModal";
import { ExportButton } from "@/components/schedule/ExportButton";
import {
  TimetableEvent,
  FilterState,
  DEFAULT_FILTERS,
  filterEvents,
  toFullCalendarEvents,
} from "@/lib/timetableUtils";
import type { EventClickArg } from "@fullcalendar/core";

// Dynamically import FullCalendar to keep bundle lean
const CalendarWrapper = dynamic(
  () => import("@/components/schedule/CalendarWrapper"),
  { ssr: false, loading: () => <CalendarSkeleton /> }
);

// ─── Skeleton ────────────────────────────────────────────────────────────────

function CalendarSkeleton() {
  return (
    <div className="space-y-3 p-4 sm:p-6">
      <Skeleton className="h-10 w-full rounded-xl" />
      {Array.from({ length: 7 }).map((_, i) => (
        <Skeleton
          key={i}
          className="w-full rounded-xl"
          style={{ height: i === 0 ? 40 : 64, animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}

// ─── Filter Select ────────────────────────────────────────────────────────────

function FilterSelect({
  placeholder,
  value,
  onChange,
  options,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
}) {
  return (
    <Select value={value || "__all__"} onValueChange={onChange}>
      <SelectTrigger className="h-8 rounded-lg text-xs min-w-[120px] border-slate-200 bg-slate-50 hover:bg-white transition-colors">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="rounded-xl">
        <SelectItem value="__all__">All {placeholder}s</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col items-center justify-center py-24 text-center px-6"
    >
      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4 shadow-inner">
        <Calendar className="size-8 text-slate-400" />
      </div>
      <h3 className="font-semibold text-slate-700 mb-1">No lectures found</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Try adjusting your search or filters to find what you&apos;re looking
        for.
      </p>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const [allEvents, setAllEvents] = useState<TimetableEvent[]>([]);
  const [buildings, setBuildings] = useState<string[]>([]);
  const [lecturers, setLecturers] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

  const [selectedEvent, setSelectedEvent] = useState<TimetableEvent | null>(
    null
  );
  const [modalOpen, setModalOpen] = useState(false);

  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  // ── Fetch ────────────────────────────────────────────────────────────────

  useEffect(() => {
    fetch("/api/timetable/events")
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        setAllEvents(data.events ?? []);
        setBuildings(data.buildings ?? []);
        setLecturers(data.lecturers ?? []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // ── Debounce search ──────────────────────────────────────────────────────

  useEffect(() => {
    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 280);
    return () => {
      if (searchTimer.current) {
        clearTimeout(searchTimer.current);
      }
    };
  }, [search]);

  // ── Derived ───────────────────────────────────────────────────────────────

  const filteredEvents = filterEvents(allEvents, debouncedSearch, filters);
  const calendarEvents = toFullCalendarEvents(filteredEvents);

  const activeFilters = (
    Object.entries(filters) as [keyof FilterState, string][]
  ).filter(([k, v]) => v && v !== "all" && !(k === "timeOfDay" && v === "all"));

  // ── Handlers ──────────────────────────────────────────────────────────────

  const setFilter = (key: keyof FilterState, value: string) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const clearFilter = (key: keyof FilterState) =>
    setFilters((f) => ({
      ...f,
      [key]: key === "timeOfDay" ? "all" : "",
    }));

  const resetAll = () => {
    setFilters(DEFAULT_FILTERS);
    setSearch("");
  };

  const handleEventClick = useCallback((info: EventClickArg) => {
    setSelectedEvent(info.event.extendedProps as TimetableEvent);
    setModalOpen(true);
  }, []);

  const handleFilterChange = (key: keyof FilterState) => (val: string) => {
    const clear =
      val === "__all__" ||
      (key === "timeOfDay" && val === "all") ||
      val === "";
    setFilter(key, clear ? (key === "timeOfDay" ? "all" : "") : val);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-white">
      {/* ── Header ──────────────────────────────────────────────────────── */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 shadow-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <Calendar className="size-4 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-semibold leading-none text-foreground">
                Lecture Schedule
              </h1>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                UPSA Class Timetable
              </p>
            </div>
          </div>
          <ExportButton events={filteredEvents} />
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        {/* ── Search + Filters ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.08 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-3"
        >
          {/* Search input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by course code, lecturer, hall, building…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-200 focus-visible:bg-white transition-colors"
            />
            <AnimatePresence>
              {search && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  onClick={() => setSearch("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="size-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap gap-2 items-center">
            <SlidersHorizontal className="size-3.5 text-muted-foreground shrink-0" />

            <FilterSelect
              placeholder="Building"
              value={filters.building}
              onChange={handleFilterChange("building")}
              options={buildings.map((b) => ({ label: b, value: b }))}
            />
            <FilterSelect
              placeholder="Lecturer"
              value={filters.lecturer}
              onChange={handleFilterChange("lecturer")}
              options={lecturers.map((l) => ({ label: l, value: l }))}
            />
            <FilterSelect
              placeholder="Capacity"
              value={filters.capacity}
              onChange={handleFilterChange("capacity")}
              options={[
                { label: "≥ 30 seats", value: "30" },
                { label: "≥ 50 seats", value: "50" },
                { label: "≥ 100 seats", value: "100" },
              ]}
            />
            <FilterSelect
              placeholder="Time"
              value={filters.timeOfDay === "all" ? "" : filters.timeOfDay}
              onChange={handleFilterChange("timeOfDay")}
              options={[
                { label: "Morning (before 12pm)", value: "morning" },
                { label: "Afternoon (12–5pm)", value: "afternoon" },
                { label: "Evening (after 5pm)", value: "evening" },
              ]}
            />
            <FilterSelect
              placeholder="Day"
              value={filters.day}
              onChange={handleFilterChange("day")}
              options={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => ({
                label: d,
                value: d,
              }))}
            />

            <AnimatePresence>
              {(activeFilters.length > 0 || search) && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={resetAll}
                    className="gap-1.5 text-muted-foreground h-8 text-xs"
                  >
                    <RotateCcw className="size-3" />
                    Reset all
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Active filter badges */}
          <AnimatePresence>
            {activeFilters.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-1.5 overflow-hidden"
              >
                {activeFilters.map(([key, val]) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                  >
                    <Badge
                      variant="secondary"
                      className="gap-1 pr-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors text-xs"
                      onClick={() => clearFilter(key)}
                    >
                      {val}
                      <X className="size-2.5" />
                    </Badge>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* ── Results info row ─────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.18 }}
          className="flex items-center justify-between px-1"
        >
          <p className="text-xs text-muted-foreground">
            {loading
              ? "Loading lectures…"
              : error
              ? `Error: ${error}`
              : `${filteredEvents.length} lecture${filteredEvents.length !== 1 ? "s" : ""} found`}
          </p>
        </motion.div>

        {/* ── Calendar card ────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
          className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
        >
          {loading ? (
            <CalendarSkeleton />
          ) : error ? (
            <div className="py-20 text-center text-sm text-destructive">
              Failed to load schedule. Please try refreshing.
            </div>
          ) : filteredEvents.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="p-2 sm:p-4">
              <CalendarWrapper
                events={calendarEvents}
                onEventClick={handleEventClick}
              />
            </div>
          )}
        </motion.div>
      </main>

      {/* ── Event detail modal ────────────────────────────────────────── */}
      <EventModal
        event={selectedEvent}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
