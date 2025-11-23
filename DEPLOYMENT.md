# Deployment Guide

## Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- OpenAI API key

### Quick Start

1. **Clone and navigate:**
   ```bash
   cd lucid-loom
   ```

2. **Set up environment:**
   ```bash
   # Copy example env file
   cp .env.example .env
   
   # Edit .env and add:
   # - SECRET_KEY (generate a strong random string)
   # - OPENAI_API_KEY (your OpenAI API key)
   ```

3. **Start services:**
   ```bash
   docker-compose up -d
   ```

4. **Check status:**
   ```bash
   docker-compose ps
   ```

5. **View logs:**
   ```bash
   docker-compose logs -f
   ```

### Access Points

- **Frontend:** http://localhost
- **Backend API:** http://localhost:8000
- **API Documentation:** http://localhost:8000/docs

### Stopping Services

```bash
docker-compose down
```

To also remove volumes (deletes database):
```bash
docker-compose down -v
```

## Production Deployment

### Using Docker Compose

1. **Update docker-compose.yml for production:**
   - Change ports if needed
   - Add environment-specific variables
   - Configure volumes for persistent data
   - Set up reverse proxy (nginx/traefik)

2. **Use production database:**
   - Replace SQLite with PostgreSQL
   - Update `SQLALCHEMY_DATABASE_URL` in environment

3. **Set up SSL/HTTPS:**
   - Use Let's Encrypt with certbot
   - Configure nginx as reverse proxy

### Cloud Deployment Options

**AWS:**
- Use ECS/Fargate for containers
- RDS for PostgreSQL
- S3 for image storage
- CloudFront for CDN

**Heroku:**
- Use Heroku Postgres
- Deploy backend as Python app
- Deploy frontend as static site

**DigitalOcean:**
- Use App Platform
- Managed PostgreSQL
- Spaces for object storage

**Vercel/Netlify:**
- Deploy frontend as static site
- Use serverless functions for API (requires refactoring)

## Environment Variables

### Backend (.env in dream-backend/)
```
SECRET_KEY=your_super_secret_key_here
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
OPENAI_API_KEY=your_openai_api_key_here
SQLALCHEMY_DATABASE_URL=sqlite:///./dreams.db

# Email configuration (for OTP verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
SMTP_FROM_NAME=Lucid Loom
```

**Email Setup Notes:**
- For Gmail: Use an [App Password](https://support.google.com/accounts/answer/185833) (not your regular password)
- For other providers: Check their SMTP documentation
- If email is not configured, OTP codes will be printed to console (development only)

### Frontend (build-time)
```
VITE_API_URL=http://localhost:8000
```

## Database Migration

When moving from SQLite to PostgreSQL:

1. **Install PostgreSQL adapter:**
   ```bash
   pip install psycopg2-binary
   ```

2. **Update database URL:**
   ```
   SQLALCHEMY_DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```

3. **Run migrations:**
   ```python
   from database import Base, engine
   Base.metadata.create_all(bind=engine)
   ```

## Monitoring

### Health Checks

Backend health endpoint: `GET /health`

### Logging

- Backend logs: `docker-compose logs backend`
- Frontend logs: `docker-compose logs frontend`

### Backup

Backup SQLite database:
```bash
docker cp lucid-loom-backend:/app/dreams.db ./backup/dreams.db
```

## Troubleshooting

### Backend won't start
- Check environment variables
- Verify OpenAI API key is set
- Check logs: `docker-compose logs backend`

### Frontend can't connect to backend
- Verify `VITE_API_URL` is correct
- Check CORS settings in backend
- Ensure backend is running

### Database issues
- Check volume mounts in docker-compose.yml
- Verify file permissions
- Check database file exists

