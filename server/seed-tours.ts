import { storage } from "./storage";
import type { InsertTour } from "@shared/schema";

const oahuTours: InsertTour[] = [
  // Day Tours
  {
    name: "Diamond Head Sunrise Hike",
    description: "Experience the breathtaking sunrise from atop Diamond Head crater. This iconic hike offers panoramic views of Waikiki Beach, Honolulu, and the Pacific Ocean. Perfect for early risers and photography enthusiasts.",
    type: "day",
    price: "89.00",
    duration: 4,
    maxGroupSize: 8,
    imageUrl: "https://images.unsplash.com/photo-1608555843308-de045b6d5e3c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600",
    isActive: true,
  },
  {
    name: "North Shore Circle Island Tour",
    description: "Discover the legendary North Shore beaches including Pipeline, Sunset Beach, and Waimea Bay. Visit charming Haleiwa town, see sea turtles at Laniakea Beach, and witness world-class surfing.",
    type: "day",
    price: "149.00",
    duration: 8,
    maxGroupSize: 12,
    imageUrl: "https://images.unsplash.com/photo-1538681105587-85640961bf8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600",
    isActive: true,
  },
  {
    name: "Hanauma Bay Snorkeling Adventure",
    description: "Explore Hawaii's premier snorkeling destination. Swim among tropical fish in the crystal-clear waters of this protected marine life conservation area. Equipment and transportation included.",
    type: "day",
    price: "129.00",
    duration: 5,
    maxGroupSize: 10,
    imageUrl: "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600",
    isActive: true,
  },
  {
    name: "Pearl Harbor Historic Tour",
    description: "Visit the USS Arizona Memorial and learn about the events of December 7, 1941. This moving experience includes museum visits, documentary viewing, and boat transport to the memorial.",
    type: "day",
    price: "79.00",
    duration: 6,
    maxGroupSize: 15,
    imageUrl: "https://images.unsplash.com/photo-1611273426858-450d8e3c9fce?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600",
    isActive: true,
  },
  {
    name: "Koko Head Crater Challenge",
    description: "Take on the ultimate hiking challenge! Climb the 1,048 railroad tie steps to the summit of Koko Head crater for spectacular 360-degree views. For experienced hikers only.",
    type: "day",
    price: "99.00",
    duration: 4,
    maxGroupSize: 6,
    imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600",
    isActive: true,
  },
  {
    name: "Polynesian Cultural Center Experience",
    description: "Immerse yourself in the cultures of Polynesia. Enjoy authentic island villages, traditional performances, hands-on activities, and a spectacular evening show featuring fire dancing.",
    type: "day",
    price: "159.00",
    duration: 8,
    maxGroupSize: 20,
    imageUrl: "https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600",
    isActive: true,
  },
  {
    name: "Manoa Falls & Rainforest Hike",
    description: "Trek through lush tropical rainforest to the spectacular 150-foot Manoa Falls. This easy-moderate hike offers incredible flora, fauna, and the chance to swim in natural pools.",
    type: "day",
    price: "79.00",
    duration: 4,
    maxGroupSize: 10,
    imageUrl: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600",
    isActive: true,
  },


  // Night Tours
  {
    name: "Sunset Dinner Cruise",
    description: "Sail into the sunset aboard our luxury catamaran. Enjoy a gourmet dinner, open bar, live Hawaiian music, and breathtaking views of the Waikiki coastline as the sun sets over the Pacific.",
    type: "night",
    price: "189.00",
    duration: 3,
    maxGroupSize: 40,
    imageUrl: "https://images.unsplash.com/photo-1520454974749-611b7248ffdb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600",
    isActive: true,
  },
  {
    name: "Waikiki Night Photography Tour",
    description: "Capture the magic of Waikiki after dark. Learn night photography techniques while exploring illuminated landmarks, beachfront hotels, and the vibrant nightlife scene.",
    type: "night",
    price: "119.00",
    duration: 3,
    maxGroupSize: 6,
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600",
    isActive: true,
  },
  {
    name: "Stargazing at Makapuu Lighthouse",
    description: "Experience the night sky like never before at Makapuu Lighthouse. Use professional telescopes to observe stars, planets, and constellations while learning about Hawaiian navigation traditions.",
    type: "night",
    price: "99.00",
    duration: 3,
    maxGroupSize: 8,
    imageUrl: "https://images.unsplash.com/photo-1502134249126-9f3755a50d78?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600",
    isActive: true,
  },
  {
    name: "Night Luau Experience",
    description: "Authentic Hawaiian luau with traditional feast, cultural performances, fire dancing, and live music. Experience the true spirit of aloha under the stars at a beachfront location.",
    type: "night",
    price: "159.00",
    duration: 4,
    maxGroupSize: 50,
    imageUrl: "https://images.unsplash.com/photo-1551218808-94e220e084d2?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600",
    isActive: true,
  },
  {
    name: "Chinatown Food & Night Market Tour",
    description: "Explore Honolulu's vibrant Chinatown district after dark. Sample authentic Asian cuisine, visit night markets, and discover hidden bars and local hangouts with our expert guide.",
    type: "night",
    price: "89.00",
    duration: 3,
    maxGroupSize: 12,
    imageUrl: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600",
    isActive: true,
  },
];

export async function seedTours() {
  console.log("Seeding tours...");

  try {
    for (const tour of oahuTours) {
      await storage.createTour(tour);
      console.log(`Created tour: ${tour.name}`);
    }
    console.log("Tours seeded successfully!");
  } catch (error) {
    console.error("Error seeding tours:", error);
  }
}

// Export the seed function for manual execution
// To run: node -e "import('./seed-tours.js').then(m => m.seedTours())"