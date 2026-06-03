export default async function handler(req, res) {
  try {
    const { message } = req.body;

    if (!process.env.GROQ_API_KEY) {
      return res.status(200).json({ reply: "Hi Emmanuella! My brain is almost ready, but the 'GROQ_API_KEY' is missing from the Vercel Vault." });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY.trim()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: "Your name is Lyromi. You are a professional AI created by Emmanuella. Be smart and helpful." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(200).json({ reply: "Brain Error: " + data.error.message });
    }

    res.status(200).json({ reply: data.choices[0].message.content });

  } catch (error) {
    res.status(200).json({ reply: "System Error: " + error.message });
  }
}
