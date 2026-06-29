# 🚀 AI Course Notes Summarizer

A full-stack AI-powered study assistant that transforms lecture notes into concise summaries, flashcards, quizzes, and revision material using **Groq LLM**. Built with the **MERN Stack**, secured using **JWT Authentication**, containerized with **Docker**, and deployed on **Vercel** and **Render**.

---

## 🌐 Live Demo

**Frontend:** https://notessummarizerweb1-epion2c52-codebytewithshobhas-projects.vercel.app/

**Backend API:** https://notes-summarizer-web.onrender.com/

**Github repository URL ** https://github.com/codebytewithshobha/Notes_summarizer_web
---

# ✨ Features

## 🤖 AI-Powered Learning

* AI-generated notes summary using Groq LLM
* Key concepts extraction
* Important definitions
* Flashcards for revision
* Multiple Choice Questions (MCQs)
* Short-answer questions
* Long-answer questions
* Context-aware study material generation

---

## 📄 Notes Upload

* Paste notes directly
* Upload TXT files
* Upload PDF files
* Automatic PDF text extraction
* Supports large documents through intelligent chunking

---

## 👤 Authentication

* User Signup
* User Login
* JWT Authentication
* Protected Routes
* Secure Password Hashing

---

## 📚 Dashboard

* Upload notes
* AI Summary Generation
* Flashcards
* Quiz Section
* Revision Questions
* Recent Notes History
* Delete Notes
* Export Notes

---

## ⚡ Performance & Security

* Helmet Security
* Rate Limiting
* Input Sanitization
* Request Validation
* MongoDB Storage
* Error Handling
* Cached History APIs

---

## 🛠 Tech Stack

### Frontend

* React
* Vite
* Tailwind CSS
* React Router
* Axios

### Backend

* Node.js
* Express.js
* MongoDB Atlas
* Mongoose
* JWT
* Multer
* pdf-parse
* Groq API

### DevOps

* Docker
* Docker Compose
* Vercel
* Render
* GitHub

---

# 🏗 Architecture

Frontend (React + Vite)

⬇ REST API

Backend (Express + Node.js)

⬇

MongoDB Atlas

⬇

Groq AI API

---

# 📂 Project Structure

```text
AI_Notes_Summarizer/

├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── server.js
│   └── package.json
│
├── docker-compose.yml
├── README.md
└── .gitignore
```

---

# ⚙ Installation

## Clone Repository

```bash
git clone https://github.com/yourusername/AI_Notes_Summarizer.git

cd AI_Notes_Summarizer
```

---

## Backend

```bash
cd server

npm install
```

Create **.env**

```env
PORT=5000

MONGODB_URI=your_mongodb_connection

GROQ_API_KEY=your_groq_api_key

GROQ_MODEL=llama-3.3-70b-versatile

JWT_SECRET=your_secret
```

Run

```bash
npm run dev
```

---

## Frontend

```bash
cd client

npm install

npm run dev
```

---

# 🐳 Docker

Build containers

```bash
docker compose build
```

Run containers

```bash
docker compose up -d
```

Stop containers

```bash
docker compose down
```

---

# ☁ Deployment

## Frontend

* Vercel

## Backend

* Render

## Database

* MongoDB Atlas

---

# 📡 API Endpoints

## Authentication

POST /api/auth/signup

POST /api/auth/login

---

## Notes

POST /api/summarize

---

## History

GET /api/history

GET /api/history/:id

DELETE /api/history/:id

---

# 🔐 Environment Variables

```env
PORT=5000

MONGODB_URI=your_mongodb_connection

GROQ_API_KEY=your_api_key

GROQ_MODEL=llama-3.3-70b-versatile

JWT_SECRET=your_secret
```

---

# 📸 Screenshots

* Home Page
* Login Page
* Dashboard
* AI Summary
* Flashcards
* MCQs
* History
* Docker Containers

(Add screenshots here.)

---

# 🚀 Future Enhancements

* AI Tutor Chat
* Daily Revision Emails using n8n
* Weekly Study Reports
* OCR Support
* Voice Notes
* Study Analytics Dashboard

---

# 📄 License

MIT License

---

# 👨‍💻 Developed By

**Shobha Kumar**

B.Tech CSE Student

Full Stack MERN Developer
