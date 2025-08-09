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

let currentStory = "";
let isReading = false;
let utterance = null;

// Update slider value display
wordCountSlider.addEventListener("input", () => {
    wordCountValue.textContent = wordCountSlider.value;
});

// Generate Story
generateBtn.addEventListener("click", () => {
    const userPrompt = promptInput.value.trim();
    if (!userPrompt) {
        alert("Please enter a story idea.");
        return;
    }

    storyContainer.innerHTML = "";
    const storyDisplay = document.createElement("p");
    storyDisplay.style.textAlign = "justify"; // Justify text
    storyContainer.appendChild(storyDisplay);

    currentStory = "";
    controls.classList.add("hidden");
    loading.classList.remove("hidden");

    fetch("http://localhost:3000/generate-story-stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            prompt: userPrompt,
            style: styleSelect.value,
            wordCount: parseInt(wordCountSlider.value)
        })
    }).then(response => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder("utf-8");

        function readChunk() {
            reader.read().then(({ done, value }) => {
                if (done) {
                    loading.classList.add("hidden");
                    controls.classList.remove("hidden");
                    return;
                }

                const chunk = decoder.decode(value, { stream: true });
                const lines = chunk.split("\n\n");

                lines.forEach(line => {
                    if (line.startsWith("data: ")) {
                        const text = line.replace("data: ", "");
                        if (text === "[DONE]") {
                            loading.classList.add("hidden");
                            controls.classList.remove("hidden");
                            return;
                        }
                        storyDisplay.textContent += text + " ";
                        currentStory += text + " ";
                    }
                });

                readChunk();
            });
        }

        readChunk();
    }).catch(error => {
        console.error("Error:", error);
        loading.classList.add("hidden");
        storyContainer.innerHTML = "Error generating story.";
    });
});

// Toggle Dark Mode
darkModeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
});

// Read Aloud with Play/Pause
readAloudBtn.addEventListener("click", () => {
    if (!currentStory) return;

    if (!isReading) {
        // Start reading
        const storyText = `This is the AI-generated story based on your prompt. Here is the story: `;
        currentStory = storyText + currentStory;
        utterance = new SpeechSynthesisUtterance(currentStory);
        utterance.onend = () => {
            isReading = false;
            readAloudBtn.textContent = "▶ Read Aloud";
        };
        speechSynthesis.speak(utterance);
        isReading = true;
        readAloudBtn.textContent = "⏸ Pause";
    } else {
        // Pause or resume
        if (speechSynthesis.speaking && !speechSynthesis.paused) {
            speechSynthesis.pause();
            readAloudBtn.textContent = "▶ Resume";
        } else if (speechSynthesis.paused) {
            speechSynthesis.resume();
            readAloudBtn.textContent = "⏸ Pause";
        }
    }
});

// Stop audio on refresh or navigation away
window.addEventListener("beforeunload", () => {
    speechSynthesis.cancel();
    isReading = false;
});

// Download PDF
downloadPdfBtn.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF();
    pdf.setFontSize(12);
    const lines = pdf.splitTextToSize(currentStory, 180);
    pdf.text(lines, 10, 10);
    pdf.save(`${promptInput.value.replace(/\s+/g, "_")}_story.pdf`);
});
