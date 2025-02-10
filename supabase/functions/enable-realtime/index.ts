
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async (req) => {
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { data, error } = await supabaseClient.rpc('supabase_functions.http', {
      method: 'POST',
      path: '/internal/alter-table',
      body: JSON.stringify({
        table_name: 'meals',
        enable_realtime: true
      })
    });

    if (error) throw error;

    return new Response(
      JSON.stringify({ message: 'Realtime enabled for meals table' }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
