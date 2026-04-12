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
import { Trash2, Edit2, Plus, Loader2, MapPin, Building2, Search } from "lucide-react";
import { buildingService } from "@/services/buildingService";
import { Building } from "@/types";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { SearchFilters } from "@/components/shared/SearchFilters";

interface FormData {
  name: string;
  code: string;
  address: string;
}

const initialFormData: FormData = {
  name: "",
  code: "",
  address: "",
};

export function BuildingManagement() {
  const [buildings, setBuildings] = useState<Building[]>([]);
  const [filteredBuildings, setFilteredBuildings] = useState<Building[]>([]);
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
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const list = await buildingService.getAll();
      setBuildings(list);
      setFilteredBuildings(list);
    } catch (error) {
      console.error("Error fetching buildings:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddClick = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (building: Building) => {
    setFormData({
      name: building.name,
      code: building.code,
      address: building.address || "",
    });
    setEditingId(building._id);
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.code) {
      toast.error("Please fill in the required fields (Name and Code)");
      return;
    }

    setSubmitting(true);
    try {
      if (editingId) {
        await buildingService.update(editingId, formData);
        toast.success("Building updated successfully");
      } else {
        await buildingService.create(formData);
        toast.success("New building registered");
      }
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
      await fetchBuildings();
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
      await buildingService.delete(deletingId);
      toast.success("Building deleted successfully");
      setIsDeleteAlertOpen(false);
      await fetchBuildings();
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
            <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Campus Infrastructure</h2>
            <Building2 className="h-5 w-5 text-indigo-500" />
          </div>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage university buildings and physical locations</p>
        </div>
        <AnimatedButton
          onClick={handleAddClick}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl h-11 px-6 shadow-md shadow-indigo-500/20 font-bold"
        >
          <Plus className="w-5 h-5 mr-2" />
          Register Building
        </AnimatedButton>
      </div>

      <SearchFilters<Building>
        data={buildings}
        placeholder="Search buildings by name or code..."
        searchFields={useMemo(() => ["name", "code"], [])}
        sortOptions={useMemo(() => [
          { label: "Name (A-Z)", field: "name", direction: "asc" },
          { label: "Name (Z-A)", field: "name", direction: "desc" },
        ], [])}
        onFilterChange={setFilteredBuildings}
      />

      <AnimatePresence mode="popLayout" initial={false}>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-none shadow-sm overflow-hidden rounded-2xl">
                <Skeleton className="h-32 w-full" />
              </Card>
            ))}
          </div>
        ) : filteredBuildings.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex flex-col items-center justify-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800"
          >
            <div className="h-20 w-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
              <Building2 className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">No buildings found</h3>
            <p className="text-slate-500 max-w-xs text-center mt-2 font-medium">
              You haven't registered any buildings yet or none match your search.
            </p>
          </motion.div>
        ) : (
          <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBuildings.map((building) => (
              <motion.div
                layout
                key={building._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
                whileHover={{ y: -4 }}
              >
                <Card className="group relative overflow-hidden border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all duration-500 bg-white dark:bg-slate-900 rounded-2xl h-full flex flex-col">
                  <CardContent className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/40 px-3 py-1 rounded-full tracking-widest">
                        {building.code}
                      </span>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditClick(building)}
                          className="h-8 w-8 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(building._id)}
                          className="h-8 w-8 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <h4 className="text-slate-900 dark:text-slate-100 font-bold text-lg mb-2 leading-tight">
                      {building.name}
                    </h4>
                    
                    {building.address && (
                      <div className="flex items-start text-sm text-slate-500 dark:text-slate-400 gap-2 mt-auto pt-4 font-medium">
                        <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-indigo-400" />
                        <span className="line-clamp-2">{building.address}</span>
                      </div>
                    )}
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
        <DialogContent className="sm:max-w-[450px] rounded-3xl border-none shadow-2xl p-0 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-indigo-500 to-indigo-400" />
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold">
                {editingId ? "Edit Building" : "Register Building"}
              </DialogTitle>
              <DialogDescription className="text-slate-500 font-medium">
                Define the primary physical structures for the campus.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              <div className="space-y-2">
                <Label htmlFor="code" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Building Code</Label>
                <Input
                  id="code"
                  name="code"
                  placeholder="e.g. FSB"
                  className="rounded-xl bg-slate-50 border-none transition-all h-11"
                  value={formData.code}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Building Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Faculty of Science Block"
                  className="rounded-xl bg-slate-50 border-none transition-all h-11"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-slate-700 dark:text-slate-300 font-semibold text-xs uppercase tracking-wider">Location / Address <span className="text-slate-400 normal-case">(Optional)</span></Label>
                <Input
                  id="address"
                  name="address"
                  placeholder="Main Campus, North Wing"
                  className="rounded-xl bg-slate-50 border-none transition-all h-11"
                  value={formData.address}
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
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-12 flex-[2] font-semibold"
              >
                {submitting ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : editingId ? (
                  "Update Record"
                ) : (
                  "Create Building"
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
            <AlertDialogTitle className="text-xl font-bold">Remove Building?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 font-medium">
              This will permanently delete the building. It will fail if there are any Lecture Halls currently inside this building.
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
                {deleting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Delete Building"}
              </AlertDialogAction>
            </motion.div>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
