"use client";

import { useState, useEffect } from "react";
import { PageTransition } from "@/components/ui/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StaggerList, StaggerItem } from "@/components/ui/StaggerList";
import { AnimatedButton } from "@/components/ui/AnimatedButton";
import { HallManagement } from "@/components/admin/HallManagement";
import { CourseManagement } from "@/components/admin/CourseManagement";
import { TimetableManagement } from "@/components/admin/TimetableManagement";
import { BuildingManagement } from "@/components/admin/BuildingManagement";
import { LecturerManagement } from "@/components/admin/LecturerManagement";
import { RepManagement } from "@/components/admin/RepManagement";
import { requestService } from "@/services/requestService";
import { hallService } from "@/services/hallService";
import { ReassignmentRequest, LectureHall } from "@/types";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, AlertCircle, MapPin, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export default function AdminDashboard() {
  const [requests, setRequests] = useState<ReassignmentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [halls, setHalls] = useState<LectureHall[]>([]);

  // Approval state
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ReassignmentRequest | null>(null);
  const [selectedHall, setSelectedHall] = useState<string>("");
  const [adminNotes, setAdminNotes] = useState("");
  const [isOneTime, setIsOneTime] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const pendingRequests = requests.filter(
    (r) => String(r.status).toLowerCase() === "pending"
  );

  useEffect(() => {
    fetchRequests();
    fetchHalls();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await requestService.getAll();
      setRequests(Array.isArray(data) ? data : (data as any)?.requests || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchHalls = async () => {
    try {
      const hallsData = await hallService.getAll();
      setHalls(hallsData);
    } catch (error) {
      console.error(error);
    }
  };

  const handleApproveClick = (request: ReassignmentRequest) => {
    setSelectedRequest(request);
    setIsApproveDialogOpen(true);
  };

  const handleApproveSubmit = async () => {
    if (!selectedRequest || !selectedHall) {
      toast.error("Please select a hall for reassignment");
      return;
    }

    setSubmitting(true);
    try {
      await requestService.approve(selectedRequest._id, selectedHall, adminNotes, isOneTime, selectedRequest.requestedDate);
      toast.success("Request approved and hall reassigned");
      setIsApproveDialogOpen(false);
      resetApprovalForm();
      fetchRequests();
    } catch (error) {
      // Handled by apiClient
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectSubmit = async (request: ReassignmentRequest) => {
    const notes = prompt("Enter reason for rejection:");
    if (notes === null) return;

    try {
      await requestService.reject(request._id, notes);
      toast.success("Request rejected");
      fetchRequests();
    } catch (error) {
      // Handled by apiClient
    }
  };

  const resetApprovalForm = () => {
    setSelectedRequest(null);
    setSelectedHall("");
    setAdminNotes("");
  };

  return (
    <PageTransition>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">System Administration</h2>
          <p className="text-slate-500 font-medium">Global classroom and reallocation management</p>
        </div>
      </div>

      <Tabs defaultValue="requests" className="w-full space-y-6">
        <TabsList className="bg-white/50 dark:bg-slate-900/50 p-1 rounded-2xl border border-slate-100 dark:border-slate-800 backdrop-blur-sm self-start">
          <TabsTrigger value="requests" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all font-semibold">
            Pending Requests
            {pendingRequests.length > 0 && (
              <span className="ml-2 bg-blue-600 text-white text-[10px] h-4 w-4 rounded-full flex items-center justify-center animate-pulse">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="buildings" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all font-semibold">
            Buildings
          </TabsTrigger>
          <TabsTrigger value="halls" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all font-semibold">
            Lecture Halls
          </TabsTrigger>
          <TabsTrigger value="lecturers" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all font-semibold">
            Lecturers
          </TabsTrigger>
          <TabsTrigger value="courses" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all font-semibold">
            Courses
          </TabsTrigger>
          <TabsTrigger value="timetable" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all font-semibold text-sm">
            Timetable
          </TabsTrigger>
          <TabsTrigger value="reps" className="rounded-xl px-6 py-2.5 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all font-semibold text-sm">
            Course Reps
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="mt-0 focus-visible:outline-none">
          <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
            <CardHeader className="border-b border-slate-50 dark:border-slate-800 pb-6">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-xl font-bold">Reassignment Queue</CardTitle>
                  <CardDescription className="text-slate-500 font-medium mt-0.5">Active requests requiring administrative action</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-12 flex flex-col items-center justify-center space-y-4">
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                  <p className="text-slate-500 font-medium">Synchronizing requests...</p>
                </div>
              ) : requests.length === 0 ? (
                <div className="p-16 text-center">
                  <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">Clear Queue</h3>
                  <p className="text-slate-500 font-medium">All reassignment requests have been processed.</p>
                </div>
              ) : (
                <StaggerList className="divide-y divide-slate-50 dark:divide-slate-800">
                  {pendingRequests.map((request) => (
                    <StaggerItem key={request._id}>
                      <div className="p-6 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors flex flex-col lg:flex-row justify-between lg:items-center gap-6 group">
                        <div className="space-y-4 flex-1">
                          {/* Course Header */}
                          <div className="flex items-center gap-3 flex-wrap">
                            <Badge variant="outline" className="rounded-full bg-blue-50 text-blue-600 border-blue-100 font-bold px-3">
                              {(request.slot as any)?.course?.courseCode || "COURSE"}
                            </Badge>
                            <span className="text-slate-900 dark:text-slate-100 font-bold text-lg">
                              {(request.slot as any)?.course?.courseName || "Course Title"}
                            </span>
                            {(request.slot as any)?.course?.enrollmentCount && (
                              <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-xs">
                                {(request.slot as any).course.enrollmentCount} students
                              </Badge>
                            )}
                          </div>

                          {/* Main Info Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm font-medium">
                            {/* Lecturer */}
                            {(request.slot as any)?.lecturer?.fullName && (
                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <span className="text-slate-500">Lecturer:</span>
                                <span className="text-slate-800 dark:text-slate-200">{(request.slot as any).lecturer.fullName}</span>
                              </div>
                            )}

                            {/* Time & Day */}
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                              <Clock className="h-4 w-4 text-blue-500" />
                              <span className="text-slate-500">Time:</span>
                              <span className="text-slate-800 dark:text-slate-200">
                                {(request.slot as any)?.day} {(request.slot as any)?.startTime}-{(request.slot as any)?.endTime}
                              </span>
                            </div>

                            {/* Current Hall */}
                            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                              <MapPin className="h-4 w-4 text-slate-400" />
                              <span className="text-slate-500">Current:</span>
                              <span className="text-slate-800 dark:text-slate-200">
                                {(request.slot as any)?.defaultHall?.hallCode || "TBA"}
                              </span>
                            </div>
                          </div>

                          {/* Secondary Info - Reason and Requested By */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            {/* Reason */}
                            <div className="flex gap-2">
                              <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                              <div>
                                <span className="text-slate-500 block mb-1">Reason:</span>
                                <span className="text-slate-800 dark:text-slate-200 italic font-medium">"{request.reason}"</span>
                              </div>
                            </div>

                            {/* Requested By */}
                            {(request.requestedBy as any)?.fullName && (
                              <div>
                                <span className="text-slate-500 text-xs block mb-1">Requested by:</span>
                                <span className="text-slate-800 dark:text-slate-200 font-medium">{(request.requestedBy as any).fullName}</span>
                              </div>
                            )}
                          </div>

                          {/* Additional Details Row */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium pt-2">
                            {/* Requested Date */}
                            {request.requestedDate && (
                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <span className="text-slate-500">Requested Date:</span>
                                <span className="text-slate-800 dark:text-slate-200">{request.requestedDate}</span>
                              </div>
                            )}

                            {/* Preferred Hall */}
                            {(request.preferredHall as any)?.name && (
                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <span className="text-slate-500">Preferred:</span>
                                <span className="text-slate-800 dark:text-slate-200">{(request.preferredHall as any).name}</span>
                              </div>
                            )}

                            {/* Current Hall Capacity */}
                            {(request.slot as any)?.defaultHall?.capacity && (
                              <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                                <span className="text-slate-500">Capacity:</span>
                                <span className="text-slate-800 dark:text-slate-200">{(request.slot as any).defaultHall.capacity} seats</span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 self-end lg:self-center">
                          <AnimatedButton
                            variant="ghost"
                            onClick={() => handleRejectSubmit(request)}
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-bold h-11 px-6 rounded-xl border border-transparent hover:border-red-100 dark:hover:border-red-900/50"
                          >
                            Reject
                          </AnimatedButton>
                          <AnimatedButton
                            onClick={() => handleApproveClick(request)}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 px-8 rounded-xl shadow-md shadow-blue-500/20"
                          >
                            Reassign & Notify
                          </AnimatedButton>
                        </div>
                      </div>
                    </StaggerItem>
                  ))}
                </StaggerList>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="buildings" className="mt-0 outline-none">
          <BuildingManagement />
        </TabsContent>

        <TabsContent value="halls" className="mt-0 outline-none">
          <HallManagement />
        </TabsContent>

        <TabsContent value="lecturers" className="mt-0 outline-none">
          <LecturerManagement />
        </TabsContent>

        <TabsContent value="courses" className="mt-0 outline-none">
          <CourseManagement />
        </TabsContent>

        <TabsContent value="timetable" className="mt-0 outline-none">
          <TimetableManagement />
        </TabsContent>
        
                 <TabsContent value="reps" className="mt-0 outline-none">
                     <RepManagement />
                   </TabsContent>
               </Tabs>

      {/* Approve Dialog */}
      <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-3xl p-0 overflow-hidden border-none shadow-2xl">
          <div className="h-2 bg-emerald-500" />
          <div className="p-8">
            <DialogHeader className="mb-6">
              <DialogTitle className="text-2xl font-bold">Confirm Reassignment</DialogTitle>
              <DialogDescription className="font-medium text-slate-500">
                Allocate a new lecture hall for <span className="text-blue-600 font-bold">{(selectedRequest?.slot as any)?.course?.courseCode}</span> ({(selectedRequest?.slot as any)?.day} {(selectedRequest?.slot as any)?.startTime}-{(selectedRequest?.slot as any)?.endTime}).
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-bold text-slate-500">Available Halls</Label>
                <Select onValueChange={setSelectedHall} value={selectedHall}>
                  <SelectTrigger className="h-12 rounded-xl bg-slate-50 dark:bg-slate-800 border-none transition-all">
                    <SelectValue placeholder="Select target hall" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {halls.map((hall) => (
                      <SelectItem key={hall._id} value={hall._id} className="rounded-lg">
                        {hall.name} ({hall.capacity} seats)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-bold text-slate-500">Admin Response</Label>
                <Textarea
                  placeholder="e.g. Approved. Nelson Mandela LT is reserved for your session."
                  className="rounded-xl min-h-[80px] bg-slate-50 dark:bg-slate-800 border-none resize-none"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>

              <div className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl">
                <input
                  type="checkbox"
                  id="one-time"
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600"
                  checked={isOneTime}
                  onChange={(e) => setIsOneTime(e.target.checked)}
                />
                <Label htmlFor="one-time" className="text-sm font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  One-time assignment (for {selectedRequest?.requestedDate || 'selected date'})
                </Label>
              </div>
            </div>
            <DialogFooter className="mt-8">
              <AnimatedButton
                onClick={handleApproveSubmit}
                disabled={submitting}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold h-12 rounded-xl"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Authorize & Proceed"}
              </AnimatedButton>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
