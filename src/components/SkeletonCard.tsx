import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const SkeletonCard = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="h-16 bg-card border-b">
        <div className="container mx-auto px-6 h-full flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
          <div className="hidden md:flex gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-20" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
      </div>

      {/* Hero Section Skeleton */}
      <section className="relative h-screen w-full overflow-hidden bg-secondary/30">
        <div className="absolute inset-0 bg-black bg-opacity-70"></div>
        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 sm:px-6 text-center">
          <Skeleton className="h-16 w-96 mb-6 bg-gold/20" />
          <Skeleton className="h-8 w-3/4 max-w-2xl mb-4" />
          <Skeleton className="h-6 w-2/3 max-w-xl mb-8" />
          <Skeleton className="h-14 w-48 rounded-xl" />
        </div>
      </section>

      {/* About Section Skeleton */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="p-6 sm:p-8">
                <CardContent className="space-y-4">
                  <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                  <Skeleton className="h-6 w-32 mx-auto" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4 mx-auto" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section Skeleton */}
      <section className="py-16 sm:py-20 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <Skeleton className="h-10 w-48 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Projects Section Skeleton */}
      <section className="py-16 sm:py-20 px-4 sm:px-6 bg-secondary/30">
        <div className="container mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <Skeleton className="h-10 w-56 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6 space-y-3">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Skeleton */}
      <div className="h-32 bg-card border-t">
        <div className="container mx-auto px-6 h-full flex items-center justify-center">
          <Skeleton className="h-4 w-48" />
        </div>
      </div>
    </div>
  );
};

