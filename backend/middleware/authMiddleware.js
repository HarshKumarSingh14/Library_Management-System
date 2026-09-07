const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
    // 1. Header se token nikalna
    let token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: "Access Denied. No token provided." });
    }

    try {
        // 2. Bearer prefix handle karna
        if (token.startsWith('Bearer ')) {
            token = token.slice(7, token.length).trimLeft();
        }

        // 3. Token verify karna
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // 4. Request object mein user data attach karna
        // Isse aap req.user.id aur req.user.role ko routes mein use kar payenge
        req.user = decoded; 
        
        next();
    } catch (err) {
        // Agar token expire ho gaya ya galat hai
        console.error("Auth Error:", err.message);
        res.status(401).json({ message: "Session expired or invalid token. Please login again." });
    }
};

// --- EXTRA: Role based session tracking ---
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ message: "Access denied. Admins only." });
    }
};

module.exports = { protect, adminOnly };