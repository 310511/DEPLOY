import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DestinationHero from "@/components/DestinationHero"; // Import the new component
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Users, Camera } from "lucide-react";

const Destinations = () => {
  const destinations = [
    {
      id: 1,
      name: "Riyadh",
      image:
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop",
      description: "The capital city with modern architecture and rich culture",
      properties: "500+ properties",
      highlights: [
        "King Abdulaziz Historical Center",
        "Diriyah",
        "Kingdom Centre",
      ],
    },
    {
      id: 2,
      name: "Jeddah",
      image:
        "https://tse3.mm.bing.net/th/id/OIP.koqoS6v2ls3pVIuqLyWZgAHaE8?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
      description: "Gateway to Mecca with beautiful Red Sea coastline",
      properties: "300+ properties",
      highlights: ["Historic Jeddah", "Corniche", "King Fahd Fountain"],
    },
    {
      id: 3,
      name: "Dubai",
      image:
        "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&h=600&fit=crop",
      description: "World-class luxury destination with iconic architecture",
      properties: "450+ properties",
      highlights: ["Burj Khalifa", "Dubai Mall", "Palm Jumeirah"],
    },
    {
      id: 4,
      name: "Abu Dhabi",
      image:
        "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=800&h=600&fit=crop",
      description: "UAE's capital with cultural landmarks and luxury resorts",
      properties: "280+ properties",
      highlights: ["Sheikh Zayed Mosque", "Louvre Abu Dhabi", "Yas Island"],
    },
    {
      id: 5,
      name: "Doha",
      image:
        "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=800&h=600&fit=crop",
      description: "Qatar's modern capital with stunning skyline and culture",
      properties: "200+ properties",
      highlights: ["Museum of Islamic Art", "Souq Waqif", "The Pearl"],
    },
    {
      id: 6,
      name: "Kuwait City",
      image:
        "https://tse4.mm.bing.net/th/id/OIP.8sYh-l-VuCsue09Mdck5sAHaEK?r=0&rs=1&pid=ImgDetMain&o=7&rm=3",
      description: "Historic trading hub with modern amenities",
      properties: "150+ properties",
      highlights: ["Kuwait Towers", "Grand Mosque", "Liberation Tower"],
    },
    {
      id: 7,
      name: "Mecca",
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
      description: "Islam's holiest city and pilgrimage destination",
      properties: "120+ properties",
      highlights: ["Masjid al-Haram", "Kaaba", "Abraj Al-Bait"],
    },
    {
      id: 8,
      name: "Medina",
      image:
        "https://travelsetu.com/apps/uploads/new_destinations_photos/destination/2024/07/02/2d6fa30789443a03920f8c4374cda018_1000x1000.jpg",
      description: "The Prophet's city with profound Islamic heritage",
      properties: "95+ properties",
      highlights: ["Al-Masjid an-Nabawi", "Quba Mosque", "Mount Uhud"],
    },
    {
      id: 9,
      name: "Dammam",
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
      description: "Eastern province hub with coastal attractions",
      properties: "180+ properties",
      highlights: ["King Fahd Park", "Coral Island", "Half Moon Bay"],
    },
    {
      id: 10,
      name: "Taif",
      image:
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
      description: "Mountain resort known for roses and cool climate",
      properties: "65+ properties",
      highlights: ["Shubra Palace", "Rose Garden", "Al Hada Mountain"],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main
        className="w-full px-6 lg:px-8 py-12 pt-header-plus-40"
        style={{
          paddingTop: "calc(var(--header-height-default) + 56px + 14px)",
        }}
      >
        <DestinationHero /> {/* Render the new hero component here */}
        <div></div>
        {/* Destinations Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {destinations.map((destination) => (
            <Link
              key={destination.id}
              to={`/destination/${destination.name.toLowerCase()}`}
            >
              <Card className="overflow-hidden shadow-intense-3d hover:shadow-intense-3d-hover transition-all duration-300 group cursor-pointer rounded-3xl hover:scale-[1.05] hover:-translate-y-2">
                <div className="aspect-[16/10] relative overflow-hidden">
                  <img
                    src={destination.image}
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <h3 className="text-2xl font-bold mb-1">
                      {destination.name}
                    </h3>
                    <div className="flex items-center space-x-1 text-sm">
                      <Users className="h-4 w-4" />
                      <span>{destination.properties}</span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-6">
                  <p className="text-muted-foreground mb-4">
                    {destination.description}
                  </p>
                  <div className="space-y-2">
                    <h4 className="font-semibold text-sm">
                      Popular Attractions:
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {destination.highlights.map((highlight, index) => (
                        <span
                          key={index}
                          className="text-xs bg-muted px-2 py-1 rounded-full"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full mt-4 rounded-full">
                    Explore Hotels
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        {/* CTA Section */}
        <div className="text-center bg-muted/50 rounded-2xl p-12">
          <Camera className="h-12 w-12 text-primary mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Can't Find Your Destination?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            We're constantly adding new destinations across Saudi Arabia. Let us
            know where you'd like to stay, and we'll help you find the perfect
            accommodation.
          </p>
          <Button size="lg">Request New Destination</Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Destinations;
