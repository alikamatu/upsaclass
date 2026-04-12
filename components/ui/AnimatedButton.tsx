"use client";
import { motion, type HTMLMotionProps } from "framer-motion";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { VariantProps } from "class-variance-authority";

interface AnimatedButtonProps
  extends HTMLMotionProps<"button">,
  VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
}

export function AnimatedButton({ children, className, variant = "default", size = "default", ...props }: AnimatedButtonProps) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </motion.button>
  );
}
