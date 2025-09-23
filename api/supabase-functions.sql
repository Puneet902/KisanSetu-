-- SQL functions to run in your Supabase SQL Editor

-- Function to find nearby users within a radius
CREATE OR REPLACE FUNCTION nearby_users(lat FLOAT, lng FLOAT, radius_km FLOAT DEFAULT 10)
RETURNS TABLE (
  id UUID,
  name TEXT,
  phone TEXT,
  latitude FLOAT8,
  longitude FLOAT8,
  created_at TIMESTAMPTZ,
  distance_km FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.name,
    u.phone,
    u.latitude,
    u.longitude,
    u.created_at,
    (
      6371 * acos(
        cos(radians(lat)) * 
        cos(radians(u.latitude)) * 
        cos(radians(u.longitude) - radians(lng)) + 
        sin(radians(lat)) * 
        sin(radians(u.latitude))
      )
    ) AS distance_km
  FROM users u
  WHERE (
    6371 * acos(
      cos(radians(lat)) * 
      cos(radians(u.latitude)) * 
      cos(radians(u.longitude) - radians(lng)) + 
      sin(radians(lat)) * 
      sin(radians(u.latitude))
    )
  ) <= radius_km
  ORDER BY distance_km;
END;
$$ LANGUAGE plpgsql;
