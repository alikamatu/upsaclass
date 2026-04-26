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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Trash2, Edit2, Plus, Loader2, Users, MapPin, Sparkles, Search } from "lucide-react";
import { StaggerList, StaggerItem } from "@/components/ui/StaggerList";
import { hallService } from "@/services/hallService";
import { buildingService } from "@/services/buildingService";
import { LectureHall, Building } from "@/types";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { SearchFilters } from "@/components/shared/SearchFilters";

interface FormData {
  hallCode: string;
  name: string;
  capacity: string;
  building: string;
  features: string;
}

const initialFormData: FormData = {
  hallCode: "",
  name: "",
  capacity: "",
  building: "",
  features: "",
};

export function HallManagement() {
  const [halls, setHalls] = useState<LectureHall[]>([]);
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
  const [filteredHalls, setFilteredHalls] = useState<LectureHall[]>([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [hallList, buildingList] = await Promise.all([
        hallService.getAll(),
        buildingService.getAll()
      ]);
      setHalls(hallList);
      setFilteredHalls(hallList);
      setBuildings(buildingList);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (hall: any) => {
    setFormData({
      hallCode: hall.hallCode,
      name: hall.name,
      capacity: hall.capacity.toString(),
      building: typeof hall.building === "object" ? hall.building._id : hall.building,
      features: hall.features.join(", "),
    });
    setEditingId(hall._id);
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.hallCode || !formData.name || !formData.capacity || !formData.building) {
      toast.error("Please fill in all required fields including building structure");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        capacity: parseInt(formData.capacity, 10),
        features: formData.features.split(",").map((f) => f.trim()).filter(Boolean),
      };

      if (editingId) {
        await hallService.update(editingId, payload as any);
        toast.success("Lecture hall updated");
      } else {
        await hallService.create(payload as any);
        toast.success("New lecture hall created");
      }
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      const hallList = await hallService.getAll();
      setHalls(hallList);
      setFilteredHalls(hallList);
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
      await hallService.delete(deletingId);
      toast.success("Hall deleted successfully");
      setIsDeleteAlertOpen(false);
      const hallList = await hallService.getAll();
      setHalls(hallList);
      setFilteredHalls(hallList);
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
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Lecture Halls</h2>
            <Sparkles className="h-5 w-5 text-blue-500 animate-pulse" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage campus infrastructure and seating capacities</p>
        </div>
        <AnimatedButton
          onClick={handleAddClick}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-11 px-6 shadow-md shadow-blue-500/20 font-bold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Add New Hall
        </AnimatedButton>
      </div>

      {/* Advanced Filters */}
      <SearchFilters<LectureHall>
        data={halls}
        placeholder="Search by name, building, or hall code..."
        searchFields={useMemo(() => ["name", "building", "hallCode" as any], [])}
        filterConfigs={useMemo(() => [
          {
            label: "Features",
            field: "features" as any,
          },
          {
            label: "Building",
            field: "building" as any,
          }
        ], [])}
        sortOptions={useMemo(() => [
          { label: "Name (A-Z)", field: "name", direction: "asc" },
          { label: "Name (Z-A)", field: "name", direction: "desc" },
          { label: "Capacity (High to Low)", field: "capacity", direction: "desc" },
          { label: "Capacity (Low to High)", field: "capacity", direction: "asc" },
        ], [])}
        onFilterChange={setFilteredHalls}
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
        ) : filteredHalls.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800"
          >
            <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Search className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No matches found</h3>
            <p className="text-slate-500 max-w-xs text-center mt-2 font-medium">
              We couldn't find any halls matching your current search parameters.
            </p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHalls.map((hall) => (
              <motion.div
                layout
                key={hall._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                whileHover={{ y: -4 }}
              >
                <Card className="group relative overflow-hidden border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-500 bg-white dark:bg-slate-900 rounded-2xl">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/40 px-3 py-1 rounded-full uppercase tracking-wider">
                          {hall.name.split(" ").map(w => w[0]).join("").toUpperCase()}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                          {(hall as any).hallCode}
                        </h3>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(hall)}
                          className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(hall._id)}
                          className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <h4 className="text-slate-900 dark:text-slate-100 font-semibold mb-2 line-clamp-1">{hall.name}</h4>
                    
                    <div className="space-y-3 mt-4">
                      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 gap-2 font-medium">
                        <MapPin className="h-4 w-4 text-blue-500" />
                        <span className="line-clamp-1">
                          {typeof hall.building === 'string' 
                            ? hall.building 
                            : hall.building?.name || 'No building assigned'}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-slate-500 dark:text-slate-400 gap-2 font-medium">
                        <Users className="h-4 w-4 text-emerald-500" />
                        <span>{hall.capacity} Student Capacity</span>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-1.5 grayscale group-hover:grayscale-0 transition-all duration-500">
                      {hall.features.slice(0, 3).map((feature, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold px-2 py-0 border-none rounded-md">
                          {feature}
                        </Badge>
                      ))}
                      {hall.features.length > 3 && (
                        <Badge variant="secondary" className="bg-slate-100 dark:bg-slate-800 text-slate-500 text-[10px] px-2 py-0 border-none rounded-md font-bold">
                          +{hall.features.length - 3}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dialog for Add/Edit */}
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
          <div className="h-1.5 bg-gradient-to-r from-blue-600 to-blue-400" />
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold">
                {editingId ? "Edit Lecture Hall" : "Create New Hall"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                Provide the details for campus classroom infrastructure.
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-2 gap-6 py-2">
              <div className="col-span-1 space-y-2">
                <Label htmlFor="hallCode" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Hall Code</Label>
                <Input
                  id="hallCode"
                  name="hallCode"
                  placeholder="LT001"
                  className="rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 transition-all h-11"
                  value={formData.hallCode}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-span-1 space-y-2">
                <Label htmlFor="capacity" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Capacity</Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  placeholder="120"
                  className="rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 transition-all h-11"
                  value={formData.capacity}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Hall Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Nelson Mandela Lecture Theatre"
                  className="rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 transition-all h-11"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="building" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Building Structure</Label>
                <Select value={formData.building} onValueChange={(val) => setFormData(p => ({ ...p, building: val }))}>
                  <SelectTrigger className="rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 h-11">
                    <SelectValue placeholder="Select a campus building" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {buildings.map((b) => (
                      <SelectItem key={b._id} value={b._id} className="cursor-pointer font-medium">
                        {b.name} ({b.code})
                      </SelectItem>
                    ))}
                    {buildings.length === 0 && (
                       <SelectItem value="none" disabled className="text-slate-400">
                         No buildings available
                       </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor="features" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Features</Label>
                <Input
                  id="features"
                  name="features"
                  placeholder="Projector, AC, Whiteboard (comma separated)"
                  className="rounded-xl bg-slate-50/50 dark:bg-slate-800/50 border-slate-100 dark:border-slate-800 focus:bg-white dark:focus:bg-slate-800 transition-all h-11"
                  value={formData.features}
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
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 flex-[2] font-semibold"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : editingId ? (
                  "Update Infrastructure"
                ) : (
                  "Create Hall"
                )}
              </AnimatedButton>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

    {/* Delete Confirmation Alert */}
    <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
      <AlertDialogContent className="rounded-3xl border-none p-0 overflow-hidden shadow-2xl">
        <div className="p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-bold text-slate-900 leading-tight">
              Delete Lecture Hall?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 pt-2 text-base leading-relaxed">
              This action is permanent and will remove <span className="font-bold text-slate-800">LT001</span> from the database. 
              Any scheduled classes in this hall will be unassigned.
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
                {deleting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Delete Permanently"
                )}
              </AlertDialogAction>
            </motion.div>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  </div>
);
}
