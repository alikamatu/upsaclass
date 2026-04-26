"use client";

import { useState, useEffect } from "react";
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
import { Trash2, Key, Plus, Loader2, ShieldCheck, UserCheck, Search, Users, Sparkles, Edit } from "lucide-react";
import { userService } from "@/services/userService";
import { courseService } from "@/services/courseService";
import { Course, User } from "@/types";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

export function RepManagement() {
  const [reps, setReps] = useState<User[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({
    studentId: "",
    fullName: "",
    courseIds: [] as string[],
  });
  const [formData, setFormData] = useState({
    studentId: "",
    fullName: "",
    courseIds: [] as string[],
    password: "",
  });
  
  const [newPassword, setNewPassword] = useState("");
  const [selectedRep, setSelectedRep] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [repsList, coursesList] = await Promise.all([
        userService.getReps(),
        courseService.getAll()
      ]);
      setReps(repsList);
      setCourses(coursesList);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRep = async () => {
    if (!formData.studentId || !formData.fullName || formData.courseIds.length === 0 || !formData.password) {
      toast.error("Please fill in all fields (at least one course)");
      return;
    }

    setSubmitting(true);
    try {
      await userService.createRep(formData);
      toast.success("Course representative added successfully");
      setIsAddDialogOpen(false);
      setFormData({ studentId: "", fullName: "", courseIds: [], password: "" });
      fetchData();
    } catch (error) {
      // Handled by API client
    } finally {
      setSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!selectedRep || !newPassword) return;

    setSubmitting(true);
    try {
      await userService.updateRepPassword(selectedRep._id, newPassword);
      toast.success("Password updated successfully");
      setIsPasswordDialogOpen(false);
      setNewPassword("");
      setSelectedRep(null);
    } catch (error) {
      // Handled by API client
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditRep = async () => {
    if (!selectedRep || !editFormData.studentId || !editFormData.fullName) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      await userService.updateRep(selectedRep._id, editFormData);
      toast.success("Representative updated successfully");
      setIsEditDialogOpen(false);
      setSelectedRep(null);
      setEditFormData({ studentId: "", fullName: "", courseIds: [] });
      fetchData();
    } catch (error) {
      // Handled by API client
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRep = async () => {
    if (!selectedRep) return;

    setSubmitting(true);
    try {
      await userService.deleteRep(selectedRep._id);
      toast.success("Representative removed successfully");
      setIsDeleteAlertOpen(false);
      setSelectedRep(null);
      fetchData();
    } catch (error) {
      // Handled by API client
    } finally {
      setSubmitting(false);
    }
  };

  const openEditDialog = (rep: User) => {
    setSelectedRep(rep);
    setEditFormData({
      studentId: rep.studentId,
      fullName: rep.fullName,
      courseIds: Array.isArray(rep.courseRepFor) 
        ? rep.courseRepFor.map((course: any) => course._id || course)
        : rep.courseRepFor ? [rep.courseRepFor._id || rep.courseRepFor] : [],
    });
    setIsEditDialogOpen(true);
  };

  const filteredReps = reps.filter(
    (rep) =>
      (rep?.fullName?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (rep?.studentId?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Course Representatives</h2>
            <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage student delegates and assignment permissions</p>
        </div>
        <AnimatedButton
          onClick={() => setIsAddDialogOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-11 px-6 shadow-md shadow-blue-500/20 font-bold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add Course Rep
        </AnimatedButton>
      </div>

      {/* Search Bar */}
      <div className="relative group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <Input 
          className="pl-12 h-14 rounded-2xl bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium"
          placeholder="Search by name or student ID..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Grid Content */}
      <AnimatePresence mode="popLayout">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="border-none shadow-sm overflow-hidden rounded-2xl">
                <Skeleton className="h-48 w-full" />
              </Card>
            ))}
          </div>
        ) : filteredReps.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800"
          >
            <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <ShieldCheck className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No representatives found</h3>
            <p className="text-slate-500 max-w-xs text-center mt-2 font-medium">
              Start by adding a course representative to delegate management.
            </p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReps.map((rep) => (
              <motion.div
                layout
                key={rep._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ y: -4 }}
              >
                <Card className="group relative overflow-hidden border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-500 bg-white dark:bg-slate-900 rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <div className="h-10 w-10 bg-blue-50 dark:bg-blue-900/30 rounded-xl flex items-center justify-center">
                          <UserCheck className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{rep.studentId}</p>
                          <h4 className="text-slate-900 dark:text-slate-100 font-bold leading-tight line-clamp-1">{rep.fullName}</h4>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800/50">
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Represents</p>
                        <div className="flex flex-wrap gap-1.5">
                          {Array.isArray(rep.courseRepFor) && rep.courseRepFor.length > 0 ? (
                            rep.courseRepFor.map((course: any) => (
                              <Badge key={course._id} variant="outline" className="text-blue-600 border-blue-100 bg-blue-50 dark:bg-blue-900/20 rounded-lg py-1 px-2 font-medium text-[10px] max-w-[140px] truncate">
                                <span className="font-bold underline mr-1">{course.courseCode}</span>
                                {course.courseName}
                              </Badge>
                            ))
                          ) : !Array.isArray(rep.courseRepFor) && rep.courseRepFor ? (
                             <Badge variant="outline" className="text-blue-600 border-blue-100 bg-blue-50 dark:bg-blue-900/20 rounded-lg py-1 px-2 font-medium text-[10px] max-w-[140px] truncate">
                                <span className="font-bold underline mr-1">{(rep.courseRepFor as any).courseCode}</span>
                                {(rep.courseRepFor as any).courseName}
                              </Badge>
                          ) : (
                            <span className="text-slate-400 italic text-xs">No Course Appointed</span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          className="flex-1 rounded-xl h-10 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-bold transition-all text-xs"
                          onClick={() => openEditDialog(rep)}
                        >
                          <Edit className="w-3.5 h-3.5 mr-2" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex-1 rounded-xl h-10 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20 font-bold transition-all text-xs"
                          onClick={() => {
                            setSelectedRep(rep);
                            setIsPasswordDialogOpen(true);
                          }}
                        >
                          <Key className="w-3.5 h-3.5 mr-2" />
                          Password
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex-1 rounded-xl h-10 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold transition-all text-xs"
                          onClick={() => {
                            setSelectedRep(rep);
                            setIsDeleteAlertOpen(true);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="h-1.5 bg-blue-600" />
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">Add Course Representative</DialogTitle>
              <DialogDescription className="font-medium text-slate-500">
                Grant elevated permissions to a student for a specific course.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Student ID</Label>
                <Input 
                  placeholder="e.g. 2024CS001" 
                  className="rounded-xl h-11 bg-slate-50 dark:bg-slate-800 border-none transition-all"
                  value={formData.studentId}
                  onChange={(e) => setFormData(p => ({ ...p, studentId: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</Label>
                <Input 
                  placeholder="e.g. Kofi Mensah" 
                  className="rounded-xl h-11 bg-slate-50 dark:bg-slate-800 border-none transition-all"
                  value={formData.fullName}
                  onChange={(e) => setFormData(p => ({ ...p, fullName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Course Assignments</Label>
                <div className="space-y-3">
                  <Select onValueChange={(val) => {
                    if (!formData.courseIds.includes(val)) {
                      setFormData(p => ({ ...p, courseIds: [...p.courseIds, val] }));
                    }
                  }}>
                    <SelectTrigger className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none h-11">
                      <SelectValue placeholder="Add course to represent" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {courses.map(course => (
                        <SelectItem key={course._id} value={course._id} className="rounded-lg">
                          {course.courseCode}: {course.courseName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {formData.courseIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl min-h-[44px]">
                      {formData.courseIds.map(id => {
                        const course = courses.find(c => c._id === id);
                        return (
                          <Badge 
                            key={id} 
                            variant="secondary" 
                            className="bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 pr-1 py-1 rounded-lg gap-1 border-slate-100 dark:border-slate-600"
                          >
                            {course?.courseCode}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-4 w-4 rounded-full p-0 text-slate-400 hover:text-red-500 hover:bg-transparent"
                              onClick={() => setFormData(p => ({ ...p, courseIds: p.courseIds.filter(cid => cid !== id) }))}
                            >
                              <Search className="h-3 w-3 rotate-45" /> 
                            </Button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Temporary Password</Label>
                <Input 
                  type="password"
                  placeholder="••••••••" 
                  className="rounded-xl h-11 bg-slate-50 dark:bg-slate-800 border-none transition-all"
                  value={formData.password}
                  onChange={(e) => setFormData(p => ({ ...p, password: e.target.value }))}
                />
              </div>
            </div>

            <DialogFooter className="mt-8">
              <AnimatedButton
                onClick={handleCreateRep}
                disabled={submitting}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-12 rounded-xl"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Verify & Add Representative"}
              </AnimatedButton>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[450px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="h-1.5 bg-green-600" />
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-white">Edit Course Representative</DialogTitle>
              <DialogDescription className="font-medium text-slate-500">
                Update representative details and course assignments.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Student ID</Label>
                <Input 
                  placeholder="e.g. 2024CS001" 
                  className="rounded-xl h-11 bg-slate-50 dark:bg-slate-800 border-none transition-all"
                  value={editFormData.studentId}
                  onChange={(e) => setEditFormData(p => ({ ...p, studentId: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name</Label>
                <Input 
                  placeholder="e.g. Kofi Mensah" 
                  className="rounded-xl h-11 bg-slate-50 dark:bg-slate-800 border-none transition-all"
                  value={editFormData.fullName}
                  onChange={(e) => setEditFormData(p => ({ ...p, fullName: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Course Assignments</Label>
                <div className="space-y-3">
                  <Select onValueChange={(val) => {
                    if (!editFormData.courseIds.includes(val)) {
                      setEditFormData(p => ({ ...p, courseIds: [...p.courseIds, val] }));
                    }
                  }}>
                    <SelectTrigger className="rounded-xl bg-slate-50 dark:bg-slate-800 border-none h-11">
                      <SelectValue placeholder="Add course to represent" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {courses.map(course => (
                        <SelectItem key={course._id} value={course._id} className="rounded-lg">
                          {course.courseCode}: {course.courseName} (Level {course.level})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {editFormData.courseIds.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl min-h-[44px]">
                      {editFormData.courseIds.map(id => {
                        const course = courses.find(c => c._id === id);
                        return (
                          <Badge 
                            key={id} 
                            variant="secondary" 
                            className="bg-white dark:bg-slate-700 text-green-600 dark:text-green-400 pr-1 py-1 rounded-lg gap-1 border-slate-100 dark:border-slate-600"
                          >
                            {course?.courseCode} (L{course?.level})
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-4 w-4 rounded-full p-0 text-slate-400 hover:text-red-500 hover:bg-transparent"
                              onClick={() => setEditFormData(p => ({ ...p, courseIds: p.courseIds.filter(cid => cid !== id) }))}
                            >
                              <Search className="h-3 w-3 rotate-45" /> 
                            </Button>
                          </Badge>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <DialogFooter className="mt-8">
              <AnimatedButton
                onClick={handleEditRep}
                disabled={submitting}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12 rounded-xl"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update Representative"}
              </AnimatedButton>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="h-1.5 bg-amber-500" />
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-xl font-bold">Change Password</DialogTitle>
              <DialogDescription className="font-medium text-slate-500">
                Update password for <span className="text-blue-600 font-bold">{selectedRep?.fullName}</span>.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">New Password</Label>
                <Input 
                  type="password"
                  placeholder="••••••••" 
                  className="rounded-xl h-12 bg-slate-50 dark:bg-slate-800 border-none transition-all"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
            </div>

            <DialogFooter className="mt-8 flex gap-3">
              <Button variant="ghost" className="flex-1 rounded-xl h-12 font-bold" onClick={() => setIsPasswordDialogOpen(false)}>Cancel</Button>
              <AnimatedButton
                onClick={handleChangePassword}
                disabled={submitting}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white font-bold h-12 rounded-xl"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Update"}
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
            <AlertDialogTitle className="text-xl font-bold">Revoke Permissions?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium font-inter">
              This will demote <span className="text-red-600 font-bold font-mono">{selectedRep?.fullName}</span>. They will still have a student account but will lose all representative privileges.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex gap-3">
            <AlertDialogCancel className="h-12 flex-1 rounded-xl border-slate-200 font-bold">Keep</AlertDialogCancel>
            <motion.div whileTap={{ scale: 0.95 }} className="flex-[2]">
              <AlertDialogAction
                onClick={handleDeleteRep}
                disabled={submitting}
                className="bg-red-500 hover:bg-red-600 h-12 w-full rounded-xl font-bold border-none"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Revoke Permissions"}
              </AlertDialogAction>
            </motion.div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
