"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, SlidersHorizontal, X, ChevronDown, Check, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

export interface FilterOption {
  label: string;
  value: string;
}

export interface SearchFiltersProps<T> {
  data: T[];
  searchFields: (keyof T)[];
  filterConfigs?: {
    label: string;
    field: keyof T;
    options?: FilterOption[]; // If provided, use these, otherwise extract from data
  }[];
  sortOptions?: {
    label: string;
    field: keyof T;
    direction: "asc" | "desc";
  }[];
  onFilterChange: (filteredData: T[]) => void;
  placeholder?: string;
  className?: string;
}

export function SearchFilters<T>({
  data,
  searchFields,
  filterConfigs,
  sortOptions,
  onFilterChange,
  placeholder = "Search...",
  className,
}: SearchFiltersProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilters, setActiveFilters] = useState<Record<string, string[]>>({});
  const [activeSort, setActiveSort] = useState<number | null>(null);
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Extract unique options for filters that don't have them predefined
  const [dynamicOptions, setDynamicOptions] = useState<Record<string, FilterOption[]>>({});

  // Make defaults stable
  const effectiveFilterConfigs = useMemo(() => filterConfigs || [], [filterConfigs]);
  const effectiveSortOptions = useMemo(() => sortOptions || [], [sortOptions]);

  useEffect(() => {
    const newDynamicOptions: Record<string, FilterOption[]> = {};
    effectiveFilterConfigs.forEach((config) => {
      if (!config.options) {
        const field = config.field;
        const uniqueValues = new Set<string>();
        data.forEach((item: any) => {
          const val = item[field];
          if (Array.isArray(val)) {
            val.forEach((v) => uniqueValues.add(v));
          } else if (val) {
            uniqueValues.add(val.toString());
          }
        });
        newDynamicOptions[field as string] = Array.from(uniqueValues)
          .sort()
          .map((v) => ({ label: v, value: v }));
      }
    });
    setDynamicOptions(newDynamicOptions);
  }, [data, effectiveFilterConfigs]);

  // Combined filtering and sorting logic
  useEffect(() => {
    let filtered = [...data];

    // 1. Search Logic
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item: any) =>
        searchFields.some((field) => {
          const val = item[field];
          return val?.toString().toLowerCase().includes(query);
        })
      );
    }

    // 2. Filter Logic
    Object.entries(activeFilters).forEach(([field, selectedValues]) => {
      if (selectedValues.length > 0) {
        filtered = filtered.filter((item: any) => {
          const itemValue = item[field];
          if (Array.isArray(itemValue)) {
            // Match if it contains at least one of the selected values (OR logic)
            // Or change to every for AND logic
            return selectedValues.some((v) => itemValue.includes(v));
          }
          return selectedValues.includes(itemValue?.toString());
        });
      }
    });

    // 3. Sort Logic
    if (activeSort !== null && effectiveSortOptions[activeSort]) {
      const { field, direction } = effectiveSortOptions[activeSort];
      filtered.sort((a: any, b: any) => {
        const valA = a[field];
        const valB = b[field];
        
        if (typeof valA === "number" && typeof valB === "number") {
          return direction === "asc" ? valA - valB : valB - valA;
        }
        
        const strA = valA?.toString().toLowerCase() || "";
        const strB = valB?.toString().toLowerCase() || "";
        
        if (strA < strB) return direction === "asc" ? -1 : 1;
        if (strA > strB) return direction === "asc" ? 1 : -1;
        return 0;
      });
    }

    onFilterChange(filtered);
  }, [searchQuery, activeFilters, activeSort, data, searchFields, effectiveFilterConfigs, effectiveSortOptions, onFilterChange]);

  const toggleFilter = (field: string, value: string) => {
    setActiveFilters((prev) => {
      const current = prev[field] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      
      const newFilters = { ...prev, [field]: updated };
      if (updated.length === 0) delete newFilters[field];
      return newFilters;
    });
  };

  const clearAll = () => {
    setSearchQuery("");
    setActiveFilters({});
    setActiveSort(null);
  };

  const hasActiveFilters = searchQuery !== "" || Object.keys(activeFilters).length > 0 || activeSort !== null;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1 group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
          </div>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={placeholder}
            className="pl-11 h-12 rounded-2xl bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 shadow-sm focus:ring-2 focus:ring-blue-500/10 transition-all placeholder:text-slate-400 font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className="h-4 w-4 text-slate-400 hover:text-slate-600" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          {effectiveFilterConfigs.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12 px-5 rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold gap-2 hover:bg-slate-50 transition-all group">
                  <SlidersHorizontal className="h-4 w-4 text-slate-500 group-hover:rotate-180 transition-transform duration-500" />
                  Filters
                  {Object.keys(activeFilters).length > 0 && (
                    <Badge className="ml-1 px-1.5 h-5 min-w-[20px] bg-blue-600 text-white border-none flex items-center justify-center text-[10px]">
                      {Object.keys(activeFilters).reduce((acc, k) => acc + activeFilters[k].length, 0)}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-slate-100 dark:border-slate-800 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95">
                {effectiveFilterConfigs.map((config) => (
                  <div key={config.field as string}>
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-slate-400 py-2">
                      {config.label}
                    </DropdownMenuLabel>
                    {(config.options || dynamicOptions[config.field as string] || []).map((opt) => (
                      <DropdownMenuCheckboxItem
                        key={opt.value}
                        checked={(activeFilters[config.field as string] || []).includes(opt.value)}
                        onCheckedChange={() => toggleFilter(config.field as string, opt.value)}
                        className="rounded-lg text-sm font-semibold py-2"
                      >
                        {opt.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                    <DropdownMenuSeparator className="my-1 opacity-50" />
                  </div>
                ))}
                {hasActiveFilters && (
                  <DropdownMenuItem onClick={clearAll} className="rounded-lg text-sm font-bold text-red-500 justify-center py-2 focus:text-red-600 focus:bg-red-50">
                    Clear All
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {effectiveSortOptions.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-12 px-5 rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 font-bold gap-2 hover:bg-slate-50 transition-all">
                  <ArrowUpDown className="h-4 w-4 text-slate-500" />
                  Sort
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl border-slate-100 dark:border-slate-800 backdrop-blur-xl bg-white/95 dark:bg-slate-900/95">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-slate-400 py-2">
                  Order By
                </DropdownMenuLabel>
                {effectiveSortOptions.map((opt, idx) => (
                  <DropdownMenuItem
                    key={idx}
                    onClick={() => setActiveSort(activeSort === idx ? null : idx)}
                    className="rounded-lg text-sm font-semibold py-2 flex justify-between items-center"
                  >
                    {opt.label}
                    {activeSort === idx && <Check className="h-4 w-4 text-blue-500" />}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      <AnimatePresence>
        {hasActiveFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -10 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -10 }}
            className="flex flex-wrap items-center gap-2 pb-2"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mr-1">Active:</span>
            {searchQuery && (
              <Badge variant="secondary" className="rounded-full bg-blue-50 text-blue-600 border-blue-100 py-1 pl-3 pr-1 font-bold gap-1 group">
                "{searchQuery}"
                <button onClick={() => setSearchQuery("")} className="hover:bg-blue-100 rounded-full p-0.5 transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            )}
            {Object.entries(activeFilters).map(([field, values]) =>
              values.map((v) => (
                <Badge key={`${field}-${v}`} variant="secondary" className="rounded-full bg-slate-100 text-slate-600 py-1 pl-3 pr-1 font-bold gap-1">
                  {v}
                  <button onClick={() => toggleFilter(field, v)} className="hover:bg-slate-200 rounded-full p-0.5 transition-colors">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-red-500 h-7"
            >
              Reset All
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
