export default async function handler(req, res) {
  try {
    const { message } = req.body;
    const apiKey = process.env.GROQ_API_KEY ? process.env.GROQ_API_KEY.trim() : null;

    if (!apiKey) {
      return res.status(200).json({ reply: "Hi Emmanuella! The API Key is missing from the Vercel Vault." });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: [
          { role: "system", content: "Your name is Lyromi. You are a world-class AI built by Emmanuella. Be smart like ChatGPT." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    // THIS IS THE FIX: Check if data.choices exists before reading [0]
    if (data && data.choices && data.choices.length > 0) {
      res.status(200).json({ reply: data.choices[0].message.content });
    } else if (data && data.error) {
      res.status(200).json({ reply: "Brain Error: " + data.error.message });
    } else {
      res.status(200).json({ reply: "Lyromi's brain is a bit sleepy. Please try that again!" });
    }

  } catch (error) {
    res.status(200).json({ reply: "Connection Error: " + error.message });
  }
}
