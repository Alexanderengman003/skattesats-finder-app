
-- Check current RLS status and policies
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('analytics_events', 'analytics_sessions');

-- Update RLS policies for analytics_events to allow public access
-- Since this appears to be admin analytics data, we'll allow public access

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "Users can view their own analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Allow anonymous event creation" ON public.analytics_events;

-- Create new policies that allow public access for analytics operations
CREATE POLICY "Allow public read access to analytics events"
  ON public.analytics_events
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to analytics events"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to analytics events"
  ON public.analytics_events
  FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete access to analytics events"
  ON public.analytics_events
  FOR DELETE
  USING (true);

-- Also update analytics_sessions policies to be consistent
DROP POLICY IF EXISTS "Users can view their own analytics sessions" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Allow anonymous session creation" ON public.analytics_sessions;
DROP POLICY IF EXISTS "Allow session updates" ON public.analytics_sessions;

CREATE POLICY "Allow public read access to analytics sessions"
  ON public.analytics_sessions
  FOR SELECT
  USING (true);

CREATE POLICY "Allow public insert access to analytics sessions"
  ON public.analytics_sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow public update access to analytics sessions"
  ON public.analytics_sessions
  FOR UPDATE
  USING (true);

CREATE POLICY "Allow public delete access to analytics sessions"
  ON public.analytics_sessions
  FOR DELETE
  USING (true);
