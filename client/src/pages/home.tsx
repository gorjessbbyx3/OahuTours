import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { MapPin, Star, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-blue-900 to-teal-800">
        {/* Video background */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src="/hero-video.mp4"
          autoPlay
          loop
          muted
          playsInline
          onError={(e) => {
            console.log('Video failed to load, using gradient background');
            e.currentTarget.style.display = 'none';
          }}
          onLoadStart={() => console.log('Video loading started')}
          onCanPlay={() => console.log('Video can play')}
        />
        <div className="absolute inset-0 bg-black bg-opacity-40" />
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <h1 className="text-5xl md:text-7xl font-light mb-6 leading-tight" data-testid="text-hero-title">
            Discover<br/>
            <span className="font-semibold">Paradise</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 font-light max-w-2xl mx-auto" data-testid="text-hero-subtitle">
            Experience the breathtaking beauty of Oahu with our premium guided tours. 
            From sunrise adventures to sunset magic.
          </p>
          <Link href="/packages">
            <Button 
              size="lg" 
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-4 text-lg font-medium"
              data-testid="button-explore-tours"
            >
              Explore Tours
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-muted">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-foreground mb-4" data-testid="text-features-title">
              Why Choose Oahu Elite Tours
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto" data-testid="text-features-subtitle">
              Experience Oahu like never before with our expertly crafted tours and personalized service
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center p-8 hover-scale" data-testid="card-feature-guides">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <MapPin className="text-2xl text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-4" data-testid="text-feature-guides-title">Expert Guides</h3>
                <p className="text-muted-foreground" data-testid="text-feature-guides-description">
                  Local experts who know every hidden gem and secret spot on the island
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 hover-scale" data-testid="card-feature-premium">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Star className="text-2xl text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-4" data-testid="text-feature-premium-title">Premium Experience</h3>
                <p className="text-muted-foreground" data-testid="text-feature-premium-description">
                  Luxury vehicles, small groups, and personalized attention for every guest
                </p>
              </CardContent>
            </Card>
            
            <Card className="text-center p-8 hover-scale" data-testid="card-feature-flexible">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-6">
                  <Clock className="text-2xl text-primary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-4" data-testid="text-feature-flexible-title">Flexible Scheduling</h3>
                <p className="text-muted-foreground" data-testid="text-feature-flexible-description">
                  Custom itineraries and flexible timing to match your perfect vacation
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Quick Tour Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-foreground mb-4" data-testid="text-preview-title">
              Popular Experiences
            </h2>
            <p className="text-xl text-muted-foreground" data-testid="text-preview-subtitle">
              Get a taste of what awaits you
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="overflow-hidden hover-scale" data-testid="card-preview-diamond">
              <div className="relative h-48">
                <img 
                  src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&h=600" 
                  alt="Diamond Head Adventure" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2" data-testid="text-diamond-title">Diamond Head Adventure</h3>
                <p className="text-muted-foreground mb-4" data-testid="text-diamond-description">
                  Hike to the summit of Oahu's most iconic landmark
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary" data-testid="text-diamond-price">$89</span>
                  <Link href="/booking">
                    <Button data-testid="button-diamond-book">Book Now</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover-scale" data-testid="card-preview-snorkel">
              <div className="relative h-48">
                <img 
                  src="https://images.unsplash.com/photo-1546026423-cc4642628d2b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&h=600" 
                  alt="Hanauma Bay Snorkel" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2" data-testid="text-snorkel-title">Hanauma Bay Snorkel</h3>
                <p className="text-muted-foreground mb-4" data-testid="text-snorkel-description">
                  Discover vibrant marine life in pristine waters
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary" data-testid="text-snorkel-price">$129</span>
                  <Link href="/booking">
                    <Button data-testid="button-snorkel-book">Book Now</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="overflow-hidden hover-scale" data-testid="card-preview-sunset">
              <div className="relative h-48">
                <img 
                  src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1000&h=600" 
                  alt="Sunset Dinner Cruise" 
                  className="w-full h-full object-cover"
                />
              </div>
              <CardContent className="p-6">
                <h3 className="text-xl font-semibold mb-2" data-testid="text-sunset-title">Sunset Dinner Cruise</h3>
                <p className="text-muted-foreground mb-4" data-testid="text-sunset-description">
                  Elegant dining with stunning sunset views
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary" data-testid="text-sunset-price">$189</span>
                  <Link href="/booking">
                    <Button data-testid="button-sunset-book">Book Now</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="text-center mt-12">
            <Link href="/packages">
              <Button size="lg" variant="outline" data-testid="button-view-all-tours">
                View All Tours
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
