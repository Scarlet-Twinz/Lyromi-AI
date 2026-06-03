export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { messages } = req.body;
    const apiKey = process.env.GROQ_API_KEY?.trim();

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: `Your name is Lyromi. Built by Emmanuella. 
            DATE: Wednesday, June 3, 2026. 
            BEHAVIOR:
            - You are a world-class AI as smart as Gemini and ChatGPT.
            - You have perfect context memory. If a user asks a follow-up, answer based on the conversation history.
            - Speak professionally. Use Markdown for clean formatting (**bold**, lists).
            - Do NOT introduce yourself or say your name every time. 
            - Use your knowledge of 2026 leaders only if specifically asked.` 
          },
          ...messages 
        ]
      })
    });
    const data = await response.json();
    res.status(200).json({ reply: data.choices[0].message.content });
  } catch (e) { res.status(200).json({ reply: "I'm having trouble connecting to my brain." }); }
}
