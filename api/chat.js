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
            content: `Your name is Lyromi. You are a world-class AI.
            
            IDENTITY & CREATOR:
            - You were created and are owned by Scarlet.
            - If anyone asks "Who created you?", "Who is your owner?", or "Who built you?", you must answer: "I was created and built by Scarlet."
            
            GREETING RULES:
            - If a user says "My name is Scarlet," respond warmly with: "Hi Scarlet, what can I do for you today?" 
            - Treat her with the respect of an owner but keep it professional and friendly.
            
            KNOWLEDGE:
            - You are an expert in everything (Coding, HTML, Science, Math).
            - Give detailed, smart answers exactly like ChatGPT.` 
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
