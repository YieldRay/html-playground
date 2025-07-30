import { createPortal } from "react-dom";
import React, { useEffect } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  className?: string;
  unmountOnClose?: boolean;
}

export function Sheet({
  open,
  onOpenChange,
  children,
  side = "right",
  className,
  unmountOnClose = false,
}: React.PropsWithChildren<SheetProps>) {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onOpenChange(false);
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when sheet is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, onOpenChange]);

  const getPositionClasses = () => {
    switch (side) {
      case "left":
        return "left-0 top-0 h-full";
      case "right":
        return "right-0 top-0 h-full";
      case "top":
        return "top-0 left-0 w-full";
      case "bottom":
        return "bottom-0 left-0 w-full";
      default:
        return "right-0 top-0 h-full";
    }
  };

  const getTransformClasses = () => {
    if (!open) {
      switch (side) {
        case "left":
          return "-translate-x-full";
        case "right":
          return "translate-x-full";
        case "top":
          return "-translate-y-full";
        case "bottom":
          return "translate-y-full";
        default:
          return "translate-x-full";
      }
    }
    return "translate-x-0 translate-y-0";
  };

  if (!open && unmountOnClose) return null;

  const sheetContent = (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-50 transition-opacity duration-300",
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => onOpenChange(false)}
      />

      {/* Sheet */}
      <div
        className={cn(
          "fixed z-50 bg-background shadow-xl transition-transform duration-300 ease-in-out max-w-full max-h-full",
          getPositionClasses(),
          getTransformClasses(),
          className
        )}
      >
        {children}
      </div>
    </>
  );

  return createPortal(sheetContent, document.body);
}
