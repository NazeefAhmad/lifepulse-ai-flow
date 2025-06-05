
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { taskId, userId, taskTitle, dueDate, assignedToEmail, daysUntilDue } = await req.json()

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user email
    const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(userId)
    if (userError) throw userError

    const userEmail = userData.user?.email
    if (!userEmail) {
      throw new Error('User email not found')
    }

    // Prepare email content
    const subject = `📅 Task Reminder: "${taskTitle}" due ${daysUntilDue === 0 ? 'today' : `in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`}`
    
    const emailContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; border-radius: 10px; color: white; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0; font-size: 24px;">📅 Task Reminder</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">From your LifeSync Task Manager</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 25px; border-radius: 10px; border-left: 4px solid #667eea;">
          <h2 style="margin-top: 0; color: #333; font-size: 20px;">${taskTitle}</h2>
          <p style="color: #666; font-size: 16px; margin: 15px 0;">
            <strong>Due Date:</strong> ${new Date(dueDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <p style="color: #666; font-size: 16px; margin: 15px 0;">
            <strong>Status:</strong> ${daysUntilDue === 0 ? '🔴 Due Today!' : `⏰ Due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`}
          </p>
          ${assignedToEmail ? `<p style="color: #666; font-size: 16px; margin: 15px 0;"><strong>Assigned to:</strong> ${assignedToEmail}</p>` : ''}
        </div>
        
        <div style="text-align: center; margin: 30px 0;">
          <p style="color: #666; font-size: 14px;">
            Stay organized and on track with LifeSync! 
            ${daysUntilDue === 0 ? "Don't forget to complete this task today." : "Plan ahead to meet your deadline."}
          </p>
        </div>
        
        <div style="border-top: 1px solid #eee; padding-top: 20px; text-align: center;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            This reminder was automatically sent by LifeSync Task Manager.<br>
            You can adjust your notification preferences in the app settings.
          </p>
        </div>
      </div>
    `

    // Send email using Resend
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    if (!resendApiKey) {
      throw new Error('Resend API key not configured')
    }

    const emailResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'LifeSync <noreply@lifesync.app>',
        to: [userEmail],
        subject: subject,
        html: emailContent,
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      throw new Error(`Failed to send email: ${errorData}`)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Task reminder sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error sending task reminder:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
