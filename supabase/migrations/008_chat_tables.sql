-- ============================================================
-- 008: Chat Tables (chats + messages)
-- Run this in Supabase Dashboard → SQL Editor
-- ============================================================

-- Chats table: one chat per work, between two participants
CREATE TABLE IF NOT EXISTS chats (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id          UUID NOT NULL REFERENCES works(id) ON DELETE CASCADE,
  participant_one  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  participant_two  UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(work_id)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id     UUID NOT NULL REFERENCES chats(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT,
  file_url    TEXT,
  file_name   TEXT,
  file_type   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_chats_participant_one ON chats(participant_one);
CREATE INDEX IF NOT EXISTS idx_chats_participant_two ON chats(participant_two);
CREATE INDEX IF NOT EXISTS idx_messages_chat_id ON messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- RLS Policies
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Allow participants to read their chats
CREATE POLICY "Participants can read chats"
  ON chats FOR SELECT
  USING (auth.uid() = participant_one OR auth.uid() = participant_two);

-- Allow participants to insert chats (service role bypasses this anyway)
CREATE POLICY "Service role manages chats"
  ON chats FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow participants to read messages in their chats
CREATE POLICY "Participants can read messages"
  ON messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
        AND (chats.participant_one = auth.uid() OR chats.participant_two = auth.uid())
    )
  );

-- Allow participants to insert messages
CREATE POLICY "Participants can send messages"
  ON messages FOR INSERT
  WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
        AND (chats.participant_one = auth.uid() OR chats.participant_two = auth.uid())
    )
  );
