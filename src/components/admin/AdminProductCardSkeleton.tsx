import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const AdminProductCardSkeleton = () => {
  return (
    <Card className="overflow-hidden">
      {/* Image skeleton */}
      <Skeleton className="aspect-square w-full" />
      
      {/* Content skeleton */}
      <div className="p-4 space-y-3">
        {/* Name and badge row */}
        <div className="flex items-center gap-3 mb-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        
        {/* Details row */}
        <div className="flex gap-4">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>

      {/* Action section */}
      <div className="p-4 pt-0">
        <Skeleton className="h-10 w-full" />
      </div>
    </Card>
  );
};

export const AdminProductGridSkeleton = ({ count = 6 }: { count?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <AdminProductCardSkeleton key={index} />
      ))}
    </div>
  );
};
