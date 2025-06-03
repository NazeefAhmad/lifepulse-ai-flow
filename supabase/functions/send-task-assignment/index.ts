
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TaskAssignmentRequest {
  taskTitle: string;
  taskDescription?: string;
  assignedToEmail: string;
  assignedToName?: string;
  assignedByEmail: string;
  dueDate?: string;
  priority: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      taskTitle, 
      taskDescription, 
      assignedToEmail, 
      assignedToName, 
      assignedByEmail,
      dueDate,
      priority 
    }: TaskAssignmentRequest = await req.json();

    const displayName = assignedToName || assignedToEmail.split('@')[0];
    const dueDateText = dueDate ? `Due: ${new Date(dueDate).toLocaleDateString()}` : 'No due date set';
    const priorityEmoji = priority === 'high' ? '🔴' : priority === 'medium' ? '🟡' : '🟢';

    const emailResponse = await resend.emails.send({
      from: "LifeSync <onboarding@resend.dev>",
      to: [assignedToEmail],
      subject: `📋 New Task Assigned: ${taskTitle}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 12px;">
          <div style="background: white; border-radius: 8px; padding: 30px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
            <h1 style="color: #333; margin-bottom: 20px; font-size: 24px;">
              📋 New Task Assigned to You!
            </h1>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #495057; margin: 0 0 15px 0; font-size: 20px;">
                ${taskTitle}
              </h2>
              
              ${taskDescription ? `
                <p style="color: #6c757d; margin: 10px 0; line-height: 1.6;">
                  <strong>Description:</strong><br>
                  ${taskDescription}
                </p>
              ` : ''}
              
              <div style="display: flex; gap: 20px; margin-top: 15px; flex-wrap: wrap;">
                <div style="background: white; padding: 10px 15px; border-radius: 6px; border-left: 4px solid #007bff;">
                  <strong style="color: #007bff;">Priority:</strong> ${priorityEmoji} ${priority.charAt(0).toUpperCase() + priority.slice(1)}
                </div>
                <div style="background: white; padding: 10px 15px; border-radius: 6px; border-left: 4px solid #28a745;">
                  <strong style="color: #28a745;">📅 ${dueDateText}</strong>
                </div>
              </div>
            </div>
            
            <div style="margin: 25px 0; padding: 15px; background: #e9f7ef; border-radius: 6px;">
              <p style="margin: 0; color: #155724;">
                <strong>👋 Hi ${displayName}!</strong><br>
                You have been assigned a new task by <strong>${assignedByEmail}</strong>. 
                Please review the details above and take action as needed.
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; border-radius: 25px; display: inline-block; font-weight: bold;">
                🚀 Get started on your task!
              </div>
            </div>
            
            <hr style="border: none; border-top: 1px solid #dee2e6; margin: 30px 0;">
            
            <p style="color: #6c757d; font-size: 14px; text-align: center; margin: 0;">
              This email was sent from <strong>LifeSync</strong> - Your AI-powered life management assistant<br>
              <span style="color: #adb5bd;">Helping you stay organized and productive! 🎯</span>
            </p>
          </div>
        </div>
      `,
    });

    console.log("Task assignment email sent:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending task assignment email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
