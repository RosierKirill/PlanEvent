"use client";

import * as React from "react";

import type { VariantProps } from "class-variance-authority";
import { motion, type HTMLMotionProps } from "motion/react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface BounceButtonProps
  extends HTMLMotionProps<"button">,
    VariantProps<typeof buttonVariants> {
  children: React.ReactNode;
}

function BounceButton({
  children,
  className,
  size,
  variant,
  ...props
}: BounceButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      className={cn(
        buttonVariants({ variant, size }),
        "transition-none",
        className
      )}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

export { BounceButton, type BounceButtonProps };
