import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-hidden focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
        variant: {
          default:
            "border-transparent bg-primary text-primary-foreground shadow-sm",
          secondary:
            "border-transparent bg-secondary text-secondary-foreground",
          destructive:
            "border-transparent bg-destructive text-destructive-foreground shadow-sm",
          outline: "text-foreground",
          success:
            "border-transparent bg-emerald-500 text-white shadow-sm",
          admin:
            "border-transparent shadow-sm",
          user:
            "border-transparent shadow-sm",
        },
      },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, style, ...props }: BadgeProps & { style?: React.CSSProperties }) {
  const variantStyles: React.CSSProperties =
    variant === "admin"
      ? { backgroundColor: "#1B3A6B", color: "#F5E6C8" }
      : variant === "user"
      ? { backgroundColor: "#F5E6C8", color: "#1B3A6B", border: "1px solid #E8D0A0" }
      : {};

  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      style={{ ...variantStyles, ...style }}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
