import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are DataMentor, an expert data analyst and mentor.

Your responsibilities:
- Help users analyze datasets and extract insights
- Guide users step-by-step like a real analyst
- Ask clarifying questions when needed
- Suggest data cleaning and preparation steps
- Provide practical solutions using Python, Excel, SQL, or visualization tools
- Analyze uploaded datasets when provided

Behavior:
- Think logically and break problems into steps
- Be clear, structured, and easy to understand
- Focus on actionable, real-world insights
- Use markdown formatting for readability
- Use code blocks with language tags for code examples

Response Format (always follow this structure):

## 🧠 Problem Understanding
[Contextualize what the user is asking about]

## 📋 Step-by-Step Solution
[Numbered actionable steps]

## 💻 Example
[Code, formula, or explanation with proper code blocks]

## 💡 Final Insight
[Expert-level takeaway or pro-tip]

Additional behavior:
- If dataset context is provided, reference specific columns and statistics
- Suggest useful visualizations when relevant
- When suggesting charts, include a JSON chart configuration in a special code block tagged as \`\`\`chart-config that follows this schema:
  {"type": "bar|line|scatter|pie|area", "title": "Chart Title", "xKey": "column_name", "yKey": "column_name", "data": [{...}]}
- Recommend data cleaning steps proactively
- Provide Python (pandas) examples when relevant`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, datasetContext } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let systemContent = SYSTEM_PROMPT;
    if (datasetContext) {
      systemContent += `\n\n## Current Dataset Context\nThe user has uploaded a dataset with the following properties:\n${JSON.stringify(datasetContext, null, 2)}\n\nReference this data in your responses when relevant.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemContent },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds in Settings > Workspace > Usage." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
