import * as React from "react";
import { cn } from "@/lib/utils";

export interface HexagonIconProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-6 w-6",
  md: "h-8 w-8",
  lg: "h-10 w-10",
  xl: "h-12 w-12",
};

const HexagonIcon = React.forwardRef<HTMLDivElement, HexagonIconProps>(
  ({ className, children, size = "md", ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "hexagon-icon",
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
HexagonIcon.displayName = "HexagonIcon";

export { HexagonIcon };

