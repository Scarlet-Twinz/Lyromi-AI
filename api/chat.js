export default async function handler(req, res) {
  try {
    const { message } = req.body;
    const apiKey = process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.trim() : null;

    if (!apiKey) return res.status(200).json({ reply: "Missing API Key in Vercel Vault." });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: "Your name is Lyromi. You are a world-class AI built by Emmanuella. Be smart and helpful like ChatGPT. You know that Bola Ahmed Tinubu is the President of Nigeria (serving since 2023)." 
          },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    res.status(200).json({ reply: data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
