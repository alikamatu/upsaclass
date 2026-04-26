"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { 
  Plus, 
  Loader2, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  AlertCircle,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { requestService } from "@/services/requestService";
import { hallService } from "@/services/hallService";
import { timetableService } from "@/services/timetableService";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { format, addDays, isAfter, startOfToday } from "date-fns";

export function RequestReassignment({ onSucess }: { onSucess?: () => void }) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingHalls, setFetchingHalls] = useState(false);
  
  const [slots, setSlots] = useState<any[]>([]);
  const [halls, setHalls] = useState<any[]>([]);
  
  // Selection State
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [selectedDate, setSelectedDate] = useState(format(addDays(new Date(), 1), "yyyy-MM-dd"));
  const [preferredHallId, setPreferredHallId] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) {
      fetchSlots();
    }
  }, [open]);

  useEffect(() => {
    if (selectedSlotId && selectedDate) {
      fetchAvailableHalls();
    }
  }, [selectedSlotId, selectedDate]);

  const fetchSlots = async () => {
    try {
      const data = await timetableService.getRepSlots();
      setSlots(data);
    } catch (error) {
      toast.error("Could not fetch course slots");
    }
  };

  const fetchAvailableHalls = async () => {
    const slot = slots.find(s => s._id === selectedSlotId);
    if (!slot) return;

    setFetchingHalls(true);
    try {
      const availableHalls = await hallService.getAvailable(
        selectedDate,
        slot.startTime,
        slot.endTime
      );
      setHalls(Array.isArray(availableHalls) ? availableHalls : (availableHalls as any).data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setFetchingHalls(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotId || !selectedDate || !reason) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await requestService.create({
        slotId: selectedSlotId,
        reason,
        preferredHallId: preferredHallId === "none" ? undefined : preferredHallId,
        requestedDate: selectedDate,
      });
      toast.success("Reassignment request dispatched to administrators");
      setOpen(false);
      resetForm();
      if (onSucess) onSucess();
    } catch (error) {
      // Error handled by client
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedSlotId("");
    setReason("");
    setPreferredHallId("");
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <AnimatedButton className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 shadow-lg shadow-blue-500/20 font-bold group">
          <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
          Request Reassignment
        </AnimatedButton>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[480px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
        <div className="h-2 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600 animate-gradient-x" />
        <div className="p-8">
          <DialogHeader className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <DialogTitle className="text-2xl font-bold">Reschedule Session</DialogTitle>
              <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
            </div>
            <DialogDescription className="font-medium text-slate-500">
              Submit a request to change the lecture hall for a specific session.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <Clock className="h-3 w-3" /> Select Session Slot
                </Label>
                <Select onValueChange={setSelectedSlotId} value={selectedSlotId}>
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none transition-all font-medium">
                    <SelectValue placeholder="Choose a recurring slot" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {slots.map((slot) => (
                      <SelectItem key={slot._id} value={slot._id} className="rounded-lg">
                        <div className="flex flex-col py-1">
                          <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                            <Badge variant="outline" className="text-[10px] h-4 py-0 font-bold bg-blue-50 text-blue-600 border-blue-100">
                              {slot.course?.courseCode}
                            </Badge>
                            <span className="font-bold text-slate-900">{slot.day} {slot.startTime} - {slot.endTime}</span>
                            {slot.classGroup && (
                              <Badge variant="secondary" className="text-[10px] px-2 py-0.5 font-bold bg-slate-100 text-slate-700 border-slate-200">
                                {slot.classGroup}
                              </Badge>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 truncate max-w-[300px]">
                            {slot.course?.courseName} · Default: {slot.defaultHall?.name}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-1 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <CalendarIcon className="h-3 w-3" /> Date
                </Label>
                <Input 
                  type="date"
                  min={format(new Date(), "yyyy-MM-dd")}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="rounded-xl h-11 bg-slate-50 dark:bg-slate-800 border-none"
                />
              </div>

              <div className="col-span-1 space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                  <MapPin className="h-3 w-3" /> Target Hall
                </Label>
                <Select onValueChange={setPreferredHallId} value={preferredHallId} disabled={!selectedSlotId || fetchingHalls}>
                  <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none">
                    <SelectValue placeholder={fetchingHalls ? "Loading..." : "No preference"} />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    <SelectItem value="none">Any Available Hall</SelectItem>
                    {halls.map((hall) => (
                      <SelectItem key={hall._id} value={hall._id} className="rounded-lg">
                        {hall.name} ({hall.capacity} seats)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                <AlertCircle className="h-3 w-3" /> Justification
              </Label>
              <Textarea 
                placeholder="Why do you need this change? (e.g., merging classes for MID-SEM, broken projector, etc.)" 
                className="rounded-xl min-h-[100px] bg-slate-50 dark:bg-slate-800 border-none resize-none pt-3 font-medium"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required 
              />
            </div>

            {selectedSlotId && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-amber-50 dark:bg-amber-950/20 rounded-xl border border-amber-100 dark:border-amber-900/30 flex items-start gap-3"
              >
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5" />
                <p className="text-[11px] text-amber-800 dark:text-amber-400 font-medium leading-relaxed">
                  Submitting this request will trigger an administrative review. Students enrolled in <span className="font-bold underline">{(slots.find(s => s._id === selectedSlotId))?.course?.courseCode}</span> will be notified once approved.
                </p>
              </motion.div>
            )}

            <DialogFooter className="pt-2">
              <AnimatedButton type="submit" disabled={loading || !selectedSlotId} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-bold shadow-md shadow-blue-500/10">
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Submit Request"}
              </AnimatedButton>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
