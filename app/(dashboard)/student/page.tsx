"use client";

import { PageTransition } from "@/components/ui/PageTransition";
import { TimetableGrid } from "@/components/TimetableGrid";
import { SearchBar } from "@/components/SearchBar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { Calendar, Search, MapPin, Info, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function StudentDashboard() {
  const { data: session } = useSession();

  return (
    <PageTransition>
      <div className="space-y-10">
        {/* Welcome Hero Section */}
        <section className="relative overflow-hidden bg-white dark:bg-slate-900 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="relative z-10">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Hello, {session?.user?.name?.split(" ")[0] || "Scholar"}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium mt-1">Here is your academic schedule for today.</p>
            
            <div className="flex flex-wrap gap-4 mt-8">
              <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-2 rounded-xl flex items-center gap-2 border border-slate-100 dark:border-slate-800">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-bold text-slate-700 dark:text-slate-200">Monday, Oct 24</span>
              </div>
              <div className="bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-xl flex items-center gap-2 border border-emerald-100 dark:border-emerald-900/30">
                <Info className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-bold text-emerald-700 dark:text-emerald-400">All lectures on track</span>
              </div>
            </div>
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2 px-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600" />
                </div>
                <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Weekly Schedule</h3>
              </div>
              <button className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 group">
                Full Calendar <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
            <TimetableGrid />
          </div>

          <div className="space-y-8 sticky top-24">
            <Card className="border-none shadow-sm bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden">
               <CardHeader className="pb-2 border-b border-slate-50 dark:border-slate-800">
                 <div className="flex items-center gap-2">
                   <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                     <Search className="h-4 w-4 text-blue-600" />
                   </div>
                   <CardTitle className="text-lg font-bold">Course Finder</CardTitle>
                 </div>
               </CardHeader>
               <CardContent className="p-6">
                 <SearchBar />
               </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-slate-900 dark:bg-blue-900/20 text-white rounded-[2rem] overflow-hidden p-8 relative">
              <div className="absolute top-0 right-0 p-4">
                <MapPin className="h-12 w-12 text-white/10" />
              </div>
              <h3 className="text-xl font-bold mb-3 relative z-10">Campus Map</h3>
              <p className="text-slate-400 dark:text-blue-100 text-sm font-medium mb-6 relative z-10 leading-relaxed">
                Need help finding your lecture hall? Use the interactive campus map for turn-by-turn navigation.
              </p>
              <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 px-6 w-full font-bold transition-all shadow-lg shadow-blue-500/20">
                Open Maps
              </button>
            </Card>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
