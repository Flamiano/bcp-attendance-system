import { createClient } from '@supabase/supabase-js';

// Use environment variables for Supabase URL and Key
const supabaseUrl = 'https://jatyugjnkxvfgnbiitdf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphdHl1Z2pua3h2ZmduYmlpdGRmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODEwMjEsImV4cCI6MjA1MDI1NzAyMX0.Q5JS7HWFF8Pc2fQ71RepLhkPPNeu9wfjv1QVsaWxb-c';

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
