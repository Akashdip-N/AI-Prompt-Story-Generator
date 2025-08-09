const generateBtn = document.getElementById("generateBtn");
const promptInput = document.getElementById("prompt");
const styleSelect = document.getElementById("style");
const wordCountSlider = document.getElementById("wordCount");
const wordCountValue = document.getElementById("wordCountValue");
const storyContainer = document.getElementById("storyContainer");
const loading = document.getElementById("loading");
const controls = document.getElementById("controls");
const darkModeBtn = document.getElementById("darkModeBtn");
const readAloudBtn = document.getElementById("readAloudBtn");
const downloadTxtBtn = document.getElementById("downloadTxt");
const downloadPdfBtn = document.getElementById("downloadPdf");

let isReading = false;
let utterance = null;
let fullStory = "";

document.getElementById("wordCount").addEventListener("input", (e) => {
    document.getElementById("wordCountValue").textContent = e.target.value;
});

document.getElementById("generateBtn").addEventListener("click", () => {
    const prompt = document.getElementById("prompt").value;
    const style = document.getElementById("style").value;
    const wordCount = document.getElementById("wordCount").value;
    const storyContainer = document.getElementById("storyContainer");

    if (!prompt.trim()) {
        alert("Please enter a prompt.");
        return;
    }

    storyContainer.innerHTML = "";
    document.getElementById("loading").textContent = "⏳ The AI is thinking...";
    document.getElementById("loading").classList.remove("hidden");
    document.getElementById("controls").classList.add("hidden");

    let started = false;

    fetch("http://localhost:3000/generate-story-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, style, wordCount })
    }).then(async (res) => {
        const reader = res.body.getReader();
        const decoder = new TextDecoder("utf-8");

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            const chunk = decoder.decode(value);
            const lines = chunk.split("\n\n").filter(l => l.startsWith("data:"));

            for (let line of lines) {
                let text = line.replace(/^data:\s*/, "");
                if (text === "[DONE]") {
                    document.getElementById("controls").classList.remove("hidden");
                    return;
                }
                if (!started) {
                    document.getElementById("loading").textContent = "📜 Here is your story:";
                    started = true;
                }
                if (text.trim()) {
                    fullStory += text + "\n\n";
                    storyContainer.innerHTML = fullStory
                        .replace(/\n\s*\n/g, "<br><br>")
                        .replace(/\n/g, "<br>");
                }
            }
        }
    });

    // Save PDF
    document.getElementById("downloadPdf").onclick = () => {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        const pageHeight = doc.internal.pageSize.getHeight();
        const pageWidth = doc.internal.pageSize.getWidth();
        const margin = 15;
        const maxWidth = pageWidth - (margin * 2);
        const fontSize = 15;
        const lineHeight = 6;

        doc.setFontSize(fontSize);
        let y = margin;

        const paragraphs = fullStory.trim().split(/\n\s*\n/);

        paragraphs.forEach(p => {
            const lines = doc.splitTextToSize(p, maxWidth);
            const paragraphHeight = lines.length * lineHeight;

            if (y + paragraphHeight > pageHeight - margin) {
                doc.addPage();
                y = margin;
            }

            lines.forEach(line => {
                doc.text(line, margin, y);
                y += lineHeight;
            });

            y += lineHeight;
        });

        doc.save(`${prompt.replace(/\s+/g, "_")}_story.pdf`);
    };
});

// Toggle Dark Mode
darkModeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});

// Read Aloud with Play/Pause
readAloudBtn.addEventListener("click", () => {
    if (!fullStory) {
        console.log("No story available for reading.");
        return;
    }

    if (!isReading) {
        const storyToRead = `This is the AI-generated story based on your prompt. Here is the story: ${fullStory}`;
        utterance = new SpeechSynthesisUtterance(storyToRead);
        utterance.onend = () => {
            isReading = false;
            readAloudBtn.textContent = "▶ Read Aloud";
        };
        speechSynthesis.speak(utterance);
        isReading = true;
        readAloudBtn.textContent = "⏸ Pause";
    } else {
        if (speechSynthesis.speaking && !speechSynthesis.paused) {
            speechSynthesis.pause();
            readAloudBtn.textContent = "▶ Resume";
        } else if (speechSynthesis.paused) {
            speechSynthesis.resume();
            readAloudBtn.textContent = "⏸ Pause";
        }
    }
});

window.addEventListener("beforeunload", () => {
    speechSynthesis.cancel();
    isReading = false;
});