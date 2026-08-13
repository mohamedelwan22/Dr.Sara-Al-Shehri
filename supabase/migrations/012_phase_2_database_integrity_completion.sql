-- Phase 2: Database Integrity Completion
-- Safe, additive, and idempotent.

-- 1. Restore UNIQUE(slug) integrity on content tables.
CREATE UNIQUE INDEX IF NOT EXISTS publications_slug_key
    ON public.publications (slug);

CREATE UNIQUE INDEX IF NOT EXISTS scientific_discussions_slug_key
    ON public.scientific_discussions (slug);

CREATE UNIQUE INDEX IF NOT EXISTS lectures_slug_key
    ON public.lectures (slug);

CREATE UNIQUE INDEX IF NOT EXISTS scientific_insights_slug_key
    ON public.scientific_insights (slug);

-- 2. Add user_id foreign keys to auth.users.
-- user_id is nullable, so anonymous metric rows remain valid.

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'content_downloads_user_id_fkey'
          AND conrelid = 'public.content_downloads'::regclass
    ) THEN
        ALTER TABLE public.content_downloads
            ADD CONSTRAINT content_downloads_user_id_fkey
            FOREIGN KEY (user_id)
            REFERENCES auth.users(id)
            ON DELETE SET NULL;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'content_shares_user_id_fkey'
          AND conrelid = 'public.content_shares'::regclass
    ) THEN
        ALTER TABLE public.content_shares
            ADD CONSTRAINT content_shares_user_id_fkey
            FOREIGN KEY (user_id)
            REFERENCES auth.users(id)
            ON DELETE SET NULL;
    END IF;
END $$;