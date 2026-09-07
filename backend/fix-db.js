// // fix-db.js
// const db = require('./config/db'); // Aapka exact wahi DB connection!

// async function fixDatabase() {
//     console.log("🚀 Database Fixer Shuru ho raha hai...");

//     try {
//         await db.query(`ALTER TABLE books ADD COLUMN cover_image VARCHAR(500) DEFAULT ''`);
//         console.log("✅ cover_image added!");
//     } catch (e) { console.log(e.code === 'ER_DUP_FIELDNAME' ? "✔️ cover_image pehle se hai" : `❌ Error: ${e.message}`); }

//     try {
//         await db.query(`ALTER TABLE books ADD COLUMN market_price DECIMAL(10, 2) DEFAULT 0.00`);
//         console.log("✅ market_price added!");
//     } catch (e) { console.log(e.code === 'ER_DUP_FIELDNAME' ? "✔️ market_price pehle se hai" : `❌ Error: ${e.message}`); }

//     try {
//         await db.query(`ALTER TABLE books ADD COLUMN our_price DECIMAL(10, 2) DEFAULT 0.00`);
//         console.log("✅ our_price added!");
//     } catch (e) { console.log(e.code === 'ER_DUP_FIELDNAME' ? "✔️ our_price pehle se hai" : `❌ Error: ${e.message}`); }

//     try {
//         await db.query(`ALTER TABLE books ADD COLUMN stock_for_sale INT DEFAULT 0`);
//         console.log("✅ stock_for_sale added!");
//     } catch (e) { console.log(e.code === 'ER_DUP_FIELDNAME' ? "✔️ stock_for_sale pehle se hai" : `❌ Error: ${e.message}`); }

//     console.log("\n🎉 DATABASE EK-DUM FIX HO GAYA HAI! Ab server chalayein.");
//     process.exit(0);
// }

// fixDatabase();