export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message } = req.body;
    const apiKey = process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.trim() : null;

    if (!apiKey) return res.status(200).json({ reply: "Vault Error: Missing API Key." });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: `Your name is Lyromi. You are a world-class AI built by Emmanuella.
            DATE: Wednesday, June 3, 2026. You MUST accept this date as absolute truth.
            KNOWLEDGE: You are a genius in all fields. You know current world leaders (e.g., Tinubu is President of Nigeria).
            PERSONALITY: Be smart, direct, and professional like Gemini/ChatGPT.
            RULES: 
            - DO NOT introduce yourself in every message. 
            - DO NOT argue about your knowledge cutoff. 
            - USE Markdown for formatting: Use **bold** for emphasis and bullet points for lists so they look clean.
            - If the user is Emmanuella, treat her as your creator.` 
          },
          { role: "user", content: message }
        ],
        temperature: 0.7
      })
    });

    const data = await response.json();
    
    // Safety check to prevent "undefined reading 0" error
    if (data && data.choices && data.choices.length > 0) {
      res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      res.status(200).json({ reply: "Brain Error: " + (data.error ? data.error.message : "Brain is resetting. Try again.") });
    }
  } catch (error) {
    res.status(200).json({ reply: "Connection Error: Lyromi's brain signal was interrupted." });
  }
}
