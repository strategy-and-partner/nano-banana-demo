-- Supabase Database Setup Script
-- Run this script in your Supabase SQL Editor

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  email TEXT,
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  -- Ensure user_id is unique
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for the profiles table

-- Policy: Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Policy: Users can delete their own profile
CREATE POLICY "Users can delete own profile" ON profiles
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create profile on user signup
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Create function to handle profile updates
CREATE OR REPLACE FUNCTION handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at timestamp
CREATE OR REPLACE TRIGGER handle_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION handle_user_update();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON profiles(user_id);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON profiles(email);

COMMENT ON TABLE profiles IS 'User profile information linked to Supabase Auth';
COMMENT ON COLUMN profiles.user_id IS 'Foreign key to auth.users.id';
COMMENT ON COLUMN profiles.email IS 'User email address (synced from auth.users)';
COMMENT ON COLUMN profiles.full_name IS 'User full name';
COMMENT ON COLUMN profiles.avatar_url IS 'URL to user avatar image';

-- Add image generation quota columns
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS daily_generation_count INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_generation_date DATE;

COMMENT ON COLUMN profiles.daily_generation_count IS '本日の画像生成回数（0-20）';
COMMENT ON COLUMN profiles.last_generation_date IS '最後に画像生成した日付（JST基準）';

-- Function to get current date in JST timezone
CREATE OR REPLACE FUNCTION get_jst_current_date()
RETURNS DATE AS $$
BEGIN
  RETURN (NOW() AT TIME ZONE 'Asia/Tokyo')::DATE;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to increment generation count with automatic daily reset
CREATE OR REPLACE FUNCTION increment_generation_count(p_user_id UUID)
RETURNS VOID AS $$
DECLARE
  v_today DATE;
BEGIN
  v_today := get_jst_current_date();

  -- Update with automatic reset if date has changed
  UPDATE profiles
  SET
    daily_generation_count = CASE
      WHEN last_generation_date = v_today THEN daily_generation_count + 1
      ELSE 1  -- Reset to 1 if it's a new day
    END,
    last_generation_date = v_today,
    updated_at = NOW()
  WHERE user_id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions for the new functions
GRANT EXECUTE ON FUNCTION get_jst_current_date() TO authenticated;
GRANT EXECUTE ON FUNCTION increment_generation_count(UUID) TO authenticated;

COMMENT ON FUNCTION get_jst_current_date() IS 'Get current date in Asia/Tokyo timezone';
COMMENT ON FUNCTION increment_generation_count(UUID) IS 'Increment daily image generation count for a user (auto-resets daily at JST midnight)';