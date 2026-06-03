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
        model: "llama-3.1-70b-versatile", // Using the BIGGER, SMARTER 70B model
        messages: [
          { 
            role: "system", 
            content: `Your name is Lyromi. You are a world-class AI built by Emmanuella.
            DATE: June 3, 2026.
            CURRENT AFFAIRS: You are fully aware of global politics. For example, Bola Ahmed Tinubu is the current President of Nigeria (serving since 2023). 
            EXPERTISE: You are an expert in HTML, CSS, JavaScript, and everything smart. 
            TONE: Professional, brilliant, and sophisticated.` 
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
