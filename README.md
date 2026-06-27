📚 AI Notes Summarizer

An AI-powered web application that transforms lengthy study notes into concise summaries, key concepts, flashcards, MCQs, and practice questions. The application uses the Groq API (Llama 3.3 70B Versatile) for AI-powered content generation and provides secure user authentication with JWT and MongoDB.

---

🚀 Features

- 🔐 User Authentication (Sign Up & Sign In)
- 🔑 JWT-based Authorization
- 📝 AI-powered Notes Summarization
- 📂 Upload TXT and PDF files
- 💡 Key Concepts Extraction
- 📖 Important Definitions
- 🎴 AI-generated Flashcards
- ❓ Short & Long Answer Questions
- ✅ Multiple Choice Questions (MCQs)
- 📜 Personal History for Each User
- 🔍 Search & Filter Previous Summaries
- 📤 Export Summaries as PDF, DOCX, and TXT
- 📱 Responsive Modern UI

---

🛠️ Tech Stack

Frontend

- React.js
- TypeScript
- Tailwind CSS
- Axios
- React Router

Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Multer

AI

- Groq API
- Llama 3.3 70B Versatile

---

📂 Project Structure

AI_Notes_Summarizer/
│
├── client/
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── context/
│   └── services/
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   └── server.js
│
└── README.md

---

⚙️ Installation

Clone Repository

git clone https://github.com/your-username/AI_Notes_Summarizer.git

Install Dependencies

Frontend

cd client
npm install

Backend

cd server
npm install

---

Environment Variables

Create a ".env" file inside the "server" folder.

PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key
GROQ_API_KEY=your_groq_api_key

---

Run the Project

Backend

cd server
npm run dev

Frontend

cd client
npm run dev

---

API Endpoints

Authentication

- POST "/api/auth/signup"
- POST "/api/auth/signin"

Notes

- POST "/api/summarize"

History

- GET "/api/history"
- GET "/api/history/:id"
- DELETE "/api/history/:id"
- GET "/api/history/:id/export/pdf"
- GET "/api/history/:id/export/docx"
- GET "/api/history/:id/export/txt"

---

Future Enhancements

- Google Authentication
- Notes Sharing
- AI Chat Assistant
- Voice Input
- OCR Support
- Multi-language Summaries
- Study Progress Dashboard

---

Author

Shobha Kumari

B.Tech (Computer Science & Engineering)

Aspiring Software Developer | MERN Stack | AI Enthusiast