
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, context } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Get user from request - fix authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { 
        global: { 
          headers: { 
            Authorization: authHeader 
          } 
        } 
      }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Auth error:', authError);
      throw new Error('Authentication failed');
    }

    console.log('Generating AI message for type:', type, 'for user:', user.id);

    let systemPrompt = '';
    let userPrompt = '';

    switch (type) {
      case 'sweet_message':
        systemPrompt = 'You are a romantic AI assistant that creates heartfelt, genuine sweet messages for couples. Create personalized, loving messages that feel authentic and warm. Keep them between 20-80 words.';
        userPrompt = context?.recentMood 
          ? `Create a sweet message for someone whose recent mood was "${context.recentMood}". Make it uplifting and caring.`
          : 'Create a sweet, romantic message that would make someone feel loved and appreciated.';
        break;
        
      case 'mood_suggestion':
        systemPrompt = 'You are a relationship wellness AI that provides thoughtful suggestions based on mood patterns. Be empathetic and constructive.';
        userPrompt = `Based on recent mood: "${context?.mood || 'mixed'}", suggest a thoughtful activity or message to improve their relationship wellbeing. Keep it practical and caring.`;
        break;
        
      case 'reminder_suggestion':
        systemPrompt = 'You are a relationship coach AI that suggests meaningful romantic gestures and important relationship activities.';
        userPrompt = 'Suggest a romantic or thoughtful reminder/activity for a couple. Be specific and actionable. Examples: plan a surprise date, write a heartfelt letter, cook their favorite meal, etc.';
        break;
        
      default:
        throw new Error('Invalid message type');
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 150,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedMessage = data.choices[0].message.content.trim();

    console.log('Generated message:', generatedMessage);

    return new Response(JSON.stringify({ 
      message: generatedMessage,
      type: type 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-ai-message function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
