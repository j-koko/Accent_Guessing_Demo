-- Supabase SQL Schema for qualmetrics
-- Run these commands in your Supabase SQL editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create responses table matching CSV structure
CREATE TABLE public.responses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ResponseId  TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  q1_language TEXT,
  q1_text     TEXT,
  q2          TEXT,
  q3          TEXT,
  q1_1a       INTEGER,
  q1_1b       INTEGER,
  q1_2a       INTEGER,
  q1_2b       INTEGER,
  q1_3a       INTEGER,
  q1_3b       INTEGER,
  q1_4a       INTEGER,
  q1_4b       INTEGER,
  q2_1a       INTEGER,
  q2_1b       INTEGER,
  q2_2a       INTEGER,
  q2_2b       INTEGER,
  q2_3a       INTEGER,
  q2_3b       INTEGER,
  q2_4a       INTEGER,
  q2_4b       INTEGER,
  q3_1a       INTEGER,
  q3_1b       INTEGER,
  q3_2a       INTEGER,
  q3_2b       INTEGER,
  q3_3a       INTEGER,
  q3_3b       INTEGER,
  q3_4a       INTEGER,
  q3_4b       INTEGER,
  q4_1a       INTEGER,
  q4_1b       INTEGER,
  q4_2a       INTEGER,
  q4_2b       INTEGER,
  q4_3a       INTEGER,
  q4_3b       INTEGER,
  q4_4a       INTEGER,
  q4_4b       INTEGER,
  q5_1a       INTEGER,
  q5_1b       INTEGER,
  q5_2a       INTEGER,
  q5_2b       INTEGER,
  q5_3a       INTEGER,
  q5_3b       INTEGER,
  q5_4a       INTEGER,
  q5_4b       INTEGER
);

ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts (for collecting responses)
CREATE POLICY "Allow anonymous inserts" ON public.responses
FOR INSERT WITH CHECK (true);

-- Create policy to allow anonymous reads (for generating reports)
CREATE POLICY "Allow anonymous reads" ON public.responses
FOR SELECT USING (true);

-- Create index on ResponseId for faster lookups
CREATE INDEX idx_responses_response_id ON public.responses(ResponseId);
