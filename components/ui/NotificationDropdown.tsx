"use client";

import { useEffect, useMemo, useState } from "react";
import { Bell, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { notificationService } from "@/services/notificationService";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface NotificationDropdownProps {
  onUnreadCountChange?: (count: number) => void;
}

export function NotificationDropdown({ onUnreadCountChange }: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  useEffect(() => {
    if (typeof onUnreadCountChange === "function") {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  // Load notifications on mount
  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getAll();
      setNotifications(data.notifications || []);
    } catch (error) {
      toast.error("Unable to load notifications");
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (value: string) => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(value));
    } catch {
      return value;
    }
  };

  return (
    <DropdownMenu open={open} onOpenChange={(value) => {
      setOpen(value);
      if (value) fetchNotifications();
    }}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative rounded-full">
          <Bell className="h-5 w-5 text-slate-600" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[360px] mt-2 rounded-3xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-800 dark:bg-slate-950">
        <div className="mb-3 flex items-center justify-between gap-3 px-2">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Notifications</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Recent system events and alerts</p>
          </div>
          <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            {unreadCount} unread
          </span>
        </div>

        <div className="max-h-[360px] space-y-2 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
              No notifications yet.
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={cn(
                  "group rounded-3xl border p-4 transition-colors",
                  notification.isRead
                    ? "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
                    : "border-blue-100 bg-blue-50 text-slate-900 shadow-sm dark:border-blue-900/40 dark:bg-blue-950/40 dark:text-white"
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 rounded-full bg-slate-100 p-2 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                    {notification.type === "success" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : notification.type === "alert" ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <Clock className="h-4 w-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-sm leading-snug text-slate-900 dark:text-slate-100">{notification.title}</p>
                      {!notification.isRead && (
                        <span className="inline-flex h-2.5 w-2.5 rounded-full bg-blue-600" />
                      )}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-400">{notification.message}</p>
                    <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-400 dark:text-slate-500">
                      {formatDateTime(notification.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
