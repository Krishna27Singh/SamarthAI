import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border-2 border-[#E0F2FE] bg-white px-4 py-2.5 text-base font-normal text-[#1E293B] transition-all duration-300 file:border-0 file:bg-transparent file:text-sm file:font-semibold file:text-[#1E293B] placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563EB] focus-visible:ring-offset-0 focus-visible:border-[#2563EB] disabled:cursor-not-allowed disabled:bg-[#F0F8FF] disabled:opacity-60 md:text-base",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
