-- ==============================================================================
-- SMART WALLET - SUPABASE CLOUD DATABASE SCHEMA
-- Zero Cold-Start • RLS Multi-tenant Security • Offline-First Idempotent Sync
-- ==============================================================================

-- 1. Enable UUID generator extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. User Profiles Table (Mirrors Supabase Auth Users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Wallets Table
CREATE TABLE IF NOT EXISTS public.wallets (
    id TEXT PRIMARY KEY DEFAULT ('SW-' || floor(random() * 9000000000 + 1000000000)::text),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'EUR',
    account_number TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Transactions Table (Idempotent offline sync via text id / clientUuid)
CREATE TABLE IF NOT EXISTS public.transactions (
    id TEXT PRIMARY KEY, -- Accepts UUID or client-generated clientUuid (e.g. tx_1729112345_abc123)
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    amount NUMERIC(15, 2) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('DEBIT', 'CREDIT')),
    category VARCHAR(50) NOT NULL DEFAULT 'AUTRE',
    description TEXT,
    payment_method VARCHAR(50) DEFAULT 'Carte',
    sender_account_number TEXT,
    recipient_account_number TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Budgets Table
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    monthly_limit NUMERIC(15, 2) NOT NULL DEFAULT 500.00,
    month_year VARCHAR(10) NOT NULL, -- Format: YYYY-MM
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, category, month_year)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Ensures each authenticated user can only access their personal records
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Wallets Policies
DROP POLICY IF EXISTS "Users can view their own wallets" ON public.wallets;
CREATE POLICY "Users can view their own wallets"
    ON public.wallets FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own wallets" ON public.wallets;
CREATE POLICY "Users can update their own wallets"
    ON public.wallets FOR UPDATE
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own wallet" ON public.wallets;
CREATE POLICY "Users can insert their own wallet"
    ON public.wallets FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Transactions Policies (Offline Sync friendly: handles user_id = auth.uid() OR anonymous demo)
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
CREATE POLICY "Users can view their own transactions"
    ON public.transactions FOR SELECT
    USING (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.transactions;
CREATE POLICY "Users can insert their own transactions"
    ON public.transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "Users can update their own transactions" ON public.transactions;
CREATE POLICY "Users can update their own transactions"
    ON public.transactions FOR UPDATE
    USING (auth.uid() = user_id OR user_id IS NULL);

-- Budgets Policies
DROP POLICY IF EXISTS "Users can view their own budgets" ON public.budgets;
CREATE POLICY "Users can view their own budgets"
    ON public.budgets FOR SELECT
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own budgets" ON public.budgets;
CREATE POLICY "Users can manage their own budgets"
    ON public.budgets FOR ALL
    USING (auth.uid() = user_id);

-- ==============================================================================
-- AUTOMATIC PROFILE TRIGGER ON SUPABASE AUTH SIGNUP
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );

    INSERT INTO public.wallets (user_id, balance, currency, account_number)
    VALUES (
        NEW.id,
        1000.00,
        'EUR',
        'SW-' || floor(random() * 9000000000 + 1000000000)::text
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if already exists then recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON public.transactions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_wallets_user_id ON public.wallets(user_id);
