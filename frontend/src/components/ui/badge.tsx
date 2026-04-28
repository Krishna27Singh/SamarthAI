import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-0 bg-[#4F46E5] text-white hover:bg-[#4338CA] shadow-sm",
        secondary:
          "border-0 bg-[#E2E8F0] text-[#1E293B] hover:bg-[#CBD5E1]",
        destructive:
          "border-0 bg-red-100 text-[#EF4444] hover:bg-red-200",
        critical:
          "border-0 bg-red-100 text-[#EF4444] hover:bg-red-200",
        warning:
          "border-0 bg-amber-100 text-[#F59E0B] hover:bg-amber-200",
        success:
          "border-0 bg-emerald-100 text-[#10B981] hover:bg-emerald-200",
        outline:
          "border-2 border-[#E2E8F0] bg-white text-[#1E293B] hover:border-[#CBD5E1]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
