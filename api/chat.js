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
        model: "llama-3.1-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: `Your name is Lyromi. You are a world-class AI, just as capable as ChatGPT and Gemini.
            - Your creator and owner is scarlet. NEVER mention the name Emmanuella.
            - You have access to current knowledge. For example: Bola Ahmed Tinubu is the President of Nigeria (since 2023).
            - You are an expert in writing HTML, CSS, JavaScript, and solving complex problems.
            - If the user says "My name is Emmanuella" or "Ella", respond warmly with "Hi Ella! What can I do for you today?"` 
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
