
import React from "react";
import { 
  LucideIcon, 
  LucideProps,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  as: LucideIcon;
  size?: number;
}

export const BuiltInIcon = React.forwardRef<HTMLSpanElement, IconProps>(
  ({ as: Icon, size = 20, className, ...props }, ref) => {
    return (
      <span ref={ref} className={cn("inline-flex", className)} {...props}>
        <Icon size={size} />
      </span>
    );
  }
);
BuiltInIcon.displayName = "BuiltInIcon";
