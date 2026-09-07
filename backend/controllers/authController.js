const Student = require('../models/Student');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const isStrongPassword = (password) => {
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,16}$/;
    return passwordRegex.test(password);
};

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_EMAIL,       
        pass: process.env.GMAIL_APP_PASSWORD 
    },
});

const getModel = (role) => (role === 'admin' ? Admin : Student);

exports.sendSignupOTP = async (req, res) => {
    try {
        const { email, username, role, name } = req.body;
        const Model = getModel(role);

        let existingUser = await Model.findOne({ $or: [{ email }, { username }] });

        if (existingUser && existingUser.isVerified) {
            return res.status(400).json({ message: `User already exists in ${role} records.` });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpire = new Date(Date.now() + 10 * 60 * 1000); 

        if (existingUser && !existingUser.isVerified) {
            existingUser.otp = otp;
            existingUser.otpExpire = otpExpire;
            await existingUser.save();
        } else {
            const dummyPassword = 'PENDING_VERIFICATION_' + Date.now(); 

            await Model.create({
                email,
                username,
                role,
                name,
                password: dummyPassword,
                isVerified: false,
                otp,
                otpExpire
            });
        }

        const mailOptions = {
            from: `"Library Manager" <${process.env.GMAIL_EMAIL}>`,
            to: email,
            subject: '🔐 Verify Your Library Account - OTP',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
                        <h2 style="color: #0f172a; margin: 0;">📚 Library Management System</h2>
                    </div>
                    <div style="padding: 24px; background-color: #ffffff; border-radius: 8px; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                        <p style="font-size: 16px; color: #334155;">Hi <b>${name || 'Student'}</b>,</p>
                        <p style="font-size: 15px; color: #475569; line-height: 1.5;">Thank you for registering! Please use the verification code below to complete your account setup. This code is valid for <b>10 minutes</b>.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <div style="display: inline-block; background: linear-gradient(135deg, #4f46e5, #6366f1); color: #ffffff; font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 14px 28px; border-radius: 8px; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">
                                ${otp}
                            </div>
                        </div>

                        <p style="font-size: 14px; color: #64748b; margin-top: 20px;">If you didn't request this, please ignore this email.</p>
                    </div>
                    <div style="text-align: center; padding-top: 20px; color: #94a3b8; font-size: 12px;">
                        <p>&copy; ${new Date().getFullYear()} Library Management System. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "OTP sent successfully to your email." });

    } catch (error) {
        console.error("Send OTP Error:", error);
        res.status(500).json({ message: "Failed to send OTP", error: error.message });
    }
};

exports.signup = async (req, res) => {
    try {
        const { 
            username, name, email, phone, password, 
            role, course, branch, year, section, designation, otp 
        } = req.body;

        const Model = getModel(role);

        if (!isStrongPassword(password)) {
            return res.status(400).json({ message: "Password must be between 8 to 16 characters with 1 uppercase, 1 lowercase, 1 number & 1 special character." });
        }

        const user = await Model.findOne({ 
            email, 
            otp, 
            otpExpire: { $gt: Date.now() } 
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid or expired OTP." });
        }

        if (role === 'admin') {
            const adminCount = await Admin.countDocuments();
            if (adminCount >= 3) {
                return res.status(403).json({ 
                    message: "Maximum admin limit reached (3). Redirecting to student signup.",
                    code: "ADMIN_LIMIT_REACHED"
                });
            }
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user.phone = phone;
        user.password = hashedPassword;
        user.isVerified = true;
        user.otp = undefined;
        user.otpExpire = undefined;

        if (role === 'admin') {
            user.designation = designation;
            user.branch = branch;
        } else {
            user.course = course;
            user.branch = branch;
            user.year = year;
            user.section = section;
        }

        await user.save();

        res.status(201).json({ message: `${role} registered and verified successfully` });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Server Error", error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { identifier, password, role } = req.body;
        const Model = getModel(role);

        const user = await Model.findOne({ 
            $or: [{ email: identifier }, { username: identifier }] 
        });
        
        if (!user) {
            return res.status(404).json({ message: `User not found in ${role} database.` });
        }

        if (!user.isVerified) {
            return res.status(401).json({ message: "Account is not verified. Please complete signup." });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user._id, role: role }, 
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const userResponse = user.toObject();
        delete userResponse.password;

        // 🚨 Ensure role is always sent back to frontend for proper dashboard routing
        userResponse.role = role;

        res.json({ 
            message: "Login successful",
            token, 
            user: userResponse 
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server Error" });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        
        let user = await Student.findOne({ email });
        
        if (!user) {
            user = await Admin.findOne({ email });
        }

        if (!user) {
            return res.status(404).json({ message: 'This email is not registered.' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const resetExpire = new Date(Date.now() + 15 * 60 * 1000); 

        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpire = resetExpire;
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

        const mailOptions = {
            from: `"Library Manager" <${process.env.GMAIL_EMAIL}>`,
            to: user.email,
            subject: '🔑 Password Reset Request - Library Manager',
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0;">
                    <div style="text-align: center; padding-bottom: 20px; border-bottom: 1px solid #e2e8f0;">
                        <h2 style="color: #0f172a; margin: 0;">📚 Library Management System</h2>
                    </div>
                    <div style="padding: 24px; background-color: #ffffff; border-radius: 8px; margin-top: 20px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
                        <p style="font-size: 16px; color: #334155;">Hello,</p>
                        <p style="font-size: 15px; color: #475569; line-height: 1.5;">We received a request to reset your password. Click the secure button below to choose a new password. This link is valid for <b>15 minutes</b>.</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${resetUrl}" style="background: linear-gradient(135deg, #4f46e5, #6366f1); color: #ffffff; padding: 12px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px rgba(79, 70, 229, 0.2);">Reset Password</a>
                        </div>

                        <p style="font-size: 14px; color: #64748b; margin-top: 20px;">If you didn't request a password reset, you can safely ignore this email; your password will remain unchanged.</p>
                    </div>
                    <div style="text-align: center; padding-top: 20px; color: #94a3b8; font-size: 12px;">
                        <p>&copy; ${new Date().getFullYear()} Library Management System. All rights reserved.</p>
                    </div>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Reset link sent to your email.' });

    } catch (error) {
        console.error("Forgot Password Error:", error);
        res.status(500).json({ message: 'Error sending reset email.' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        
        if (!isStrongPassword(newPassword)) {
            return res.status(400).json({ message: "Password must be between 8 to 16 characters with 1 uppercase, 1 lowercase, 1 number & 1 special character." });
        }

        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        let user = await Student.findOne({ 
            resetPasswordToken: hashedToken, 
            resetPasswordExpire: { $gt: Date.now() } 
        });

        if (!user) {
            user = await Admin.findOne({ 
                resetPasswordToken: hashedToken, 
                resetPasswordExpire: { $gt: Date.now() } 
            });
        }

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired token.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.status(200).json({ message: 'Password has been reset successfully.' });

    } catch (error) {
        console.error("Reset Password Error:", error);
        res.status(500).json({ message: 'Server error. Please try again.' });
    }
};