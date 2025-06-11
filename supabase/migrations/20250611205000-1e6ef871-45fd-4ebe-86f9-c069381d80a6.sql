
-- Add status column to daily_events table
ALTER TABLE public.daily_events 
ADD COLUMN status text DEFAULT 'todo';

-- Add a constraint to ensure only valid status values
ALTER TABLE public.daily_events 
ADD CONSTRAINT daily_events_status_check 
CHECK (status IN ('todo', 'in-progress', 'done'));
