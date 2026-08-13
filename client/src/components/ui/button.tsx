import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import * as React from "react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center font-semibold tracking-wide whitespace-nowrap transition-all outline-none select-none focus-visible:ring-3 focus-visible:ring-primary/40 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover border border-transparent",
        outline:
          "border-2 border-ink bg-transparent text-ink hover:bg-canvas-soft",
        secondary:
          "bg-canvas-soft text-ink hover:bg-[#d8dbd6] border border-transparent",
        ghost:
          "hover:bg-canvas-soft hover:text-ink text-body-text border border-transparent",
        destructive:
          "bg-negative text-white hover:bg-negative/90 border border-transparent",
        link: "text-ink underline-offset-4 hover:underline border border-transparent",
      },
      size: {
        default: "h-12 px-6 rounded-xl text-base", // 24px/rounded-xl border radius for buttons
        xs: "h-8 px-3 rounded-lg text-xs",
        sm: "h-10 px-4 rounded-xl text-sm",
        lg: "h-14 px-8 rounded-xl text-lg",
        icon: "size-12 rounded-full",
        "icon-xs": "size-8 rounded-full",
        "icon-sm": "size-10 rounded-full",
        "icon-lg": "size-14 rounded-full",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

type BaseButtonProps = React.ComponentPropsWithoutRef<"button">;

type ButtonProps = (ButtonPrimitive.Props | BaseButtonProps) & 
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: ButtonProps) {
  if (asChild) {
    return (
      <Slot
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...(props as React.ComponentPropsWithoutRef<"button">)}
      />
    );
  }

  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...(props as ButtonPrimitive.Props)}
    />
  );
}

export { Button, buttonVariants };
export type { ButtonProps };
