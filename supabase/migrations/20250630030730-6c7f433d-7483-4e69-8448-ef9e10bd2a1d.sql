
-- Add new columns to analytics_sessions table to track form inputs
ALTER TABLE public.analytics_sessions 
ADD COLUMN municipality TEXT,
ADD COLUMN parish TEXT,
ADD COLUMN user_age INTEGER,
ADD COLUMN monthly_income INTEGER,
ADD COLUMN taxable_benefit INTEGER,
ADD COLUMN income_type TEXT,
ADD COLUMN has_collective_agreement BOOLEAN,
ADD COLUMN vacation_days INTEGER,
ADD COLUMN variable_salary INTEGER,
ADD COLUMN includes_swedish_church BOOLEAN,
ADD COLUMN selected_year INTEGER;

-- Add new columns to analytics_events table for form-specific events
ALTER TABLE public.analytics_events
ADD COLUMN form_data JSONB DEFAULT '{}';

-- Create index for better performance on form data queries
CREATE INDEX idx_analytics_sessions_municipality ON public.analytics_sessions(municipality);
CREATE INDEX idx_analytics_sessions_selected_year ON public.analytics_sessions(selected_year);
CREATE INDEX idx_analytics_events_form_data ON public.analytics_events USING GIN(form_data);
