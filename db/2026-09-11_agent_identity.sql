-- 2026-09-11_agent_identity.sql
-- Merchant-chosen identity for the AI agent: the name it introduces itself
-- with, and the grammatical gender it speaks about itself in.
-- Purely additive.

ALTER TABLE public.merchants
  ADD COLUMN IF NOT EXISTS agent_name   text,
  ADD COLUMN IF NOT EXISTS agent_gender text NOT NULL DEFAULT 'unspecified';

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'merchants_agent_gender_check'
  ) THEN
    ALTER TABLE public.merchants
      ADD CONSTRAINT merchants_agent_gender_check
      CHECK (agent_gender IN ('male', 'female', 'unspecified'));
  END IF;
END $$;
