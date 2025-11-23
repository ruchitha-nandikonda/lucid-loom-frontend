# Lucid Loom - AI Dream-to-Reality Generator

A beautiful web application that transforms your dreams into poetic narratives, interpretations, and AI-generated images.

## ✨ Features

### Core Features
- ✅ User authentication (register, login, logout with "Remember Me")
- ✅ Dream journal with AI-powered interpretation
- ✅ Poetic narrative generation
- ✅ Symbol and emotion extraction
- ✅ AI-generated dream images (DALL-E 3)
- ✅ Gallery view with image thumbnails
- ✅ Real-time dream processing via WebSockets

### Advanced Features
- ✅ **Gallery & Search** - Real-time search with tag filtering
- ✅ **Analytics Dashboard** - Visual charts, top symbols/emotions, monthly trends
- ✅ **Multi-Style Rewrites** - Transform dreams into 6 narrative styles (Horror, Sci-Fi, Fantasy, etc.)
- ✅ **Symbol Encyclopedia** - Deep explanations of dream symbols
- ✅ **Pattern Analysis** - AI-powered analysis across all dreams
- ✅ **Password Management** - Forgot password, reset, change password
- ✅ **Settings Page** - User account management
- ✅ **Dream Editing** - Edit dream title and text
- ✅ **Dream Deletion** - Delete dreams with confirmation
- ✅ **Dream Export** - Export all dreams as JSON

### Technical Features
- ✅ Background job processing
- ✅ WebSocket real-time updates
- ✅ Docker containerization
- ✅ Production-ready architecture

## Tech Stack

### Backend
- FastAPI (Python)
- SQLite with SQLAlchemy
- JWT authentication
- OpenAI API (GPT-4o-mini + DALL-E 3)

### Frontend
- React with Vite
- React Router
- Axios for API calls
- Modern CSS styling

## Quick Start with Docker (Recommended)

The easiest way to run Lucid Loom is with Docker Compose:

1. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY and SECRET_KEY
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - Frontend: http://localhost
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

4. **View logs:**
   ```bash
   docker-compose logs -f
   ```

5. **Stop services:**
   ```bash
   docker-compose down
   ```

## Setup Instructions (Development)

### Backend Setup

1. Navigate to the backend directory:
```bash
cd dream-backend
```

2. Activate the virtual environment:
```bash
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies (if not already installed):
```bash
pip install -r requirements.txt
```

4. Set up your `.env` file:
```bash
# Edit .env file with your credentials
SECRET_KEY=your_super_secret_key_here_change_this_in_production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
OPENAI_API_KEY=your_openai_api_key_here

# Email configuration (for OTP verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
SMTP_FROM_NAME=Lucid Loom
```

**Note:** For Gmail, you'll need to use an [App Password](https://support.google.com/accounts/answer/185833) instead of your regular password. For other email providers, check their SMTP settings.

5. Run the backend server:
```bash
uvicorn main:app --reload
```

The backend will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd dream-frontend
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. Start both backend and frontend servers
2. Open `http://localhost:5173` in your browser
3. Sign up for a new account or log in
4. Click "New Dream" to add a dream
5. Enter a title and describe your dream
6. Click "Interpret my dream" to generate:
   - Poetic narrative
   - Meaning interpretation
   - Symbols analysis
   - Emotions detected
   - AI-generated image
7. View all your dreams in the gallery
8. Click on any dream to see full details

## API Endpoints

### Authentication
- `POST /auth/register` - Register a new user
- `POST /auth/login` - Login and get JWT token
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/change-password` - Change password (authenticated)

### Dreams
- `POST /dreams` - Create a new dream (async processing)
- `GET /dreams` - Get all dreams for the current user
- `GET /dreams/{dream_id}` - Get a specific dream
- `POST /dreams/{dream_id}/rewrite` - Rewrite dream in different style

### Symbols
- `GET /symbols/{symbol}/explain` - Get detailed symbol explanation

### Analytics
- `GET /analytics/summary` - Get analytics summary (stats, charts)
- `POST /analytics/patterns` - Analyze patterns across all dreams

### WebSocket
- `WS /ws/dream-status/{dream_id}` - Real-time dream processing status

## Project Structure

```
lucid-loom/
├── dream-backend/
│   ├── main.py           # FastAPI app and routes
│   ├── models.py         # SQLAlchemy models
│   ├── schemas.py        # Pydantic schemas
│   ├── database.py       # Database setup
│   ├── auth.py           # JWT authentication
│   ├── ai.py             # OpenAI integration
│   ├── .env              # Environment variables
│   └── requirements.txt  # Python dependencies
│
└── dream-frontend/
    └── src/
        ├── App.jsx       # Main app with routing
        ├── api.js        # API helper functions
        ├── styles.css    # Global styles
        ├── pages/        # Page components
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── DreamList.jsx
        │   ├── NewDream.jsx
        │   └── DreamDetail.jsx
        └── components/   # Reusable components
            └── Navbar.jsx
```

## Docker Deployment

### Building Images

**Backend:**
```bash
cd dream-backend
docker build -t lucid-loom-backend .
```

**Frontend:**
```bash
cd dream-frontend
docker build -t lucid-loom-frontend .
```

### Environment Variables

Create a `.env` file in the project root:
```bash
SECRET_KEY=your_super_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here
VITE_API_URL=http://localhost:8000  # For frontend
```

### Production Considerations

- Use a production database (PostgreSQL) instead of SQLite
- Set up proper email service for password resets
- Use environment-specific secrets management
- Configure HTTPS with reverse proxy (nginx/traefik)
- Set up proper logging and monitoring
- Use Docker secrets for sensitive data

## Notes

- Make sure to add your OpenAI API key to the `.env` file
- The database (`dreams.db`) will be created automatically on first run
- JWT tokens are stored in localStorage on the frontend
- CORS is configured to allow requests from `localhost:5173` and `localhost:3000`
- For Docker, the API URL is configurable via `VITE_API_URL` environment variable

## 🎯 Complete Feature List

### ✅ Implemented Features
- User authentication with JWT
- Dream creation with AI interpretation
- Gallery with search and tag filtering
- Analytics dashboard with visualizations
- Multi-style dream rewrites (6 styles)
- Symbol encyclopedia with deep explanations
- Pattern analysis across all dreams
- Password management (forgot/reset/change)
- Settings page
- Real-time processing via WebSockets
- Background job processing
- Docker deployment
- Responsive dark theme UI

### 🔮 Future Enhancements (Optional)
- Dream editing/deletion
- Dream sharing (public/private links)
- Export dreams (PDF, JSON)
- Dream calendar view
- Voice input for dreams
- Mobile app (React Native)
- Advanced ML predictions

## 📚 Documentation

- `PROJECT_COMPLETE.md` - Complete feature breakdown
- `PROJECT_SPEC.md` - Original project specification
- `DEPLOYMENT.md` - Deployment guide
- `SETUP_OPENAI.md` - OpenAI API key setup

## 🎉 Project Status: COMPLETE

All planned features have been implemented. The project is production-ready and interview-ready!

