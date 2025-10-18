# Backend Deployment Guide for Elastic Beanstalk

## 🚀 Quick Deploy

The backend has been updated with hotel and room endpoints. Follow these steps to deploy to Elastic Beanstalk.

## 📋 Prerequisites

1. AWS CLI installed and configured
2. EB CLI installed (`pip install awsebcli`)
3. AWS credentials with Elastic Beanstalk permissions

## 🔧 Deployment Steps

### Option 1: Using EB CLI (Recommended)

1. **Initialize EB (if not already done):**
   ```bash
   cd /Users/utsavgautam/Downloads/Y-SoC-final--main/backend
   eb init -p python-3.9 hotelrbs --region us-east-1
   ```

2. **Deploy the updated application:**
   ```bash
   eb deploy
   ```

3. **Check deployment status:**
   ```bash
   eb status
   eb health
   ```

### Option 2: Using AWS Console

1. **Create a deployment package:**
   ```bash
   cd /Users/utsavgautam/Downloads/Y-SoC-final--main/backend
   zip -r backend-deployment.zip . -x "*.git*" -x "*__pycache__*" -x "*.xlsx"
   ```

2. **Upload to Elastic Beanstalk:**
   - Go to AWS Elastic Beanstalk Console
   - Select your environment (hotelrbs)
   - Click "Upload and Deploy"
   - Upload `backend-deployment.zip`
   - Click "Deploy"

### Option 3: Quick Test Locally First

Before deploying, test the new endpoints locally:

```bash
cd /Users/utsavgautam/Downloads/Y-SoC-final--main/backend
python app.py
```

Then test the endpoints:

```bash
# Test hotel endpoint
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

# Test room endpoint
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
```

## 📝 New Endpoints Added

### POST /hotel/add-hotel
Stores hotel details in `hotels.xlsx`

**Request Body:**
```json
{
  "hotel_code": "HTL123",
  "name": "Grand Hotel",
  "rating": 5,
  "address": "123 Street",
  "city_id": "DXB",
  "country_code": "AE",
  "map_lat": 25.2048,
  "map_lon": 55.2708,
  "facilities": {"wifi": true, "pool": true},
  "images": ["url1", "url2"]
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
Stores room details in `hotel_rooms.xlsx`

**Request Body:**
```json
{
  "room_id": "ROOM001",
  "hotel_code": "HTL123",
  "booking_code": "BKG001",
  "room_name": "Deluxe Suite",
  "base_price": 150.0,
  "total_fare": 200.0,
  "currency": "USD",
  "is_refundable": true,
  "day_rates": {"2025-10-10": 150},
  "extras": {"breakfast": true, "wifi": true}
}
```

**Response:**
```json
{
  "success": true,
  "message": "Hotel room added successfully"
}
```

## 🔍 Verify Deployment

After deployment, test the live endpoints:

```bash
# Test hotel endpoint
curl -X POST http://hotelrbs.us-east-1.elasticbeanstalk.com/hotel/add-hotel \
  -H "Content-Type: application/json" \
  -d '{"hotel_code":"TEST123","name":"Test Hotel","rating":5,"address":"Test Address","city_id":"DXB","country_code":"AE","map_lat":25.2048,"map_lon":55.2708,"facilities":{"wifi":true},"images":[]}'

# Test room endpoint
curl -X POST http://hotelrbs.us-east-1.elasticbeanstalk.com/hotelRoom/add \
  -H "Content-Type: application/json" \
  -d '{"room_id":"ROOM001","hotel_code":"TEST123","booking_code":"BKG001","room_name":"Deluxe Suite","base_price":150.0,"total_fare":200.0,"currency":"USD","is_refundable":true,"day_rates":{},"extras":{"breakfast":true}}'
```

## 📊 Files Created

After deployment, the backend will automatically create:
- `hotels.xlsx` - Stores hotel data
- `hotel_rooms.xlsx` - Stores room data

## ⚠️ Important Notes

1. **Excel Files**: The Excel files will be created automatically on first request
2. **Persistence**: Excel files are stored on the EC2 instance. For production, consider using S3 or a database
3. **CORS**: CORS is enabled for all origins
4. **Port**: The app runs on port 5000 by default

## 🐛 Troubleshooting

If endpoints return 500 errors:
1. Check EB logs: `eb logs`
2. Verify Python version compatibility
3. Ensure all dependencies are in requirements.txt
4. Check file permissions for Excel file creation

## 📦 Updated Files

- `app.py` - Added hotel and room endpoints
- `application.py` - Elastic Beanstalk entry point
- `requirements.txt` - Verify dependencies are listed
