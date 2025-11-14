import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div 
      className={cn("relative overflow-hidden rounded-md bg-muted", className)} 
      {...props}
    >
      {/* Shimmer overlay effect */}
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-background/60 to-transparent" />
    </div>
  );
}

export { Skeleton };
