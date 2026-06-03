export default async function handler(req, res) {
  try {
    const { message } = req.body;
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { 
            role: "system", 
            content: "Your name is Lyromi. You are a world-class AI built by Emmanuella. You are an expert in code, HTML, math, and writing. If the user says they are Emmanuella or Ella, treat them as your creator and owner. If it is anyone else, be professional but ask for their name. Always give brilliant, detailed answers." 
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
