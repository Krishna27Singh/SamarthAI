import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-600 transition-all duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-[#4F46E5] text-white hover:bg-[#4338CA] shadow-sm hover:shadow-md hover:-translate-y-0.5",
        destructive:
          "bg-[#EF4444] text-white hover:bg-red-600 shadow-sm hover:shadow-md hover:-translate-y-0.5",
        outline:
          "border-2 border-[#E2E8F0] bg-white text-[#1E293B] hover:bg-[#F8FAFC] hover:border-[#CBD5E1]",
        secondary:
          "bg-[#E2E8F0] text-[#1E293B] hover:bg-[#CBD5E1] shadow-sm hover:shadow-md hover:-translate-y-0.5",
        ghost: "text-[#4F46E5] hover:bg-[#F8FAFC] hover:text-[#4338CA]",
        link: "text-[#4F46E5] underline-offset-4 hover:underline font-600",
        premium:
          "bg-gradient-to-r from-[#4F46E5] to-[#4338CA] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5",
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
