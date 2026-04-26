"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  MapPin, 
  Calendar as CalendarIcon,
  Loader2,
  Trash2,
  MoreVertical,
  MessageSquare,
  Users
} from "lucide-react";
import { requestService } from "@/services/requestService";
import { toast } from "sonner";
import { StaggerList, StaggerItem } from "@/components/ui/StaggerList";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export function MyRequests({ refreshKey }: { refreshKey: number }) {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, [refreshKey]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await requestService.getAll();
      setRequests(Array.isArray(data) ? data : (data as any).requests || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">Approved</Badge>;
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 border-red-200">Rejected</Badge>;
      default:
        return <Badge className="bg-amber-100 text-amber-700 border-amber-200">Pending</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "approved":
        return <CheckCircle2 className="h-5 w-5 text-emerald-500" />;
      case "rejected":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };

  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        <p className="text-slate-500 font-medium font-inter">Synchronizing requests...</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden">
        <CardContent className="p-12 text-center">
          <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <CalendarIcon className="h-8 w-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Empty Queue</h3>
          <p className="text-slate-500 font-medium">You haven't submitted any reassignment requests yet.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <StaggerList className="space-y-4">
      {requests.map((request) => (
        <StaggerItem key={request._id}>
          <Card className="border-none shadow-sm hover:shadow-md transition-shadow group bg-white dark:bg-slate-900 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {getStatusIcon(request.status)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {request.slot?.course?.courseCode || "Course"} Reassignment
                      </span>
                      {getStatusBadge(request.status)}
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="h-3 w-3" />
                        {request.slot?.day}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {request.slot?.startTime} - {request.slot?.endTime}
                      </div>                      {request.slot?.classGroup && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>Group: {request.slot.classGroup}</span>
                        </div>
                      )}                      {request.preferredHall && (
                        <div className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Preferred: {request.preferredHall.name}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-end md:self-center">
                  {request.adminComment && (
                    <div className="px-3 py-1 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center gap-2 max-w-[200px]">
                      <MessageSquare className="h-3 w-3 text-slate-400 shrink-0" />
                      <span className="text-[10px] text-slate-500 truncate font-medium">{request.adminComment}</span>
                    </div>
                  )}
                  {request.approvedNewHall && (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold">
                      Moved to {request.approvedNewHall.name}
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </StaggerItem>
      ))}
    </StaggerList>
  );
}
