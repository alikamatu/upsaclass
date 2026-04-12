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
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Trash2, Edit2, Plus, Loader2, GraduationCap, Phone, UserCircle2 } from "lucide-react";
import { lecturerService } from "@/services/lecturerService";
import { Lecturer } from "@/types";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { SearchFilters } from "@/components/shared/SearchFilters";

interface FormData {
  staffId: string;
  fullName: string;
  email: string;
  department: string;
  phoneNumber: string;
}

const initialFormData: FormData = {
  staffId: "",
  fullName: "",
  email: "",
  department: "",
  phoneNumber: "",
};

export function LecturerManagement() {
  const [lecturers, setLecturers] = useState<Lecturer[]>([]);
  const [filteredLecturers, setFilteredLecturers] = useState<Lecturer[]>([]);
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
    fetchLecturers();
  }, []);

  const fetchLecturers = async () => {
    try {
      setLoading(true);
      const list = await lecturerService.getAll();
      setLecturers(list);
      setFilteredLecturers(list);
    } catch (error) {
      console.error("Error fetching lecturers:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (lecturer: Lecturer) => {
    setFormData({
      staffId: lecturer.staffId,
      fullName: lecturer.fullName,
      email: lecturer.email,
      department: lecturer.department,
      phoneNumber: lecturer.phoneNumber || "",
    });
    setEditingId(lecturer._id);
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.staffId || !formData.fullName || !formData.email || !formData.department) {
      toast.error("Please fill in all required fields");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await lecturerService.update(editingId, formData);
        toast.success("Lecturer profile updated");
      } else {
        await lecturerService.create(formData);
        toast.success("New lecturer registered");
      }
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      await fetchLecturers();
    } catch (error) {
      // Error handled by apiClient toast directly
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
      await lecturerService.delete(deletingId);
      toast.success("Lecturer removed from system");
      setIsDeleteAlertOpen(false);
      await fetchLecturers();
    } catch (error) {
      // Handled by apiClient toast
    } finally {
      setDeleting(false);
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Faculty Database</h2>
            <GraduationCap className="h-5 w-5 text-emerald-500" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage and register academic teaching staff</p>
        </div>
        <AnimatedButton
          onClick={handleAddClick}
          className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl h-11 px-6 shadow-md shadow-emerald-500/20 font-bold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Onboard Lecturer
        </AnimatedButton>
      </div>

      <SearchFilters<Lecturer>
        data={lecturers}
        placeholder="Search faculty by name, email, or department..."
        searchFields={useMemo(() => ["fullName", "email", "department", "staffId"], [])}
        filterConfigs={useMemo(() => [
          {
            label: "Department",
            field: "department" as any,
          }
        ], [])}
        sortOptions={useMemo(() => [
          { label: "Name (A-Z)", field: "fullName", direction: "asc" },
          { label: "Name (Z-A)", field: "fullName", direction: "desc" },
        ], [])}
        onFilterChange={setFilteredLecturers}
      />

      <AnimatePresence mode="popLayout" initial={false}>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-none shadow-sm overflow-hidden rounded-2xl">
                <Skeleton className="h-40 w-full" />
              </Card>
            ))}
          </div>
        ) : filteredLecturers.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800"
          >
            <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <UserCircle2 className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No faculty found</h3>
            <p className="text-slate-500 max-w-xs text-center mt-2 font-medium">
              Lecturer database is empty or no matches fit your search.
            </p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredLecturers.map((lecturer) => (
              <motion.div
                layout
                key={lecturer._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                whileHover={{ y: -4 }}
              >
                <Card className="group relative overflow-hidden border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-500 bg-white dark:bg-slate-900 rounded-2xl h-full flex flex-col">
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/40 px-3 py-1 rounded-full uppercase tracking-wider">
                        {lecturer.department}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(lecturer)}
                          className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(lecturer._id)}
                          className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <h4 className="text-slate-900 dark:text-slate-100 font-bold text-lg mb-1 leading-tight">
                      {lecturer.fullName}
                    </h4>
                    
                    <p className="text-sm font-medium text-slate-500 mb-4">{lecturer.staffId}</p>
                    
                    <div className="space-y-2 mt-auto pt-4 border-t border-slate-50 dark:border-slate-800/50">
                      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 gap-2 font-medium">
                        <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center text-[10px]">@</div>
                        <span className="line-clamp-1">{lecturer.email}</span>
                      </div>
                      {lecturer.phoneNumber && (
                        <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 gap-2 font-medium">
                          <Phone className="h-3.5 w-3.5 shrink-0" />
                          <span>{lecturer.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <Dialog
        open={isAddDialogOpen || isEditDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setIsAddDialogOpen(false);
            setIsEditDialogOpen(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-emerald-500 to-teal-400" />
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold">
                {editingId ? "Update Lecturer" : "Register Lecturer"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                Add an official staff member to the faculty registry.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-5 py-2">
              <div className="col-span-1 space-y-2">
                <Label htmlFor="staffId" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Staff ID</Label>
                <Input
                  id="staffId"
                  name="staffId"
                  placeholder="e.g. STF-001"
                  className="rounded-xl bg-slate-50 border-none transition-all h-11"
                  value={formData.staffId}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-span-1 space-y-2">
                <Label htmlFor="department" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Department</Label>
                <Input
                  id="department"
                  name="department"
                  placeholder="Computer Science"
                  className="rounded-xl bg-slate-50 border-none transition-all h-11"
                  value={formData.department}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="fullName" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  placeholder="Dr. Ebenezer Adjei"
                  className="rounded-xl bg-slate-50 border-none transition-all h-11"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="email" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Official Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@upsa.edu.gh"
                  className="rounded-xl bg-slate-50 border-none transition-all h-11"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="phoneNumber" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Phone Number <span className="text-slate-400 normal-case">(Optional)</span></Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  placeholder="+233 55 000 0000"
                  className="rounded-xl bg-slate-50 border-none transition-all h-11"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                />
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
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl h-12 flex-[2] font-semibold"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : editingId ? (
                  "Save Changes"
                ) : (
                  "Onboard Lecturer"
                )}
              </AnimatedButton>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="rounded-3xl border-none shadow-2xl p-8 max-w-[400px]">
          <AlertDialogHeader>
            <div className="h-12 w-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <AlertDialogTitle className="text-xl font-bold">Revoke Faculty Access?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">
              This action permanent. You cannot delete a lecturer if they are currently assigned to any Active Courses or Timetable Slots.
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
                {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Delete Records"}
              </AlertDialogAction>
            </motion.div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
