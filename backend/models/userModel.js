const Admin = require('./Admin');   // Mongoose Admin Model
const Student = require('./Student'); // Mongoose Student Model

const User = {
    // Admin collection se count check karna
    countAdmins: async () => {
        return await Admin.countDocuments();
    },

    // Signup logic based on role (MongoDB version)
    create: async (userData) => {
        const { role, username, name, email, phone, password, branch, course, year, section, designation } = userData;
        
        if (role === 'admin') {
            return await Admin.create({
                username,
                name,
                email,
                phone,
                password,
                designation,
                branch,
                isVerified: false // Default unverified state
            });
        } else {
            return await Student.create({
                username,
                name,
                email,
                phone,
                password,
                course,
                branch,
                year,
                section,
                isVerified: false
            });
        }
    },

    // Login logic: Role ke hisaab se sahi collection mein check karna
    findByEmailOrUsername: async (identifier, role) => {
        const Model = role === 'admin' ? Admin : Student;
        
        // MongoDB mein $or operator use karke email ya username match karte hain
        return await Model.findOne({
            $or: [{ email: identifier }, { username: identifier }]
        });
    }
};

module.exports = User;