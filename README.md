# AI Course Notes Summarizer

A production-grade full-stack application that transforms lecture notes into structured study materials using AI.

## Features

### Core Functionality
- **AI-Powered Summarization**: Uses Google Gemini AI to generate comprehensive summaries
- **Multiple Input Methods**: Paste text directly or upload TXT/PDF files
- **Large Input Handling**: Automatically chunks large notes (3000-4000 chars) for parallel processing
- **Advanced Question Generation**: Creates multiple question types:
  - Short-answer questions
  - Long-answer questions
  - Multiple Choice Questions (MCQs)
  - Conceptual questions

### Data Management
- **Structured Output**: Generates summaries with:
  - Key concepts
  - Important definitions
  - Revision questions with answers
  - Processing metadata (time, model used, source file)
- **Advanced History Dashboard**:
  - Search functionality
  - Sort by date, processing time
  - Filter by date range
  - Pagination
  - Delete entries
  - Detailed view of past summaries

### Performance & Security
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Sanitization**: Automatic XSS protection
- **Request Caching**: 60-second cache for history endpoints
- **Helmet.js**: Security headers for HTTP protection
- **Timeout Handling**: 60-second timeout for AI API calls
- **File Validation**: 10MB limit, TXT/PDF only, corrupted file detection

### User Experience
- **Responsive Design**: Mobile-optimized interface
- **Loading Skeletons**: Smooth loading states
- **Progress Indicators**: Real-time upload progress
- **Error Handling**: Comprehensive error messages
- **PDF Download**: Export summaries with all sections and metadata

## Tech Stack

### Frontend
- React 18 with TypeScript
- TailwindCSS for styling
- React Router for navigation
- Axios for API calls
- Vite for build tooling

### Backend
- Express.js with Node.js
- MongoDB with Mongoose
- Multer for file uploads
- PDF parsing with pdf-parse
- Groq API

### DevOps
- Docker & Docker Compose
- Environment configuration
- Production-ready architecture

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB 7.0+
- Groq API Key

### Installation

1. Clone the repository
```bash
git clone <repository-url>
cd AI_Notes_Summarizer
```

2. Set up environment variables
```bash
# Server
cd server
cp .env.example .env
# Edit .env with your Groq API KEY
```

3. Install dependencies
```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

4. Start MongoDB
```bash
# Using Docker
docker-compose up -d mongo

# Or local MongoDB
mongod
```

5. Run the application
```bash
# Server
cd server
npm run dev

# Client (new terminal)
cd client
npm run dev
```

### Docker Deployment

```bash
docker-compose up -d
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- MongoDB: localhost:27017

## API Endpoints

### Summarization
- `POST /api/summarize` - Generate summary from notes or file upload

### History
- `GET /api/history` - Get paginated history with search, sort, and filters
- `GET /api/history/:id` - Get specific history entry
- `DELETE /api/history/:id` - Delete history entry

## Environment Variables

### Server (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-course-notes
Groq_API_KEY=your_groq_api_key
GEMINI_MODEL=llama-3.3-70b-versatile
NODE_ENV=production
```

## Project Structure

```
AI_Notes_Summarizer/
├── client/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API service layer
│   │   └── types/         # TypeScript types
│   └── package.json
├── server/
│   ├── config/           # Database configuration
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   └── services/         # Business logic
└── docker-compose.yml
```

## License

MIT
