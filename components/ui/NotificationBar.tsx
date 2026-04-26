"use client";

import { useEffect, useState } from "react";
import { X, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { notificationService } from "@/services/notificationService";

interface NotificationBarProps {
  onClose?: () => void;
}

export function NotificationBar({ onClose }: NotificationBarProps) {
  const [latestNotification, setLatestNotification] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkForNewNotifications = async () => {
      try {
        const data = await notificationService.getAll();
        const notifications = data.notifications || [];
        const unreadNotifications = notifications.filter(n => !n.isRead);

        if (unreadNotifications.length > 0) {
          // Show the most recent unread notification
          const latest = unreadNotifications.sort((a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0];

          // Only show if it's a reschedule approval notification
          if (latest.title?.includes("Approved") || latest.message?.includes("approved")) {
            setLatestNotification(latest);
            setIsVisible(true);
          }
        }
      } catch (error) {
        console.error("Failed to check notifications:", error);
      }
    };

    // Check immediately and then every 30 seconds
    checkForNewNotifications();
    const interval = setInterval(checkForNewNotifications, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  const handleMarkAsRead = async () => {
    if (latestNotification) {
      try {
        await notificationService.markAsRead(latestNotification._id);
        setIsVisible(false);
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
  };

  if (!isVisible || !latestNotification) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="fixed top-16 left-0 right-0 z-40 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg border-b border-green-400"
      >
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm truncate">{latestNotification.title}</p>
                <p className="text-xs opacity-90 truncate">{latestNotification.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleMarkAsRead}
                className="text-white hover:bg-white/20 h-8 px-3 text-xs"
              >
                Mark Read
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="text-white hover:bg-white/20 h-8 w-8"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}