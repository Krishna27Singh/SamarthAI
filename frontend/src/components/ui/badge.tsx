import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-0 bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-sm",
        secondary:
          "border-0 bg-[#E0F2FE] text-[#1E293B] hover:bg-[#BEE3F8]",
        destructive:
          "border-0 bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FC8181]",
        critical:
          "border-0 bg-[#FEE2E2] text-[#DC2626] hover:bg-[#FC8181]",
        warning:
          "border-0 bg-[#FEF3C7] text-[#D97706] hover:bg-[#FCD34D]",
        success:
          "border-0 bg-[#D1FAE5] text-[#059669] hover:bg-[#A7F3D0]",
        outline:
          "border-2 border-[#E0F2FE] bg-white text-[#1E293B] hover:border-[#2563EB]",
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
