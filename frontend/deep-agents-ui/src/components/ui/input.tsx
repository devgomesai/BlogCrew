import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-10 w-full min-w-0 rounded-none border-2 border-black bg-white px-3 py-1 text-base shadow-[3px_3px_0px_0px_#121212] outline-none transition-all duration-200 ease-out selection:bg-[#F0C020] selection:text-black file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-gray-400 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#1a1a1a] dark:text-white dark:border-gray-500 dark:shadow-[3px_3px_0px_0px_#333] md:text-sm",
        "focus-visible:shadow-[4px_4px_0px_0px_#121212] focus-visible:translate-x-[-1px] focus-visible:translate-y-[-1px]",
        "aria-invalid:border-[#D02020] aria-invalid:shadow-[3px_3px_0px_0px_#D02020]",
        className
      )}
      {...props}
    />
  );
}

export { Input };
