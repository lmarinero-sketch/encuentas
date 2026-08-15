import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pxvhovctyewwppwkldaq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB4dmhvdmN0eWV3d3Bwd2tsZGFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjY3MTY3NDQsImV4cCI6MjA4MjI5Mjc0NH0.-fHvp3Rs4RFcBD87_SYLA2xFw756_VSdkWhy0Q1ekNo';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
