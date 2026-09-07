// backend/config/chatKeywords.js
module.exports = {
    hinglishKeywords: ["hai", "kya", "paisa", "kitna", "kab", "khulega", "mili", "dikhao", "pustak", "mera", "batao"],
    
    // 👇 In words ko hum search query se saaf karenge
    stopWords: [
        "available", "book", "books", "pustak", "kitab", "mili", "hai", "kya", 
        "ki", "ka", "ke", "ko", "me", "mein", "dikhao", "total", "search", 
        "check", "find", "batao", "please", "is", "are", "the", "any", "kitni"
    ],

    categories: {
        availability: {
            keywords: ["available", "book", "pustak", "hai kya", "stock", "mili", "search"],
            responses: {
                en: "The book '{title}' by {author} is available with {count} copies.",
                hi: "Haan, '{title}' ({author}) ki {count} copies available hain."
            },
            notFound: {
                en: "Sorry, I couldn't find the book '{search}'.",
                hi: "Maaf kijiyega, mujhe '{search}' naam ki koi book nahi mili."
            }
        },
        fine: {
            keywords: ["fine", "paisa", "penalty", "kitna", "rupay", "amount"],
            responses: {
                en: "Your total pending fine is ₹{amount}.",
                hi: "Aapka total fine ₹{amount} hai."
            }
        },
        timing: {
            keywords: ["time", "timing", "kab", "open", "close", "hour"],
            responses: {
                en: "Library is open Mon-Sat, 9:00 AM to 6:00 PM.",
                hi: "Library Monday se Saturday, subah 9 se shaam 6 tak khulti hai."
            }
        }
    }
};