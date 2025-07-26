-- Supabase SQL Schema for qualmetrics
-- Run these commands in your Supabase SQL editor

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create responses table
CREATE TABLE public.responses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  responseId  TEXT UNIQUE NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  Q1          TEXT,
  Q2          TEXT,
  Q3          TEXT,
  Q4          TEXT,
  Q5          TEXT,
  Q6          TEXT,
  Q7          TEXT,
  Q8          TEXT,
  Q9          TEXT,
  Q10         TEXT
);

ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts (for collecting responses)
CREATE POLICY "Allow anonymous inserts" ON public.responses
FOR INSERT WITH CHECK (true);

-- Create policy to allow anonymous reads (for generating reports)
CREATE POLICY "Allow anonymous reads" ON public.responses
FOR SELECT USING (true);

-- Create index on responseId for faster lookups
CREATE INDEX idx_responses_response_id ON public.responses(responseId);
