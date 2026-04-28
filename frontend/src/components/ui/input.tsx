import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-lg border-2 border-[#E2E8F0] bg-white px-4 py-2.5 text-base font-400 text-[#1E293B] transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-500 file:text-[#1E293B] placeholder:text-[#94A3B8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4F46E5] focus-visible:ring-offset-0 focus-visible:border-transparent disabled:cursor-not-allowed disabled:bg-[#F8FAFC] disabled:opacity-60 md:text-base",
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
