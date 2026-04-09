"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export function SearchBar() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    // Real search API call with debounce would go here
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Search by course code or name..." 
          className="pl-9 rounded-xl border-slate-200"
          value={query}
          onChange={handleSearch}
        />
      </div>
      <div className="text-sm text-slate-500 text-center py-4">
        {query ? "Searching..." : "Type to find a course hall."}
      </div>
    </div>
  );
}
