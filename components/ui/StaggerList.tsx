"use client";
import { motion } from "framer-motion";

interface StaggerListProps {
  children: React.ReactNode;
  className?: string;
}

export function StaggerList({ children, className = "" }: StaggerListProps) {
  return (
    <motion.div
      variants={{
        animate: {
          transition: {
            staggerChildren: 0.05,
          },
        },
      }}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      variants={{
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
      }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
