# Hotel Booking Backend API

A Flask backend service for storing hotel and room booking details.

## 🏨 Features

- **POST /hotel/add-hotel** - Store hotel details
- **POST /hotelRoom/add** - Store room details
- **GET /hotels** - Retrieve all hotels
- **GET /rooms** - Retrieve all rooms
- **GET /health** - Health check endpoint
- Automatic Excel file creation with proper headers
- Data validation for required fields
- CORS enabled for all origins
- Comprehensive error handling and logging

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Run the Server

```bash
python hotel_app.py
```

The server will start on `http://localhost:5000`

## 📊 API Endpoints

### POST /hotel/add-hotel

Store hotel details in the database.

**Request Body:**
```json
{
  "hotel_code": "HTL123",
  "name": "Grand Palace Hotel",
  "rating": 5,
  "address": "123 Luxury Street, New York",
  "city_id": "NYC01",
  "country_code": "US",
  "map_lat": 40.712776,
  "map_lon": -74.005974,
  "facilities": {
    "wifi": true,
    "pool": true,
    "parking": true,
    "gym": false
  },
  "images": [
    "https://example.com/hotel1.jpg",
    "https://example.com/hotel2.jpg"
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Hotel added successfully"
}
```

### POST /hotelRoom/add

Store room details in the database.

**Request Body:**
```json
{
  "room_id": "R001",
  "hotel_code": "HTL123",
  "booking_code": "BKG001",
  "room_name": "Deluxe Suite",
  "base_price": 150.00,
  "total_fare": 200.00,
  "currency": "USD",
  "is_refundable": true,
  "day_rates": {
    "2025-10-10": 150,
    "2025-10-11": 160
  },
  "extras": {
    "breakfast": true,
    "wifi": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Hotel room added successfully"
}
```

### GET /hotels

Retrieve all stored hotels.

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 5
}
```

### GET /rooms

Retrieve all stored rooms.

**Response:**
```json
{
  "success": true,
  "data": [...],
  "count": 10
}
```

### GET /health

Check if the server is running.

**Response:**
```json
{
  "status": "success",
  "message": "Hotel booking backend is running"
}
```

## 💾 Data Storage

Data is stored in Excel files:
- `hotels.xlsx` - Hotel details
- `hotel_rooms.xlsx` - Room details

Each record includes a timestamp for tracking.

## 🧪 Testing

Test the API using curl:

```bash
# Health check
curl http://localhost:5000/health

# Add hotel
curl -X POST http://localhost:5000/hotel/add-hotel \
  -H "Content-Type: application/json" \
  -d '{
    "hotel_code": "TEST123",
    "name": "Test Hotel",
    "rating": 5,
    "address": "123 Test St",
    "city_id": "DXB",
    "country_code": "AE",
    "map_lat": 25.2048,
    "map_lon": 55.2708,
    "facilities": {"wifi": true},
    "images": []
  }'

# Add room
curl -X POST http://localhost:5000/hotelRoom/add \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": "ROOM001",
    "hotel_code": "TEST123",
    "booking_code": "BKG001",
    "room_name": "Deluxe Suite",
    "base_price": 150.0,
    "total_fare": 200.0,
    "currency": "USD",
    "is_refundable": true,
    "day_rates": {},
    "extras": {"breakfast": true}
  }'

# Get all hotels
curl http://localhost:5000/hotels

# Get all rooms
curl http://localhost:5000/rooms
```

## 🚀 Deployment to AWS Elastic Beanstalk

### Option 1: EB CLI

```bash
eb init -p python-3.9 hotel-booking-api --region us-east-1
eb create hotel-booking-env
eb deploy
```

### Option 2: AWS Console

1. Create a deployment package:
   ```bash
   zip -r hotel-backend.zip . -x "*.git*" -x "*__pycache__*" -x "*.xlsx"
   ```

2. Go to AWS Elastic Beanstalk Console
3. Create new application or select existing
4. Upload `hotel-backend.zip`
5. Deploy

### Option 3: Use existing deployment package

The `backend-deployment.zip` file is ready to deploy.

## 📁 Project Structure

```
backend/
├── hotel_app.py          # Main Flask application (hotel-only)
├── app.py                # Original app (includes other endpoints)
├── application.py        # Elastic Beanstalk entry point
├── requirements.txt      # Python dependencies
├── hotels.xlsx          # Hotel data storage (auto-created)
├── hotel_rooms.xlsx     # Room data storage (auto-created)
└── README.md            # This file
```

## 🔧 Configuration

- **Port:** 5000 (default)
- **Host:** 0.0.0.0 (all interfaces)
- **CORS:** Enabled for all origins
- **Debug Mode:** Enabled (disable in production)

## ⚠️ Error Handling

The API returns appropriate HTTP status codes:
- **200** - Success
- **400** - Bad Request (missing required fields)
- **500** - Internal Server Error

All errors include descriptive messages in the response.

## 📝 Required Fields

### Hotel
- `hotel_code` (string)
- `name` (string)
- `rating` (number)
- `address` (string)

### Room
- `room_id` (string)
- `hotel_code` (string)
- `booking_code` (string)
- `room_name` (string)

## 🔒 Security Notes

- CORS is enabled for all origins (restrict in production)
- No authentication implemented (add for production)
- Excel files stored locally (consider database for production)
- Debug mode enabled (disable in production)

## 📦 Dependencies

- Flask==2.3.3
- flask-cors==4.0.0
- pandas==2.1.4
- openpyxl==3.1.2
- Werkzeug==2.3.7

## 🤝 Integration

This backend integrates with the hotel booking frontend via proxy server:
- Frontend → Proxy Server → This Backend
- Stores hotel and room details after successful prebook
- Non-blocking: Booking continues even if storage fails

## 📞 Support

For issues or questions, check the deployment guides:
- `DEPLOYMENT_GUIDE.md` - Detailed deployment instructions
- `BACKEND_FIX_SUMMARY.md` - Implementation summary
