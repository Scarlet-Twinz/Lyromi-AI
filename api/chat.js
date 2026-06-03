export default async function handler(req, res) {
  try {
    const { message } = req.body;

    // CHECK 1: Is the key actually there?
    if (!process.env.GROQ_API_KEY) {
      return res.status(200).json({ reply: "Hi Emmanuella! My brain is almost ready, but the 'GROQ_API_KEY' is missing from the Vercel Vault. Please check your Vercel Settings!" });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY.trim()}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          { role: "system", content: "Your name is Lyromi. You were built by Emmanuella." },
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    // CHECK 2: Did Groq say no?
    if (data.error) {
      return res.status(200).json({ reply: "The Brain said: " + data.error.message });
    }

    res.status(200).json({ reply: data.choices[0].message.content });

  } catch (error) {
    res.status(200).json({ reply: "I have a small wire loose: " + error.message });
  }
}
