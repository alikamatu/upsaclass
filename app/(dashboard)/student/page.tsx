"use client";

import { PageTransition } from "@/components/ui/PageTransition";
import { TimetableGrid } from "@/components/TimetableGrid";
import { SearchBar } from "@/components/SearchBar";
import { Card } from "@/components/ui/card";

export default function StudentDashboard() {
  return (
    <PageTransition>
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-4">My Weekly Schedule</h2>
            <TimetableGrid />
          </div>
        </div>
        <div>
          <div className="sticky top-24">
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
