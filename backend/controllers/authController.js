// const Student = require('../models/Student');
// const Admin = require('../models/Admin');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');

// // ----------------------------------------------------
// // PASSWORD VALIDATION
// // ----------------------------------------------------
// const isStrongPassword = (password) => {
//     const passwordRegex =
//         /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,16}$/;

//     return passwordRegex.test(password);
// };

// // ----------------------------------------------------
// // BREVO EMAIL API
// // SMTP/Nodemailer ki jagah Brevo HTTP API
// // ----------------------------------------------------
// const sendBrevoEmail = async ({ to, subject, htmlContent }) => {
//     try {
//         if (!process.env.BREVO_API_KEY) {
//             throw new Error('BREVO_API_KEY is not configured');
//         }

//         if (!process.env.BREVO_SENDER_EMAIL) {
//             throw new Error('BREVO_SENDER_EMAIL is not configured');
//         }

//         const response = await fetch(
//             'https://api.brevo.com/v3/smtp/email',
//             {
//                 method: 'POST',
//                 headers: {
//                     accept: 'application/json',
//                     'api-key': process.env.BREVO_API_KEY,
//                     'content-type': 'application/json'
//                 },
//                 body: JSON.stringify({
//                     sender: {
//                         name: 'Library Manager',
//                         email: process.env.BREVO_SENDER_EMAIL
//                     },
//                     to: [
//                         {
//                             email: to
//                         }
//                     ],
//                     subject,
//                     htmlContent
//                 })
//             }
//         );

//         const data = await response.json();

//         if (!response.ok) {
//             console.error('Brevo API Error:', data);

//             throw new Error(
//                 data.message || 'Failed to send email through Brevo'
//             );
//         }

//         console.log('Brevo Email Sent:', data.messageId);

//         return data;

//     } catch (error) {
//         console.error('Brevo Email Error:', error);
//         throw error;
//     }
// };

// // ----------------------------------------------------
// // GET MODEL BASED ON ROLE
// // ----------------------------------------------------
// const getModel = (role) => {
//     return role === 'admin' ? Admin : Student;
// };

// // ====================================================
// // 1. SEND SIGNUP OTP
// // ====================================================
// exports.sendSignupOTP = async (req, res) => {
//     try {
//         const { email, username, role, name } = req.body;

//         // Basic validation
//         if (!email || !username || !role) {
//             return res.status(400).json({
//                 message: 'Email, username and role are required.'
//             });
//         }

//         const Model = getModel(role);

//         // Check existing user
//         let existingUser = await Model.findOne({
//             $or: [
//                 { email },
//                 { username }
//             ]
//         });

//         // Already verified
//         if (existingUser && existingUser.isVerified) {
//             return res.status(400).json({
//                 message: `User already exists in ${role} records.`
//             });
//         }

//         // Generate 6 digit OTP
//         const otp = Math.floor(
//             100000 + Math.random() * 900000
//         ).toString();

//         // OTP valid for 10 minutes
//         const otpExpire = new Date(
//             Date.now() + 10 * 60 * 1000
//         );

//         // ------------------------------------------------
//         // UPDATE EXISTING UNVERIFIED USER
//         // ------------------------------------------------
//         if (existingUser && !existingUser.isVerified) {

//             existingUser.otp = otp;
//             existingUser.otpExpire = otpExpire;

//             await existingUser.save();

//         } else {

//             // ------------------------------------------------
//             // CREATE TEMPORARY USER
//             // ------------------------------------------------
//             const dummyPassword =
//                 'PENDING_VERIFICATION_' + Date.now();

//             await Model.create({
//                 email,
//                 username,
//                 role,
//                 name,
//                 password: dummyPassword,
//                 isVerified: false,
//                 otp,
//                 otpExpire
//             });
//         }

//         // ------------------------------------------------
//         // EMAIL HTML
//         // ------------------------------------------------
//         const htmlContent = `
//             <div style="
//                 font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//                 max-width: 600px;
//                 margin: auto;
//                 background-color: #f8fafc;
//                 padding: 20px;
//                 border-radius: 12px;
//                 border: 1px solid #e2e8f0;
//             ">

//                 <div style="
//                     text-align: center;
//                     padding-bottom: 20px;
//                     border-bottom: 1px solid #e2e8f0;
//                 ">
//                     <h2 style="
//                         color: #0f172a;
//                         margin: 0;
//                     ">
//                         📚 Library Management System
//                     </h2>
//                 </div>

//                 <div style="
//                     padding: 24px;
//                     background-color: #ffffff;
//                     border-radius: 8px;
//                     margin-top: 20px;
//                     box-shadow: 0 1px 3px rgba(0,0,0,0.05);
//                 ">

//                     <p style="
//                         font-size: 16px;
//                         color: #334155;
//                     ">
//                         Hi <b>${name || 'Student'}</b>,
//                     </p>

//                     <p style="
//                         font-size: 15px;
//                         color: #475569;
//                         line-height: 1.5;
//                     ">
//                         Thank you for registering!
//                         Please use the verification code below
//                         to complete your account setup.
//                         This code is valid for <b>10 minutes</b>.
//                     </p>

//                     <div style="
//                         text-align: center;
//                         margin: 30px 0;
//                     ">

//                         <div style="
//                             display: inline-block;
//                             background: linear-gradient(
//                                 135deg,
//                                 #4f46e5,
//                                 #6366f1
//                             );
//                             color: #ffffff;
//                             font-size: 32px;
//                             font-weight: bold;
//                             letter-spacing: 6px;
//                             padding: 14px 28px;
//                             border-radius: 8px;
//                             box-shadow:
//                                 0 4px 6px
//                                 rgba(79,70,229,0.2);
//                         ">
//                             ${otp}
//                         </div>

//                     </div>

//                     <p style="
//                         font-size: 14px;
//                         color: #64748b;
//                         margin-top: 20px;
//                     ">
//                         If you didn't request this,
//                         please ignore this email.
//                     </p>

//                 </div>

//                 <div style="
//                     text-align: center;
//                     padding-top: 20px;
//                     color: #94a3b8;
//                     font-size: 12px;
//                 ">
//                     <p>
//                         &copy; ${new Date().getFullYear()}
//                         Library Management System.
//                         All rights reserved.
//                     </p>
//                 </div>

//             </div>
//         `;

//         // ------------------------------------------------
//         // SEND EMAIL THROUGH BREVO API
//         // ------------------------------------------------
//         await sendBrevoEmail({
//             to: email,
//             subject: '🔐 Verify Your Library Account - OTP',
//             htmlContent
//         });

//         return res.status(200).json({
//             message: 'OTP sent successfully to your email.'
//         });

//     } catch (error) {

//         console.error('Send OTP Error:', error);

//         return res.status(500).json({
//             message: 'Failed to send OTP',
//             error: error.message
//         });
//     }
// };

// // ====================================================
// // 2. COMPLETE SIGNUP
// // ====================================================
// exports.signup = async (req, res) => {
//     try {

//         const {
//             username,
//             name,
//             email,
//             phone,
//             password,
//             role,
//             course,
//             branch,
//             year,
//             section,
//             designation,
//             otp
//         } = req.body;

//         const Model = getModel(role);

//         // Password validation
//         if (!isStrongPassword(password)) {
//             return res.status(400).json({
//                 message:
//                     'Password must be between 8 to 16 characters with 1 uppercase, 1 lowercase, 1 number & 1 special character.'
//             });
//         }

//         // Find user using email + OTP
//         const user = await Model.findOne({
//             email,
//             otp,
//             otpExpire: {
//                 $gt: Date.now()
//             }
//         });

//         if (!user) {
//             return res.status(400).json({
//                 message: 'Invalid or expired OTP.'
//             });
//         }

//         // ------------------------------------------------
//         // ADMIN LIMIT
//         // ------------------------------------------------
//         if (role === 'admin') {

//             const adminCount =
//                 await Admin.countDocuments();

//             if (adminCount >= 3) {
//                 return res.status(403).json({
//                     message:
//                         'Maximum admin limit reached (3). Redirecting to student signup.',
//                     code: 'ADMIN_LIMIT_REACHED'
//                 });
//             }
//         }

//         // ------------------------------------------------
//         // HASH PASSWORD
//         // ------------------------------------------------
//         const salt = await bcrypt.genSalt(10);

//         const hashedPassword =
//             await bcrypt.hash(password, salt);

//         // ------------------------------------------------
//         // UPDATE USER
//         // ------------------------------------------------
//         user.phone = phone;
//         user.password = hashedPassword;
//         user.isVerified = true;

//         // Clear signup OTP
//         user.otp = undefined;
//         user.otpExpire = undefined;

//         // ------------------------------------------------
//         // ROLE SPECIFIC DATA
//         // ------------------------------------------------
//         if (role === 'admin') {

//             user.designation = designation;
//             user.branch = branch;

//         } else {

//             user.course = course;
//             user.branch = branch;
//             user.year = year;
//             user.section = section;
//         }

//         await user.save();

//         return res.status(201).json({
//             message:
//                 `${role} registered and verified successfully`
//         });

//     } catch (error) {

//         console.error('Signup Error:', error);

//         return res.status(500).json({
//             message: 'Server Error',
//             error: error.message
//         });
//     }
// };

// // ====================================================
// // 3. LOGIN
// // ====================================================
// exports.login = async (req, res) => {
//     try {

//         const {
//             identifier,
//             password,
//             role
//         } = req.body;

//         const Model = getModel(role);

//         const user = await Model.findOne({
//             $or: [
//                 { email: identifier },
//                 { username: identifier }
//             ]
//         });

//         if (!user) {
//             return res.status(404).json({
//                 message:
//                     `User not found in ${role} database.`
//             });
//         }

//         if (!user.isVerified) {
//             return res.status(401).json({
//                 message:
//                     'Account is not verified. Please complete signup.'
//             });
//         }

//         const isMatch =
//             await bcrypt.compare(
//                 password,
//                 user.password
//             );

//         if (!isMatch) {
//             return res.status(400).json({
//                 message: 'Invalid credentials'
//             });
//         }

//         const token = jwt.sign(
//             {
//                 id: user._id,
//                 role: role
//             },
//             process.env.JWT_SECRET,
//             {
//                 expiresIn: '1d'
//             }
//         );

//         const userResponse =
//             user.toObject();

//         delete userResponse.password;

//         userResponse.role = role;

//         return res.json({
//             message: 'Login successful',
//             token,
//             user: userResponse
//         });

//     } catch (error) {

//         console.error('Login Error:', error);

//         return res.status(500).json({
//             message: 'Server Error',
//             error: error.message
//         });
//     }
// };

// // ====================================================
// // 4. FORGOT PASSWORD - SEND OTP
// // ====================================================
// exports.forgotPassword = async (req, res) => {
//     try {

//         const { email } = req.body;

//         if (!email) {
//             return res.status(400).json({
//                 message: 'Email is required.'
//             });
//         }

//         // Search Student first
//         let user =
//             await Student.findOne({ email });

//         // Search Admin if not found
//         if (!user) {
//             user =
//                 await Admin.findOne({ email });
//         }

//         if (!user) {
//             return res.status(404).json({
//                 message:
//                     'This email is not registered.'
//             });
//         }

//         // ------------------------------------------------
//         // GENERATE OTP
//         // ------------------------------------------------
//         const otp = Math.floor(
//             100000 + Math.random() * 900000
//         ).toString();

//         // Hash OTP before storing
//         const hashedOtp =
//             crypto
//                 .createHash('sha256')
//                 .update(otp)
//                 .digest('hex');

//         // OTP valid for 10 minutes
//         const resetExpire =
//             new Date(
//                 Date.now() + 10 * 60 * 1000
//             );

//         // FIX:
//         // hashedToken variable ki zarurat nahi
//         user.resetPasswordToken = hashedOtp;
//         user.resetPasswordExpire = resetExpire;

//         await user.save();

//         // ------------------------------------------------
//         // PASSWORD RESET EMAIL
//         // ------------------------------------------------
//         const htmlContent = `
//             <div style="
//                 font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
//                 max-width: 600px;
//                 margin: auto;
//                 background-color: #f8fafc;
//                 padding: 20px;
//                 border-radius: 12px;
//                 border: 1px solid #e2e8f0;
//             ">

//                 <div style="
//                     text-align: center;
//                     padding-bottom: 20px;
//                     border-bottom: 1px solid #e2e8f0;
//                 ">
//                     <h2 style="
//                         color: #0f172a;
//                         margin: 0;
//                     ">
//                         📚 Library Management System
//                     </h2>
//                 </div>

//                 <div style="
//                     padding: 24px;
//                     background-color: #ffffff;
//                     border-radius: 8px;
//                     margin-top: 20px;
//                     box-shadow: 0 1px 3px rgba(0,0,0,0.05);
//                 ">

//                     <p style="
//                         font-size: 16px;
//                         color: #334155;
//                     ">
//                         Hello,
//                     </p>

//                     <p style="
//                         font-size: 15px;
//                         color: #475569;
//                         line-height: 1.5;
//                     ">
//                         We received a request to reset your password.
//                         Use the OTP below to set a new password.
//                         This code is valid for <b>10 minutes</b>.
//                     </p>

//                     <div style="
//                         text-align: center;
//                         margin: 30px 0;
//                     ">

//                         <div style="
//                             display: inline-block;
//                             background: linear-gradient(
//                                 135deg,
//                                 #4f46e5,
//                                 #6366f1
//                             );
//                             color: #ffffff;
//                             font-size: 32px;
//                             font-weight: bold;
//                             letter-spacing: 6px;
//                             padding: 14px 28px;
//                             border-radius: 8px;
//                             box-shadow:
//                                 0 4px 6px
//                                 rgba(79,70,229,0.2);
//                         ">
//                             ${otp}
//                         </div>

//                     </div>

//                     <p style="
//                         font-size: 14px;
//                         color: #64748b;
//                         margin-top: 20px;
//                     ">
//                         If you didn't request a password reset,
//                         you can safely ignore this email;
//                         your password will remain unchanged.
//                     </p>

//                 </div>

//                 <div style="
//                     text-align: center;
//                     padding-top: 20px;
//                     color: #94a3b8;
//                     font-size: 12px;
//                 ">
//                     <p>
//                         &copy; ${new Date().getFullYear()}
//                         Library Management System.
//                         All rights reserved.
//                     </p>
//                 </div>

//             </div>
//         `;

//         // ------------------------------------------------
//         // SEND THROUGH BREVO API
//         // ------------------------------------------------
//         await sendBrevoEmail({
//             to: user.email,
//             subject: '🔑 Password Reset OTP - Library Manager',
//             htmlContent
//         });

//         return res.status(200).json({
//             message: 'OTP sent to your email.'
//         });

//     } catch (error) {

//         console.error(
//             'Forgot Password Error:',
//             error
//         );

//         return res.status(500).json({
//             message: 'Error sending reset email.',
//             error: error.message
//         });
//     }
// };

// // ====================================================
// // 5. RESET PASSWORD
// // ====================================================
// exports.resetPassword = async (req, res) => {
//     try {

//         const {
//             email,
//             otp,
//             newPassword
//         } = req.body;

//         if (!email || !otp || !newPassword) {
//             return res.status(400).json({
//                 message:
//                     'Email, OTP, and new password are required.'
//             });
//         }

//         // Password validation
//         if (!isStrongPassword(newPassword)) {
//             return res.status(400).json({
//                 message:
//                     'Password must be between 8 to 16 characters with 1 uppercase, 1 lowercase, 1 number & 1 special character.'
//             });
//         }

//         // Hash entered OTP
//         const hashedOtp =
//             crypto
//                 .createHash('sha256')
//                 .update(otp.toString().trim())
//                 .digest('hex');

//         // ------------------------------------------------
//         // FIND STUDENT
//         // ------------------------------------------------
//         let user =
//             await Student.findOne({
//                 email,
//                 resetPasswordToken: hashedOtp,
//                 resetPasswordExpire: {
//                     $gt: Date.now()
//                 }
//             });

//         // ------------------------------------------------
//         // FIND ADMIN
//         // ------------------------------------------------
//         if (!user) {
//             user =
//                 await Admin.findOne({
//                     email,
//                     resetPasswordToken: hashedOtp,
//                     resetPasswordExpire: {
//                         $gt: Date.now()
//                     }
//                 });
//         }

//         if (!user) {
//             return res.status(400).json({
//                 message:
//                     'Invalid or expired OTP.'
//             });
//         }

//         // ------------------------------------------------
//         // HASH NEW PASSWORD
//         // ------------------------------------------------
//         const salt =
//             await bcrypt.genSalt(10);

//         const hashedPassword =
//             await bcrypt.hash(
//                 newPassword,
//                 salt
//             );

//         // ------------------------------------------------
//         // SAVE NEW PASSWORD
//         // ------------------------------------------------
//         user.password = hashedPassword;

//         user.resetPasswordToken = undefined;
//         user.resetPasswordExpire = undefined;

//         await user.save();

//         return res.status(200).json({
//             message:
//                 'Password has been reset successfully.'
//         });

//     } catch (error) {

//         console.error(
//             'Reset Password Error:',
//             error
//         );

//         return res.status(500).json({
//             message:
//                 'Server error. Please try again.',
//             error: error.message
//         });
//     }
// };



const Student = require('../models/Student');
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

// ----------------------------------------------------
// PASSWORD VALIDATION
// ----------------------------------------------------
const isStrongPassword = (password) => {
    const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,16}$/;

    return passwordRegex.test(password);
};

// ----------------------------------------------------
// EMAIL VALIDATION
// ----------------------------------------------------
const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// ----------------------------------------------------
// ROLE VALIDATION
// ----------------------------------------------------
const isValidRole = (role) => {
    return role === 'student' || role === 'admin';
};

// ----------------------------------------------------
// HTML ESCAPE
// Prevent HTML injection in email
// ----------------------------------------------------
const escapeHtml = (text = '') => {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
};

// ----------------------------------------------------
// SECURE OTP GENERATOR
// ----------------------------------------------------
const generateOTP = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

// ----------------------------------------------------
// HASH OTP
// ----------------------------------------------------
const hashOTP = (otp) => {
    return crypto
        .createHash('sha256')
        .update(String(otp))
        .digest('hex');
};

// ----------------------------------------------------
// GET MODEL BASED ON ROLE
// ----------------------------------------------------
const getModel = (role) => {
    return role === 'admin' ? Admin : Student;
};

// ----------------------------------------------------
// ADMIN INVITE CODE VALIDATION
// ----------------------------------------------------
const validateAdminInviteCode = (role, inviteCode) => {

    // Student ke liye invite code nahi chahiye
    if (role !== 'admin') {
        return true;
    }

    const adminInviteCode =
        process.env.ADMIN_INVITE_CODE;

    // Server par invite code configured nahi hai
    if (
        !adminInviteCode ||
        typeof inviteCode !== 'string'
    ) {
        return false;
    }

    const providedCode =
        Buffer.from(inviteCode.trim());

    const expectedCode =
        Buffer.from(adminInviteCode.trim());

    // timingSafeEqual same length ke buffers par hi work karta hai
    if (
        providedCode.length !== expectedCode.length
    ) {
        return false;
    }

    return crypto.timingSafeEqual(
        providedCode,
        expectedCode
    );
};

// ----------------------------------------------------
// BREVO EMAIL API
// ----------------------------------------------------
const sendBrevoEmail = async ({
    to,
    subject,
    htmlContent
}) => {
    try {

        if (!process.env.BREVO_API_KEY) {
            throw new Error(
                'BREVO_API_KEY is not configured'
            );
        }

        if (!process.env.BREVO_SENDER_EMAIL) {
            throw new Error(
                'BREVO_SENDER_EMAIL is not configured'
            );
        }

        const response = await fetch(
            'https://api.brevo.com/v3/smtp/email',
            {
                method: 'POST',

                headers: {
                    accept: 'application/json',
                    'api-key':
                        process.env.BREVO_API_KEY,
                    'content-type':
                        'application/json'
                },

                body: JSON.stringify({
                    sender: {
                        name: 'Library Manager',
                        email:
                            process.env.BREVO_SENDER_EMAIL
                    },

                    to: [
                        {
                            email: to
                        }
                    ],

                    subject,
                    htmlContent
                })
            }
        );

        const data =
            await response.json();

        if (!response.ok) {

            console.error(
                'Brevo API Error:',
                data
            );

            throw new Error(
                'Failed to send email through Brevo'
            );
        }

        console.log(
            'Brevo Email Sent:',
            data.messageId
        );

        return data;

    } catch (error) {

        console.error(
            'Brevo Email Error:',
            error.message
        );

        throw error;
    }
};

// ====================================================
// 1. SEND SIGNUP OTP
// ====================================================

exports.sendSignupOTP = async (req, res) => {

    try {

        const {
            email,
            username,
            role,
            name,
            inviteCode
        } = req.body;

        // ------------------------------------------------
        // BASIC VALIDATION
        // ------------------------------------------------

        if (
            !email ||
            !username ||
            !role
        ) {
            return res.status(400).json({
                message:
                    'Email, username and role are required.'
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                message:
                    'Please enter a valid email address.'
            });
        }

        if (!isValidRole(role)) {
            return res.status(400).json({
                message: 'Invalid role.'
            });
        }

        if (
            typeof username !== 'string' ||
            username.trim().length < 3 ||
            username.trim().length > 30
        ) {
            return res.status(400).json({
                message:
                    'Username must be between 3 and 30 characters.'
            });
        }

        // ------------------------------------------------
        // ADMIN INVITE CODE
        // ------------------------------------------------

        if (
            !validateAdminInviteCode(
                role,
                inviteCode
            )
        ) {
            return res.status(403).json({
                message:
                    'Invalid admin invite code.'
            });
        }

        const Model = getModel(role);

        const normalizedEmail =
            email.toLowerCase().trim();

        const normalizedUsername =
            username.trim();

        // ------------------------------------------------
        // CHECK EXISTING USER
        // ------------------------------------------------

        let existingUser =
            await Model.findOne({
                $or: [
                    {
                        email:
                            normalizedEmail
                    },
                    {
                        username:
                            normalizedUsername
                    }
                ]
            });

        // Already verified
        if (
            existingUser &&
            existingUser.isVerified
        ) {
            return res.status(409).json({
                message:
                    'User already exists.'
            });
        }

        // ------------------------------------------------
        // GENERATE SECURE OTP
        // ------------------------------------------------

        const otp = generateOTP();

        const hashedOtp =
            hashOTP(otp);

        // OTP valid for 10 minutes
        const otpExpire =
            new Date(
                Date.now() +
                10 * 60 * 1000
            );

        // ------------------------------------------------
        // CREATE SECURE TEMP PASSWORD
        // ------------------------------------------------

        const temporaryPassword =
            crypto.randomBytes(32).toString('hex');

        const hashedTemporaryPassword =
            await bcrypt.hash(
                temporaryPassword,
                12
            );

        // ------------------------------------------------
        // UPDATE EXISTING UNVERIFIED USER
        // ------------------------------------------------

        if (
            existingUser &&
            !existingUser.isVerified
        ) {

            existingUser.otp =
                hashedOtp;

            existingUser.otpExpire =
                otpExpire;

            await existingUser.save();

        } else {

            // ------------------------------------------------
            // CREATE TEMPORARY USER
            // ------------------------------------------------

            await Model.create({

                email:
                    normalizedEmail,

                username:
                    normalizedUsername,

                role,

                name:
                    String(name || '').trim(),

                password:
                    hashedTemporaryPassword,

                isVerified:
                    false,

                otp:
                    hashedOtp,

                otpExpire
            });
        }

        // ------------------------------------------------
        // SAFE NAME FOR EMAIL
        // ------------------------------------------------

        const safeName =
            escapeHtml(
                name || 'Student'
            );

        // ------------------------------------------------
        // EMAIL HTML
        // ------------------------------------------------

        const htmlContent = `
            <div style="
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 600px;
                margin: auto;
                background-color: #f8fafc;
                padding: 20px;
                border-radius: 12px;
                border: 1px solid #e2e8f0;
            ">

                <div style="
                    text-align: center;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #e2e8f0;
                ">

                    <h2 style="
                        color: #0f172a;
                        margin: 0;
                    ">
                        📚 Library Management System
                    </h2>

                </div>

                <div style="
                    padding: 24px;
                    background-color: #ffffff;
                    border-radius: 8px;
                    margin-top: 20px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                ">

                    <p style="
                        font-size: 16px;
                        color: #334155;
                    ">
                        Hi <b>${safeName}</b>,
                    </p>

                    <p style="
                        font-size: 15px;
                        color: #475569;
                        line-height: 1.5;
                    ">
                        Thank you for registering!
                        Please use the verification code below
                        to complete your account setup.
                        This code is valid for <b>10 minutes</b>.
                    </p>

                    <div style="
                        text-align: center;
                        margin: 30px 0;
                    ">

                        <div style="
                            display: inline-block;
                            background: linear-gradient(
                                135deg,
                                #4f46e5,
                                #6366f1
                            );
                            color: #ffffff;
                            font-size: 32px;
                            font-weight: bold;
                            letter-spacing: 6px;
                            padding: 14px 28px;
                            border-radius: 8px;
                            box-shadow:
                                0 4px 6px
                                rgba(79,70,229,0.2);
                        ">
                            ${otp}
                        </div>

                    </div>

                    <p style="
                        font-size: 14px;
                        color: #64748b;
                        margin-top: 20px;
                    ">
                        If you didn't request this,
                        please ignore this email.
                    </p>

                </div>

                <div style="
                    text-align: center;
                    padding-top: 20px;
                    color: #94a3b8;
                    font-size: 12px;
                ">

                    <p>
                        &copy; ${new Date().getFullYear()}
                        Library Management System.
                        All rights reserved.
                    </p>

                </div>

            </div>
        `;

        // ------------------------------------------------
        // SEND EMAIL
        // ------------------------------------------------

        await sendBrevoEmail({
            to: normalizedEmail,
            subject:
                '🔐 Verify Your Library Account - OTP',
            htmlContent
        });

        return res.status(200).json({
            message:
                'OTP sent successfully to your email.'
        });

    } catch (error) {

        console.error(
            'Send OTP Error:',
            error.message
        );

        return res.status(500).json({
            message:
                'Failed to send OTP.'
        });
    }
};

// ====================================================
// 2. COMPLETE SIGNUP
// ====================================================

exports.signup = async (req, res) => {

    try {

        const {
            username,
            name,
            email,
            phone,
            password,
            role,
            course,
            branch,
            year,
            section,
            designation,
            otp,
            inviteCode
        } = req.body;

        // ------------------------------------------------
        // BASIC VALIDATION
        // ------------------------------------------------

        if (
            !username ||
            !name ||
            !email ||
            !password ||
            !role ||
            !otp
        ) {
            return res.status(400).json({
                message:
                    'Required fields are missing.'
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                message:
                    'Please enter a valid email address.'
            });
        }

        if (!isValidRole(role)) {
            return res.status(400).json({
                message:
                    'Invalid role.'
            });
        }

        // ------------------------------------------------
        // ADMIN INVITE CODE
        // Check again during final signup
        // ------------------------------------------------

        if (
            !validateAdminInviteCode(
                role,
                inviteCode
            )
        ) {
            return res.status(403).json({
                message:
                    'Invalid admin invite code.'
            });
        }

        // ------------------------------------------------
        // PASSWORD VALIDATION
        // ------------------------------------------------

        if (!isStrongPassword(password)) {
            return res.status(400).json({
                message:
                    'Password must be between 8 to 16 characters with 1 uppercase, 1 lowercase, 1 number & 1 special character.'
            });
        }

        const Model =
            getModel(role);

        const normalizedEmail =
            email.toLowerCase().trim();

        // ------------------------------------------------
        // HASH OTP
        // ------------------------------------------------

        const hashedOtp =
            hashOTP(
                String(otp).trim()
            );

        // ------------------------------------------------
        // FIND USER USING EMAIL + HASHED OTP
        // ------------------------------------------------

        const user =
            await Model.findOne({

                email:
                    normalizedEmail,

                otp:
                    hashedOtp,

                otpExpire: {
                    $gt: Date.now()
                }

            });

        if (!user) {
            return res.status(400).json({
                message:
                    'Invalid or expired OTP.'
            });
        }

        // ------------------------------------------------
        // ADMIN LIMIT
        // ------------------------------------------------

        if (role === 'admin') {

            const adminCount =
                await Admin.countDocuments({
                    isVerified: true
                });

            if (adminCount >= 3) {

                return res.status(403).json({

                    message:
                        'Maximum admin limit reached (3). Redirecting to student signup.',

                    code:
                        'ADMIN_LIMIT_REACHED'
                });
            }
        }

        // ------------------------------------------------
        // CHECK USERNAME
        // ------------------------------------------------

        const usernameExists =
            await Model.findOne({

                username:
                    username.trim(),

                _id: {
                    $ne: user._id
                }

            });

        if (usernameExists) {

            return res.status(409).json({
                message:
                    'Username already exists.'
            });
        }

        // ------------------------------------------------
        // HASH PASSWORD
        // ------------------------------------------------

        const salt =
            await bcrypt.genSalt(12);

        const hashedPassword =
            await bcrypt.hash(
                password,
                salt
            );

        // ------------------------------------------------
        // UPDATE USER
        // ------------------------------------------------

        user.username =
            username.trim();

        user.name =
            name.trim();

        user.email =
            normalizedEmail;

        user.phone =
            phone;

        user.password =
            hashedPassword;

        user.isVerified =
            true;

        // ------------------------------------------------
        // CLEAR SIGNUP OTP
        // ------------------------------------------------

        user.otp =
            undefined;

        user.otpExpire =
            undefined;

        // ------------------------------------------------
        // ROLE SPECIFIC DATA
        // ------------------------------------------------

        if (role === 'admin') {

            user.designation =
                designation;

            user.branch =
                branch;

        } else {

            user.course =
                course;

            user.branch =
                branch;

            user.year =
                year;

            user.section =
                section;
        }

        await user.save();

        return res.status(201).json({

            message:
                `${role} registered and verified successfully`

        });

    } catch (error) {

        console.error(
            'Signup Error:',
            error.message
        );

        return res.status(500).json({
            message:
                'Signup failed.'
        });
    }
};

// ====================================================
// 3. LOGIN
// ====================================================

exports.login = async (req, res) => {

    try {

        const {
            identifier,
            password,
            role
        } = req.body;

        // ------------------------------------------------
        // VALIDATION
        // ------------------------------------------------

        if (
            !identifier ||
            !password ||
            !role
        ) {
            return res.status(400).json({
                message:
                    'Identifier, password and role are required.'
            });
        }

        if (!isValidRole(role)) {
            return res.status(400).json({
                message:
                    'Invalid role.'
            });
        }

        if (!process.env.JWT_SECRET) {

            console.error(
                'JWT_SECRET is not configured'
            );

            return res.status(500).json({
                message:
                    'Authentication service is not configured.'
            });
        }

        const Model =
            getModel(role);

        const normalizedIdentifier =
            identifier.trim();

        const user =
            await Model.findOne({

                $or: [

                    {
                        email:
                            normalizedIdentifier
                                .toLowerCase()
                    },

                    {
                        username:
                            normalizedIdentifier
                    }

                ]

            });

        // ------------------------------------------------
        // GENERIC LOGIN ERROR
        // Prevent account enumeration
        // ------------------------------------------------

        if (!user) {

            return res.status(401).json({
                message:
                    'Invalid credentials.'
            });
        }

        // ------------------------------------------------
        // EMAIL VERIFICATION
        // ------------------------------------------------

        if (!user.isVerified) {

            return res.status(401).json({
                message:
                    'Account is not verified. Please complete signup.'
            });
        }

        // ------------------------------------------------
        // PASSWORD CHECK
        // ------------------------------------------------

        const isMatch =
            await bcrypt.compare(
                password,
                user.password
            );

        if (!isMatch) {

            return res.status(401).json({
                message:
                    'Invalid credentials.'
            });
        }

        // ------------------------------------------------
        // JWT TOKEN
        // ------------------------------------------------

        const token =
            jwt.sign(

                {
                    id:
                        user._id.toString(),

                    role:
                        role
                },

                process.env.JWT_SECRET,

                {
                    expiresIn:
                        '1d'
                }

            );

        // ------------------------------------------------
        // REMOVE SENSITIVE DATA
        // ------------------------------------------------

        const userResponse =
            user.toObject();

        delete userResponse.password;
        delete userResponse.otp;
        delete userResponse.otpExpire;
        delete userResponse.resetPasswordToken;
        delete userResponse.resetPasswordExpire;

        userResponse.role =
            role;

        return res.json({

            message:
                'Login successful',

            token,

            user:
                userResponse
        });

    } catch (error) {

        console.error(
            'Login Error:',
            error.message
        );

        return res.status(500).json({
            message:
                'Login failed.'
        });
    }
};

// ====================================================
// 4. FORGOT PASSWORD - SEND OTP
// ====================================================

exports.forgotPassword = async (req, res) => {

    try {

        const { email } =
            req.body;

        // ------------------------------------------------
        // VALIDATION
        // ------------------------------------------------

        if (!email) {

            return res.status(400).json({
                message:
                    'Email is required.'
            });
        }

        if (!isValidEmail(email)) {

            return res.status(400).json({
                message:
                    'Please enter a valid email address.'
            });
        }

        const normalizedEmail =
            email.toLowerCase().trim();

        // ------------------------------------------------
        // SEARCH STUDENT
        // ------------------------------------------------

        let user =
            await Student.findOne({
                email:
                    normalizedEmail
            });

        // ------------------------------------------------
        // SEARCH ADMIN
        // ------------------------------------------------

        if (!user) {

            user =
                await Admin.findOne({
                    email:
                        normalizedEmail
                });
        }

        // ------------------------------------------------
        // GENERIC RESPONSE
        // Prevent email enumeration
        // ------------------------------------------------

        if (!user) {

            return res.status(200).json({

                message:
                    'If this email is registered, a password reset OTP has been sent.'

            });
        }

        // ------------------------------------------------
        // GENERATE SECURE OTP
        // ------------------------------------------------

        const otp =
            generateOTP();

        const hashedOtp =
            hashOTP(otp);

        // OTP valid for 10 minutes
        const resetExpire =
            new Date(
                Date.now() +
                10 * 60 * 1000
            );

        // ------------------------------------------------
        // SAVE HASHED RESET OTP
        // ------------------------------------------------

        user.resetPasswordToken =
            hashedOtp;

        user.resetPasswordExpire =
            resetExpire;

        await user.save();

        // ------------------------------------------------
        // SAFE NAME
        // ------------------------------------------------

        const safeName =
            escapeHtml(
                user.name || 'User'
            );

        // ------------------------------------------------
        // PASSWORD RESET EMAIL
        // ------------------------------------------------

        const htmlContent = `
            <div style="
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 600px;
                margin: auto;
                background-color: #f8fafc;
                padding: 20px;
                border-radius: 12px;
                border: 1px solid #e2e8f0;
            ">

                <div style="
                    text-align: center;
                    padding-bottom: 20px;
                    border-bottom: 1px solid #e2e8f0;
                ">

                    <h2 style="
                        color: #0f172a;
                        margin: 0;
                    ">
                        📚 Library Management System
                    </h2>

                </div>

                <div style="
                    padding: 24px;
                    background-color: #ffffff;
                    border-radius: 8px;
                    margin-top: 20px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.05);
                ">

                    <p style="
                        font-size: 16px;
                        color: #334155;
                    ">
                        Hello ${safeName},
                    </p>

                    <p style="
                        font-size: 15px;
                        color: #475569;
                        line-height: 1.5;
                    ">
                        We received a request to reset your password.
                        Use the OTP below to set a new password.
                        This code is valid for <b>10 minutes</b>.
                    </p>

                    <div style="
                        text-align: center;
                        margin: 30px 0;
                    ">

                        <div style="
                            display: inline-block;
                            background: linear-gradient(
                                135deg,
                                #4f46e5,
                                #6366f1
                            );
                            color: #ffffff;
                            font-size: 32px;
                            font-weight: bold;
                            letter-spacing: 6px;
                            padding: 14px 28px;
                            border-radius: 8px;
                            box-shadow:
                                0 4px 6px
                                rgba(79,70,229,0.2);
                        ">
                            ${otp}
                        </div>

                    </div>

                    <p style="
                        font-size: 14px;
                        color: #64748b;
                        margin-top: 20px;
                    ">
                        If you didn't request a password reset,
                        you can safely ignore this email;
                        your password will remain unchanged.
                    </p>

                </div>

                <div style="
                    text-align: center;
                    padding-top: 20px;
                    color: #94a3b8;
                    font-size: 12px;
                ">

                    <p>
                        &copy; ${new Date().getFullYear()}
                        Library Management System.
                        All rights reserved.
                    </p>

                </div>

            </div>
        `;

        // ------------------------------------------------
        // SEND THROUGH BREVO
        // ------------------------------------------------

        await sendBrevoEmail({

            to:
                normalizedEmail,

            subject:
                '🔑 Password Reset OTP - Library Manager',

            htmlContent
        });

        return res.status(200).json({

            message:
                'If this email is registered, a password reset OTP has been sent.'

        });

    } catch (error) {

        console.error(
            'Forgot Password Error:',
            error.message
        );

        return res.status(500).json({
            message:
                'Unable to process password reset request.'
        });
    }
};

// ====================================================
// 5. RESET PASSWORD
// ====================================================

exports.resetPassword = async (req, res) => {

    try {

        const {
            email,
            otp,
            newPassword
        } = req.body;

        // ------------------------------------------------
        // VALIDATION
        // ------------------------------------------------

        if (
            !email ||
            !otp ||
            !newPassword
        ) {

            return res.status(400).json({
                message:
                    'Email, OTP, and new password are required.'
            });
        }

        if (!isValidEmail(email)) {

            return res.status(400).json({
                message:
                    'Please enter a valid email address.'
            });
        }

        // ------------------------------------------------
        // PASSWORD VALIDATION
        // ------------------------------------------------

        if (!isStrongPassword(newPassword)) {

            return res.status(400).json({
                message:
                    'Password must be between 8 to 16 characters with 1 uppercase, 1 lowercase, 1 number & 1 special character.'
            });
        }

        const normalizedEmail =
            email.toLowerCase().trim();

        // ------------------------------------------------
        // HASH OTP
        // ------------------------------------------------

        const hashedOtp =
            hashOTP(
                String(otp).trim()
            );

        // ------------------------------------------------
        // FIND STUDENT
        // ------------------------------------------------

        let user =
            await Student.findOne({

                email:
                    normalizedEmail,

                resetPasswordToken:
                    hashedOtp,

                resetPasswordExpire: {
                    $gt: Date.now()
                }

            });

        // ------------------------------------------------
        // FIND ADMIN
        // ------------------------------------------------

        if (!user) {

            user =
                await Admin.findOne({

                    email:
                        normalizedEmail,

                    resetPasswordToken:
                        hashedOtp,

                    resetPasswordExpire: {
                        $gt: Date.now()
                    }

                });
        }

        // ------------------------------------------------
        // INVALID OTP
        // ------------------------------------------------

        if (!user) {

            return res.status(400).json({
                message:
                    'Invalid or expired OTP.'
            });
        }

        // ------------------------------------------------
        // HASH NEW PASSWORD
        // ------------------------------------------------

        const salt =
            await bcrypt.genSalt(12);

        const hashedPassword =
            await bcrypt.hash(
                newPassword,
                salt
            );

        // ------------------------------------------------
        // SAVE NEW PASSWORD
        // ------------------------------------------------

        user.password =
            hashedPassword;

        // Clear reset data
        user.resetPasswordToken =
            undefined;

        user.resetPasswordExpire =
            undefined;

        await user.save();

        return res.status(200).json({

            message:
                'Password has been reset successfully.'

        });

    } catch (error) {

        console.error(
            'Reset Password Error:',
            error.message
        );

        return res.status(500).json({

            message:
                'Server error. Please try again.'

        });
    }
};

