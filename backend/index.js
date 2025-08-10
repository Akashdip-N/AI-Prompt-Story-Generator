import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import cors from "cors";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const API_KEY = process.env.GOOGLE_API_KEY;

app.post("/generate-story-stream", async (req, res) => {
    const { prompt, style, wordCount } = req.body;

    if (!prompt) {
        res.writeHead(400, { "Content-Type": "application/json" });
        return res.end(JSON.stringify({ error: "Prompt is required" }));
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const storyPrompt = `
You are a storyteller.
Write an engaging ${style} story of about ${wordCount} words based on the following prompt:
"${prompt}"
Preserve natural paragraph spacing. Do not exceed ${wordCount + 20} words.
    `;

    try {
        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: storyPrompt }] }]
                })
            }
        );

        const data = await response.json();
        console.log(data);
        const story = data.candidates?.[0]?.content?.parts?.[0]?.text || "No story generated.";

        const paragraphs = story.split(/\n\s*\n/);
        let index = 0;

        const interval = setInterval(() => {
            if (index < paragraphs.length) {
                res.write(`data: ${paragraphs[index]}\n\n`);
                index++;
            } else {
                clearInterval(interval);
                res.write("data: [DONE]\n\n");
                res.end();
            }
        }, 800);
    } catch (error) {
        console.error(error);
        res.write(`data: Error generating story.\n\n`);
        res.write("data: [DONE]\n\n");
        res.end();
    }
});

// Add near the top where you define routes
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const PORT = 3000;
app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
