-- ============================================
-- WorkBridge: Complete Database Setup
-- Run this ENTIRE file in Supabase SQL Editor
-- ============================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABLES
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  about TEXT DEFAULT '',
  profession TEXT DEFAULT '',
  location TEXT DEFAULT '',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  experience TEXT DEFAULT '',
  availability TEXT DEFAULT 'available' CHECK (availability IN ('available', 'busy', 'unavailable')),
  category TEXT DEFAULT 'both' CHECK (category IN ('tech', 'non-tech', 'both')),
  profile_photo_url TEXT DEFAULT '',
  work_can_provide TEXT DEFAULT '',
  work_interested_in TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL CHECK (category IN ('tech', 'non-tech')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  skill_id UUID REFERENCES skills(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_id)
);

CREATE TABLE works (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  category TEXT NOT NULL CHECK (category IN ('tech', 'non-tech')),
  required_skills TEXT[] DEFAULT '{}',
  location TEXT DEFAULT '',
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  budget TEXT DEFAULT '',
  deadline DATE,
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'assigned', 'in_progress', 'completed', 'cancelled')),
  creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_works_updated_at
BEFORE UPDATE ON works
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE work_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT DEFAULT '',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER set_work_requests_updated_at
BEFORE UPDATE ON work_requests
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  work_id UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reviewee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE works ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "skills_select" ON skills FOR SELECT TO authenticated USING (true);

CREATE POLICY "user_skills_select" ON user_skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "user_skills_insert" ON user_skills FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_skills_delete" ON user_skills FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "works_select" ON works FOR SELECT TO authenticated USING (true);
CREATE POLICY "works_insert" ON works FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "works_update" ON works FOR UPDATE TO authenticated USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "works_delete" ON works FOR DELETE TO authenticated USING (auth.uid() = creator_id);

CREATE POLICY "work_requests_select" ON work_requests FOR SELECT TO authenticated USING (
  auth.uid() = requester_id OR auth.uid() = (SELECT creator_id FROM works WHERE id = work_requests.work_id)
);
CREATE POLICY "work_requests_insert" ON work_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "work_requests_update" ON work_requests FOR UPDATE TO authenticated USING (
  auth.uid() = requester_id OR auth.uid() = (SELECT creator_id FROM works WHERE id = work_requests.work_id)
) WITH CHECK (
  auth.uid() = requester_id OR auth.uid() = (SELECT creator_id FROM works WHERE id = work_requests.work_id)
);
CREATE POLICY "work_requests_delete" ON work_requests FOR DELETE TO authenticated USING (auth.uid() = requester_id);

CREATE POLICY "reviews_select" ON reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "reviews_insert" ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);

-- 4. SEED SKILLS
INSERT INTO skills (name, category) VALUES
  ('Web Development', 'tech'),
  ('App Development', 'tech'),
  ('React', 'tech'),
  ('Angular', 'tech'),
  ('Vue.js', 'tech'),
  ('Java', 'tech'),
  ('Python', 'tech'),
  ('JavaScript', 'tech'),
  ('Node.js', 'tech'),
  ('Data Science', 'tech'),
  ('Machine Learning', 'tech'),
  ('UI/UX Design', 'tech'),
  ('Graphic Design', 'tech'),
  ('Video Editing', 'tech'),
  ('Digital Marketing', 'tech'),
  ('Computer Repair', 'tech'),
  ('Software Development', 'tech'),
  ('DevOps', 'tech'),
  ('Cloud Computing', 'tech'),
  ('Cybersecurity', 'tech'),
  ('Electrician', 'non-tech'),
  ('Plumber', 'non-tech'),
  ('Carpenter', 'non-tech'),
  ('Painter', 'non-tech'),
  ('Driver', 'non-tech'),
  ('Tutor', 'non-tech'),
  ('Delivery', 'non-tech'),
  ('Cleaning', 'non-tech'),
  ('Photography', 'non-tech'),
  ('Event Management', 'non-tech'),
  ('Home Services', 'non-tech'),
  ('Cooking', 'non-tech'),
  ('Gardening', 'non-tech'),
  ('Tailoring', 'non-tech'),
  ('AC Repair', 'non-tech')
ON CONFLICT (name) DO NOTHING;

-- 5. STORAGE BUCKET FOR PROFILE PHOTOS
INSERT INTO storage.buckets (id, name, public) VALUES ('profile-photos', 'profile-photos', true);

CREATE POLICY "Users can upload their own photos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can update their own photos" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can delete their own photos" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'profile-photos' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Public read access for profile photos" ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'profile-photos');

-- 6. SEARCH FUNCTION (uses earth_distance for geo queries)
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
