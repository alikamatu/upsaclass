"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Trash2, Edit2, Plus, Loader2, Calendar, MapPin, Search, Clock, GraduationCap, Sparkles, Users } from "lucide-react";
import { timetableService } from "@/services/timetableService";
import { courseService } from "@/services/courseService";
import { hallService } from "@/services/hallService";
import { lecturerService } from "@/services/lecturerService";
import { buildingService } from "@/services/buildingService";
import { TimetableSlot, Course, LectureHall, Lecturer, Building } from "@/types";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { SearchFilters } from "@/components/shared/SearchFilters";

interface FormData {
  course: string;
  lecturer: string;
  day: string;
  startTime: string;
  endTime: string;
  building: string;
  defaultHall: string;
  semester: string;
}

const initialFormData: FormData = {
  course: "",
  lecturer: "",
  day: "Mon",
  startTime: "",
  endTime: "",
  building: "",
  defaultHall: "",
  semester: "2025-1",
};

export function TimetableManagement() {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [filteredSlots, setFilteredSlots] = useState<TimetableSlot[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [halls, setHalls] = useState<LectureHall[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [buildings, setBuildings] = useState<Building[]>([]);

  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);

  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [slotsData, coursesData, hallsData, lecturersData, buildingsData] = await Promise.all([
        timetableService.getAll(),
        courseService.getAll(),
        hallService.getAll(),
        lecturerService.getAll(),
        buildingService.getAll()
      ]);
      const slotsList = slotsData;
      setSlots(slotsList);
      setFilteredSlots(slotsList);

      setCourses(coursesData);
      setHalls(hallsData);
      setLecturers(lecturersData);
      setBuildings(buildingsData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load timetable data");
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (slot: TimetableSlot) => {
    let buildingId = "";
    if (typeof slot.defaultHall === "object") {
      const bObj = (slot.defaultHall as any).building;
      buildingId = typeof bObj === "object" ? bObj?._id : bObj;
    } else {
      // If we don't have building data in the slot, try to find it from the local halls array
      const matchingHall = halls.find(h => h._id === slot.defaultHall);
      if (matchingHall) {
        buildingId = typeof matchingHall.building === "object" ? (matchingHall.building as any)._id : matchingHall.building;
      }
    }

    setFormData({
      course: typeof slot.course === "object" ? (slot.course as Course)?._id : slot.course,
      lecturer: typeof slot.lecturer === "object" ? (slot.lecturer as Lecturer)?._id : slot.lecturer,
      day: slot.day,
      startTime: slot.startTime,
      endTime: slot.endTime,
      building: buildingId || "none",
      defaultHall: typeof slot.defaultHall === "object" ? (slot.defaultHall as LectureHall)?._id : slot.defaultHall,
      semester: slot.semester,
    });
    setEditingId(slot._id);
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => {
      const updates: any = { [name]: value };

      // Auto-populate lecturer if course is selected
      if (name === "course") {
        const selectedCourse = courses.find(c => c._id === value);
        if (selectedCourse && selectedCourse.assignedLecturer) {
          updates.lecturer = typeof selectedCourse.assignedLecturer === "object"
            ? (selectedCourse.assignedLecturer as any)._id
            : selectedCourse.assignedLecturer;
        }
      }

      // Reset hall if building is changed
      if (name === "building") {
        updates.defaultHall = "";
      }

      return { ...prev, ...updates };
    });
  };

  const handleSubmit = async () => {
    if (!formData.course || !formData.lecturer || !formData.day || !formData.startTime || !formData.endTime || !formData.defaultHall) {
      toast.error("Please fill in all required fields for scheduling");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await timetableService.update(editingId, formData);
        toast.success("Timetable slot updated successfully");
      } else {
        await timetableService.create(formData);
        toast.success("New timetable slot added");
      }
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      await fetchInitialData();
    } catch (error) {
      // Error handled by api-client toast
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    setDeleting(true);
    try {
      await timetableService.delete(deletingId);
      toast.success("Timetable slot removed");
      setIsDeleteAlertOpen(false);
      await fetchInitialData();
    } catch (error) {
      // Error handled by apiClient toast
    } finally {
      setDeleting(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Master Timetable</h2>
            <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage global university class schedules</p>
        </div>
        <AnimatedButton
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-11 px-6 shadow-md shadow-blue-500/20 font-bold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Schedule Slot
        </AnimatedButton>
      </div>

      {/* Advanced Filters */}
      <SearchFilters<any>
        data={slots}
        placeholder="Search blocks by course, hall, or lecturer..."
        searchFields={useMemo(() => ["course.courseName", "lecturer.fullName", "defaultHall.name"], [])}
        filterConfigs={useMemo(() => [
          {
            label: "Day of Week",
            field: "day" as any,
          }
        ], [])}
        sortOptions={useMemo(() => [
          { label: "Day (Mon-Sun)", field: "day", direction: "asc" },
          { label: "Start Time", field: "startTime", direction: "asc" },
        ], [])}
        onFilterChange={setFilteredSlots}
        flattenFields={true}
      />

      {/* Grid Content */}
      <AnimatePresence mode="popLayout" initial={false}>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="border-none shadow-sm overflow-hidden rounded-2xl">
                <Skeleton className="h-48 w-full" />
              </Card>
            ))}
          </div>
        ) : filteredSlots.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800"
          >
            <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Calendar className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No schedules found</h3>
            <p className="text-slate-500 max-w-xs text-center mt-2 font-medium">
              Try adjusting your filters or search to find schedules.
            </p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredSlots.map((slot) => {
              const course = slot.course as Course;

              return (
                <motion.div
                  layout
                  key={slot._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="group relative overflow-hidden border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-500 bg-white dark:bg-slate-900 rounded-2xl h-full flex flex-col">
                    <CardContent className="p-6 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded-full uppercase tracking-wider">
                            {slot.day}
                          </span>
                          <span className="text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                            {slot.startTime} - {slot.endTime}
                          </span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditClick(slot)}
                            className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteClick(slot._id)}
                            className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline" className="border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-[10px]">
                          {course?.courseCode}
                        </Badge>
                        <Badge variant="secondary" className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px]">
                          Sem {slot.semester}
                        </Badge>
                      </div>

                      <h4 className="text-slate-900 dark:text-slate-100 font-bold text-lg mb-4 line-clamp-2 leading-tight flex-1">
                        {course?.courseName || "Unknown Course"}
                      </h4>

                      <div className="flex gap-4 mb-4">
                        <div className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300 gap-1.5">
                          <Users className="w-4 h-4 text-indigo-500" />
                          {typeof slot.lecturer === "object" ? (slot.lecturer as Lecturer).fullName : slot.lecturer}
                        </div>
                        <div className="flex items-center text-sm font-medium text-slate-600 dark:text-slate-300 gap-1.5">
                          <MapPin className="w-4 h-4 text-rose-500" />
                          {typeof slot.defaultHall === "object" ? (slot.defaultHall as LectureHall).name : slot.defaultHall}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add/Edit Dialog */}
      <Dialog
        open={isAddDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-400" />
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold">
                {editingId ? "Edit Schedule Slot" : "Create Schedule Slot"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                Map a course to a lecture hall and set class timings.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-6 py-2">
              <div className="col-span-2 space-y-2">
                <Label htmlFor="course" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Select Course</Label>
                <Select onValueChange={(val) => handleSelectChange("course", val)} value={formData.course}>
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-none transition-all">
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px] rounded-xl">
                    {courses.map((c) => (
                      <SelectItem key={c._id} value={c._id} className="rounded-lg">
                        {c.courseCode} - {c.courseName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Assigned Lecturer</Label>
                <Select value={formData.lecturer} onValueChange={(val) => setFormData(p => ({ ...p, lecturer: val }))}>
                  <SelectTrigger className="rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 h-11">
                    <SelectValue placeholder="Select faculty member" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-56">
                    {lecturers.map(l => (
                      <SelectItem key={l._id} value={l._id} className="cursor-pointer font-medium">
                        {l.fullName} ({l.department})
                      </SelectItem>
                    ))}
                    {lecturers.length === 0 && (
                      <SelectItem value="none" disabled>No lecturers available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-1 space-y-2">
                <Label htmlFor="day" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Day of Week</Label>
                <Select onValueChange={(val) => handleSelectChange("day", val)} value={formData.day}>
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-none transition-all">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                      <SelectItem key={day} value={day} className="rounded-lg">{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-1 space-y-2">
                <Label htmlFor="semester" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Semester</Label>
                <Input
                  id="semester"
                  name="semester"
                  placeholder="1 or 2"
                  className="rounded-xl bg-slate-50 border-none focus:bg-white transition-all h-11"
                  value={formData.semester}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-span-1 space-y-2">
                <Label htmlFor="startTime" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Start Time</Label>
                <Input
                  id="startTime"
                  type="time"
                  name="startTime"
                  className="rounded-xl bg-slate-50 border-none focus:bg-white transition-all h-11"
                  value={formData.startTime}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-span-1 space-y-2">
                <Label htmlFor="endTime" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">End Time</Label>
                <Input
                  id="endTime"
                  type="time"
                  name="endTime"
                  className="rounded-xl bg-slate-50 border-none focus:bg-white transition-all h-11"
                  value={formData.endTime}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="building" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Building Structure</Label>
                <Select onValueChange={(val) => handleSelectChange("building", val)} value={formData.building}>
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-none transition-all">
                    <SelectValue placeholder="Select campus building" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px] rounded-xl">
                    {buildings.map((b) => (
                      <SelectItem key={b._id} value={b._id} className="rounded-lg">
                        {b.name} ({b.code})
                      </SelectItem>
                    ))}
                    {buildings.length === 0 && (
                      <SelectItem value="none" disabled>No buildings available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="defaultHall" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Lecture Hall</Label>
                <Select onValueChange={(val) => handleSelectChange("defaultHall", val)} value={formData.defaultHall} disabled={!formData.building}>
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50 border-none transition-all disabled:opacity-50">
                    <SelectValue placeholder={formData.building ? "Select lecture hall" : "Select a building first"} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px] rounded-xl">
                    {halls
                      .filter(h => {
                        const hBuildingId = typeof h.building === "object" ? (h.building as any)._id : h.building;
                        return hBuildingId === formData.building;
                      })
                      .map((h) => (
                        <SelectItem key={h._id} value={h._id} className="rounded-lg">
                          {h.name} {h.isAvailable ? "" : "(Unavailable)"}
                        </SelectItem>
                      ))}
                    {halls.filter(h => {
                      const hBuildingId = typeof h.building === "object" ? (h.building as any)._id : h.building;
                      return hBuildingId === formData.building;
                    }).length === 0 && formData.building && (
                        <SelectItem value="none" disabled>No halls in this building</SelectItem>
                      )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="mt-8 flex gap-3">
              <Button
                variant="ghost"
                className="rounded-xl h-12 flex-1 font-semibold"
                onClick={() => {
                  setIsAddDialogOpen(false);
                  setIsEditDialogOpen(false);
                }}
              >
                Cancel
              </Button>
              <AnimatedButton
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 flex-[2] font-semibold"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : editingId ? (
                  "Update Slot"
                ) : (
                  "Create Slot"
                )}
              </AnimatedButton>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl p-8 max-w-[400px]">
          <AlertDialogHeader>
            <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl font-bold">Remove Timetable Slot?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">
              This will permanently remove this slot from the master schedule. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex gap-3">
            <AlertDialogCancel className="h-12 flex-1 rounded-xl border-slate-200 font-semibold">Cancel</AlertDialogCancel>
            <motion.div whileTap={{ scale: 0.95 }} className="flex-[2]">
              <AlertDialogAction
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-red-500 hover:bg-red-600 h-12 w-full rounded-xl font-semibold border-none"
              >
                {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Remove File"}
              </AlertDialogAction>
            </motion.div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
