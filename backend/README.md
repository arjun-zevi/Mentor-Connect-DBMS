# Backend Setup Guide

## Quick Start

### 1. Database Setup
```bash
# Start MySQL and create database
mysql -u root -p < database/schema.sql
```

### 2. Install Dependencies
```bash
cd backend
npm install
```

### 3. Configure Environment
Edit `.env` file:
```
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=root
DB_NAME=mentorship_db
```

### 4. Start Server
```bash
npm start
```

Server runs on `http://localhost:5000`

## Project Structure

```
backend/
├── config/
│   └── database.js       # MySQL connection pool
├── middleware/
│   └── auth.js           # JWT authentication
├── routes/
│   ├── auth.js           # Authentication endpoints
│   ├── mentors.js        # Mentor management
│   ├── meetings.js       # Meeting management
│   ├── goals.js          # Goal management
│   ├── notes.js          # Notes management
│   ├── interventions.js  # Interventions
│   ├── admin.js          # Admin operations
│   └── reports.js        # Reports and analytics
├── server.js             # Main application
├── .env                  # Environment variables
└── package.json
```

## Key Routes

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register-student` - Student registration
- `POST /api/auth/register-mentor` - Mentor registration

### Data Access
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <token>
```

## Database Schema Overview

### Users Table
- Stores login credentials
- Roles: admin, mentor, student

### Mentors & Students
- Detailed profiles linked to users
- One-to-one relationship with users

### Assignments
- Links mentors to students
- Tracks duration and status

### Meetings, Goals, Notes, Interventions
- Child tables linked to assignments
- Track all mentorship activities

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 5000 | Server port |
| DB_HOST | localhost | MySQL host |
| DB_USER | root | MySQL user |
| DB_PASSWORD | root | MySQL password |
| DB_NAME | mentorship_db | Database name |
| NODE_ENV | development | Environment |

## Dependencies

- **express** - Web framework
- **mysql2** - Database driver
- **cors** - Cross-origin requests
- **jwt** - Authentication tokens
- **bcryptjs** - Password hashing
- **body-parser** - Request parsing

## API Response Format

Success:
```json
{
  "data": {...},
  "message": "Operation successful"
}
```

Error:
```json
{
  "message": "Error description",
  "error": "Error details"
}
```

## Testing with cURL

```bash
# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"mentor1@college.com","password":"mentor123"}'

# Get mentees (with token)
curl -X GET http://localhost:5000/api/mentors/mentees \
  -H "Authorization: Bearer <token>"
```

## Common Issues

### MySQL Connection Failed
- Ensure MySQL is running
- Check credentials in `.env`
- Verify database exists: `mentorship_db`

### Port Already in Use
Change PORT in `.env` or kill process using port 5000

### JWT Token Expired
- Token expires in 24 hours
- User needs to login again

## Development

For development with auto-reload:
```bash
npm run dev
```

This uses nodemon to restart server on file changes.
