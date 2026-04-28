import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-semibold transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-[#2563EB] text-white hover:bg-[#1D4ED8] shadow-sm hover:shadow-md hover:-translate-y-0.5",
        destructive:
          "bg-[#DC2626] text-white hover:bg-red-700 shadow-sm hover:shadow-md hover:-translate-y-0.5",
        outline:
          "border-2 border-[#E0F2FE] bg-white text-[#1E293B] hover:bg-[#F0F8FF] hover:border-[#BEE3F8]",
        secondary:
          "bg-[#E0F2FE] text-[#1E293B] hover:bg-[#BEE3F8] shadow-sm hover:shadow-md hover:-translate-y-0.5",
        ghost: "text-[#2563EB] hover:bg-[#F0F8FF] hover:text-[#1D4ED8]",
        link: "text-[#2563EB] underline-offset-4 hover:underline font-semibold",
      },
      size: {
        default: "h-10 px-4 py-2 text-sm",
        sm: "h-9 px-3 text-xs rounded-lg",
        lg: "h-12 px-6 text-base rounded-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
