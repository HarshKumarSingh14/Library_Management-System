require('dotenv').config();

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    // Sabse stable endpoint to check access
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.log("❌ API Key Error:", data.error.message);
            console.log("Tip: Check if your API Key is correct in .env");
            return;
        }

        console.log("✅ Your Key supports these models:");
        data.models.forEach(m => {
            // Check if it supports chatting
            if (m.supportedGenerationMethods.includes("generateContent")) {
                console.log(`- ${m.name.split('/').pop()}`);
            }
        });
    } catch (err) {
        console.log("❌ Connection Error:", err.message);
    }
}

listModels();