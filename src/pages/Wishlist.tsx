import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { getWishlist, WishlistItem, removeFromWishlist } from "@/services/wishlistApi";
import { getHotelDetails } from "@/services/hotelApi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Heart,
  MapPin,
  Star,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useNavigate } from "react-router-dom";

interface EnrichedWishlistItem extends WishlistItem {
  hotelDetails?: any;
  isLoadingDetails?: boolean;
}

const Wishlist = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  // Wishlist state
  const [wishlist, setWishlist] = useState<EnrichedWishlistItem[]>([]);
  const [isLoadingWishlist, setIsLoadingWishlist] = useState(false);
  const [wishlistError, setWishlistError] = useState<string | null>(null);

  // Fetch wishlist
  const fetchWishlist = async () => {
    if (!user || !user.customer_id) return;
    
    setIsLoadingWishlist(true);
    setWishlistError(null);
    
    try {
      console.log('💖 Fetching wishlist for customer:', user.customer_id);
      const response = await getWishlist(user.customer_id);
      
      if (response.success && response.data) {
        const enrichedWishlist: EnrichedWishlistItem[] = response.data.map(item => ({
          ...item,
          isLoadingDetails: true
        }));
        setWishlist(enrichedWishlist);
        console.log('✅ Fetched', response.data.length, 'wishlist items');
        
        // Fetch hotel details for each item
        enrichedWishlist.forEach(async (item, index) => {
          const hotelCode = item.hotel_code || item['Hotel Code'];
          if (hotelCode) {
            try {
              const hotelDetails = await getHotelDetails(hotelCode);
              setWishlist(prev => {
                const updated = [...prev];
                updated[index] = {
                  ...updated[index],
                  hotelDetails,
                  isLoadingDetails: false
                };
                return updated;
              });
            } catch (error) {
              console.error(`Failed to fetch details for hotel ${hotelCode}:`, error);
              setWishlist(prev => {
                const updated = [...prev];
                updated[index] = {
                  ...updated[index],
                  isLoadingDetails: false
                };
                return updated;
              });
            }
          }
        });
      } else {
        setWishlist([]);
      }
    } catch (error) {
      console.error('❌ Error fetching wishlist:', error);
      setWishlistError('Failed to load wishlist. Please try again.');
      setWishlist([]);
    } finally {
      setIsLoadingWishlist(false);
    }
  };

  // Fetch wishlist on component mount
  useEffect(() => {
    if (isAuthenticated && user && user.customer_id) {
      console.log('🔍 Wishlist page loaded - User authenticated, fetching wishlist...');
      console.log('👤 User customer_id:', user.customer_id);
      fetchWishlist();
    } else {
      console.log('⚠️ Waiting for user authentication...');
    }
  }, [isAuthenticated, user]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main
        className="w-full py-8 px-6 pt-header-plus-15 max-w-7xl mx-auto"
        style={{
          paddingTop: "calc(var(--header-height-default) + 31px + 14px)",
        }}
      >
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <Heart className="h-8 w-8 text-red-500 fill-red-500" />
          Your Wishlist
        </h1>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                Saved Hotels
              </CardTitle>
              <Button 
                onClick={fetchWishlist} 
                disabled={isLoadingWishlist}
                size="sm"
                variant="outline"
              >
                {isLoadingWishlist ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  'Refresh'
                )}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Loading State */}
            {isLoadingWishlist && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Loading wishlist...</p>
                </div>
              </div>
            )}

            {/* Error State */}
            {wishlistError && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg mb-4">
                <p className="text-sm">{wishlistError}</p>
              </div>
            )}

            {/* Empty State */}
            {!isLoadingWishlist && !wishlistError && wishlist.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                <Heart className="h-16 w-16 text-muted-foreground mb-4" />
                <div>
                  <h3 className="text-lg font-semibold mb-2">No hotels in wishlist</h3>
                  <p className="text-muted-foreground text-sm mb-4">
                    Start adding hotels to your wishlist by clicking the heart icon on hotel details pages
                  </p>
                </div>
                <Button onClick={() => navigate('/search')} variant="outline">
                  Browse Hotels
                </Button>
              </div>
            )}

            {/* Wishlist Grid */}
            {!isLoadingWishlist && !wishlistError && wishlist.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {wishlist.map((item) => {
                  // Get hotel code - support both formats
                  const hotelCode = item.hotel_code || item['Hotel Code'] || '';
                  const wishlistId = item.wishlist_id || item['Wishlist ID'] || '';
                  
                  // Use fetched hotel details if available, otherwise use stored data
                  const details = item.hotelDetails;
                  const hotelName = details?.HotelName || item.hotel_name || item['Hotel Name'] || 'Hotel Details Not Available';
                  const hotelRating = details?.HotelRating || item.hotel_rating || item['Hotel Rating'] || 0;
                  const address = details?.Address || item.address || item['Address'] || '';
                  const city = details?.CityName || item.city || item['City'] || '';
                  const country = details?.CountryName || item.country || item['Country'] || '';
                  const price = details?.Price || item.price || item['Price'] || 0;
                  const currency = details?.Currency || item.currency || item['Currency'] || 'USD';
                  const imageUrl = details?.FrontImage || details?.Images?.[0] || item.image_url || item['Image URL'] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop';
                  const searchParamsStr = item.search_params || item['Search Params'] || '';
                  
                  // Parse stored search parameters or use defaults
                  let searchParams;
                  try {
                    const storedParams = searchParamsStr ? JSON.parse(searchParamsStr) : null;
                    
                    if (storedParams && storedParams.checkIn) {
                      // Use stored search parameters
                      searchParams = new URLSearchParams(storedParams);
                    } else {
                      // Fallback to default parameters
                      const today = new Date();
                      const tomorrow = new Date(today);
                      tomorrow.setDate(tomorrow.getDate() + 1);
                      
                      const formatDate = (date: Date) => {
                        const year = date.getFullYear();
                        const month = String(date.getMonth() + 1).padStart(2, '0');
                        const day = String(date.getDate()).padStart(2, '0');
                        return `${year}-${month}-${day}`;
                      };
                      
                      searchParams = new URLSearchParams({
                        checkIn: formatDate(today),
                        checkOut: formatDate(tomorrow),
                        guests: '2',
                        adults: '2',
                        children: '0',
                        rooms: '1',
                        roomGuests: JSON.stringify([{ adults: 2, children: 0, childrenAges: [] }])
                      });
                    }
                  } catch (error) {
                    console.error('Error parsing search params:', error);
                    // Fallback to default
                    searchParams = new URLSearchParams({
                      checkIn: new Date().toISOString().split('T')[0],
                      checkOut: new Date(Date.now() + 86400000).toISOString().split('T')[0],
                      guests: '2',
                      adults: '2',
                      children: '0',
                      rooms: '1',
                      roomGuests: JSON.stringify([{ adults: 2, children: 0, childrenAges: [] }])
                    });
                  }
                  
                  return (
                  <div
                    key={wishlistId}
                    className="group relative border rounded-lg overflow-hidden hover:shadow-lg transition-all cursor-pointer"
                    onClick={() => navigate(`/hotel/${hotelCode}?${searchParams.toString()}`)}
                  >
                    {/* Hotel Image */}
                    <div className="aspect-[4/3] relative overflow-hidden">
                      <img
                        src={imageUrl}
                        alt={hotelName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="bg-white/90 hover:bg-white"
                          onClick={async (e) => {
                            e.stopPropagation();
                            if (!user || !user.customer_id) return;
                            
                            try {
                              await removeFromWishlist(user.customer_id, hotelCode);
                              // Refresh wishlist after removal
                              fetchWishlist();
                            } catch (error) {
                              console.error('Error removing from wishlist:', error);
                            }
                          }}
                        >
                          <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                        </Button>
                      </div>
                    </div>

                    {/* Hotel Info */}
                    <div className="p-4">
                      <h4 className="font-semibold text-base mb-1 line-clamp-1">
                        {hotelName}
                      </h4>
                      
                      <div className="flex items-center gap-2 mb-2">
                        {hotelRating > 0 && (
                          <div className="flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-medium">{hotelRating}</span>
                          </div>
                        )}
                      </div>

                      {(address || city || country) && (
                        <div className="flex items-start gap-1 mb-3">
                          <MapPin className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <p className="text-xs text-muted-foreground line-clamp-2">
                            {[address, city, country].filter(Boolean).join(', ')}
                          </p>
                        </div>
                      )}

                      {price > 0 && (
                        <div className="flex items-center justify-between pt-3 border-t">
                          <div>
                            <p className="text-xs text-muted-foreground">From</p>
                            <p className="text-lg font-bold text-primary">
                              {currency} {price}
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            View Details
                          </Button>
                        </div>
                      )}
                      
                      {!hotelName || hotelName === 'Hotel Details Not Available' && (
                        <div className="pt-3 border-t">
                          <Button size="sm" variant="outline" className="w-full">
                            View Details
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Wishlist;
