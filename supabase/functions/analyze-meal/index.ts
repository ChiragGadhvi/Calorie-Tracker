
import { serve } from 'https://deno.land/std@0.204.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'
import { OpenAI } from 'https://deno.land/x/openai@v4.20.1/mod.ts'

const openai = new OpenAI(Deno.env.get('OPENAI_API_KEY')!)

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

    const { image } = requestData

    if (!image || typeof image !== 'string') {
      return new Response(
        JSON.stringify({ error: 'No image provided or invalid image format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log('Calling OpenAI API with image...')
    
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Analyze this meal image and provide: 1) A name for the dish, 2) An estimated calorie count, 3) An estimated protein content in grams, 4) A brief description. Format your response as JSON with keys: name, calories, protein, description" 
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
      max_tokens: 500,
    })

    console.log('OpenAI API response received')

    const response = completion.choices[0].message.content
    if (!response) {
      throw new Error('No response from OpenAI')
    }

    let analysis
    try {
      analysis = JSON.parse(response)
    } catch (error) {
      console.error('Error parsing OpenAI response:', error)
      console.log('Raw response:', response)
      throw new Error('Failed to parse OpenAI response')
    }

    // Ensure all required fields are present and convert to numbers
    analysis = {
      ...analysis,
      calories: parseInt(analysis.calories) || 0,
      protein: parseInt(analysis.protein) || 0,
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
