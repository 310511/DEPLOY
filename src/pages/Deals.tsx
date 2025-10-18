import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Star, MapPin, Tag, TrendingDown } from "lucide-react";

const Deals = () => {
  const deals = [
    {
      id: 1,
      title: "Weekend Getaway Special",
      originalPrice: 450,
      salePrice: 320,
      discount: 29,
      hotel: "Riyadh Palace Hotel",
      location: "Riyadh",
      rating: 4.5,
      reviews: 234,
      image:
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
      validUntil: "Dec 31, 2024",
      features: ["Free Breakfast", "Pool Access", "WiFi"],
    },
    {
      id: 2,
      title: "Early Bird Booking",
      originalPrice: 380,
      salePrice: 285,
      discount: 25,
      hotel: "Jeddah Corniche Resort",
      location: "Jeddah",
      rating: 4.7,
      reviews: 189,
      image:
        "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop",
      validUntil: "Dec 25, 2024",
      features: ["Sea View", "Spa Access", "Restaurant"],
    },
    {
      id: 3,
      title: "Family Package Deal",
      originalPrice: 520,
      salePrice: 399,
      discount: 23,
      hotel: "Al Khobar Beach Hotel",
      location: "Al Khobar",
      rating: 4.3,
      reviews: 156,
      image:
        "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop",
      validUntil: "Jan 15, 2025",
      features: ["Kids Club", "Family Rooms", "Pool"],
    },
    {
      id: 4,
      title: "Business Traveler Special",
      originalPrice: 340,
      salePrice: 275,
      discount: 19,
      hotel: "Executive Tower Hotel",
      location: "Riyadh",
      rating: 4.6,
      reviews: 298,
      image:
        "https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop",
      validUntil: "Dec 20, 2024",
      features: ["Business Center", "Meeting Rooms", "Airport Shuttle"],
    },
  ];

  const flashDeals = [
    {
      id: 1,
      title: "Flash Sale - 48 Hours Only!",
      discount: 40,
      hotel: "Luxury Resort Abha",
      originalPrice: 600,
      salePrice: 360,
      timeLeft: "23:45:12",
    },
    {
      id: 2,
      title: "Limited Time Offer",
      discount: 35,
      hotel: "Desert Oasis Hotel",
      originalPrice: 420,
      salePrice: 273,
      timeLeft: "15:23:45",
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
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Tag className="h-8 w-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-foreground">
              Exclusive Deals & Offers
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Save more on your next stay with our special promotions and
            limited-time offers
          </p>
        </div>

        {/* Premium Deals Section */}
        <section className="mb-16">
          <div className="flex items-center space-x-2 mb-8">
            <Star className="h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">
              Premium Collection
            </h2>
            <Badge variant="secondary" className="bg-primary/10 text-primary">
              Luxury
            </Badge>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {deals.slice(0, 3).map((deal) => (
              <Card
                key={deal.id}
                className="group overflow-hidden shadow-intense-3d hover:shadow-intense-3d-hover transition-all duration-300 cursor-pointer rounded-2xl border-0 bg-gradient-to-br from-white to-muted/30 hover:scale-[1.05] hover:-translate-y-2"
                onClick={() => (window.location.href = `/hotel/${deal.id}`)}
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={deal.image}
                    alt={deal.hotel}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-4 left-4 flex space-x-2">
                    <Badge className="bg-white/90 text-primary border-0 font-semibold backdrop-blur-sm">
                      {deal.discount}% OFF
                    </Badge>
                    <Badge
                      variant="secondary"
                      className="bg-black/70 text-white border-0 backdrop-blur-sm"
                    >
                      Premium
                    </Badge>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                      <span className="font-medium">{deal.rating}</span>
                    </div>
                    <span className="text-muted-foreground">•</span>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="text-muted-foreground">
                        {deal.location}
                      </span>
                    </div>
                  </div>

                  <h3 className="font-bold text-xl mb-2 text-foreground group-hover:text-primary transition-colors">
                    {deal.hotel}
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    {deal.title}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {deal.features.slice(0, 2).map((feature, index) => (
                      <span
                        key={index}
                        className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full font-medium"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-muted-foreground line-through text-lg">
                      ${deal.originalPrice}
                    </span>
                    <span className="text-3xl font-bold text-foreground">
                      ${deal.salePrice}
                    </span>
                    <span className="text-muted-foreground">per night</span>
                  </div>

                  <Button className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-3 rounded-xl group-hover:shadow-lg transition-all">
                    Book Premium Stay
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Regular Deals */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6">
            Best Deals Available
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {deals.map((deal) => (
              <Card
                key={deal.id}
                className="overflow-hidden shadow-intense-3d hover:shadow-intense-3d-hover transition-all duration-300 group cursor-pointer rounded-2xl hover:scale-[1.05] hover:-translate-y-2"
                onClick={() => (window.location.href = `/hotel/${deal.id}`)}
              >
                <div className="aspect-[16/10] relative overflow-hidden">
                  <img
                    src={deal.image}
                    alt={deal.hotel}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                    {deal.discount}% OFF
                  </Badge>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg">{deal.title}</h3>
                  </div>
                  <p className="text-foreground font-medium mb-1">
                    {deal.hotel}
                  </p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mb-4">
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 fill-black text-black" />
                      <span>{deal.rating}</span>
                      <span>({deal.reviews} reviews)</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-4 w-4" />
                      <span>{deal.location}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {deal.features.map((feature, index) => (
                      <span
                        key={index}
                        className="text-xs bg-muted px-2 py-1 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-muted-foreground line-through">
                      ${deal.originalPrice}
                    </span>
                    <span className="text-2xl font-bold text-primary">
                      ${deal.salePrice}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      per night
                    </span>
                  </div>

                  <div className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
                    <Clock className="h-4 w-4" />
                    <span>Valid until {deal.validUntil}</span>
                  </div>

                  <Button
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.location.href = `/hotel/${deal.id}`;
                    }}
                  >
                    Book This Deal
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="mt-16 bg-primary/10 rounded-2xl p-12 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Never Miss a Deal
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter and be the first to know about exclusive
            offers, flash sales, and special promotions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg border border-input bg-background"
            />
            <Button>Subscribe</Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Deals;
