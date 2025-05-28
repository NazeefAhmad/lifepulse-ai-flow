
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to decode JWT token
function decodeJWT(token: string) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

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

    // Get authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header provided');
    }

    // Extract and verify the JWT token
    const token = authHeader.replace('Bearer ', '');
    const payload = decodeJWT(token);
    
    if (!payload || !payload.sub) {
      console.error('Invalid JWT token or missing user ID');
      throw new Error('Authentication failed - invalid token');
    }

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.error('JWT token has expired');
      throw new Error('Authentication failed - token expired');
    }

    const userId = payload.sub;
    console.log('Generating AI message for type:', type, 'for user:', userId);

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
