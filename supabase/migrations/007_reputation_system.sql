-- 007_reputation_system.sql
-- Migration for Delayed-Submission Tracking, Deadlines, and Dynamic Badging System

-- 1. Ensure deadline is mandatory for new works
ALTER TABLE works ALTER COLUMN deadline SET NOT NULL;

-- 2. Add reputation tracking columns to profiles (optional caching layer)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS delayed_work_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS completed_jobs_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS average_rating NUMERIC(3, 2) DEFAULT 0.00;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- 3. Helpful comment documenting the trigger rules:
-- - Active/Overdue Project Phase: In-progress projects do NOT increment delay count.
-- - Submission Trigger (+1): Late completion after deadline increments delayed_work_count by 1.
-- - On-Time Recovery (-1): On-time completion decrements delayed_work_count by 1 (minimum 0).
-- - Badging:
--   * delayed: delayed_work_count > 0
--   * reliable: delayed_work_count = 0 AND completed_jobs_count > 0
--   * fresher: delayed_work_count = 0 AND completed_jobs_count = 0
