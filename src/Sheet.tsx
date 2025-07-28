import { createPortal } from "react-dom";
import React, { useEffect } from "react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children?: ReactNode;
  side?: "left" | "right" | "top" | "bottom";
  size?: "sm" | "md" | "lg" | "xl" | "full";
  unmountOnClose?: boolean;
  asChild?: boolean;
}

export function Sheet({
  open,
  onOpenChange,
  children,
  side = "right",
  size = "md",
  unmountOnClose = false,
  asChild = false,
  ...props
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

  const getSizeClasses = () => {
    const isVertical = side === "top" || side === "bottom";

    if (isVertical) {
      switch (size) {
        case "sm":
          return "h-1/4";
        case "md":
          return "h-1/3";
        case "lg":
          return "h-1/2";
        case "xl":
          return "h-3/4";
        case "full":
          return "h-full";
        default:
          return "h-1/3";
      }
    } else {
      switch (size) {
        case "sm":
          return "w-80";
        case "md":
          return "w-96";
        case "lg":
          return "w-[28rem]";
        case "xl":
          return "w-[36rem]";
        case "full":
          return "w-full";
        default:
          return "w-96";
      }
    }
  };

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
          "fixed z-50 bg-white shadow-xl transition-transform duration-300 ease-in-out",
          getPositionClasses(),
          getSizeClasses(),
          getTransformClasses()
        )}
      >
        {children}
      </div>
    </>
  );

  return createPortal(sheetContent, document.body);
}
