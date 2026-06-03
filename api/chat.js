export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { message } = req.body;
    if (!process.env.GROQ_API_KEY) return res.status(500).json({ error: "Missing Key in Vercel Settings" });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY.trim()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "Your name is Lyromi. You are a professional AI created by Emmanuella. Always be helpful to her." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();
    if (data.error) return res.status(500).json({ error: data.error.message });
    res.status(200).json({ reply: data.choices[0].message.content });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
