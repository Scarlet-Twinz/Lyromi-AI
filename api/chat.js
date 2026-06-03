export default async function handler(req, res) {
  try {
    const { message } = req.body;
    const apiKey = process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.trim() : null;

    if (!apiKey) return res.status(200).json({ reply: "Missing API Key in Vault." });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // This is the new working model
        messages: [
          { role: "system", content: "Your name is Lyromi. You are a world-class AI built by Emmanuella. You know current affairs like Bola Tinubu being President of Nigeria. Be smart and helpful." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    if (data && data.choices && data.choices.length > 0) {
      res.status(200).json({ reply: data.choices[0].message.content });
    } else {
      res.status(200).json({ reply: "Brain Error: " + (data.error ? data.error.message : "Try again.") });
    }

  } catch (error) {
    res.status(200).json({ reply: "Connection Error: " + error.message });
  }
}
