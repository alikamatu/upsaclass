"use client";
import { Bell } from "lucide-react";
import { motion } from "framer-motion";

interface NotificationBadgeProps {
  count?: number;
}

export function NotificationBadge({ count = 0 }: NotificationBadgeProps) {
  return (
    <div className="relative cursor-pointer transition-colors p-1.5 hover:bg-slate-100 rounded-full">
      <Bell className="w-5 h-5 text-slate-600" />
      {count > 0 && (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center border-2 border-white"
        >
          {count > 9 ? "9+" : count}
        </motion.span>
      )}
    </div>
  );
}
