const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://tdeelzkzirdzapkabkuq.supabase.co';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// API Routes

// GET /api/users - Fetch all users
app.get('/api/users', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }

    res.json({
      success: true,
      data: data,
      count: data.length
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// GET /api/users/:id - Fetch user by ID
app.get('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ 
        success: false, 
        error: 'User not found' 
      });
    }

    res.json({
      success: true,
      data: data
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// GET /api/users/search/phone/:phone - Search user by phone
app.get('/api/users/search/phone/:phone', async (req, res) => {
  try {
    const { phone } = req.params;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('phone', phone);

    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }

    res.json({
      success: true,
      data: data,
      count: data.length
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// GET /api/users/search/name/:name - Search user by name
app.get('/api/users/search/name/:name', async (req, res) => {
  try {
    const { name } = req.params;
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .ilike('name', `%${name}%`);

    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }

    res.json({
      success: true,
      data: data,
      count: data.length
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// GET /api/users/location/nearby - Get users within a radius (in km)
app.get('/api/users/location/nearby', async (req, res) => {
  try {
    const { lat, lng, radius = 10 } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({
        success: false,
        error: 'Latitude and longitude are required'
      });
    }

    // Using Supabase PostGIS functions for location-based queries
    const { data, error } = await supabase
      .rpc('nearby_users', {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
        radius_km: parseFloat(radius)
      });

    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }

    res.json({
      success: true,
      data: data,
      count: data.length,
      filters: {
        latitude: parseFloat(lat),
        longitude: parseFloat(lng),
        radius_km: parseFloat(radius)
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// GET /api/stats - Get database statistics
app.get('/api/stats', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id', { count: 'exact' });

    if (error) {
      return res.status(400).json({ 
        success: false, 
        error: error.message 
      });
    }

    // Get users registered today
    const today = new Date().toISOString().split('T')[0];
    const { data: todayUsers, error: todayError } = await supabase
      .from('users')
      .select('id', { count: 'exact' })
      .gte('created_at', `${today}T00:00:00.000Z`)
      .lt('created_at', `${today}T23:59:59.999Z`);

    res.json({
      success: true,
      stats: {
        total_users: data.length,
        users_today: todayUsers ? todayUsers.length : 0,
        last_updated: new Date().toISOString()
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'KisanSetu API is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 KisanSetu API Server running on port ${PORT}`);
  console.log(`📊 API Documentation available at http://localhost:${PORT}/api/health`);
});

module.exports = app;
