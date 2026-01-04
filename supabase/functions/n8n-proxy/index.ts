import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const N8N_WEBHOOK_URL = "https://n8n.srv1245507.hstgr.cloud/webhook-test/f452eb55-a1ef-4f86-861c-0fe04c8341c4";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message } = await req.json();
    
    console.log("Received message:", message);
    console.log("Forwarding to n8n webhook...");

    const response = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message }),
    });

    if (!response.ok) {
      console.error("n8n webhook error:", response.status, response.statusText);
      throw new Error(`n8n webhook returned ${response.status}`);
    }

    const data = await response.text();
    console.log("n8n response:", data);

    // Parse response - could be JSON or plain text
    let responseContent: string;
    try {
      const jsonData = JSON.parse(data);
      responseContent = jsonData.output || jsonData.message || jsonData.response || JSON.stringify(jsonData, null, 2);
    } catch {
      responseContent = data;
    }

    return new Response(
      JSON.stringify({ response: responseContent }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );
  } catch (error) {
    console.error("Error in n8n-proxy:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});