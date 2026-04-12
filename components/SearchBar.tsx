"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function SearchBar() {
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (val) {
      setIsSearching(true);
      // Simulate debounce search
      setTimeout(() => setIsSearching(false), 800);
    }
  };

  return (
    <div className="space-y-6">
      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl blur opacity-0 group-focus-within:opacity-20 transition duration-1000 group-hover:duration-200" />
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500 transition-colors group-focus-within:text-blue-500" />
          <Input 
            placeholder="Search courses or halls..." 
            className="pl-11 h-12 rounded-2xl border-none bg-slate-100 dark:bg-slate-800 focus:bg-white dark:focus:bg-slate-700 transition-all font-medium placeholder:text-slate-400"
            value={query}
            onChange={handleSearch}
          />
          <AnimatePresence>
            {isSearching && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="absolute right-4 top-1/2 -translate-y-1/2"
              >
                <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!query ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="flex flex-col items-center justify-center py-6 text-center space-y-2 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl"
          >
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-full mb-1">
              <Sparkles className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-200">Quick Finder</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 max-w-[180px]">Instant access to class schedules and lecture hall locations.</p>
          </motion.div>
        ) : (
          <motion.div 
            key="results"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-1">Simulated Results</p>
            {[1, 2].map((i) => (
              <div key={i} className="p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-xs font-bold text-blue-600">CSC{300 + i}</span>
                  <span className="text-[10px] font-medium text-slate-400 uppercase">Mon 10am</span>
                </div>
                <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">Advanced Algorithm Design {i}</p>
                <p className="text-[10px] text-slate-500 mt-1">Nelson Mandela LT</p>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
