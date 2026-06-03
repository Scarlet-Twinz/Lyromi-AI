export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message } = req.body;
    if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: "Key Missing" });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY.trim()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { 
            role: "system", 
            content: "Your name is Lyromi (L-Y-R-O-M-I). You are a world-class AI, as capable and smart as ChatGPT. You were built and are owned by Emmanuella. You are an expert in programming, HTML, CSS, math, and creative writing. When Emmanuella or any user asks a question, provide professional, detailed, and brilliant answers. If asked to write code, write clean, professional HTML/CSS/JS." 
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
