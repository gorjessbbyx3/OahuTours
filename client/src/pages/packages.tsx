import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import type { Tour } from "@shared/schema";

export default function Packages() {
  const { data: tours, isLoading } = useQuery<Tour[]>({
    queryKey: ["/api/tours"],
  });

  const dayTours = tours?.filter(tour => tour.type === 'day') || [];
  const nightTours = tours?.filter(tour => tour.type === 'night') || [];

  if (isLoading) {
    return (
      <div className="pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Skeleton className="h-12 w-64 mx-auto mb-4" />
            <Skeleton className="h-6 w-96 mx-auto" />
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-6">
                  <Skeleton className="h-6 w-32 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-light text-foreground mb-6" data-testid="text-packages-title">
            Tour Packages
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto" data-testid="text-packages-subtitle">
            Choose from our carefully curated tour experiences, each designed to showcase the best of Oahu
          </p>
        </div>

        {/* Day Tours */}
        {dayTours.length > 0 && (
          <div className="mb-16">
            <h2 className="text-3xl font-semibold mb-8" data-testid="text-day-tours-title">Day Tours</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {dayTours.map((tour) => (
                <Card key={tour.id} className="overflow-hidden shadow-lg hover-scale" data-testid={`card-tour-${tour.id}`}>
                  <div className="relative h-48">
                    <img 
                      src={tour.imageUrl || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&h=600"} 
                      alt={tour.name} 
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-4 left-4 bg-primary" data-testid={`badge-duration-${tour.id}`}>
                      {tour.duration}h
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2" data-testid={`text-tour-name-${tour.id}`}>
                      {tour.name}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2" data-testid={`text-tour-description-${tour.id}`}>
                      {tour.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary" data-testid={`text-tour-price-${tour.id}`}>
                        ${tour.price}
                      </span>
                      <Link href="/booking" search={`tour=${tour.id}`}>
                        <Button className="hover:bg-primary/90" data-testid={`button-book-${tour.id}`}>
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Night Tours */}
        {nightTours.length > 0 && (
          <div>
            <h2 className="text-3xl font-semibold mb-8" data-testid="text-night-tours-title">Night Tours</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {nightTours.map((tour) => (
                <Card key={tour.id} className="overflow-hidden shadow-lg hover-scale" data-testid={`card-tour-${tour.id}`}>
                  <div className="relative h-48">
                    <img 
                      src={tour.imageUrl || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&h=600"} 
                      alt={tour.name} 
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-4 left-4 bg-accent" data-testid={`badge-duration-${tour.id}`}>
                      {tour.duration}h
                    </Badge>
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2" data-testid={`text-tour-name-${tour.id}`}>
                      {tour.name}
                    </h3>
                    <p className="text-muted-foreground mb-4 line-clamp-2" data-testid={`text-tour-description-${tour.id}`}>
                      {tour.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary" data-testid={`text-tour-price-${tour.id}`}>
                        ${tour.price}
                      </span>
                      <Link href="/booking" search={`tour=${tour.id}`}>
                        <Button className="hover:bg-primary/90" data-testid={`button-book-${tour.id}`}>
                          Book Now
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && tours?.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold mb-2" data-testid="text-no-tours">No tours available</h3>
            <p className="text-muted-foreground" data-testid="text-no-tours-description">
              Check back later for exciting tour packages!
            </p>
          </div>
        )}

        {/* Custom Tour CTA */}
        <div className="mt-20 text-center">
          <div className="bg-muted rounded-lg p-12">
            <h3 className="text-3xl font-semibold mb-4" data-testid="text-custom-cta-title">
              Want Something Different?
            </h3>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-custom-cta-description">
              Create your own personalized tour experience with our custom tour builder
            </p>
            <Link href="/custom-tour">
              <Button size="lg" data-testid="button-create-custom">
                Create Custom Tour
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
