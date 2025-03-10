
import { serve } from 'https://deno.land/std@0.204.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { OpenAI } from 'https://deno.land/x/openai@v4.20.1/mod.ts'

const openai = new OpenAI(Deno.env.get('OPENAI_API_KEY')!)

const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const requestData = await req.json()
    console.log('Received request data:', typeof requestData)

    if (!requestData || typeof requestData !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Invalid request format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { image, user_id } = requestData

    if (!image || typeof image !== 'string') {
      return new Response(
        JSON.stringify({ error: 'No image provided or invalid image format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!user_id) {
      return new Response(
        JSON.stringify({ error: 'User ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Check remaining analyses
    const { data: subscription, error: subscriptionError } = await supabaseClient
      .from('subscriptions')
      .select('remaining_analyses')
      .eq('user_id', user_id)
      .single()

    if (subscriptionError) {
      console.error('Error fetching subscription:', subscriptionError)
      return new Response(
        JSON.stringify({ error: 'Error fetching subscription information' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (subscription.remaining_analyses <= 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No analyses remaining',
          current: 0,
          limit: 3
        }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Calling OpenAI API with image...')
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a meal analysis assistant. Your responses must be valid JSON strings. Always format your responses as follows, with EXACT keys and types: {\"name\": \"string\", \"calories\": number, \"protein\": number, \"description\": \"string\"}. Use whole numbers for calories and protein. Example: {\"name\": \"Chicken Salad\", \"calories\": 350, \"protein\": 25, \"description\": \"Fresh garden salad with grilled chicken\"}"
        },
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Analyze this meal image. Return ONLY a JSON object with no additional text." 
            },
            {
              type: "image_url",
              image_url: {
                url: image
              }
            },
          ],
        },
      ],
      max_tokens: 1000,
    })

    console.log('OpenAI API response received')

    const response = completion.choices[0].message.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    console.log('Raw OpenAI response:', response)

    let analysis
    try {
      const cleanResponse = response.replace(/```json\n?|\n?```/g, '').trim()
      analysis = JSON.parse(cleanResponse)
    } catch (error) {
      console.error('Error parsing OpenAI response:', error)
      console.log('Raw response:', response)
      throw new Error('Failed to parse OpenAI response')
    }

    // Validate required fields and data types
    const requiredFields = ['name', 'calories', 'protein', 'description']
    for (const field of requiredFields) {
      if (!(field in analysis)) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    // Ensure numbers are integers
    analysis = {
      ...analysis,
      calories: Math.round(Number(analysis.calories)) || 0,
      protein: Math.round(Number(analysis.protein)) || 0,
    }

    // Decrement the remaining_analyses count
    const { error: updateError } = await supabaseClient
      .from('subscriptions')
      .update({ remaining_analyses: subscription.remaining_analyses - 1 })
      .eq('user_id', user_id)

    if (updateError) {
      console.error('Error updating remaining_analyses:', updateError)
      return new Response(
        JSON.stringify({ error: 'Error updating analysis count' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
