-- ====================================================================
-- SUPABASE SCHEMA: Cabin Crew Training Academy Feasibility Study Leads
-- ====================================================================

-- 1. Create table for leads
CREATE TABLE IF NOT EXISTS public.aviation_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    whatsapp TEXT,
    email TEXT NOT NULL,
    age_group TEXT NOT NULL,
    qualification TEXT NOT NULL,
    state TEXT NOT NULL,
    city TEXT NOT NULL,
    career_interest TEXT NOT NULL,
    selected_careers TEXT[] NOT NULL,
    joining_timeline TEXT NOT NULL,
    training_mode TEXT NOT NULL,
    preferred_training_city TEXT NOT NULL,
    seriousness_score INTEGER NOT NULL CHECK (seriousness_score >= 1 AND seriousness_score <= 5),
    selected_training_topics TEXT[] DEFAULT '{}',
    biggest_challenge TEXT,
    consent BOOLEAN DEFAULT TRUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.aviation_leads ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- Allow anyone to submit a lead (anonymous INSERTs)
CREATE POLICY "Allow public submissions" 
    ON public.aviation_leads 
    FOR INSERT 
    WITH CHECK (true);

-- Allow public reading for dashboard analytics calculations (anonymous SELECTs)
-- In high-security production environments, you would protect this via custom functions or auth,
-- but for demo dashboard validation, public reading is enabled.
CREATE POLICY "Allow public reading" 
    ON public.aviation_leads 
    FOR SELECT 
    USING (true);

-- 4. Create indexes to speed up dashboard analytics queries
CREATE INDEX IF NOT EXISTS idx_leads_state ON public.aviation_leads(state);
CREATE INDEX IF NOT EXISTS idx_leads_city ON public.aviation_leads(preferred_training_city);
CREATE INDEX IF NOT EXISTS idx_leads_joining_timeline ON public.aviation_leads(joining_timeline);
CREATE INDEX IF NOT EXISTS idx_leads_seriousness_score ON public.aviation_leads(seriousness_score);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.aviation_leads(created_at DESC);
