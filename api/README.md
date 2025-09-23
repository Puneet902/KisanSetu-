# KisanSetu API Server

A REST API server for accessing KisanSetu mobile app user data stored in Supabase.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd api
npm install
```

### 2. Setup Environment
Make sure your `.env` file in the root directory contains:
```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
PORT=3000
```

### 3. Setup Supabase Function
Run the SQL from `supabase-functions.sql` in your Supabase SQL Editor to enable location-based queries.

### 4. Start the Server
```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Check server status |
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| GET | `/api/users/search/phone/:phone` | Search by phone |
| GET | `/api/users/search/name/:name` | Search by name |
| GET | `/api/users/location/nearby` | Get nearby users |
| GET | `/api/stats` | Get database statistics |

## 📖 Documentation

See `API_DOCUMENTATION.md` for detailed API documentation with examples.

## 🔧 Usage Example

```javascript
// Fetch all users
const response = await fetch('http://localhost:3000/api/users');
const data = await response.json();

if (data.success) {
  console.log('Users:', data.data);
} else {
  console.error('Error:', data.error);
}
```

## 🤝 For Your Friend

Your friend can use this API to fetch data from your KisanSetu app database. Share:

1. **API Documentation**: `API_DOCUMENTATION.md`
2. **Client Example**: `client-example.js`
3. **Server URL**: `http://your-server-ip:3000/api`

## 🔒 Security Notes

- The API currently uses Supabase's built-in security
- Consider adding API key authentication for production
- Enable CORS only for trusted domains in production
- Use HTTPS in production environment

## 📦 Dependencies

- **express**: Web server framework
- **@supabase/supabase-js**: Supabase client
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variable management
