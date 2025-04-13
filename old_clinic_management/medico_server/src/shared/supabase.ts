import { createClient } from '@supabase/supabase-js';
import config from '../config';

// Create a single supabase client for interacting with your database
const supabaseUrl = config.supabase.url || '';
const supabaseKey = config.supabase.key || '';

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export default supabase; 