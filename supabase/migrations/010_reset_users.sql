-- ============================================================
-- DATABASE RESET SCRIPT
-- ⚠️  WARNING: This permanently deletes ALL users and data.
-- Run ONLY in Supabase Dashboard → SQL Editor when ready.
-- ============================================================

-- 1. Delete all messages
DELETE FROM messages;

-- 2. Delete all chats
DELETE FROM chats;

-- 3. Delete all reviews
DELETE FROM reviews;

-- 4. Delete all work requests
DELETE FROM work_requests;

-- 5. Delete all works
DELETE FROM works;

-- 6. Delete all user skills
DELETE FROM user_skills;

-- 7. Delete all profiles
DELETE FROM profiles;

-- 8. Delete all auth users (this removes login sessions too)
DELETE FROM auth.users;

-- Done. Database is clean. You can now re-register with OTP flow.
SELECT 'Database reset complete. All users and data removed.' AS status;
