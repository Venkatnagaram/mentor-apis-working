# Quick Start Guide

## Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or remote)
- npm or yarn

## Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Configure environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and set:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mentor-api
   JWT_SECRET=your-super-secret-key-change-in-production
   NODE_ENV=development
   ```

3. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

4. **Run the server**
   ```bash
   # Production mode
   npm start

   # Development mode (with auto-reload)
   npm run dev
   ```

5. **Verify it's running**
   ```
   Server should be running at http://localhost:5000
   ```

## Testing the API

### 1. Register a new user (OTP-based)
```bash
curl -X POST http://localhost:5000/api/onboarding/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "phone": "+1234567890"
  }'
```

Response will include OTP (always "1234" in prototype).

### 2. Verify OTP and get token
```bash
curl -X POST http://localhost:5000/api/onboarding/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "otp": "1234"
  }'
```

Copy the `token` from response.

### 3. Update user information (authenticated)
```bash
curl -X PUT http://localhost:5000/api/onboarding/update-user \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "userId": "YOUR_USER_ID",
    "personalInfo": {
      "fullName": "John Doe",
      "city": "New York"
    }
  }'
```

### 4. Complete mentor onboarding
```bash
curl -X POST http://localhost:5000/api/onboarding/complete-mentor \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### 5. Create mentor profile
```bash
curl -X POST http://localhost:5000/api/mentors/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "expertiseAreas": ["Web Development"],
    "experienceYears": 5,
    "bio": "Experienced developer"
  }'
```

### 6. Get all mentors
```bash
curl http://localhost:5000/api/mentors
```

## Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in `.env`
- Verify MongoDB port (default: 27017)

### Port Already in Use
- Change PORT in `.env` to different value
- Or kill process using port 5000:
  ```bash
  # Find process
  lsof -i :5000
  # Kill it
  kill -9 <PID>
  ```

### JWT Token Errors
- Ensure JWT_SECRET is set in `.env`
- Token expires in 7 days, request new one if expired
- Include "Bearer " prefix in Authorization header

## Project Structure

```
mentor-apis-working/
├── src/
│   ├── api/              # API layer
│   │   ├── controllers/  # Request handlers
│   │   ├── middlewares/  # Express middlewares
│   │   ├── models/       # MongoDB schemas
│   │   ├── repositories/ # Data access layer
│   │   ├── routes/       # API routes
│   │   ├── services/     # Business logic
│   │   └── validators/   # Input validation
│   ├── config/           # Configuration files
│   ├── loaders/          # Application initializers
│   └── utils/            # Utility functions
├── server.js             # Entry point
├── package.json          # Dependencies
├── .env.example          # Environment template
└── API_DOCUMENTATION.md  # Complete API docs
```

## Next Steps

1. Read `API_DOCUMENTATION.md` for complete endpoint details
2. Review `CHANGES_SUMMARY.md` to understand the architecture
3. Implement real OTP service (currently hardcoded to "1234")
4. Add email/SMS notifications
5. Implement rate limiting for API endpoints
6. Add unit and integration tests
7. Set up CI/CD pipeline

## Support

For detailed API documentation, see `API_DOCUMENTATION.md`
For architecture details, see `CHANGES_SUMMARY.md`
