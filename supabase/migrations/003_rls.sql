ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE works ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- skills
CREATE POLICY "skills_select" ON skills FOR SELECT TO authenticated USING (true);

-- user_skills
CREATE POLICY "user_skills_select" ON user_skills FOR SELECT TO authenticated USING (true);
CREATE POLICY "user_skills_insert" ON user_skills FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_skills_delete" ON user_skills FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- works
CREATE POLICY "works_select" ON works FOR SELECT TO authenticated USING (true);
CREATE POLICY "works_insert" ON works FOR INSERT TO authenticated WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "works_update" ON works FOR UPDATE TO authenticated USING (auth.uid() = creator_id) WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "works_delete" ON works FOR DELETE TO authenticated USING (auth.uid() = creator_id);

-- work_requests
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

-- reviews
CREATE POLICY "reviews_select" ON reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "reviews_insert" ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);
