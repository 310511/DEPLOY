import { useState, useMemo, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import {
  ChevronLeft,
  ChevronRight,
  Grid3X3,
  Map as MapIcon,
  Loader2,
  AlertCircle,
  X,
} from "lucide-react";
import SearchFilters from "@/components/SearchFilters";
import Footer from "@/components/Footer";
import AirbnbHotelCard from "@/components/AirbnbHotelCard";
import Header from "@/components/Header";
import { useHotelSearch } from "@/hooks/useHotelSearch";
import FakeMapView from "@/components/FakeMapView";
import {
  getCountryList,
  getCityList,
  getHotelCodeList,
} from "@/services/hotelCodeApi";
import { APP_CONFIG, getCurrentDate, getDateFromNow } from "@/config/constants";

const SearchResults = () => {
  console.log("🚀 SearchResults component rendering...");
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const destination = searchParams.get("destination") || "Riyadh";
  const guests =
    searchParams.get("guests") || APP_CONFIG.DEFAULT_GUESTS.toString();
  const rooms = parseInt(searchParams.get("rooms") || "1");
  const checkInRaw = searchParams.get("checkIn") || "";
  const checkOutRaw = searchParams.get("checkOut") || "";

  // Parse ISO dates to YYYY-MM-DD format
  const parseDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const date = new Date(dateStr);
      const parsedDate = date.toISOString().split("T")[0]; // Convert to YYYY-MM-DD

      // Validate that the date is reasonable (not too far in the past or future)
      const today = new Date();
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(today.getFullYear() + 1);

      if (date < today) {
        console.warn("Date is in the past:", parsedDate);
        return "";
      }

      if (date > oneYearFromNow) {
        console.warn("Date is too far in the future:", parsedDate);
        return "";
      }

      return parsedDate;
    } catch (error) {
      console.error("Error parsing date:", dateStr, error);
      return "";
    }
  };

  const checkIn = parseDate(checkInRaw);
  const checkOut = parseDate(checkOutRaw);

  const [priceRange, setPriceRange] = useState<[number, number]>([50, 5000]);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<string>();
  const [hoveredHotel, setHoveredHotel] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const itemsPerPage = viewMode === "map" ? 15 : 20;

  // Use the hotel search hook
  const { hotels, loading, error, search } = useHotelSearch();

  // Local loading state for the dynamic search process
  const [isSearching, setIsSearching] = useState(false);

  // Debug logging
  console.log("📊 SearchResults state:", {
    destination,
    guests,
    checkInRaw,
    checkOutRaw,
    checkIn,
    checkOut,
    hotels: hotels,
    hotelsType: typeof hotels,
    hotelsIsArray: Array.isArray(hotels),
    hotelsLength: hotels?.length,
    loading,
    error,
  });

  // Additional debugging for hotels
  if (hotels && hotels.length > 0) {
    console.log("🏨 Hotels found in state:", hotels);
    console.log("🏨 First hotel:", hotels[0]);
  } else {
    console.log("❌ No hotels in state");
  }

  // Additional debugging
  console.log("🔍 Search function available:", typeof search);

  // Dynamic search based on destination
  useEffect(() => {
    console.log("🚨 SEARCHRESULTS USEEFFECT TRIGGERED!");
    console.log("🔍 SearchResults useEffect triggered with:", {
      checkIn,
      checkOut,
      destination,
      guests,
    });
    console.log("📊 SearchResults state:", { hotels, loading, error });
    console.log("📊 Hotels array length:", hotels.length);
    console.log("📊 Hotels array:", hotels);
    console.log("🔍 Search function in useEffect:", typeof search);

    // Only search if we have valid parameters
    if (checkIn && checkOut && destination && guests) {
      // Validate dates
      const checkInDate = new Date(checkIn);
      const checkOutDate = new Date(checkOut);
      const today = new Date();
      const maxFutureDate = new Date();
      maxFutureDate.setMonth(maxFutureDate.getMonth() + 6); // 6 months from now

      const stayDuration = Math.ceil(
        (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      // Check if dates are in the past
      if (checkInDate < today) {
        console.warn("Check-in date is in the past:", checkIn);
        setError(
          "Check-in date cannot be in the past. Please select a future date."
        );
        setIsSearching(false);
        return;
      }

      // Check if dates are too far in the future (more than 6 months)
      if (checkInDate > maxFutureDate) {
        console.warn("Check-in date is too far in the future:", checkIn);
        setError(
          "Check-in date cannot be more than 6 months in the future. Please select a closer date."
        );
        setIsSearching(false);
        return;
      }

      if (stayDuration > 30) {
        console.warn(
          "Stay duration too long:",
          stayDuration,
          "days. Maximum allowed is 30 days."
        );
        setError(
          "Stay duration cannot exceed 30 days. Please select a shorter period."
        );
        setIsSearching(false);
        return;
      }

      if (stayDuration <= 0) {
        console.warn(
          "Invalid stay duration:",
          stayDuration,
          "days. Check-out must be after check-in."
        );
        setError("Check-out date must be after check-in date.");
        setIsSearching(false);
        return;
      }

      console.log("✅ All parameters valid, starting search...");
      console.log("📅 Stay duration:", stayDuration, "days");

      // No hardcoded city codes - everything will be fetched dynamically from API

      // Simple 4-step flow: Country → City → Hotel Codes → Search
      const performSearch = async () => {
        console.log("🔍 Starting simple 4-step search for:", destination);
        setIsSearching(true);

        try {
          // Step 1: Get country code
          console.log("🌍 Step 1: Getting country code...");
          const countryResponse = await getCountryList();
          const countryName =
            destination.split(",")[1]?.trim() ||
            destination.split(",")[0]?.trim();
          const country = countryResponse.CountryList?.find(
            (c) =>
              c.Name.toLowerCase().includes(countryName.toLowerCase()) ||
              countryName.toLowerCase().includes(c.Name.toLowerCase())
          );

          if (!country) {
            console.log("❌ Country not found:", countryName);
            setIsSearching(false);
            return;
          }

          const countryCode = country.Code;
          console.log(
            "✅ Step 1 complete - Country:",
            country.Name,
            "→",
            countryCode
          );

          // Step 2: Get city code
          console.log("🏙️ Step 2: Getting city code...");
          const cityResponse = await getCityList(countryCode);
          const cityName = destination.split(",")[0]?.trim();
          const city = cityResponse.CityList?.find(
            (c) =>
              c.CityName.toLowerCase().includes(cityName.toLowerCase()) ||
              cityName.toLowerCase().includes(c.CityName.toLowerCase())
          );

          if (!city) {
            console.log("❌ City not found:", cityName);
            setIsSearching(false);
            return;
          }

          const cityCode = city.CityCode;
          console.log(
            "✅ Step 2 complete - City:",
            city.CityName,
            "→",
            cityCode
          );

          // Step 3: Get hotel codes
          console.log("🏨 Step 3: Getting hotel codes...");
          const hotelResponse = await getHotelCodeList(
            countryCode,
            cityCode,
            false
          );

          if (
            !hotelResponse.HotelList ||
            hotelResponse.HotelList.length === 0
          ) {
            console.log("❌ No hotels found for:", cityName);
            setIsSearching(false);
            return;
          }

          // Filter hotels to only include those from the specific city
          const cityHotels = hotelResponse.HotelList.filter(
            (hotel) => hotel.CityCode === cityCode
          );

          if (cityHotels.length === 0) {
            console.log(
              "❌ No hotels found for city:",
              cityName,
              "with city code:",
              cityCode
            );
            setIsSearching(false);
            return;
          }

          // Take first 20 hotel codes from the filtered city hotels
          const hotelCodes = cityHotels
            .slice(0, 20)
            .map((hotel) => hotel.HotelCode)
            .join(",");
          console.log(
            "✅ Step 3 complete - Found",
            cityHotels.length,
            "hotels for",
            cityName,
            "using first 20"
          );

          // Step 4: Search hotels
          console.log("🔍 Step 4: Searching hotels...");

          // Always search for 1 room to get all available room types
          // Users can then select multiple rooms from the available options
          const totalGuests = parseInt(guests) || APP_CONFIG.DEFAULT_GUESTS;
          
          let searchParams = {
            CheckIn: checkIn,
            CheckOut: checkOut,
            CityCode: cityCode, // Use city code instead of specific hotel codes
            HotelCodes: hotelCodes, // Fallback to specific hotel codes
            GuestNationality: APP_CONFIG.DEFAULT_GUEST_NATIONALITY,
            PreferredCurrencyCode: APP_CONFIG.DEFAULT_CURRENCY,
            PaxRooms: [
              {
                Adults: totalGuests,
                Children: APP_CONFIG.DEFAULT_CHILDREN,
                ChildrenAges: [],
              },
            ],
            IsDetailResponse: true,
            ResponseTime: APP_CONFIG.DEFAULT_RESPONSE_TIME,
          };

          console.log(
            "🔍 Trying city-based search first with cityCode:",
            cityCode
          );

          const searchResult = await search(searchParams);
          console.log("🔍 City-based search result:", searchResult);
          console.log("✅ Step 4 complete - Search finished");
          console.log("🔍 Final search result:", searchResult);
          console.log("🔍 Hotels state after search:", hotels);

          // Force a small delay to ensure state updates
          await new Promise((resolve) => setTimeout(resolve, 100));

          // Debug: Log the first hotel's room structure to understand pricing
          if (hotels && hotels.length > 0) {
            console.log(
              "🔍 Debug - First hotel rooms structure:",
              hotels[0].Rooms
            );
            if (hotels[0].Rooms && hotels[0].Rooms.length > 0) {
              console.log("🔍 Debug - First room details:", hotels[0].Rooms[0]);
            }
          }
        } catch (error) {
          console.error("❌ Search failed:", error);
        } finally {
          setIsSearching(false);
        }

        // Safety timeout to ensure isSearching gets reset
        setTimeout(() => {
          setIsSearching(false);
        }, 10000);
      };

      // Call async function (fire and forget)
      performSearch().catch((error) => {
        console.error("❌ Error in hotel search:", error);
        setIsSearching(false);
      });
    }
  }, [checkIn, checkOut, destination, guests, search]);

  // Filter hotels based on selected filters and price range
  const filteredHotels = useMemo(() => {
    console.log("🔍 Filtering hotels...");
    console.log("🏨 Input hotels:", hotels);

    if (!hotels || !Array.isArray(hotels)) {
      console.log("❌ Hotels is not an array:", hotels);
      return [];
    }

    let filtered = hotels.filter((hotel) => {
      // Extract price from API response - Rooms is an object with TotalFare
      let price = hotel.Price;
      console.log("🔍 SearchResults price extraction:", {
        hotelName: hotel.HotelName,
        Price: hotel.Price,
        Rooms: hotel.Rooms,
        TotalFare: (hotel.Rooms as any)?.TotalFare,
      });

      // Always prioritize TotalFare from Rooms object (this is the real price from API)
      if (hotel.Rooms && (hotel.Rooms as any).TotalFare) {
        price = (hotel.Rooms as any).TotalFare;
        console.log("✅ SearchResults using TotalFare from Rooms:", price);
      } else if (hotel.Price) {
        price = hotel.Price;
        console.log("⚠️ SearchResults using hotel.Price as fallback:", price);
      } else {
        console.log(
          "❌ SearchResults no price found - Rooms:",
          hotel.Rooms,
          "Price:",
          hotel.Price
        );
        price = 0; // No hardcoded fallback - show 0 if no price found
      }
      // Convert string to number if needed
      price = typeof price === "string" ? parseFloat(price) : price;

      console.log("🔍 SearchResults final price:", price);
      return price >= priceRange[0] && price <= priceRange[1];
    });

    if (selectedFilters.includes("Free cancellation")) {
      filtered = filtered.filter((hotel) =>
        hotel.CancellationPolicy?.includes("Free")
      );
    }

    console.log("✅ Filtered hotels:", filtered);
    console.log("✅ Filtered hotels length:", filtered.length);
    console.log("✅ Price range:", priceRange);
    return filtered;
  }, [hotels, priceRange, selectedFilters]);

  // Pagination logic
  const totalPages = Math.ceil(filteredHotels.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedHotels = filteredHotels.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedFilters, priceRange, viewMode]);

  // Debug logging for render
  console.log("🔍 Rendering SearchResults with:");
  console.log("🏨 Total hotels:", hotels?.length || 0);
  console.log("🏨 Filtered hotels:", filteredHotels.length);
  console.log("🏨 Paginated hotels:", paginatedHotels.length);
  console.log("🏨 Loading state:", loading);
  console.log("🏨 Is searching:", isSearching);
  console.log("🏨 Error state:", error);
  console.log("🏨 Hotels array:", hotels);
  console.log("🏨 Paginated hotels:", paginatedHotels);
  console.log(
    "🏨 Should show hotels:",
    !loading && !error && !isSearching && paginatedHotels.length > 0
  );

  // Debug first hotel if exists
  if (hotels && hotels.length > 0) {
    console.log("🔍 First hotel details:", hotels[0]);
    console.log("🔍 First hotel price extraction:", {
      Price: hotels[0].Price,
      Rooms: hotels[0].Rooms,
      TotalFare: (hotels[0].Rooms as any)?.TotalFare,
      extractedPrice:
        hotels[0].Price ||
        (hotels[0].Rooms && (hotels[0].Rooms as any).TotalFare
          ? (hotels[0].Rooms as any).TotalFare
          : 100),
    });
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Main Content */}
      <main className="w-full pt-32">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          {/* Search Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-6 border-b border-border">
            <div className="flex items-center gap-4 mb-4 sm:mb-0">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
                className="h-8 w-8"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">
                  {destination}
                </h1>
                <p className="text-sm text-muted-foreground">
                  {checkIn} - {checkOut} • {guests} guests
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-8"
              >
                {showFilters ? "Hide Filters" : "Show Filters"}
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8"
              >
                <Grid3X3 className="h-4 w-4 mr-2" />
                List
              </Button>
              <Button
                variant={viewMode === "map" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("map")}
                className="h-8"
              >
                <MapIcon className="h-4 w-4 mr-2" />
                Map
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex flex-col lg:flex-row gap-6 py-6">
            {/* Filters Sidebar */}
            {showFilters && (
              <div className="w-full lg:w-80 xl:w-96">
                <div className="max-h-screen overflow-y-auto pr-4 space-y-6">
                  {/* Close Button */}
                  <div className="flex justify-end mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowFilters(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Price Range */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-6 flex items-center">
                      <div className="w-2 h-6 bg-gradient-to-b from-primary to-primary/60 rounded-full mr-3"></div>
                      Price range
                    </h3>
                    <div className="space-y-6">
                      <Slider
                        value={priceRange}
                        onValueChange={(range) =>
                          setPriceRange(range as [number, number])
                        }
                        max={5000}
                        min={50}
                        step={50}
                        className="w-full"
                      />
                      <div className="flex justify-between">
                        <div className="bg-gray-50 px-3 py-2 rounded-lg border">
                          <span className="text-sm font-semibold text-gray-700">
                            ${priceRange[0]}
                          </span>
                        </div>
                        <div className="bg-gray-50 px-3 py-2 rounded-lg border">
                          <span className="text-sm font-semibold text-gray-700">
                            ${priceRange[1]}+
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Property Type */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-6 flex items-center">
                      <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full mr-3"></div>
                      Type of place
                    </h3>
                    <div className="space-y-4">
                      {[
                        { id: "hotel", label: "Hotels", count: 198 },
                        { id: "apartment", label: "Apartments", count: 89 },
                        { id: "resort", label: "Resorts", count: 45 },
                        { id: "villa", label: "Villas", count: 23 },
                      ].map((type) => (
                        <div
                          key={type.id}
                          className="flex items-center justify-between hover:bg-gray-50 p-3 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200"
                        >
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={type.id}
                              checked={selectedFilters.includes(type.id)}
                              onCheckedChange={() => {
                                setSelectedFilters(
                                  selectedFilters.includes(type.id)
                                    ? selectedFilters.filter(
                                        (id) => id !== type.id
                                      )
                                    : [...selectedFilters, type.id]
                                );
                              }}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label
                              htmlFor={type.id}
                              className="text-sm font-medium text-gray-700 cursor-pointer"
                            >
                              {type.label}
                            </label>
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {type.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Amenities */}
                  <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                    <h3 className="font-bold text-lg mb-6 flex items-center">
                      <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full mr-3"></div>
                      Amenities
                    </h3>
                    <div className="space-y-4">
                      {[
                        { id: "wifi", label: "Wi-Fi", count: 245 },
                        { id: "parking", label: "Free parking", count: 189 },
                        { id: "pool", label: "Pool", count: 156 },
                        { id: "gym", label: "Gym", count: 134 },
                        { id: "restaurant", label: "Restaurant", count: 176 },
                        { id: "kitchen", label: "Kitchen", count: 156 },
                        { id: "ac", label: "Air conditioning", count: 298 },
                        {
                          id: "workspace",
                          label: "Dedicated workspace",
                          count: 87,
                        },
                        { id: "garden", label: "Garden", count: 67 },
                        { id: "concierge", label: "Concierge", count: 23 },
                      ].map((amenity) => (
                        <div
                          key={amenity.id}
                          className="flex items-center justify-between hover:bg-gray-50 p-3 rounded-lg transition-all duration-200 border border-transparent hover:border-gray-200"
                        >
                          <div className="flex items-center space-x-3">
                            <Checkbox
                              id={amenity.id}
                              checked={selectedFilters.includes(amenity.id)}
                              onCheckedChange={() => {
                                setSelectedFilters(
                                  selectedFilters.includes(amenity.id)
                                    ? selectedFilters.filter(
                                        (id) => id !== amenity.id
                                      )
                                    : [...selectedFilters, amenity.id]
                                );
                              }}
                              className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <label
                              htmlFor={amenity.id}
                              className="text-sm font-medium text-gray-700 cursor-pointer"
                            >
                              {amenity.label}
                            </label>
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                            {amenity.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Results */}
            <div className="flex-1">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Searching...
                      </span>
                    ) : (
                      `${filteredHotels.length} properties found`
                    )}
                  </p>
                </div>
              </div>

              {/* Loading State */}
              {(loading || isSearching) && (
                <div className="flex items-center justify-center py-12 min-h-[400px]">
                  <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="text-lg font-medium">
                      {isSearching
                        ? "Fetching hotels ..."
                        : "Finding the best hotels for you..."}
                    </span>
                    <p className="text-sm text-muted-foreground text-center max-w-md">
                      {isSearching
                        ? "Please wait while we fetch hotel data from our partners"
                        : "Please wait while we search for available accommodations"}
                    </p>
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && !loading && !isSearching && (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-2 text-destructive">
                    <AlertCircle className="h-5 w-5" />
                    <span>Error loading hotels: {error}</span>
                  </div>
                </div>
              )}

              {/* No Results State */}
              {!loading &&
                !error &&
                !isSearching &&
                filteredHotels.length === 0 && (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-foreground mb-2">
                        No hotels found
                      </h3>
                      <p className="text-muted-foreground">
                        Try adjusting your filters or search criteria.
                      </p>
                    </div>
                  </div>
                )}

              {/* Hotels Grid/List - Show if we have hotels */}
              {hotels && hotels.length > 0 && (
                <div className="space-y-6">
                  {viewMode === "list" ? (
                    <div
                      className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full ${
                        showFilters ? "justify-start" : "justify-start"
                      }`}
                    >
                      {hotels.map((hotel, index) => (
                        <AirbnbHotelCard
                          key={hotel.HotelCode || index}
                          hotel={hotel}
                          onHover={(isHovered) => {
                            setHoveredHotel(isHovered ? hotel.HotelCode : null);
                          }}
                          isSelected={hoveredHotel === hotel.HotelCode}
                        />
                      ))}
                    </div>
                  ) : (
                    <FakeMapView
                      hotels={hotels.map((hotel) => ({
                        id: hotel.HotelCode,
                        name: hotel.HotelName,
                        location:
                          hotel.Address ||
                          hotel.Location?.Latitude +
                            "," +
                            hotel.Location?.Longitude ||
                          "Unknown",
                        price: (() => {
                          let price = hotel.Price;
                          console.log("🔍 FakeMapView price extraction:", {
                            hotelName: hotel.HotelName,
                            Price: hotel.Price,
                            Rooms: hotel.Rooms,
                            TotalFare: (hotel.Rooms as any)?.TotalFare,
                          });
                          // Always prioritize TotalFare from Rooms object (this is the real price from API)
                          if (hotel.Rooms && (hotel.Rooms as any).TotalFare) {
                            price = (hotel.Rooms as any).TotalFare;
                            console.log(
                              "✅ FakeMapView using TotalFare from Rooms:",
                              price
                            );
                          } else if (hotel.Price) {
                            price = hotel.Price;
                            console.log(
                              "⚠️ FakeMapView using hotel.Price as fallback:",
                              price
                            );
                          } else {
                            console.log(
                              "❌ FakeMapView no price found - Rooms:",
                              hotel.Rooms,
                              "Price:",
                              hotel.Price
                            );
                            price = 0; // No hardcoded fallback - show 0 if no price found
                          }
                          const finalPrice =
                            typeof price === "string"
                              ? parseFloat(price)
                              : price;
                          console.log(
                            "🔍 FakeMapView final price:",
                            finalPrice
                          );
                          return finalPrice;
                        })(),
                        rating: parseInt(hotel.StarRating) || 4,
                        reviews: Math.floor(Math.random() * 500) + 50,
                        images: [
                          hotel.FrontImage || "/api/placeholder/300/200",
                        ],
                        coordinates: {
                          lat:
                            hotel.Location?.Latitude ||
                            25.2048 + Math.random() * 0.1,
                          lng:
                            hotel.Location?.Longitude ||
                            55.2708 + Math.random() * 0.1,
                        },
                      }))}
                      selectedHotel={selectedHotel || hoveredHotel || undefined}
                      onHotelSelect={setSelectedHotel}
                      onHotelHover={setHoveredHotel}
                    />
                  )}
                </div>
              )}

              {/* Pagination - Temporarily disabled to show all hotels */}
              {false && totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Button>

                  <div className="flex items-center gap-2">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={
                            currentPage === pageNum ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                          className="h-8 w-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-2"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SearchResults;
