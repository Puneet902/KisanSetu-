# KisanSetu API Documentation

## Base URL
```
http://localhost:3000/api
```

## Authentication
Currently, the API uses Supabase's Row Level Security. No additional authentication is required for read operations.

## Endpoints

### 1. Health Check
**GET** `/api/health`

Check if the API server is running.

**Response:**
```json
{
  "success": true,
  "message": "KisanSetu API is running",
  "timestamp": "2025-01-23T11:48:00.000Z"
}
```

---

### 2. Get All Users
**GET** `/api/users`

Fetch all registered users from the database.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "name": "John Doe",
      "phone": "+1234567890",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "created_at": "2025-01-23T11:48:00.000Z"
    }
  ],
  "count": 1
}
```

---

### 3. Get User by ID
**GET** `/api/users/:id`

Fetch a specific user by their UUID.

**Parameters:**
- `id` (string): User UUID

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "John Doe",
    "phone": "+1234567890",
    "latitude": 28.6139,
    "longitude": 77.2090,
    "created_at": "2025-01-23T11:48:00.000Z"
  }
}
```

---

### 4. Search User by Phone
**GET** `/api/users/search/phone/:phone`

Find users by phone number.

**Parameters:**
- `phone` (string): Phone number to search

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "name": "John Doe",
      "phone": "+1234567890",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "created_at": "2025-01-23T11:48:00.000Z"
    }
  ],
  "count": 1
}
```

---

### 5. Search User by Name
**GET** `/api/users/search/name/:name`

Find users by name (partial match supported).

**Parameters:**
- `name` (string): Name to search (case-insensitive)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "name": "John Doe",
      "phone": "+1234567890",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "created_at": "2025-01-23T11:48:00.000Z"
    }
  ],
  "count": 1
}
```

---

### 6. Get Nearby Users
**GET** `/api/users/location/nearby`

Find users within a specified radius from a location.

**Query Parameters:**
- `lat` (float): Latitude
- `lng` (float): Longitude  
- `radius` (float, optional): Radius in kilometers (default: 10)

**Example:**
```
GET /api/users/location/nearby?lat=28.6139&lng=77.2090&radius=5
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "name": "John Doe",
      "phone": "+1234567890",
      "latitude": 28.6139,
      "longitude": 77.2090,
      "created_at": "2025-01-23T11:48:00.000Z",
      "distance_km": 2.5
    }
  ],
  "count": 1,
  "filters": {
    "latitude": 28.6139,
    "longitude": 77.2090,
    "radius_km": 5
  }
}
```

---

### 7. Get Statistics
**GET** `/api/stats`

Get database statistics including total users and daily registrations.

**Response:**
```json
{
  "success": true,
  "stats": {
    "total_users": 150,
    "users_today": 5,
    "last_updated": "2025-01-23T11:48:00.000Z"
  }
}
```

---

## Error Responses

All endpoints return consistent error responses:

```json
{
  "success": false,
  "error": "Error message here"
}
```

**HTTP Status Codes:**
- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error

---

## Example Usage (JavaScript/Node.js)

```javascript
// Fetch all users
const response = await fetch('http://localhost:3000/api/users');
const data = await response.json();

if (data.success) {
  console.log('Users:', data.data);
  console.log('Total count:', data.count);
} else {
  console.error('Error:', data.error);
}

// Search by phone
const phoneResponse = await fetch('http://localhost:3000/api/users/search/phone/+1234567890');
const phoneData = await phoneResponse.json();

// Get nearby users
const nearbyResponse = await fetch('http://localhost:3000/api/users/location/nearby?lat=28.6139&lng=77.2090&radius=10');
const nearbyData = await nearbyResponse.json();
```

---

## Setup Instructions

1. **Install dependencies:**
   ```bash
   cd api
   npm install
   ```

2. **Run the server:**
   ```bash
   npm start
   # or for development with auto-reload:
   npm run dev
   ```

3. **Add SQL function to Supabase:**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the SQL from `supabase-functions.sql`

4. **Environment variables:**
   Make sure your `.env` file contains:
   ```
   EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=3000
   ```
