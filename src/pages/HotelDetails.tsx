import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import FakeMapView from "@/components/FakeMapView";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  Star,
  Heart,
  Share,
  MapPin,
  Wifi,
  Car,
  Coffee,
  Users,
  Calendar,
  ArrowLeft,
  Waves,
  Dumbbell,
  UtensilsCrossed,
  Shield,
  AirVent,
  Tv,
  Bath,
  Bed,
  Shirt,
} from "lucide-react";
import Loader from "@/components/ui/Loader";
import HotelRoomDetails from "@/components/HotelRoomDetails";
import { prebookHotel } from "@/services/bookingapi";
import { searchHotels, getHotelDetails } from "@/services/hotelApi";
import { APP_CONFIG, getCurrentDate, getDateFromNow } from "@/config/constants";
import { storeHotelAndRoom } from "@/services/hotelStorageApi";

const HotelDetails = () => {
  const { id } = useParams();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [urlSearchParams] = useSearchParams();
  
  // Extract search parameters (will be redefined below)
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [hotelDetails, setHotelDetails] = useState<any>(null);
  const [loading, setIsLoading] = useState(false);
  const [showRoomDetails, setShowRoomDetails] = useState(false);
  const [selectedBookingCode, setSelectedBookingCode] = useState<string | null>(null);
  const [prebookLoading, setPrebookLoading] = useState(false);
  const [bookingCode, setBookingCode] = useState<string | null>(null);
  const [searchingForBookingCode, setSearchingForBookingCode] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<any>(null);
  const [showAllAmenities, setShowAllAmenities] = useState(false);
  // console.log(HotelDetails , " details")
  console.log(id ,'id')
  
  // Extract search parameters at component level
  const checkIn = urlSearchParams.get("checkIn");
  const checkOut = urlSearchParams.get("checkOut");
  const guests = urlSearchParams.get("guests");
  const adults = parseInt(urlSearchParams.get("adults") || "2");
  const children = parseInt(urlSearchParams.get("children") || "0");
  const rooms = urlSearchParams.get("rooms");
  const childrenAgesParam = urlSearchParams.get("childrenAges");
  const roomGuestsParam = urlSearchParams.get("roomGuests");
  
  // Parse children ages
  const childrenAges = childrenAgesParam 
    ? childrenAgesParam.split(",").map(age => parseInt(age))
    : [];
  
  // Parse room guests distribution
  const roomGuests = roomGuestsParam
    ? JSON.parse(roomGuestsParam)
    : [];

  // Handle ESC key to close modals
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (showRoomDetails) {
        handleCloseRoomDetails();
        }
      }
    };

    if (showRoomDetails) {
      document.addEventListener('keydown', handleEscKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [showRoomDetails]);

   const fetchHotelDetails = async (hotelCode: string) => {
    setIsLoading(true);
    try {
      const response = await getHotelDetails(hotelCode);
      setHotelDetails(response.HotelDetails);
    } catch (error) {
      console.error("Error fetching hotel details:", error);
    } finally {
      setIsLoading(false);
    }
  };



  // const fetchHotelDetails = async (hotelCode: string) => {
  //   setIsLoading(true);
  //   try {
  //     const response = await getHotelDetails(hotelCode);
  //     setHotelDetails(response.HotelDetails);
  //   } catch (error) {
  //     console.error("Error fetching hotel details:", error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const fetchBookingCode = async () => {
    console.log('🔍 fetchBookingCode called with id:', id);
    console.log('🔍 Current state - searchingForBookingCode:', searchingForBookingCode);
    
    if (!id) {
      console.log('❌ No id provided');
      return;
    }
    
    // Prevent multiple simultaneous calls
    if (searchingForBookingCode) {
      console.log('⏳ Already searching for booking code, skipping...');
      return;
    }
    
    setSearchingForBookingCode(true);
    console.log('🚀 Starting booking code fetch...');
    try {
      // Parse ISO dates to YYYY-MM-DD format
      console.log('📅 Raw checkIn:', checkIn);
      console.log('📅 Raw checkOut:', checkOut);
      console.log('👥 Raw guests:', guests);
      console.log('🏠 Raw rooms:', rooms);
      
      let parsedCheckIn = checkIn;
      let parsedCheckOut = checkOut;
      
      if (checkIn && checkIn.includes('T')) {
        try {
          parsedCheckIn = new Date(checkIn).toISOString().split('T')[0];
          console.log('📅 Parsed checkIn:', parsedCheckIn);
        } catch (error) {
          console.error('Error parsing checkIn date:', checkIn, error);
        }
      }
      
      if (checkOut && checkOut.includes('T')) {
        try {
          parsedCheckOut = new Date(checkOut).toISOString().split('T')[0];
          console.log('📅 Parsed checkOut:', parsedCheckOut);
        } catch (error) {
          console.error('Error parsing checkOut date:', checkOut, error);
        }
      }
      
        if (checkIn && checkOut && guests) {
        console.log('✅ All required parameters available, proceeding with search...');
        // Use rooms parameter if available, otherwise default to 1
        const roomsCount = rooms ? parseInt(rooms) : 1;
        
        console.log('🏠 roomsCount:', roomsCount);
        console.log('👥 adults:', adults);
        console.log('👶 children:', children);
        console.log('📋 roomGuests:', roomGuests);
        console.log('📋 roomGuests length:', roomGuests?.length);
        console.log('📋 roomGuests content:', JSON.stringify(roomGuests, null, 2));
        console.log('🔍 URL params - adults:', urlSearchParams.get("adults"));
        console.log('🔍 URL params - children:', urlSearchParams.get("children"));
        console.log('🔍 URL params - rooms:', urlSearchParams.get("rooms"));
        console.log('🔍 URL params - roomGuests:', urlSearchParams.get("roomGuests"));
        
        // Validate that parsing was successful
        if (isNaN(roomsCount)) {
          console.log('❌ Invalid room count');
          setBookingCode(null);
          return;
        }
        
        // Build PaxRooms structure based on room guest distribution or defaults
        let paxRooms;
        
        // Check if roomGuests has meaningful data (not just default 1 adult per room)
        const hasDetailedRoomGuests = roomGuests && roomGuests.length > 0 && 
          roomGuests.some((room: any) => room.adults > 1 || room.children > 0);
        
        if (hasDetailedRoomGuests) {
          // Use the detailed room guest distribution from search bar
          paxRooms = roomGuests.map((room: any) => ({
            Adults: room.adults || 1,
            Children: room.children || 0,
            ChildrenAges: room.childrenAges || [],
          }));
          console.log('✅ Using detailed room guest distribution:', paxRooms);
        } else {
          // Fallback: distribute guests across rooms
          const adultsPerRoom = Math.floor(adults / roomsCount);
          const childrenPerRoom = Math.floor(children / roomsCount);
          
          paxRooms = Array.from({ length: roomsCount }, (_, index) => {
            const isLastRoom = index === roomsCount - 1;
            const roomAdults = isLastRoom ? adults - (adultsPerRoom * (roomsCount - 1)) : adultsPerRoom;
            const roomChildren = isLastRoom ? children - (childrenPerRoom * (roomsCount - 1)) : childrenPerRoom;
            
            // Distribute children ages across rooms
            const startIdx = index * childrenPerRoom;
            const endIdx = isLastRoom ? childrenAges.length : startIdx + childrenPerRoom;
            const roomChildrenAges = childrenAges.slice(startIdx, endIdx);
            
            return {
              Adults: Math.max(1, roomAdults), // At least 1 adult per room
              Children: roomChildren,
              ChildrenAges: roomChildrenAges,
            };
          });
          console.log('✅ Using distributed guests across rooms:', paxRooms);
        }
        
        const apiSearchParams = {
          CheckIn: parsedCheckIn,
          CheckOut: parsedCheckOut,
          HotelCodes: id,
          GuestNationality: APP_CONFIG.DEFAULT_GUEST_NATIONALITY,
          PreferredCurrencyCode: APP_CONFIG.DEFAULT_CURRENCY,
          PaxRooms: paxRooms,
          IsDetailResponse: true,
          ResponseTime: APP_CONFIG.DEFAULT_RESPONSE_TIME
        };
        
        // Try to get booking code from hotel details first (faster)
        console.log('🚀 Trying to get booking code from hotel details...');
        try {
          const hotelDetailsResponse = await getHotelDetails(id);
          if (hotelDetailsResponse?.Rooms?.BookingCode) {
            console.log('✅ Found booking code from hotel details:', hotelDetailsResponse.Rooms.BookingCode);
            setBookingCode(hotelDetailsResponse.Rooms.BookingCode);
            return;
          }
        } catch (error) {
          console.log('⚠️ Hotel details approach failed, trying search API...');
        }
        
        // Fallback to search API with timeout
        console.log('🔍 Calling search API with params:', apiSearchParams);
        const searchResponse = await Promise.race([
          searchHotels(apiSearchParams),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Search request timeout after 30 seconds')), 30000)
          )
        ]);
        
        if (searchResponse?.HotelResult) {
          const hotel = searchResponse.HotelResult;
          
          // Handle both array and object structures
          if (Array.isArray(hotel)) {
            const foundHotel = hotel.find(h => h.HotelCode === id);
            
            if (foundHotel?.Rooms) {
              if (Array.isArray(foundHotel.Rooms) && foundHotel.Rooms.length > 0) {
                const foundBookingCode = foundHotel.Rooms[0].BookingCode;
                setBookingCode(foundBookingCode);
                return;
              } else if (foundHotel.Rooms.BookingCode) {
                // Handle object structure where Rooms is an object
                const foundBookingCode = foundHotel.Rooms.BookingCode;
                setBookingCode(foundBookingCode);
                return;
              }
            }
          } else if (hotel.HotelCode && hotel.Rooms && hotel.Rooms.BookingCode) {
            // Handle object structure where Rooms is an object
            if (hotel.HotelCode === id || hotel.HotelCode === String(id)) {
              const foundBookingCode = hotel.Rooms.BookingCode;
              setBookingCode(foundBookingCode);
              return;
            }
          }
        }
      }
      
      // If no search parameters available, try with default values
      if (!checkIn || !checkOut || !guests) {
        const defaultSearchParams = {
          CheckIn: getCurrentDate(),
          CheckOut: getDateFromNow(1),
          HotelCodes: id,
          GuestNationality: APP_CONFIG.DEFAULT_GUEST_NATIONALITY,
          PreferredCurrencyCode: APP_CONFIG.DEFAULT_CURRENCY,
          PaxRooms: [{ 
            Adults: APP_CONFIG.DEFAULT_GUESTS, 
            Children: APP_CONFIG.DEFAULT_CHILDREN, 
            ChildrenAges: [] 
          }],
          IsDetailResponse: true,
          ResponseTime: APP_CONFIG.DEFAULT_RESPONSE_TIME
        };
        
        // Add timeout to prevent hanging requests (increased to 30 seconds)
        const defaultSearchResponse = await Promise.race([
          searchHotels(defaultSearchParams),
          new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Default search request timeout after 30 seconds')), 30000)
          )
        ]);
        
        if (defaultSearchResponse?.HotelResult) {
          const hotel = defaultSearchResponse.HotelResult;
          
          if (Array.isArray(hotel)) {
            const foundHotel = hotel.find(h => h.HotelCode === id);
            if (foundHotel?.Rooms && Array.isArray(foundHotel.Rooms) && foundHotel.Rooms.length > 0) {
              const foundBookingCode = foundHotel.Rooms[0].BookingCode;
              setBookingCode(foundBookingCode);
              return;
            }
          } else if (hotel.HotelCode && hotel.Rooms && hotel.Rooms.BookingCode) {
            if (hotel.HotelCode === id || hotel.HotelCode === String(id)) {
              const foundBookingCode = hotel.Rooms.BookingCode;
            setBookingCode(foundBookingCode);
            return;
            }
          }
        }
      }
      
      // If no booking code found from search, show error
      setBookingCode(null);
      
    } catch (error) {
      console.error("Error fetching booking code:", error);
      // Set booking code to null if search fails
      setBookingCode(null);
    } finally {
      setSearchingForBookingCode(false);
    }
  };

  const handleViewRoomDetails = (bookingCode: string) => {
    setSelectedBookingCode(bookingCode);
    setShowRoomDetails(true);
  };

  const handleCloseRoomDetails = () => {
    setShowRoomDetails(false);
    setSelectedBookingCode(null);
  };

  const handleRoomSelect = (room: any) => {
    setSelectedRoom(room);
    setBookingCode(room.BookingCode);
    console.log("Selected room:", room);
    // Close the room details after selection
    setShowRoomDetails(false);
  };


  const handleReserveClick = async () => {
    console.log("🔍 Debug - checkIn:", checkIn);
    console.log("🔍 Debug - checkOut:", checkOut);
    console.log("🔍 Debug - guests:", guests);
    console.log("🔍 Debug - rooms:", rooms);
    
    // Check if a room is selected
    if (!selectedRoom) {
      toast({
        title: "Room Selection Required",
        description: "Please select a room before proceeding to reserve.",
        variant: "destructive",
      });
      return;
    }
    
    if (!bookingCode) {
      console.error("No booking code available, trying to fetch again...");
      // Try to fetch booking code again
      await fetchBookingCode();
      if (!bookingCode) {
        toast({
          title: "Booking Code Missing",
          description: "Booking code is not available. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    setPrebookLoading(true);
    try {
      console.log("🔒 Starting prebook process with booking code:", bookingCode);

      const prebookResponse = await prebookHotel({
        BookingCode: bookingCode,
        PaymentMode: "Limit",
      });

      console.log("✅ Prebook successful:", prebookResponse);

      // Check if prebook was successful
      if (prebookResponse.Status && prebookResponse.Status.Code === "200") {
        // Store hotel and room details in custom backend before navigating
        try {
          console.log("💾 Storing hotel and room details to custom backend...");
          
          if (hotelDetails && selectedRoom) {
            await storeHotelAndRoom(hotelDetails, selectedRoom, bookingCode);
            console.log("✅ Hotel and room details stored successfully");
          } else {
            console.warn("⚠️ Missing hotel or room data for storage");
            console.warn("  - Hotel data:", hotelDetails ? 'Available' : 'MISSING');
            console.warn("  - Room data:", selectedRoom ? 'Available' : 'MISSING');
          }
        } catch (storageError) {
          console.error("❌ Failed to store hotel/room details:", storageError);
          // Don't fail the booking if storage fails, just log it
        }

        // Navigate to booking page with hotel code and prebook data
        navigate(`/booking/${hotelDetails.HotelCode}`, {
          state: {
            prebookData: prebookResponse,
            bookingCode: bookingCode,
            hotelDetails: hotelDetails,
            checkIn: checkIn,
            checkOut: checkOut,
            guests: guests,
            rooms: rooms,
            adults: adults,
            children: children,
            childrenAges: childrenAges,
            roomGuests: roomGuests,
          },
        });
      } else {
        // Handle prebook failure
        console.error("Prebook failed:", prebookResponse);
        alert(
          `Prebook failed: ${
            prebookResponse.Status?.Description || "Unknown error"
          }`
        );
      }
    } catch (error) {
      console.error("💥 Prebook error:", error);
      alert(
        `Prebook failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setPrebookLoading(false);
    }
  };


  useEffect(() => {
    if (id) {
      fetchHotelDetails(id);
      fetchBookingCode();
    }
  }, [id, urlSearchParams]);

  if (loading) {
    return <Loader />;
  }

  console.log(HotelDetails , " details")

  if (!hotelDetails) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="w-full px-6 lg:px-8 py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Hotel Not Found
          </h1>
          <p className="text-muted-foreground mb-8">
            The hotel you're looking for doesn't exist.
          </p>
          <Link to="/search">
            <Button>Back to Search</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Helper function to decode HTML entities
  const decodeHtmlEntities = (html: string) => {
    return html
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/andlt;/g, '<')
      .replace(/andgt;/g, '>')
      .replace(/andamp;/g, '&')
      .replace(/andquot;/g, '"')
      .replace(/and#39;/g, "'");
  };

  // Helper function to extract sections from description
  const extractSections = (description: string) => {
    const decoded = decodeHtmlEntities(description);
    const sections: { [key: string]: string } = {};
    
    // Extract different sections using regex
    const sectionRegex = /<b>([^<]+)<\/b><br\s*\/?>(.*?)(?=<b>|$)/gs;
    let match;
    
    while ((match = sectionRegex.exec(decoded)) !== null) {
      const sectionName = match[1].trim();
      const sectionContent = match[2].trim();
      sections[sectionName] = sectionContent;
    }
    
    return sections;
  };

  const getAmenityIcon = (amenity: string) => {
    switch (amenity.toLowerCase()) {
      case "wifi":
      case "free wifi":
        return <Wifi className="h-4 w-4" />;
      case "parking":
        return <Car className="h-4 w-4" />;
      case "restaurant":
        return <Coffee className="h-4 w-4" />;
      case "pool":
        return <Waves className="h-4 w-4" />;
      case "gym":
        return <Dumbbell className="h-4 w-4" />;
      case "spa":
        return <Bath className="h-4 w-4" />;
      case "ac":
      case "air conditioning":
        return <AirVent className="h-4 w-4" />;
      case "kitchen":
        return <UtensilsCrossed className="h-4 w-4" />;
      case "tv":
        return <Tv className="h-4 w-4" />;
      case "concierge":
        return <Users className="h-4 w-4" />;
      case "workspace":
        return <Bed className="h-4 w-4" />;
      case "laundry":
        return <Shirt className="h-4 w-4" />;
      case "security":
      case "24/7 support":
        return <Shield className="h-4 w-4" />;
      default:
        return <Shield className="h-4 w-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main
        className="w-full px-6 lg:px-8 py-8 pt-header-plus-25"
        style={{
          paddingTop: "calc(var(--header-height-default) + 41px + 19px)",
        }}
      >
        {/* Back Button */}
        <div className="mb-6">
          <Link to="/search">
            <Button variant="ghost" className="flex items-center space-x-2">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to search</span>
            </Button>
          </Link>
        </div>

        {/* Hotel Images */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="space-y-4">
            <div className="aspect-[4/3] relative overflow-hidden rounded-xl group">
              <img
                src={
                  hotelDetails.Images?.[currentImageIndex] || 
                  hotelDetails.FrontImage || 
                  "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop"
                }
                alt={`${hotelDetails.HotelName} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover transition-transform duration-300"
              />
              
              {/* Image Navigation Arrows */}
              {hotelDetails.Images && hotelDetails.Images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => 
                      prev === 0 ? hotelDetails.Images.length - 1 : prev - 1
                    )}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-800" />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => 
                      prev === hotelDetails.Images.length - 1 ? 0 : prev + 1
                    )}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <ArrowLeft className="h-5 w-5 text-gray-800 rotate-180" />
                  </button>
                  
                  {/* Image Counter */}
                  <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                    {currentImageIndex + 1} / {hotelDetails.Images.length}
                  </div>
                  
                  {/* Dot Indicators */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                    {hotelDetails.Images.slice(0, 5).map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          index === currentImageIndex 
                            ? 'bg-white w-6' 
                            : 'bg-white/50 hover:bg-white/75'
                        }`}
                      />
                    ))}
                    {hotelDetails.Images.length > 5 && (
                      <span className="text-white text-xs ml-1">+{hotelDetails.Images.length - 5}</span>
                    )}
                  </div>
                </>
              )}
            </div>
            
            {/* Thumbnail Grid */}
            {hotelDetails.Images && hotelDetails.Images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {hotelDetails.Images.slice(0, 5).map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      index === currentImageIndex 
                        ? 'border-primary scale-105' 
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Hotel Details */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-2">
                  {/* API does not provide isNew; can skip */}
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Share className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsFavorite(!isFavorite)}
                  >
                    <Heart
                      className={`h-4 w-4 ${
                        isFavorite ? "fill-red-500 text-red-500" : ""
                      }`}
                    />
                  </Button>
                </div>
              </div>

              <h1 className="text-3xl font-bold text-foreground mb-2">
                {hotelDetails.HotelName}
              </h1>

              <div className="flex items-center space-x-4 text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Star className="h-4 w-4 fill-black text-black" />
                  <span className="font-medium">
                    {hotelDetails.HotelRating
                      ? hotelDetails.HotelRating
                      : "N/A"}
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {hotelDetails.Address}, {hotelDetails.CityName},{" "}
                    {hotelDetails.CountryName}
                  </span>
                </div>
              </div>

              {/* Available Rooms Section */}
              <div className="mt-8">
                <div className="space-y-4">
                  {/* Show selected room summary if available */}
                  {selectedRoom && !showRoomDetails && (
                    <div className="border border-primary rounded-lg p-4 bg-primary/5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{selectedRoom.Name}</h4>
                          <p className="text-sm text-muted-foreground">{selectedRoom.MealType}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={selectedRoom.IsRefundable === "true" ? "default" : "destructive"}>
                              {selectedRoom.IsRefundable === "true" ? "Refundable" : "Non-Refundable"}
                            </Badge>
                            {selectedRoom.WithTransfers === "true" && (
                              <Badge variant="outline">With Transfers</Badge>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-primary">
                            {hotelDetails.Currency || 'USD'} {selectedRoom.TotalFare}
                          </div>
                          <div className="text-sm text-muted-foreground">total</div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Toggle button */}
                  {!showRoomDetails && (
                    <Button 
                      onClick={() => handleViewRoomDetails(bookingCode || "no-booking-code")}
                      variant="outline"
                      className="w-96"
                    >
                      {selectedRoom ? "Change Room Selection" : "Available Rooms"}
                    </Button>
                  )}
                                        
                  {/* Inline room details */}
                  {showRoomDetails && selectedBookingCode && (
                    <div className="border rounded-lg bg-muted/5">
                      <div className="flex justify-between items-center p-4 border-b sticky top-0 bg-background z-10">
                        <h4 className="font-semibold text-lg">Select Your Room</h4>
                        <Button 
                          onClick={handleCloseRoomDetails}
                          variant="ghost"
                          size="sm"
                        >
                          Close
                        </Button>
                      </div>
                      <div className="max-h-[500px] overflow-y-auto p-4">
                        <HotelRoomDetails 
                          bookingCode={selectedBookingCode} 
                          onClose={handleCloseRoomDetails}
                          onRoomSelect={handleRoomSelect}
                          selectedRoom={selectedRoom}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Reserve Button with Couple Video */}
              <div className="flex items-center gap-6 mt-2">
                <Button 
                  size="lg" 
                  className="w-96 bg-primary hover:bg-primary/90 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
                  onClick={handleReserveClick}
                  disabled={prebookLoading || !bookingCode || searchingForBookingCode}
                >
                  {searchingForBookingCode ? "Finding booking code..." : prebookLoading ? "Processing..." : "Reserve"}
                </Button>
                <video
                  src="/couple-vacation.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  style={{ width: "200px", borderRadius: "8px" }}
                />
              </div>

              {!bookingCode && !searchingForBookingCode && (
                <div className="text-center text-sm text-red-500 mt-2">
                  <p>Booking code not available. Please try again.</p>
                  <button 
                    onClick={fetchBookingCode}
                    className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Retry Fetch Booking Code
                  </button>
                </div>
              )}

              <p className="text-center text-sm text-muted-foreground mt-2">
                You won't be charged yet
              </p>
            </div>

            {/* Amenities */}
            <div>
  <h3 className="font-semibold text-foreground mb-4">
    What this place offers
  </h3>
  <div className="flex flex-wrap gap-3">
    {hotelDetails.HotelFacilities &&
      (showAllAmenities
        ? hotelDetails.HotelFacilities
        : hotelDetails.HotelFacilities.slice(0, 6)
      ).map((amenity: string, index: number) => (
        <div
          key={`${amenity}-${index}`}
          className="flex items-center space-x-2 py-1 px-2 rounded-full bg-muted/50"
        >
          <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
            {getAmenityIcon(amenity)}
          </div>
          <span className="text-sm font-medium">{amenity}</span>
        </div>
      ))
    }
  </div>

  {/* Show More / Show Less button */}
  {hotelDetails.HotelFacilities && hotelDetails.HotelFacilities.length > 5 && (
    <button
      onClick={() => setShowAllAmenities(!showAllAmenities)}
      className="mt-2 text-primary font-medium text-sm hover:underline"
    >
      {showAllAmenities ? "Show Less" : "Show More"}
    </button>
  )}
</div>
          </div>
        </div>

        {/* Description and Hotel Information */}
        {hotelDetails.Description && (() => {
          const sections = extractSections(hotelDetails.Description);
          return (
            <div className="space-y-6 mb-8">
              {/* About this place */}
              {(sections['Amenities'] || sections['Dining'] || sections['Business Amenities'] || sections['Rooms']) && (
                <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">
              About this place
            </h3>
                    <div className="space-y-4">
                      {sections['Amenities'] && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Amenities</h4>
                          <div 
                            className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: sections['Amenities'] }}
                          />
                        </div>
                      )}
                      {sections['Dining'] && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Dining</h4>
                          <div 
                            className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: sections['Dining'] }}
                          />
                        </div>
                      )}
                      {sections['Business Amenities'] && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Business Amenities</h4>
                          <div 
                            className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: sections['Business Amenities'] }}
                          />
                        </div>
                      )}
                      {sections['Rooms'] && (
                        <div>
                          <h4 className="font-semibold text-foreground mb-2">Rooms</h4>
                          <div 
                            className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: sections['Rooms'] }}
                          />
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Attractions */}
              {sections['Attractions'] && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">
                      Nearby Attractions
                    </h3>
                    <div 
                      className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: sections['Attractions'] }}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Location */}
              {sections['Location'] && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">
                      Location
                    </h3>
                    <div 
                      className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: sections['Location'] }}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Check In Instructions */}
              {sections['Check In Instructions'] && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">
                      Check In Information
                    </h3>
                    <div 
                      className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: sections['Check In Instructions'] }}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Fees */}
              {sections['Fees'] && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">
                      Fees & Charges
                    </h3>
                    <div 
                      className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: sections['Fees'] }}
                    />
                  </CardContent>
                </Card>
              )}

              {/* Policies */}
              {sections['Policies'] && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="font-semibold text-foreground mb-4">
                      Policies
                    </h3>
                    <div 
                      className="text-muted-foreground leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: sections['Policies'] }}
                    />
          </CardContent>
        </Card>
              )}
            </div>
          );
        })()}

        {/* Location */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4">
              Where you'll be
            </h3>
            <div className="h-80 rounded-lg overflow-hidden">
              <FakeMapView
                hotels={[
                  {
                    id: hotelDetails.HotelCode,
                    name: hotelDetails.HotelName,
                    location: hotelDetails.Address,
                    images: hotelDetails.Images || [hotelDetails.FrontImage],
                    rating: hotelDetails.HotelRating,
                    price: hotelDetails.Price || 200,
                    reviews: 0,
                  },
                ]}
                selectedHotel={hotelDetails.HotelCode}
                onHotelSelect={() => {}}
              />
            </div>
            <div className="mt-4 flex items-center space-x-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {hotelDetails.Address}, {hotelDetails.CityName},{" "}
                {hotelDetails.CountryName}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Reviews Preview */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <Star className="h-5 w-5 fill-black text-black" />
              <span className="text-xl font-semibold">
                {hotelDetails.HotelRating ? hotelDetails.HotelRating : "N/A"} ·
                Guest Reviews
              </span>
            </div>
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Guest reviews are not available through the API at this time.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                This hotel has a {hotelDetails.HotelRating || "N/A"} star rating.
              </p>
            </div>
          </CardContent>
        </Card>


        
        



      </main>
      <Footer />
    </div>
  );
};

export default HotelDetails;