# 📚 Library Management System (LMS) — Bookify

> A comprehensive, full-stack Library Management System built to streamline physical book borrowing, provide digital e-learning resources, and manage an integrated campus bookstore with secure role-based access for Students and Administrators.

[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen?style=for-the-badge&logo=netlify)](https://bookify-library14.netlify.app/)
[![React](https://img.shields.io/badge/Frontend-React.js-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB-green?style=for-the-badge&logo=mongodb)](https://www.mongodb.com/)

---

## ✨ Key Features

* **🛡️ Admin Command Center:** Manage the library catalog, approve or reject student borrow requests, track active issues, and oversee complete transaction histories.
* **🎓 Student Portal:** Browse the library catalog, send instant borrow requests, track active/overdue loans, and monitor accumulated fines.
* **🛍️ Integrated Campus Store:** A built-in e-commerce module where students can purchase books or study materials and track their order history.
* **📖 Digital E-Learning Hub:** Dedicated sections for students to access digital videos, notes, previous year questions (PYQs), and quizzes.
* **🔒 Robust Security:** Strict 8-16 character password validation, OTP-based email verification via Nodemailer, and secure JWT session management.

---

## 🛠️ Technology Stack

| Layer | Technologies & Tools |
| :--- | :--- |
| **Frontend** | `React.js (Vite)` • `TypeScript` • `Tailwind CSS` • `React Router` • `Lucide Icons` • `Sonner` |
| **Backend** | `Node.js` • `Express.js` • `Bcrypt.js` • `JSON Web Tokens (JWT)` • `Nodemailer` |
| **Database** | `MongoDB` • `Mongoose Schemas` |

---

## 🚀 Quick Start & Setup

To get this project running locally on your machine, follow these steps:

1. **Clone & Install:** 
   Clone the repository and run `npm install` inside both your frontend and backend directories.

2. **Configure Environment Variables:** 
   Create a `.env` file in your backend folder and add the required credentials:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   GMAIL_EMAIL=your_gmail_address
   GMAIL_APP_PASSWORD=your_gmail_app_password
