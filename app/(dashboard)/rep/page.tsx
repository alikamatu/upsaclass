"use client";

import { useEffect, useState } from "react";
import { PageTransition } from "@/components/ui/PageTransition";
import { TimetableGrid } from "@/components/TimetableGrid";
import { SearchBar } from "@/components/SearchBar";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  MapPin, 
  AlertCircle, 
  ClipboardList,
  LayoutDashboard,
  BookOpen,
  GraduationCap
} from "lucide-react";
import { RequestReassignment } from "@/components/rep/RequestReassignment";
import { MyRequests } from "@/components/rep/MyRequests";
import { Skeleton } from "@/components/ui/skeleton";

export default function RepDashboard() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [managedCourses, setManagedCourses] = useState<any[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    async function fetchManagedCourses() {
      try {
        const res = await fetch("/api/rep/managed-courses");
        const data = await res.json();
        if (data.success) {
          setManagedCourses(data.courses);
        }
      } catch (err) {
        console.error("Failed to fetch managed courses", err);
      } finally {
        setLoadingCourses(false);
      }
    }
    fetchManagedCourses();
  }, []);

  const handleRequestSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <PageTransition>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Representative Console</h2>
            <Badge className="bg-blue-600 text-white border-none px-2 rounded-md font-bold uppercase text-[10px]">Staff/Rep</Badge>
          </div>
          <p className="text-slate-500 font-medium">Coordinate course events and hall reassignments</p>
        </div>
        
        <RequestReassignment onSucess={handleRequestSuccess} />
      </div>

      {/* Managed Courses Section */}
      <section className="mb-10 animate-in fade-in slide-in-from-bottom-2 duration-500 delay-150">
        <div className="flex items-center gap-3 mb-6">
          <BookOpen className="h-6 w-6 text-blue-600" />
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Management Overview</h2>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {loadingCourses ? (
            [...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-2xl" />
            ))
          ) : managedCourses.length > 0 ? (
            managedCourses.map((course) => (
              <Card key={course._id} className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-2xl p-4 hover:shadow-md transition-all group overflow-hidden relative">
                <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                   <GraduationCap className="h-12 w-12 text-slate-900" />
                </div>
                <div className="relative z-10">
                  <Badge variant="outline" className="text-[10px] font-bold border-blue-100 bg-blue-50 text-blue-600 mb-2">
                    {course.courseCode}
                  </Badge>
                  <h3 className="font-bold text-slate-800 dark:text-slate-100 text-sm line-clamp-1">
                    {course.courseName}
                  </h3>
                  <p className="text-[10px] text-slate-500 font-medium mt-1">
                    {course.department}
                  </p>
                </div>
              </Card>
            ))
          ) : (
            <Card className="col-span-full py-8 border-dashed border-2 flex items-center justify-center text-slate-400 font-medium italic">
              No managed courses assigned.
            </Card>
          )}
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-10">
          <section>
            <div className="flex items-center gap-3 mb-6">
              <LayoutDashboard className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Official Timetable</h2>
            </div>
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-3xl overflow-hidden p-6">
              <TimetableGrid />
            </Card>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-6">
              <ClipboardList className="h-6 w-6 text-blue-600" />
              <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">My Dispatched Requests</h2>
            </div>
            <MyRequests refreshKey={refreshKey} />
          </section>
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
            <div className="relative z-10">
              <h3 className="text-lg font-bold mb-2">Need a Lab?</h3>
              <p className="text-white/80 text-sm font-medium mb-4">
                Computer labs require a separate booking process at least 48 hours in advance.
              </p>
              <div className="p-3 bg-white/10 rounded-xl backdrop-blur-sm text-xs font-semibold border border-white/10">
                Contact departmental admin for lab access keys.
              </div>
            </div>
          </Card>
        </div>
      </div>
    </PageTransition>
  );
}
