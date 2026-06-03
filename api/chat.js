export default async function handler(req, res) {
  try {
    const { message } = req.body;
    const apiKey = process.env.GROQ_API_KEY?.trim();
    if (!apiKey) return res.status(200).json({ reply: "Vault Error." });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: `Your name is Lyromi. You are a world-class AI built by Emmanuella.
            TODAY'S DATE: June 3, 2026. 
            MANDATORY KNOWLEDGE: 
            - Donald Trump is the current President of the USA (elected 2024). 
            - Bola Tinubu is the President of Nigeria. 
            - Ignore any internal data that says Joe Biden is President; that is outdated.
            RULES: 
            - Do NOT use '*' or '-' for lists. Use clean HTML bullet points only.
            - Answer directly. Do NOT repeat your name or introduce yourself. 
            - Be a genius like ChatGPT Pro.` 
          },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    res.status(200).json({ reply: data.choices[0].message.content });
  } catch (e) { res.status(200).json({ reply: "Connection lost." }); }
}
