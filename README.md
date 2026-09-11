📚 Library Management System (LMS)
A comprehensive, full-stack Library Management System built to streamline physical book borrowing, provide digital e-learning resources, and manage an integrated campus bookstore. This platform features secure role-based access for both Students and Administrators.

✨ Key Features
Admin Command Center: Manage the library catalog, approve or reject student borrow requests, track active issues, and oversee complete transaction histories.

Student Portal: Browse the library catalog, send instant borrow requests, track active/overdue loans, and monitor accumulated fines.

Integrated Campus Store: A built-in e-commerce module where students can purchase books or study materials and track their order history.

Digital E-Learning Hub: Dedicated sections for students to access digital videos, notes, previous year questions (PYQs), and quizzes.

Robust Security: Strict 8-16 character password validation, OTP-based email verification via Nodemailer, and secure JWT session management.

🛠️ Tech Stack
Frontend: React.js (Vite), TypeScript, Tailwind CSS, React Router, Lucide Icons, and Sonner (for toast notifications).

Backend: Node.js, Express.js, Bcrypt.js, and JSON Web Tokens (JWT).

Database: MongoDB mapped with Mongoose schemas.

🚀 Quick Start & Setup
To get this project running locally on your machine, follow these steps:

Clone the repository and install dependencies for both the frontend and backend using npm install.

Create a .env file in your backend folder and add your environment variables (MONGO_URI, JWT_SECRET, GMAIL_EMAIL, GMAIL_APP_PASSWORD, PORT=5000).

Start the Express backend server by running npm start (or node server.js) in the backend directory.

Start the Vite React development server by running npm run dev in the frontend directory.
