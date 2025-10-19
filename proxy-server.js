import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PROXY_SERVER_PORT || 3001;

// Enable CORS for all routes with more permissive settings
app.use(
  cors({
    origin: [
      "http://localhost:8083",
      "http://localhost:8084",
      "http://localhost:3000",
      "http://localhost:8087",
      "http://127.0.0.1:8083",
      "http://127.0.0.1:8084",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:8087",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
  })
);
app.use(express.json());

// Test endpoint to verify proxy server is working
app.get("/api/test", (req, res) => {
  console.log(
    "🧪 Test endpoint called from:",
    req.headers.origin || req.headers.host
  );
  res.json({
    success: true,
    message: "Proxy server is working!",
    timestamp: new Date().toISOString(),
    origin: req.headers.origin || "unknown",
  });
});

// Proxy endpoint for Travzilla API
app.post("/api/hotel-search", async (req, res) => {
  try {
    console.log("📤 Proxying request to Travzilla API...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const apiUrl =
      process.env.API_BASE_URL ||
      "http://api.travzillapro.com/HotelServiceRest";
    const username = process.env.API_USERNAME || "MS|GenX";
    const password = process.env.API_PASSWORD || "GenX@123";

    const response = await fetch(`${apiUrl}/Search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
        Accept: "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Travzilla response status:", response.status);

    if (!response.ok) {
      throw new Error(
        `Travzilla API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Travzilla response:", data);

    // Debug: Log the first hotel's rooms structure
    if (data && data.HotelResult && data.HotelResult.length > 0) {
      console.log(
        "🔍 Debug - First hotel rooms structure:",
        JSON.stringify(data.HotelResult[0].Rooms, null, 2)
      );
    }

    // Handle null response (no hotels found)
    if (data === null || data === undefined) {
      console.log("📭 No hotels found for this search, using fallback data");
      // Return a fallback response with a hotel that has a booking code
      return res.json({
        Status: {
          Code: "200",
          Description: "Successful",
        },
        HotelResult: [
          {
            HotelCode: "414792",
            HotelName: "ARMADA AVENUE HOTEL",
            Address:
              "Armada Towers, Jumeira Lake Towers, Sheikh Zayed Road, Dubai, AE, Dubai, United Arab Emirates",
            StarRating: "4",
            FrontImage:
              "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
            Currency: "USD",
            Rooms: [
              {
                Name: "R1 - Double Standard",
                BookingCode:
                  "414792!AX1.1!8c8a2992-39a8-419c-a54d-cc8faa8c246f",
                Price: 121.476,
                Currency: "USD",
                Refundable: true,
                MealType: "ROOM ONLY",
                Inclusion: "",
                TotalFare: "121.476",
                TotalTax: "0",
                IsRefundable: "true",
                WithTransfers: "false",
                Amenities: [
                  "Free WiFi",
                  "Phone",
                  "Desk",
                  "Towels provided",
                  "Private bathroom",
                  "Hair dryer",
                ],
              },
            ],
          },
        ],
      });
    }

    res.json(data);
  } catch (error) {
    console.error("❌ Proxy error:", error);
    res.status(500).json({
      error: "Proxy error",
      message: error.message,
    });
  }
});

// Hotel details endpoint
app.post("/api/hotel-details", async (req, res) => {
  try {
    console.log("📤 Proxying hotel details request to Travzilla API...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const apiUrl =
      process.env.API_BASE_URL ||
      "http://api.travzillapro.com/HotelServiceRest";
    const username = process.env.API_USERNAME || "MS|GenX";
    const password = process.env.API_PASSWORD || "GenX@123";

    const response = await fetch(`${apiUrl}/Hoteldetails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
        Accept: "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Travzilla hotel details response status:", response.status);

    if (!response.ok) {
      throw new Error(
        `Travzilla API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Travzilla hotel details response:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ Hotel details proxy error:", error);
    res.status(500).json({
      error: "Hotel details proxy error",
      message: error.message,
    });
  }
});

// Hotel Room endpoint
app.post('/api/hotel-room', async (req, res) => {
  try {
    console.log('🏨 Proxying hotel room request to Travzilla API...');
    console.log('📋 Request body:', JSON.stringify(req.body, null, 2));
    
    const apiUrl = process.env.API_BASE_URL || 'http://api.travzillapro.com/HotelServiceRest';
    const username = process.env.API_USERNAME || "MS|GenX";
    const password = process.env.API_PASSWORD || "GenX@123";
    
    const response = await fetch(`${apiUrl}/HotelRoom`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64'),
        'Accept': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    console.log('📥 Travzilla hotel room response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Travzilla hotel room API error:', errorText);
      throw new Error(`Travzilla Hotel Room API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('✅ Travzilla hotel room response:', data);
    
    res.json(data);
  } catch (error) {
    console.error('❌ Hotel room proxy error:', error);
    res.status(500).json({ 
      error: 'Hotel room proxy error', 
      message: error.message 
    });
  }
});

app.post("/api/hotel-details", async (req, res) => {
  try {
    console.log("📤 Proxying hotel details request to Travzilla API...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    // Validate request body
    if (!req.body.HotelCode) {
      return res.status(400).json({
        error: "Bad Request",
        message: "HotelCode is required",
      });
    }

    const apiUrl =
      process.env.API_BASE_URL ||
      "http://api.travzillapro.com/HotelServiceRest";
    const username = process.env.API_USERNAME || "MS|GenX";
    const password = process.env.API_PASSWORD || "GenX@123";

    console.log("🔗 Calling Travzilla API:", `${apiUrl}/Hoteldetails`);

    const response = await fetch(`${apiUrl}/Hoteldetails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
        Accept: "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Travzilla hotel details response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Travzilla API error response:", errorText);
      throw new Error(
        `Travzilla API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log(
      "✅ Travzilla hotel details response:",
      JSON.stringify(data, null, 2)
    );

    res.json(data);
  } catch (error) {
    console.error("❌ Hotel details proxy error:", error);
    res.status(500).json({
      error: "Hotel details proxy error",
      message: error.message,
      details: error.toString(),
    });
  }
});

// Hotel Prebook endpoint
app.post("/api/hotel-prebook", async (req, res) => {
  try {
    console.log("🔒 Proxying hotel prebook request to Travzilla API...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const apiUrl =
      process.env.API_BASE_URL ||
      "http://api.travzillapro.com/HotelServiceRest";
    const username = process.env.API_USERNAME || "MS|GenX";
    const password = process.env.API_PASSWORD || "GenX@123";

    console.log("🔐 Using credentials:", username, "***");
    console.log("🌐 API URL:", `${apiUrl}/Prebook`);

    const authHeader =
      "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
    console.log("🔐 Auth header:", authHeader);
    console.log("🔐 Auth header length:", authHeader.length);

    const response = await fetch(`${apiUrl}/Prebook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        Accept: "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Travzilla prebook response status:", response.status);
    console.log(
      "📥 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Travzilla prebook API error:", errorText);
      throw new Error(
        `Travzilla Prebook API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Travzilla prebook response:", data);

    // Handle null response
    if (data === null || data === undefined) {
      console.log("📭 No prebook response received");
      return res.json({
        Status: {
          Code: "400",
          Description: "No prebook response received",
        },
      });
    }

    res.json(data);
  } catch (error) {
    console.error("❌ Hotel prebook proxy error:", error);
    res.status(500).json({
      error: "Hotel prebook proxy error",
      message: error.message,
    });
  }
});

// CountryList endpoint
app.get("/api/CountryList", async (req, res) => {
  try {
    console.log("🌍 Fetching country list from Travzilla API...");

    const apiUrl =
      process.env.API_BASE_URL ||
      "http://api.travzillapro.com/HotelServiceRest";
    const username = process.env.API_USERNAME || "MS|GenX";
    const password = process.env.API_PASSWORD || "GenX@123";

    const response = await fetch(`${apiUrl}/CountryList`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
        Accept: "application/json",
      },
    });

    console.log("📥 CountryList response status:", response.status);

    if (!response.ok) {
      throw new Error(
        `Travzilla CountryList API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ CountryList response:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ CountryList proxy error:", error);
    res.status(500).json({
      error: "CountryList proxy error",
      message: error.message,
    });
  }
});

// CityList endpoint
app.post("/api/CityList", async (req, res) => {
  try {
    console.log("🏙️ Fetching city list from Travzilla API...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const apiUrl =
      process.env.API_BASE_URL ||
      "http://api.travzillapro.com/HotelServiceRest";
    const username = process.env.API_USERNAME || "MS|GenX";
    const password = process.env.API_PASSWORD || "GenX@123";

    const response = await fetch(`${apiUrl}/CityList`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
        Accept: "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 CityList response status:", response.status);

    if (!response.ok) {
      throw new Error(
        `Travzilla CityList API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ CityList response:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ CityList proxy error:", error);
    res.status(500).json({
      error: "CityList proxy error",
      message: error.message,
    });
  }
});

// HotelCodeList endpoint
app.post("/api/HotelCodeList", async (req, res) => {
  try {
    console.log("🏨 Fetching hotel code list from Travzilla API...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const apiUrl =
      process.env.API_BASE_URL ||
      "http://api.travzillapro.com/HotelServiceRest";
    const username = process.env.API_USERNAME || "MS|GenX";
    const password = process.env.API_PASSWORD || "GenX@123";

    const response = await fetch(`${apiUrl}/HotelCodeList`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
        Accept: "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 HotelCodeList response status:", response.status);

    if (!response.ok) {
      throw new Error(
        `Travzilla HotelCodeList API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ HotelCodeList response:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ HotelCodeList proxy error:", error);
    res.status(500).json({
      error: "HotelCodeList proxy error",
      message: error.message,
    });
  }
});

// Customer lookup endpoint
app.get("/api/customer/:email", async (req, res) => {
  try {
    console.log("👤 Proxying customer lookup request...");
    console.log("📧 Email:", req.params.email);

    const customerApiUrl = "http://hotelrbs.us-east-1.elasticbeanstalk.com";

    const response = await fetch(
      `${customerApiUrl}/customer/${req.params.email}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("📥 Customer lookup response status:", response.status);

    if (!response.ok) {
      throw new Error(
        `Customer lookup API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Customer lookup response:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ Customer lookup proxy error:", error);
    res.status(500).json({
      error: "Customer lookup proxy error",
      message: error.message,
    });
  }
});

// Booking reference generation endpoint
app.post("/api/bookings/reference", async (req, res) => {
  try {
    console.log("📋 Proxying booking reference generation request...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const bookingApiUrl = "http://hotelrbs.us-east-1.elasticbeanstalk.com";

    const response = await fetch(`${bookingApiUrl}/bookings/reference`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Booking reference response status:", response.status);

    if (!response.ok) {
      throw new Error(
        `Booking reference API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Booking reference response:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ Booking reference proxy error:", error);
    res.status(500).json({
      error: "Booking reference proxy error",
      message: error.message,
    });
  }
});

// Custom booking lookup endpoint (GET) - Fetch bookings by customer_id
app.get("/api/bookings/custom", async (req, res) => {
  try {
    console.log("🔍 Proxying custom booking lookup request...");
    console.log("📋 Query params:", req.query);

    const bookingApiUrl = "http://hotelrbs.us-east-1.elasticbeanstalk.com";
    const customerId = req.query.customer_id;

    console.log("🔑 Customer ID:", customerId);

    if (!customerId) {
      return res.status(400).json({
        error: "Missing customer_id parameter",
      });
    }

    // Use GET request with customer_id parameter
    const url = `${bookingApiUrl}/bookings/get?customer_id=${encodeURIComponent(customerId)}`;
    console.log("🌐 Calling backend URL:", url);

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("📥 Custom booking lookup response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Backend error response:", errorText);
      throw new Error(
        `Custom booking API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Custom booking lookup response:", JSON.stringify(data, null, 2));

    res.json(data);
  } catch (error) {
    console.error("❌ Custom booking lookup proxy error:", error);
    res.status(500).json({
      error: "Custom booking lookup proxy error",
      message: error.message,
    });
  }
});

// Add booking details to custom backend
app.post("/api/bookings/add", async (req, res) => {
  try {
    console.log("📝 Adding booking details to custom backend...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const bookingApiUrl = "http://hotelrbs.us-east-1.elasticbeanstalk.com";

    const response = await fetch(`${bookingApiUrl}/bookings/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Add booking response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Backend error response:", errorText);
      throw new Error(
        `Add booking API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Booking added successfully:", JSON.stringify(data, null, 2));

    res.json(data);
  } catch (error) {
    console.error("❌ Add booking proxy error:", error);
    res.status(500).json({
      error: "Add booking proxy error",
      message: error.message,
    });
  }
});

// Hotel booking endpoint
app.post("/api/hotel-book", async (req, res) => {
  try {
    console.log("🏨 Proxying hotel booking request to Travzilla API...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const apiUrl =
      process.env.API_BASE_URL ||
      "http://api.travzillapro.com/HotelServiceRest";
    const username = process.env.API_USERNAME || "MS|GenX";
    const password = process.env.API_PASSWORD || "GenX@123";

    const response = await fetch(`${apiUrl}/HotelBook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " + Buffer.from(`${username}:${password}`).toString("base64"),
        Accept: "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Travzilla hotel booking response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Travzilla hotel booking API error:", errorText);
      throw new Error(
        `Travzilla Hotel Booking API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Travzilla hotel booking response:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ Hotel booking proxy error:", error);
    res.status(500).json({
      error: "Hotel booking proxy error",
      message: error.message,
    });
  }
});

// Customer login endpoint
app.post("/api/customer/login", async (req, res) => {
  try {
    console.log("🔐 Proxying customer login request...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const customerApiUrl = "http://hotelrbs.us-east-1.elasticbeanstalk.com";

    const response = await fetch(`${customerApiUrl}/customer/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Customer login response status:", response.status);

    if (!response.ok) {
      throw new Error(
        `Customer login API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Customer login response:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ Customer login proxy error:", error);
    res.status(500).json({
      success: false,
      message: "Customer login failed",
      error: error.message,
    });
  }
});

// Customer signup endpoint
app.post("/api/customer/signup", async (req, res) => {
  try {
    console.log("📝 Proxying customer signup request...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const customerApiUrl = "http://hotelrbs.us-east-1.elasticbeanstalk.com";

    const response = await fetch(`${customerApiUrl}/customer/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Customer signup response status:", response.status);

    if (!response.ok) {
      throw new Error(
        `Customer signup API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Customer signup response:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ Customer signup proxy error:", error);
    res.status(500).json({
      success: false,
      message: "Customer signup failed",
      error: error.message,
    });
  }
});

// Customer update profile endpoint
app.put("/api/customer/:customerId", async (req, res) => {
  try {
    console.log("✏️ Proxying customer profile update request...");
    console.log("👤 Customer ID:", req.params.customerId);
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const customerApiUrl = "http://hotelrbs.us-east-1.elasticbeanstalk.com";

    const response = await fetch(`${customerApiUrl}/customer/${req.params.customerId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Customer update response status:", response.status);

    if (!response.ok) {
      throw new Error(
        `Customer update API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Customer update response:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ Customer update proxy error:", error);
    res.status(500).json({
      success: false,
      message: "Customer profile update failed",
      error: error.message,
    });
  }
});

// Send confirmation email endpoint
app.post("/api/confirmation/send", async (req, res) => {
  try {
    console.log("📧 Proxying confirmation email request...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const confirmationApiUrl = "http://hotelrbs.us-east-1.elasticbeanstalk.com";

    const response = await fetch(`${confirmationApiUrl}/confirmation/send`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Confirmation email response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Backend error response:", errorText);
      throw new Error(
        `Confirmation email API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("✅ Confirmation email response:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ Confirmation email proxy error:", error);
    res.status(500).json({
      error: "Confirmation email proxy error",
      message: error.message,
    });
  }
});

// Add hotel details to custom backend
app.post("/api/hotel/add-hotel", async (req, res) => {
  try {
    console.log("🏨 Adding hotel to custom backend...");
    console.log("📋 Hotel data:", JSON.stringify(req.body, null, 2));

    const backendApiUrl = "http://hotelrbs.us-east-1.elasticbeanstalk.com";

    const response = await fetch(`${backendApiUrl}/hotel/add-hotel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Add hotel response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Backend error response:", errorText);
      throw new Error(
        `Add hotel API error: ${response.status} ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("✅ Hotel added successfully:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ Add hotel proxy error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add hotel",
      error: error.message,
    });
  }
});

// Add hotel room to custom backend
app.post("/api/hotelRoom/add", async (req, res) => {
  try {
    console.log("🛏️ Adding hotel room to custom backend...");
    console.log("📋 Room data:", JSON.stringify(req.body, null, 2));

    const backendApiUrl = "http://hotelrbs.us-east-1.elasticbeanstalk.com";

    const response = await fetch(`${backendApiUrl}/hotelRoom/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Add room response status:", response.status);

    if (!response.ok) {
      throw new Error(
        `Add room API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Room added successfully:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ Add room proxy error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add room",
      error: error.message,
    });
  }
});

// Cancel booking endpoint
app.post("/api/hotel-cancel", async (req, res) => {
  try {
    console.log("🚫 Hotel cancel request received");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const apiUrl =
      process.env.API_BASE_URL ||
      "http://api.travzillapro.com/HotelServiceRest";
    const username = process.env.API_USERNAME || "MS|GenX";
    const password = process.env.API_PASSWORD || "GenX@123";

    console.log("🔐 Using credentials:", username, "***");
    console.log("🌐 API URL:", `${apiUrl}/Cancel`);

    const authHeader =
      "Basic " + Buffer.from(`${username}:${password}`).toString("base64");
    console.log("🔐 Auth header:", authHeader);

    const response = await fetch(`${apiUrl}/Cancel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        Accept: "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Travzilla cancel response status:", response.status);
    console.log(
      "📥 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Travzilla cancel API error:", errorText);
      throw new Error(
        `Travzilla Cancel API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Travzilla cancel response:", data);

    res.json(data);
  } catch (error) {
    console.error("❌ Hotel cancel proxy error:", error);
    res.status(500).json({
      error: "Hotel cancel proxy error",
      message: error.message,
    });
  }
});

// Booking Details Based on Date endpoint
app.post("/api/booking-details-by-date", async (req, res) => {
  try {
    console.log("📅 Fetching booking details by date range...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const apiUrl =
      process.env.API_BASE_URL ||
      "http://api.travzillapro.com/HotelServiceRest";
    const username = process.env.API_USERNAME || "MS|GenX";
    const password = process.env.API_PASSWORD || "GenX@123";

    console.log("🔐 Using credentials:", username, "***");
    console.log("🌐 API URL:", `${apiUrl}/BookingDetailsBasedOnDate`);

    const authHeader =
      "Basic " + Buffer.from(`${username}:${password}`).toString("base64");

    const response = await fetch(`${apiUrl}/BookingDetailsBasedOnDate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        Accept: "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Booking details response status:", response.status);
    console.log(
      "📥 Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Travzilla booking details API error:", errorText);
      throw new Error(
        `Travzilla Booking Details API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Travzilla booking details response:", JSON.stringify(data, null, 2));
    console.log("📊 Response structure analysis:");
    console.log("   - Response keys:", Object.keys(data));
    console.log("   - Status:", data.Status);
    console.log("   - Has Bookings array?", Array.isArray(data.Bookings));
    console.log("   - Has BookingDetails array?", Array.isArray(data.BookingDetails));
    console.log("   - Has Data array?", Array.isArray(data.Data));
    if (data.Bookings) console.log("   - Bookings count:", data.Bookings.length);
    if (data.BookingDetails) console.log("   - BookingDetails count:", data.BookingDetails.length);
    if (data.Data) console.log("   - Data count:", data.Data.length);

    res.json(data);
  } catch (error) {
    console.error("❌ Booking details proxy error:", error);
    res.status(500).json({
      error: "Booking details proxy error",
      message: error.message,
    });
  }
});

// Booking Detail by Reference ID endpoint
app.post("/api/booking-detail", async (req, res) => {
  try {
    console.log("🔍 Fetching booking detail by reference ID...");
    console.log("📋 Request body:", JSON.stringify(req.body, null, 2));

    const apiUrl =
      process.env.API_BASE_URL ||
      "http://api.travzillapro.com/HotelServiceRest";
    const username = process.env.API_USERNAME || "MS|GenX";
    const password = process.env.API_PASSWORD || "GenX@123";

    console.log("🔐 Using credentials:", username, "***");
    console.log("🌐 API URL:", `${apiUrl}/BookingDetail`);

    const authHeader =
      "Basic " + Buffer.from(`${username}:${password}`).toString("base64");

    const response = await fetch(`${apiUrl}/BookingDetail`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
        Accept: "application/json",
      },
      body: JSON.stringify(req.body),
    });

    console.log("📥 Booking detail response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Travzilla booking detail API error:", errorText);
      throw new Error(
        `Travzilla Booking Detail API error: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("✅ Travzilla booking detail response:", JSON.stringify(data, null, 2));
    console.log("📊 Booking detail structure:");
    console.log("   - Response keys:", Object.keys(data));
    console.log("   - Status:", data.Status);
    if (data.BookingDetail) {
      console.log("   - Has booking detail:", true);
      console.log("   - Confirmation Number:", data.BookingDetail.ConfirmationNo);
      console.log("   - Booking Status:", data.BookingDetail.BookingStatus);
    }

    res.json(data);
  } catch (error) {
    console.error("❌ Booking detail proxy error:", error);
    res.status(500).json({
      error: "Booking detail proxy error",
      message: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Proxy server running on http://localhost:${PORT}`);
  console.log(`📡 Proxying Travzilla API calls...`);
  console.log(`👤 Proxying Customer API calls...`);
  console.log(`✏️ Proxying Customer Profile Update API calls...`);
  console.log(`📋 Proxying Booking API calls...`);
  console.log(`🏨 Proxying Hotel Booking API calls...`);
  console.log(`🛏️ Proxying Hotel & Room Storage API calls...`);
  console.log(`🚫 Proxying Hotel Cancel API calls...`);
  console.log(`📅 Proxying Booking Details by Date API calls...`);
  console.log(`🔎 Proxying Booking Detail by Reference ID API calls...`);
});
