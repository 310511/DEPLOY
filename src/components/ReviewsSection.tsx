import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Star } from "lucide-react";

interface Review {
  id: number;
  name: string;
  rating: number;
  comment: string;
  avatar: string;
  location: string;
}

const reviews: Review[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    rating: 5,
    comment:
      "Amazing experience! The hotel was luxurious and the service was exceptional. Will definitely book again.",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    location: "New York, USA",
  },
  {
    id: 2,
    name: "Ahmed Al-Rashid",
    rating: 5,
    comment:
      "Perfect location and wonderful staff. The amenities exceeded our expectations. Highly recommended!",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    location: "Riyadh, Saudi Arabia",
  },
  {
    id: 3,
    name: "Maria Garcia",
    rating: 4,
    comment:
      "Beautiful rooms with stunning views. The breakfast was delicious and the pool area was fantastic.",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
    location: "Barcelona, Spain",
  },
  {
    id: 4,
    name: "David Chen",
    rating: 5,
    comment:
      "Exceptional service and attention to detail. The concierge helped us with everything we needed.",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    location: "Tokyo, Japan",
  },
  {
    id: 5,
    name: "Emma Thompson",
    rating: 5,
    comment:
      "The most relaxing vacation ever! Beautiful spa facilities and amazing room service.",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
    location: "London, UK",
  },
  {
    id: 6,
    name: "Omar Hassan",
    rating: 4,
    comment:
      "Great value for money. Clean rooms, friendly staff, and excellent location near attractions.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face",
    location: "Dubai, UAE",
  },
];

const ReviewsSection = () => {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <section className="py-16 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            What Our Guests Say
          </h2>
          <p className="text-muted-foreground text-lg">
            Real experiences from travelers around the world
          </p>
        </div>

        <div className="relative">
          <div
            className={`flex gap-6 ${!isPaused ? "animate-scroll" : ""}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
          >
            {/* Duplicate reviews for seamless loop */}
            {[...reviews, ...reviews].map((review, index) => (
              <Card
                key={`${review.id}-${index}`}
                className="min-w-[400px] hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-card/50 backdrop-blur-sm border border-border/50 group"
                style={{
                  boxShadow:
                    "0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.05)",
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="relative">
                      <img
                        src={review.avatar}
                        alt={review.name}
                        className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all duration-300"
                      />
                      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold text-foreground">
                          {review.name}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "text-yellow-400 fill-current"
                                  : "text-muted-foreground/30"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-muted-foreground text-sm mb-3 line-clamp-3">
                        "{review.comment}"
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        {review.location}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Gradient overlays for fade effect */}
          <div className="absolute left-0 top-0 h-full w-20 bg-gradient-to-r from-background to-transparent pointer-events-none z-20"></div>
          <div className="absolute right-0 top-0 h-full w-20 bg-gradient-to-l from-background to-transparent pointer-events-none z-20"></div>
        </div>
      </div>
    </section>
  );
};

export default ReviewsSection;
