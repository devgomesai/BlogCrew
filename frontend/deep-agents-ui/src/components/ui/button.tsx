import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-bold uppercase tracking-wider transition-all duration-200 ease-out border-2 border-black disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive btn-press",
  {
    variants: {
      variant: {
        default:
          "bg-[#D02020] text-white border-black shadow-[4px_4px_0px_0px_#121212] hover:bg-[#D02020]/90",
        primary:
          "bg-[#D02020] text-white border-black shadow-[4px_4px_0px_0px_#121212] hover:bg-[#D02020]/90",
        secondary:
          "bg-[#1040C0] text-white border-black shadow-[4px_4px_0px_0px_#121212] hover:bg-[#1040C0]/90",
        yellow:
          "bg-[#F0C020] text-black border-black shadow-[4px_4px_0px_0px_#121212] hover:bg-[#F0C020]/90",
        outline:
          "bg-white text-black border-black shadow-[4px_4px_0px_0px_#121212] hover:bg-gray-100",
        ghost:
          "border-none text-black shadow-none hover:bg-gray-200 dark:text-white dark:hover:bg-white/10",
        destructive:
          "bg-[#D02020] text-white border-black shadow-[4px_4px_0px_0px_#121212] hover:bg-[#D02020]/80",
        link:
          "border-none text-[#D02020] underline-offset-4 hover:underline shadow-none",
      },
      size: {
        default: "h-10 px-5 py-2 has-[>svg]:px-3",
        sm: "h-8 px-3 py-1.5 text-xs gap-1.5 has-[>svg]:px-2.5",
        lg: "h-12 px-7 py-3 text-base has-[>svg]:px-5",
        icon: "h-10 w-10 p-0",
      },
      shape: {
        square: "rounded-none",
        pill: "rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      shape: "square",
    },
  }
);

function Button({
  className,
  variant,
  size,
  shape,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot : "button";

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, shape, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
