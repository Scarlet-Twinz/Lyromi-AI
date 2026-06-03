export default async function handler(req, res) {
  try {
    const { message } = req.body;
    const apiKey = process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.trim() : null;

    if (!apiKey) return res.status(200).json({ reply: "Missing API Key in Vercel Vault." });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: "Your name is Lyromi. You are a world-class AI created by Emmanuella. You are an expert in science, advanced coding, math, and history. Give detailed, smart answers. DO NOT repeat your name or introduce yourself in every message. Only mention Emmanuella if she introduces herself first." 
          },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    if (data.choices && data.choices.length > 0) {
      res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      res.status(200).json({ reply: "I'm thinking... please try that again." });
    }
  } catch (error) {
    res.status(200).json({ reply: "Brain connection error." });
  }
}
