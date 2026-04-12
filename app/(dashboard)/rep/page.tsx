"use client";

import { useState, useEffect } from "react";
import { PageTransition } from "@/components/ui/PageTransition";
import { TimetableGrid } from "@/components/TimetableGrid";
import { SearchBar } from "@/components/SearchBar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, Plus, Calendar, MapPin, AlertCircle, Sparkles } from "lucide-react";
import { requestService } from "@/services/requestService";
import { hallService } from "@/services/hallService";
import { LectureHall } from "@/types";
import { motion } from "framer-motion";

export default function RepDashboard() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [halls, setHalls] = useState<LectureHall[]>([]);

  // Form state
  const [courseCode, setCourseCode] = useState("");
  const [reason, setReason] = useState("");
  const [preferredHallId, setPreferredHallId] = useState("");

  useEffect(() => {
    fetchHalls();
  }, []);

  const fetchHalls = async () => {
    try {
      const hallsData = await hallService.getAll();
      setHalls(hallsData);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseCode || !reason) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      await requestService.create({
        reason,
        preferredHallId,
        // In a real app, courseId and currentHallId would be derived from the rep's context
      });
      toast.success("Reassignment request submitted for review");
      setOpen(false);
      resetForm();
    } catch (error) {
      // Handled by apiClient
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCourseCode("");
    setReason("");
    setPreferredHallId("");
  };

  return (
    <PageTransition>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Representative Console</h2>
            <Badge className="bg-blue-100 text-blue-600 border-none px-2 rounded-md font-bold uppercase text-[10px]">Active</Badge>
          </div>
          <p className="text-slate-500 font-medium">Manage course schedules and hall requirements</p>
        </div>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <AnimatedButton className="bg-blue-600 hover:bg-blue-700 text-white rounded-2xl h-12 px-6 shadow-lg shadow-blue-500/20 font-bold group">
              <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
              Request Reassignment
            </AnimatedButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[450px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
             <div className="h-2 bg-gradient-to-r from-blue-600 to-indigo-500" />
             <div className="p-8">
              <DialogHeader className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                  <DialogTitle className="text-2xl font-bold">New Hall Request</DialogTitle>
                  <Sparkles className="h-4 w-4 text-blue-500" />
                </div>
                <DialogDescription className="font-medium text-slate-500">
                  Submit a request for a lecture hall change. Admins will review and update the schedule.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="course" className="text-xs font-bold uppercase tracking-wider text-slate-500">Course Identification</Label>
                  <Input 
                    id="course" 
                    placeholder="e.g. CSC301 - Web Dev" 
                    className="rounded-xl h-11 bg-slate-50 dark:bg-slate-800 border-none transition-all"
                    value={courseCode}
                    onChange={(e) => setCourseCode(e.target.value)}
                    required 
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hall" className="text-xs font-bold uppercase tracking-wider text-slate-500">Preferred Hall (Optional)</Label>
                  <Select onValueChange={setPreferredHallId} value={preferredHallId}>
                    <SelectTrigger className="h-11 rounded-xl bg-slate-50 dark:bg-slate-800 border-none">
                      <SelectValue placeholder="No preference" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {halls.map((hall) => (
                        <SelectItem key={hall._id} value={hall._id} className="rounded-lg">
                          {hall.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-xs font-bold uppercase tracking-wider text-slate-500">Reason for Change</Label>
                  <Textarea 
                    id="reason" 
                    placeholder="e.g. Faulty projector, insufficient capacity for merged groups..." 
                    className="rounded-xl min-h-[100px] bg-slate-50 dark:bg-slate-800 border-none resize-none pt-3"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    required 
                  />
                </div>

                <DialogFooter className="pt-4">
                  <AnimatedButton type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-bold shadow-md shadow-blue-500/10">
                    {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Dispatch Request"}
                  </AnimatedButton>
                </DialogFooter>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="h-6 w-6 text-blue-600" />
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Active Schedule</h2>
          </div>
          <TimetableGrid />
        </div>
        
        <div className="space-y-8 sticky top-24">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden group">
             <CardHeader className="pb-2 border-b border-slate-50 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900">
               <div className="flex items-center gap-2">
                 <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                   <MapPin className="h-4 w-4 text-blue-600" />
                 </div>
                 <CardTitle className="text-lg font-bold">Hall Search</CardTitle>
               </div>
             </CardHeader>
             <CardContent className="p-6">
               <SearchBar />
             </CardContent>
          </Card>

          <Card className="border-none shadow-sm bg-gradient-to-br from-indigo-500 to-blue-600 text-white rounded-3xl overflow-hidden p-6 relative">
            <AlertCircle className="absolute -bottom-4 -right-4 h-24 w-24 text-white/10 rotate-12" />
            <h3 className="text-lg font-bold mb-2">Need a lab?</h3>
            <p className="text-white/80 text-sm font-medium mb-6 relative z-10">Computer labs must be booked 48 hours in advance through the departmental office.</p>
            <Button variant="secondary" className="bg-white/10 hover:bg-white/20 border-white/20 text-white rounded-xl w-full font-bold backdrop-blur-sm transition-all">
              View Lab Guidelines
            </Button>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
