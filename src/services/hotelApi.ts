import { APP_CONFIG } from "@/config/constants";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://api.travzillapro.com/HotelServiceRest";
const PROXY_SERVER_URL =
  import.meta.env.VITE_PROXY_SERVER_URL || "http://localhost:3001/api";
const API_USERNAME = import.meta.env.VITE_API_USERNAME || "";
const API_PASSWORD = import.meta.env.VITE_API_PASSWORD || "";

const getApiUrl = (endpoint: string) => {
  return `${PROXY_SERVER_URL}${endpoint}`;
};
const authHeader = btoa(`${API_USERNAME}:${API_PASSWORD}`);
export interface HotelSearchParams {
  CheckIn: string;
  CheckOut: string;
  HotelCodes?: string;
  CityCode?: string;
  GuestNationality: string;
  PreferredCurrencyCode: string;
  PaxRooms: Array<{
    Adults: number;
    Children: number;
    ChildrenAges: number[];
  }>;
  IsDetailResponse?: boolean;
  ResponseTime?: number;
  Filters?: {
    MealType: string;
    Refundable: string;
    NoOfRooms: number;
  };
}

export interface HotelResult {
  HotelCode: string;
  HotelName: string;
  Address: string;
  StarRating: string;
  FrontImage: string;
  Price?: number;
  Currency?: string;
  RoomType?: string;
  MealType?: string;
  Refundable?: boolean;
  CancellationPolicy?: string;
  Amenities?: string[];
  Description?: string;
  Location?: {
    Latitude: number;
    Longitude: number;
  };
  Rooms?: Array<{
    BookingCode: string;
    RoomType: string;
    Price: number;
    Currency: string;
    Refundable: boolean;
    MealType?: string;
    CancellationPolicy?: string;
  }>;
}

export interface HotelSearchResponse {
  Status: {
    Code: string | number;
    Description: string;
  };
  HotelResult: HotelResult[] | HotelResult;
}

// Search hotels using Travzilla API - NO MOCK DATA
export const searchHotels = async (
  params: HotelSearchParams
): Promise<HotelSearchResponse> => {
  try {
    console.log("🔍 Calling Travzilla API with params:", params);

    // Always use real Travzilla API - no fallback to mock data
    return await searchHotelsTravzilla(params);
  } catch (error) {
    console.error("💥 Hotel search error:", error);
    throw error;
  }
};

// Real API integration with Travzilla via local proxy
const searchHotelsTravzilla = async (
  params: HotelSearchParams
): Promise<HotelSearchResponse> => {
  try {
    console.log("🌐 Calling Travzilla API via local proxy...");
    console.log("🌐 searchHotelsTravzilla called with params:", params);
    const proxyUrl = getApiUrl("/hotel-search");
    console.log("📍 Proxy URL:", proxyUrl);
    console.log("📤 Request Body:", JSON.stringify(params, null, 2));
    console.log("🔍 Environment check - PROXY_SERVER_URL:", PROXY_SERVER_URL);

    const response = await fetch(proxyUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(params),
    });

    console.log("📥 Response Status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Proxy response error:", errorText);
      throw new Error(
        `Proxy server error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Travzilla API response:", data);
    console.log("✅ Travzilla API response type:", typeof data);
    console.log("✅ Travzilla API response keys:", Object.keys(data || {}));

    // Handle null response (no hotels found)
    if (data === null || data === undefined) {
      console.log("📭 No hotels found for this search");
      return {
        Status: {
          Code: "204",
          Description: "No results found for the requested search",
        },
        HotelResult: [],
      };
    }

    // Check if the response has the expected structure
    if (data.Status && data.HotelResult) {
      // Ensure HotelResult is an array
      let hotelResults = data.HotelResult;
      if (!Array.isArray(hotelResults)) {
        console.log(
          "📋 HotelResult is not an array, converting...",
          typeof hotelResults
        );
        if (typeof hotelResults === "object" && hotelResults !== null) {
          // Convert single hotel object to array
          hotelResults = [hotelResults];
        } else {
          hotelResults = [];
        }
      }

      // Process hotel results to extract room data and booking codes
      const processedHotels = hotelResults.map((hotel: any) => {
        if (hotel.Rooms) {
          // Process rooms data to extract booking codes
          // Preserve the original Rooms object structure - don't convert to array
          // The Rooms object contains TotalFare which we need for pricing
          return {
            ...hotel,
            // Keep Rooms as-is since it contains the pricing information
          };
        }
        return hotel;
      });

      return {
        ...data,
        HotelResult: processedHotels,
      };
    } else {
      // Transform response if needed
      return {
        Status: {
          Code: "200",
          Description: "Successful",
        },
        HotelResult: Array.isArray(data.HotelResult)
          ? data.HotelResult
          : data.hotels || [],
      };
    }
  } catch (error) {
    console.error("💥 Proxy API error:", error);
    console.error("💥 Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    throw new Error(
      `Travzilla API failed: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
};

// Get hotel details by code using proxy server
// export const getHotelDetails = async (hotelCode: string): Promise<any> => {
//   try {
//     console.log('🔍 Fetching hotel details for:', hotelCode);

//     const response = await fetch(`${PROXY_SERVER_URL}/hotel-details`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Accept': 'application/json',
//       },
//       body: JSON.stringify({ HotelCode: Number(hotelCode) ,Language : 'EN'}),
//     });

//     if (!response.ok) {
//       const errorText = await response.text();
//       console.error('❌ Hotel details error:', errorText);
//       throw new Error(`Hotel details error: ${response.status} ${response.statusText}`);
//     }

//     const data = await response.json();
//     console.log('✅ Hotel details response:', data);
//     return data;
//   } catch (error) {
//     console.error('💥 Hotel details error:', error);
//     throw error;
//   }
// };

export const getHotelDetails = async (hotelCode: string): Promise<any> => {
  try {
    console.log("🔍 Fetching hotel details for:", hotelCode);

    const response = await fetch(`${PROXY_SERVER_URL}/hotel-details`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ Hotelcodes: Number(hotelCode), Language: "en" }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Hotel details error:", errorText);
      throw new Error(
        `Hotel details error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Hotel details response:", data);
    return data;
  } catch (error) {
    console.error("💥 Hotel details error:", error);
    throw error;
  }
};

// Get room availability
export const getRoomAvailability = async (
  hotelCode: string,
  checkIn: string,
  checkOut: string
): Promise<any> => {
  try {
    console.log("🔍 Getting room availability for:", hotelCode);

    const response = await fetch(`${PROXY_SERVER_URL}/room-availability`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        HotelCode: hotelCode,
        CheckIn: checkIn,
        CheckOut: checkOut,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Room availability error:", errorText);
      throw new Error(
        `Room availability error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Room availability response:", data);
    return data;
  } catch (error) {
    console.error("💥 Room availability error:", error);
    throw error;
  }
};

// Get hotel room details using booking code
export const getHotelRoomDetails = async (bookingCode) => {
  try {
    console.log('🔍 Getting room details for booking code:', bookingCode);
    
    const response = await fetch(`${PROXY_SERVER_URL}/hotel-room`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ BookingCode: bookingCode }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Room details error:', errorText);
      throw new Error(`Room details error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Room details response:', data);
    return data;
  } catch (error) {
    console.error('💥 Room details error:', error);
    throw error;
  }
};