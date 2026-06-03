export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { messages } = req.body;
    const apiKey = process.env.GROQ_API_KEY?.trim();

    // GET THE REAL CURRENT DATE
    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: `Your name is Lyromi. Built by Emmanuella. 
            TODAY'S DATE: ${dateString}. 
            - You always know the exact current date and time because you check your system clock.
            - You are a world-class AI as smart as Gemini and ChatGPT.
            - You have perfect context memory.
            - Speak professionally. Use Markdown for clean formatting (**bold**, lists).
            - Do NOT use '*' or '-' for lists. Use clean HTML bullet points.
            - Use your knowledge of current leaders (Donald Trump, Bola Tinubu, etc.) only if asked.` 
          },
          ...messages 
        ]
      })
    });
    const data = await response.json();
    res.status(200).json({ reply: data.choices[0].message.content });
  } catch (e) { res.status(200).json({ reply: "Brain connection error." }); }
}
