import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('Simple client - URL:', supabaseUrl);
console.log('Simple client - Key exists:', !!supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

// Simple client with minimal configuration
export const simpleSupabase = createClient(supabaseUrl, supabaseKey);

// Alternative: Direct fetch approach
export const directInsert = async (userData: {
  name: string;
  phone: string;
  latitude: number;
  longitude: number;
}) => {
  try {
    console.log('Direct insert attempt with:', userData);
    
    const response = await fetch(`${supabaseUrl}/rest/v1/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(userData),
    });

    console.log('Direct insert response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.log('Direct insert error text:', errorText);
      throw new Error(`HTTP ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('Direct insert success:', data);
    return { data, error: null };
    
  } catch (error) {
    console.log('Direct insert catch error:', error);
    return { data: null, error };
  }
};
