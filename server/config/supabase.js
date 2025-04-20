
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Supabase URL and Service Role Key must be defined in .env');
}

// Create Supabase client with service role key for backend operations
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Create Supabase client with anon key for public operations (if needed)
export const supabasePublic = createClient(supabaseUrl, supabaseAnonKey);

// Export the Supabase URL for frontend configuration
export const getSupabaseUrl = () => supabaseUrl;

// Helper function to verify Supabase JWT tokens
export async function verifyToken(token) {
  try {
    const { data, error } = await supabaseAdmin.auth.getUser(token);
    
    if (error) {
      throw new Error(error.message);
    }
    
    return data.user;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}
