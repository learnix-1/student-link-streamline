
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://exajbjnqkmmkavqyxfct.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4YWpiam5xa21ta2F2cXl4ZmN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDMwNTU4NTksImV4cCI6MjA1ODYzMTg1OX0.S-ZpSrIY6fTeE9s76edWfwzsD0tVKjWPYdeal1ow7cw";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
