-- Add wallet balance to profiles table
-- Run this in Supabase SQL Editor

-- Add balance column (in MKD - Macedonian Denars)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS wallet_balance integer DEFAULT 0;

-- Comment for documentation
COMMENT ON COLUMN public.profiles.wallet_balance IS 'User wallet balance in MKD (Macedonian Denars)';

-- Create a function to update balance (for transactions)
CREATE OR REPLACE FUNCTION update_wallet_balance(user_uuid uuid, amount integer)
RETURNS integer AS $$
DECLARE
    new_balance integer;
BEGIN
    UPDATE public.profiles 
    SET wallet_balance = wallet_balance + amount,
        updated_at = NOW()
    WHERE id = user_uuid
    RETURNING wallet_balance INTO new_balance;
    
    RETURN new_balance;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

