
-- First, create database functions

-- Function to get attacks grouped by day (for chart data)
CREATE OR REPLACE FUNCTION get_attacks_by_day(start_date TIMESTAMP WITH TIME ZONE, end_date TIMESTAMP WITH TIME ZONE)
RETURNS TABLE (day DATE, count BIGINT) 
LANGUAGE SQL
AS $$
  SELECT 
    DATE_TRUNC('day', timestamp)::DATE as day,
    COUNT(*) as count
  FROM alerts
  WHERE timestamp BETWEEN start_date AND end_date
  GROUP BY day
  ORDER BY day;
$$;

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
  type TEXT NOT NULL,
  sourceIp TEXT NOT NULL,
  destPort INTEGER,
  details TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'investigating', 'resolved')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create blocked_ips table
CREATE TABLE IF NOT EXISTS blocked_ips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ip_address TEXT NOT NULL UNIQUE,
  blocked_by_user_id UUID REFERENCES auth.users,
  reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create settings table (for system-wide settings)
CREATE TABLE IF NOT EXISTS settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT NOT NULL UNIQUE,
  value JSONB,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add Row Level Security

-- Enable RLS on all tables
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_ips ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies for alerts (all authenticated users can see all alerts)
CREATE POLICY "Anyone can view alerts" 
ON alerts FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Anyone can create alerts" 
ON alerts FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Anyone can update alerts" 
ON alerts FOR UPDATE 
TO authenticated 
USING (true);

-- Create policies for blocked_ips
CREATE POLICY "Anyone can view blocked IPs" 
ON blocked_ips FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Anyone can block IPs" 
ON blocked_ips FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Anyone can unblock IPs" 
ON blocked_ips FOR DELETE 
TO authenticated 
USING (true);

-- Create policies for settings (only authenticated users can access settings)
CREATE POLICY "Anyone can view settings" 
ON settings FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Anyone can update settings" 
ON settings FOR UPDATE 
TO authenticated 
USING (true);

-- Insert some initial settings
INSERT INTO settings (key, value, description)
VALUES 
  ('notification_settings', '{"email_alerts": false, "critical_only": true}', 'Settings for notifications'),
  ('monitoring_settings', '{"log_retention_days": 30, "scan_interval_minutes": 5}', 'Settings for monitoring behavior')
ON CONFLICT (key) DO NOTHING;
