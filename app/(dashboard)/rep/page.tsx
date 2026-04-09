"use client";

import { PageTransition } from "@/components/ui/PageTransition";
import { TimetableGrid } from "@/components/TimetableGrid";
import { SearchBar } from "@/components/SearchBar";
import { Card } from "@/components/ui/card";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export default function RepDashboard() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form state
  const [courseCode, setCourseCode] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setOpen(false);
      toast.success("Request submitted successfully!");
    }, 1000);
  };

  return (
    <PageTransition>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Rep Dashboard</h2>
        
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <AnimatedButton className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-sm">
              Request Reassignment
            </AnimatedButton>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-xl">
            <DialogHeader>
              <DialogTitle>Request Hall Reassignment</DialogTitle>
              <DialogDescription>
                Submit a request to change the lecture hall for your course.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="course">Course Code</Label>
                <Input 
                  id="course" 
                  placeholder="e.g. CSC301" 
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Change</Label>
                <Input 
                  id="reason" 
                  placeholder="e.g. Projector is faulty" 
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  required 
                />
              </div>
              <div className="pt-4 flex justify-end">
                <AnimatedButton type="submit" disabled={loading} className="w-full bg-blue-600 text-white rounded-xl">
                  {loading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting...</> : "Submit Request"}
                </AnimatedButton>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">My Weekly Schedule</h2>
            <TimetableGrid />
          </div>
        </div>
        <div>
          <div className="sticky top-24 relative z-0">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Find a Course</h2>
            <Card className="p-4 rounded-xl shadow-sm border-slate-100">
              <SearchBar />
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
