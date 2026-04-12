"use client";

import { useState, useEffect, useMemo } from "react";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Trash2, Edit2, Plus, Loader2, BookOpen, GraduationCap, Clock, Users, Sparkles, Search } from "lucide-react";
import { courseService } from "@/services/courseService";
import { lecturerService } from "@/services/lecturerService";
import { Course, Lecturer } from "@/types";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { SearchFilters } from "@/components/shared/SearchFilters";

interface FormData {
  courseCode: string;
  courseName: string;
  department: string;
  level: string;
  creditHours: string;
  enrollmentCount: string;
  assignedLecturer: string;
}

const initialFormData: FormData = {
  courseCode: "",
  courseName: "",
  department: "",
  level: "100",
  creditHours: "",
  enrollmentCount: "",
  assignedLecturer: "none",
};

export function CourseManagement() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [courseList, lecturerList] = await Promise.all([
        courseService.getAll(),
        lecturerService.getAll()
      ]);
      setCourses(courseList);
      setFilteredCourses(courseList);
      setLecturers(lecturerList);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const courseList = await courseService.getAll();
      setCourses(courseList);
      setFilteredCourses(courseList);
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  const handleAddClick = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (course: any) => {
    setFormData({
      courseCode: course.courseCode,
      courseName: course.courseName,
      department: course.department,
      level: (course.level || 100).toString(),
      creditHours: course.creditHours.toString(),
      enrollmentCount: course.enrollmentCount.toString(),
      assignedLecturer: course.assignedLecturer ? (typeof course.assignedLecturer === "object" ? course.assignedLecturer._id : course.assignedLecturer) : "none"
    });
    setEditingId(course._id);
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.courseCode || !formData.courseName || !formData.department) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        level: parseInt(formData.level, 10),
        creditHours: parseInt(formData.creditHours, 10),
        enrollmentCount: parseInt(formData.enrollmentCount, 10),
        assignedLecturer: formData.assignedLecturer === "none" ? undefined : formData.assignedLecturer,
      };

      if (editingId) {
        await courseService.update(editingId, payload);
        toast.success("Course updated successfully");
        await fetchCourses();
      } else {
        await courseService.create(payload as any);
        toast.success("New course registered");
        await fetchCourses();
      }
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      resetForm();
    } catch (error) {
      if (editingId) {
        await fetchCourses();
      }
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
      await courseService.delete(deletingId);
      toast.success("Course deleted successfully");
      setIsDeleteAlertOpen(false);
      await fetchCourses();
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
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Course Registry</h2>
            <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage academic programs and curriculum data</p>
        </div>
        <AnimatedButton
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-11 px-6 shadow-md shadow-blue-500/20 font-bold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Course
        </AnimatedButton>
      </div>

      {/* Advanced Filters */}
      <SearchFilters<Course>
        data={courses}
        placeholder="Search by title, code or department..."
        searchFields={useMemo(() => ["courseName", "courseCode", "department"], [])}
        filterConfigs={useMemo(() => [
          {
            label: "Department",
            field: "department",
          },
          {
            label: "Academic Level",
            field: "level",
          }
        ], [])}
        sortOptions={useMemo(() => [
          { label: "Title (A-Z)", field: "courseName", direction: "asc" },
          { label: "Code (A-Z)", field: "courseCode", direction: "asc" },
          { label: "Enrollment (High to Low)", field: "enrollmentCount", direction: "desc" },
          { label: "Credit Hours", field: "creditHours", direction: "desc" },
        ], [])}
        onFilterChange={setFilteredCourses}
      />

      {/* Grid Content */}
      <AnimatePresence mode="popLayout" initial={false}>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-none shadow-sm overflow-hidden rounded-2xl">
                <Skeleton className="h-48 w-full" />
              </Card>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800"
          >
            <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <BookOpen className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No courses found</h3>
            <p className="text-slate-500 max-w-xs text-center mt-2 font-medium">
              Try adjusting your search or filters to find what you're looking for.
            </p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <motion.div
                layout
                key={course._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                whileHover={{ y: -4 }}
              >
                <Card className="group relative overflow-hidden border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-500 bg-white dark:bg-slate-900 rounded-2xl">
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded-full uppercase tracking-wider">
                          {course.courseCode}
                        </span>
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] font-bold rounded-md">
                          Level {course.level || 100}
                        </Badge>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(course)}
                          className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(course._id)}
                          className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <h4 className="text-slate-900 dark:text-slate-100 font-bold text-lg mb-2 leading-tight">
                      {course.courseName}
                    </h4>
                    
                    {course.assignedLecturer && (
                      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4 shrink-0 text-slate-400" />
                        {typeof course.assignedLecturer === "object" ? (course.assignedLecturer as any).fullName : "Default Lecturer"}
                      </p>
                    )}
                    
                    <div className="mt-auto space-y-3 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 gap-2 font-medium">
                        <GraduationCap className="h-4 w-4 text-blue-500" />
                        <span className="line-clamp-1">{course.department}</span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 gap-2 font-medium">
                          <Clock className="h-4 w-4 text-amber-500" />
                          <span>{course.creditHours} Credits</span>
                        </div>
                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 gap-2 font-medium">
                          <Users className="h-4 w-4 text-emerald-500" />
                          <span>{course.enrollmentCount} Enrolled</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
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
        <DialogContent className="sm:max-w-[550px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-blue-600 to-indigo-400" />
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold">
                {editingId ? "Edit Course Details" : "Register New Course"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                Manage curriculum data for the university registry.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-6 py-2">
              <div className="col-span-1 space-y-2">
                <Label htmlFor="courseCode" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Course Code</Label>
                <Input
                  id="courseCode"
                  name="courseCode"
                  placeholder="CSC 301"
                  className="rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 transition-all h-11"
                  value={formData.courseCode}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-span-1 space-y-2">
                <Label htmlFor="level" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Academic Level</Label>
                <Input
                  id="level"
                  name="level"
                  type="number"
                  placeholder="300"
                  className="rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 transition-all h-11"
                  value={formData.level}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="courseName" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Course Title</Label>
                <Input
                  id="courseName"
                  name="courseName"
                  placeholder="Advanced Database Systems"
                  className="rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 transition-all h-11"
                  value={formData.courseName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="department" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Department</Label>
                <Input
                  id="department"
                  name="department"
                  placeholder="Information Technology"
                  className="rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 transition-all h-11"
                  value={formData.department}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-span-1 space-y-2">
                <Label htmlFor="creditHours" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Credit Hours</Label>
                <Input
                  id="creditHours"
                  name="creditHours"
                  type="number"
                  placeholder="3"
                  className="rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 transition-all h-11"
                  value={formData.creditHours}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-span-1 space-y-2">
                <Label htmlFor="enrollmentCount" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Enrollment</Label>
                <Input
                  id="enrollmentCount"
                  name="enrollmentCount"
                  type="number"
                  placeholder="120"
                  className="rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 transition-all h-11"
                  value={formData.enrollmentCount}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="col-span-2 space-y-2">
                <Label htmlFor="assignedLecturer" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Default Lecturer <span className="text-slate-400 normal-case">(Optional)</span></Label>
                <Select value={formData.assignedLecturer} onValueChange={(val) => setFormData(p => ({ ...p, assignedLecturer: val }))}>
                  <SelectTrigger className="rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 h-11">
                    <SelectValue placeholder="Assign a default lecturer" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl max-h-56">
                    <SelectItem value="none" className="text-slate-500">Unassigned</SelectItem>
                    {lecturers.map(l => (
                      <SelectItem key={l._id} value={l._id} className="cursor-pointer font-medium">
                        {l.fullName} ({l.staffId})
                      </SelectItem>
                    ))}
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
                  "Update Registry"
                ) : (
                  "Add to Registry"
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
            <AlertDialogTitle className="text-xl font-bold">Remove Course?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">
              This will permanently remove this course from the registry. This action cannot be undone.
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
                {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Remove Permanently"}
              </AlertDialogAction>
            </motion.div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
