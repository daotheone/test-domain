const SUPABASE_URL = 'https://niugpzzfotyhjzekpbtw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pdWdwenpmb3R5aGp6ZWtwYnR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5Nzc3NjYsImV4cCI6MjA4OTU1Mzc2Nn0.yun3zBBkh7YaTpcyPH8QIsSmQXHR8X2Tdk_KrX5qZoc';

// Initialize Supabase client
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/*
=========================================================
🔥 REQUIRED SUPABASE DATABASE SETUP 🔥
=========================================================
1. Go to your Supabase project dashboard -> Database -> Tables
2. Create a new table named: user_data
3. Disable Row Level Security (RLS) for testing, or set up policies to allow access.
4. Add the following columns:
   - username (type: text, Primary Key)
   - todos (type: jsonb, Default value: '[]')
   - events (type: jsonb, Default value: '[]')
   - period_tracking (type: jsonb, Default value: '{"periods": [], "showCalendar": true}')
   - shortcuts (type: jsonb, Default value: '[]')
=========================================================
*/
