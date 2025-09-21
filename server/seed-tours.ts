import { storage } from "./storage";
import type { InsertTour } from "@shared/schema";

const oahuTours: InsertTour[] = [
  // Day Tours
  {
    name: "Diamond Head Sunrise Adventure",
    description: "Experience the iconic Diamond Head crater at sunrise. This moderate hike offers breathtaking panoramic views of Waikiki, Honolulu, and the Pacific Ocean. Perfect for photography enthusiasts and nature lovers.",
    type: "day",
    price: "89.00",
    duration: 4,
    maxGroupSize: 8,
    imageUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600",
    isActive: true,
  },
  {
    name: "Hanauma Bay Snorkeling Experience",
    description: "Discover the underwater paradise of Hanauma Bay Nature Preserve. Snorkel among tropical fish and vibrant coral reefs in this world-renowned marine sanctuary. Equipment and instruction included.",
    type: "day",
    price: "129.00",
    duration: 6,
    maxGroupSize: 10,
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600",
    isActive: true,
  },
  {
    name: "Circle Island Grand Tour",
    description: "Explore all of Oahu in one unforgettable day! Visit the North Shore's famous surf beaches, Polynesian Cultural Center area, scenic Windward Coast, and historic Pearl Harbor. Includes lunch and multiple photo stops.",
    type: "day",
    price: "179.00",
    duration: 8,
    maxGroupSize: 12,
    imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600",
    isActive: true,
  },
  {
    name: "Pearl Harbor & Historic Honolulu",
    description: "Pay respects at Pearl Harbor Memorial and explore historic downtown Honolulu. Visit the USS Arizona Memorial, Pearl Harbor Museum, Iolani Palace, and King Kamehameha Statue.",
    type: "day",
    price: "149.00",
    duration: 7,
    maxGroupSize: 15,
    imageUrl: "https://images.unsplash.com/photo-1551966775-a4ddc8df052b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600",
    isActive: true,
  },
  {
    name: "North Shore Adventure",
    description: "Experience the legendary North Shore beaches including Pipeline, Sunset Beach, and Waimea Bay. Stop at Giovanni's Shrimp Truck, visit Haleiwa town, and watch world-class surfers in action.",
    type: "day",
    price: "139.00",
    duration: 8,
    maxGroupSize: 8,
    imageUrl: "https://images.unsplash.com/photo-1582882112003-ca5900d8471e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600",
    isActive: true,
  },
  {
    name: "Koko Head Crater Hike",
    description: "Challenge yourself with this intense railway trail hike up Koko Head Crater. Reward yourself with stunning 360-degree views of Southeast Oahu. Includes post-hike refreshments.",
    type: "day",
    price: "99.00",
    duration: 5,
    maxGroupSize: 6,
    imageUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e421e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600",
    isActive: true,
  },
  {
    name: "Polynesian Cultural Center & Laie",
    description: "Immerse yourself in Polynesian culture at the world-famous Polynesian Cultural Center. Experience traditional villages, authentic performances, and learn about Pacific Island heritage.",
    type: "day",
    price: "199.00",
    duration: 8,
    maxGroupSize: 20,
    imageUrl: "https://images.unsplash.com/photo-1580500550469-26c0d0cd6d7e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600",
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
    imageUrl: "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600",
    isActive: true,
  },
  {
    name: "Night Luau Experience",
    description: "Authentic Hawaiian luau with traditional feast, cultural performances, fire dancing, and live music. Experience the true spirit of aloha under the stars at a beachfront location.",
    type: "night",
    price: "159.00",
    duration: 4,
    maxGroupSize: 50,
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&h=600",
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