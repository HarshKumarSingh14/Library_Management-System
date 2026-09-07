const express = require('express');
const router = express.Router();
const Book = require('../models/Book');           // Mongoose Book Model
const Transaction = require('../models/Transaction'); // Mongoose Transaction Model
const chatConfig = require('../config/chatKeywords');

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

router.post('/query', async (req, res) => {
    const { message, studentId } = req.body;
    if (!message) return res.status(400).json({ error: "Message is empty" });

    const msg = message.toLowerCase();
    const isHinglish = chatConfig.hinglishKeywords.some(word => msg.includes(word));
    const lang = isHinglish ? 'hi' : 'en';

    try {
        // 1. TIMING CHECK
        if (chatConfig.categories.timing.keywords.some(k => msg.includes(k))) {
            return res.json({ reply: chatConfig.categories.timing.responses[lang] });
        }

        // 2. FINE CHECK (Using Mongoose Aggregation for Sum)
        if (chatConfig.categories.fine.keywords.some(k => msg.includes(k))) {
            let amount = 0;
            try {
                const fineData = await Transaction.aggregate([
                    { $match: { student_id: studentId, status: 'issued' } },
                    { $group: { _id: null, total: { $sum: '$fine_amount' } } }
                ]);
                amount = fineData[0]?.total || 0;
            } catch (err) {
                console.error("Fine Calculation Error:", err);
            }
            return res.json({ reply: chatConfig.categories.fine.responses[lang].replace("{amount}", amount) });
        }

        // 3. AVAILABILITY CHECK with Config StopWords
        if (chatConfig.categories.availability.keywords.some(k => msg.includes(k))) {
            
            let searchTitle = msg.split(/\s+/)
                .filter(word => !chatConfig.stopWords.includes(word))
                .join(" ").trim();

            if (searchTitle.length >= 2) {
                // Case-insensitive regex search using Mongoose
                const book = await Book.findOne({ title: new RegExp(searchTitle, 'i') });

                if (book) {
                    return res.json({ 
                        reply: chatConfig.categories.availability.responses[lang]
                            .replace("{title}", book.title)
                            .replace("{author}", book.author)
                            .replace("{count}", book.available_copies) 
                    });
                } else {
                    return res.json({ 
                        reply: chatConfig.categories.availability.notFound[lang].replace("{search}", searchTitle) 
                    });
                }
            }
        }

        // 4. GEMINI FALLBACK
        await sleep(1000); 
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${process.env.GEMINI_API_KEY}`;
        const aiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: `Library Bot. Reply in ${isHinglish ? 'Hinglish' : 'English'}: "${message}"` }] }]
            })
        });

        const data = await aiResponse.json();
        res.json({ reply: data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm not sure about that." });

    } catch (err) {
        console.error("Chat Query Error:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

module.exports = router;