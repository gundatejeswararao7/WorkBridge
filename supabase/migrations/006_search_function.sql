CREATE OR REPLACE FUNCTION search_people(
  search_query TEXT DEFAULT NULL,
  search_category TEXT DEFAULT NULL,
  user_lat DOUBLE PRECISION DEFAULT NULL,
  user_lng DOUBLE PRECISION DEFAULT NULL,
  search_radius DOUBLE PRECISION DEFAULT 50,
  search_availability TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  email TEXT,
  full_name TEXT,
  about TEXT,
  profession TEXT,
  location TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  experience TEXT,
  availability TEXT,
  category TEXT,
  profile_photo_url TEXT,
  work_can_provide TEXT,
  work_interested_in TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  distance_km DOUBLE PRECISION,
  skills JSON
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT
    p.id,
    p.email,
    p.full_name,
    p.about,
    p.profession,
    p.location,
    p.latitude,
    p.longitude,
    p.experience,
    p.availability,
    p.category,
    p.profile_photo_url,
    p.work_can_provide,
    p.work_interested_in,
    p.created_at,
    p.updated_at,
    CASE
      WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL
      THEN (earth_distance(ll_to_earth(p.latitude, p.longitude), ll_to_earth(user_lat, user_lng)) / 1000.0)
      ELSE NULL
    END AS distance_km,
    COALESCE(
      (SELECT json_agg(json_build_object('id', s.id, 'name', s.name, 'category', s.category))
       FROM user_skills us JOIN skills s ON us.skill_id = s.id WHERE us.user_id = p.id),
      '[]'::json
    ) AS skills
  FROM profiles p
  LEFT JOIN user_skills us ON p.id = us.user_id
  LEFT JOIN skills s ON us.skill_id = s.id
  WHERE
    (search_query IS NULL OR search_query = '' OR
     p.full_name ILIKE '%' || search_query || '%' OR
     p.profession ILIKE '%' || search_query || '%' OR
     s.name ILIKE '%' || search_query || '%')
    AND
    (search_category IS NULL OR search_category = '' OR search_category = 'all' OR
     p.category = search_category OR p.category = 'both' OR
     s.category = search_category)
    AND
    (search_availability IS NULL OR search_availability = '' OR
     p.availability = search_availability)
    AND
    (user_lat IS NULL OR user_lng IS NULL OR p.latitude IS NULL OR p.longitude IS NULL OR
     earth_distance(ll_to_earth(p.latitude, p.longitude), ll_to_earth(user_lat, user_lng)) <= (search_radius * 1000.0))
  ORDER BY
    CASE
      WHEN user_lat IS NOT NULL AND user_lng IS NOT NULL AND p.latitude IS NOT NULL AND p.longitude IS NOT NULL
      THEN earth_distance(ll_to_earth(p.latitude, p.longitude), ll_to_earth(user_lat, user_lng))
      ELSE 999999999
    END ASC;
END;
$$ LANGUAGE plpgsql;
