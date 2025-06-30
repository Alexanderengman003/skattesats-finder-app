
-- Create analytics events table
CREATE TABLE public.analytics_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL,
  event_name TEXT NOT NULL,
  properties JSONB DEFAULT '{}',
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create analytics sessions table
CREATE TABLE public.analytics_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_start TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  session_end TIMESTAMP WITH TIME ZONE,
  page_views INTEGER DEFAULT 0,
  events_count INTEGER DEFAULT 0,
  referrer TEXT,
  landing_page TEXT,
  user_agent TEXT,
  ip_address INET,
  country TEXT,
  city TEXT,
  device_type TEXT,
  browser TEXT,
  os TEXT
);

-- Enable RLS on analytics tables
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_sessions ENABLE ROW LEVEL SECURITY;

-- Create policies for analytics events (admins can view all, users can view their own)
CREATE POLICY "Users can view their own analytics events"
  ON public.analytics_events
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow anonymous event creation"
  ON public.analytics_events
  FOR INSERT
  WITH CHECK (true);

-- Create policies for analytics sessions
CREATE POLICY "Users can view their own analytics sessions"
  ON public.analytics_sessions
  FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Allow anonymous session creation"
  ON public.analytics_sessions
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow session updates"
  ON public.analytics_sessions
  FOR UPDATE
  USING (true);

-- Create indexes for better performance
CREATE INDEX idx_analytics_events_session_id ON public.analytics_events(session_id);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);
CREATE INDEX idx_analytics_events_created_at ON public.analytics_events(created_at);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_sessions_user_id ON public.analytics_sessions(user_id);
CREATE INDEX idx_analytics_sessions_session_start ON public.analytics_sessions(session_start);
