"use client";
import { motion } from "framer-motion";
import { Button, buttonVariants } from "@/components/ui/button";
import { VariantProps } from "class-variance-authority";

interface AnimatedButtonProps
  extends React.ComponentProps<"button">,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
  asChild?: boolean;
}

export function AnimatedButton({ children, className, ...props }: AnimatedButtonProps) {
  return (
    <motion.div
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: 1.01 }}
      className={className}
    >
      <Button {...props}>{children}</Button>
    </motion.div>
  );
}
