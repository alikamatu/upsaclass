"use client";

import { PageTransition } from "@/components/ui/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StaggerList, StaggerItem } from "@/components/ui/StaggerList";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

export default function AdminDashboard() {
  return (
    <PageTransition>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900">Admin Dashboard</h2>
      </div>

      <Tabs defaultValue="requests" className="w-full">
        <TabsList className="mb-8 w-full md:w-auto overflow-x-auto justify-start border-b border-slate-200">
          <TabsTrigger value="requests" className="rounded-xl data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            Pending Requests
          </TabsTrigger>
          <TabsTrigger value="halls" className="rounded-xl data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            Lecture Halls
          </TabsTrigger>
          <TabsTrigger value="courses" className="rounded-xl data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            Courses
          </TabsTrigger>
          <TabsTrigger value="timetable" className="rounded-xl data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700">
            Timetable Overrides
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="animation-fade-in">
          <Card className="rounded-xl shadow-sm border-slate-100">
            <CardHeader>
              <CardTitle>Reassignment Requests</CardTitle>
              <CardDescription>Manage hall reassignment requests from course reps.</CardDescription>
            </CardHeader>
            <CardContent>
              <StaggerList className="space-y-4">
                <StaggerItem>
                  <div className="border rounded-xl p-4 flex flex-col md:flex-row justify-between md:items-center bg-slate-50 transition-colors">
                    <div>
                      <h3 className="font-semibold text-slate-900">CSC301 - Web Development</h3>
                      <p className="text-sm text-slate-600">Mon, 10:00 - 12:00 (Nelson Mandela LT)</p>
                      <p className="text-sm text-slate-500 mt-2"><span className="font-medium">Reason:</span> Projector is faulty</p>
                    </div>
                    <div className="mt-4 md:mt-0 flex gap-2">
                      <AnimatedButton variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                        Reject
                      </AnimatedButton>
                      <AnimatedButton className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
                        Approve & Reassign
                      </AnimatedButton>
                    </div>
                  </div>
                </StaggerItem>
              </StaggerList>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="halls">
          <Card className="rounded-xl shadow-sm border-slate-100">
             <CardHeader>
              <CardTitle>Lecture Halls</CardTitle>
              <CardDescription>View and manage all classroom venues.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-slate-500 py-8 text-center border-2 border-dashed rounded-xl">
                Lecture Halls management interface coming soon.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card className="rounded-xl shadow-sm border-slate-100">
            <CardHeader>
              <CardTitle>Courses</CardTitle>
              <CardDescription>Course list and assigned course reps.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-slate-500 py-8 text-center border-2 border-dashed rounded-xl">
                Courses management interface coming soon.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timetable">
          <Card className="rounded-xl shadow-sm border-slate-100">
            <CardHeader>
              <CardTitle>Master Timetable Overrides</CardTitle>
              <CardDescription>View all active manual allocations overriding the standard schedule.</CardDescription>
            </CardHeader>
             <CardContent>
              <div className="text-slate-500 py-8 text-center border-2 border-dashed rounded-xl">
                Timetable management interface coming soon.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageTransition>
  );
}
