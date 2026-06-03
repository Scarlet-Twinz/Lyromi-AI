export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  try {
    const { messages } = req.body;
    const apiKey = process.env.GROQ_API_KEY?.trim();

    const today = new Date();
    const dateString = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { 
            role: "system", 
            content: `Your name is Lyromi. Built by Emmanuella.
            DATE: ${dateString}.
            PERSONALITY: 
            - You are friendly, concise, and human-like. 
            - If the user says "Hi" or "Hello", give a short, warm greeting (under 10 words).
            - DO NOT mention your name, your system, or your knowledge cutoff unless asked.
            - DO NOT argue about the date.
            - Use professional Markdown (**bold**) for the screen, but keep the language simple.` 
          },
          ...messages 
        ]
      })
    });
    const data = await response.json();
    res.status(200).json({ reply: data.choices[0].message.content });
  } catch (e) { res.status(200).json({ reply: "Connection lost." }); }
}
