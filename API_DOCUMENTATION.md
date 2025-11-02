# Mentor API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Authentication Routes (`/api/auth`)

### 1. Register (Admin/Password-based)
**POST** `/api/auth/register`

Creates a new user with email/password (for admin panel or traditional auth).

**Body:**
```json
{
  "name": "John Doe",
  "email": "admin@example.com",
  "password": "securePassword123",
  "role": "mentor"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "admin@example.com",
    "role": "mentor"
  }
}
```

---

### 2. Login
**POST** `/api/auth/login`

Login with email and password.

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "role": "mentor",
    "onboardingCompleted": true
  }
}
```

---

### 3. Get Current User
**GET** `/api/auth/me`

Get the currently authenticated user's profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "email": "user@example.com",
    "phone": "+1234567890",
    "role": "mentee",
    "verified": true,
    "onboardingCompleted": true,
    "personalInfo": {...},
    "professionalInfo": {...}
  }
}
```

---

### 4. Logout
**POST** `/api/auth/logout`

Logout the current user (client-side should discard the token).

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Onboarding Routes (`/api/onboarding`)

### 1. Register (OTP-based)
**POST** `/api/onboarding/register`

Register a new user with email and phone, generates OTP.

**Body:**
```json
{
  "email": "user@example.com",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP generated successfully",
  "data": {
    "message": "OTP generated successfully",
    "otp": "1234",
    "userId": "..."
  }
}
```

---

### 2. Verify OTP
**POST** `/api/onboarding/verify-otp`

Verify the OTP and get JWT token for authenticated requests.

**Body:**
```json
{
  "email": "user@example.com",
  "otp": "1234"
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "message": "OTP verified successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "...",
      "email": "user@example.com",
      "phone": "+1234567890",
      "role": "mentee",
      "verified": true,
      "onboardingCompleted": false
    }
  }
}
```

---

### 3. Update User Info
**PUT** `/api/onboarding/update-user`

Update user's personal and professional information during onboarding.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "userId": "...",
  "personalInfo": {
    "fullName": "John Doe",
    "dob": "1990-01-01",
    "gender": "Male",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "languages": ["English", "Spanish"],
    "hobby": "Reading",
    "timezone": "EST"
  },
  "professionalInfo": {
    "workingStatus": "Employed",
    "jobTitle": "Software Engineer",
    "organization": "Tech Corp",
    "industry": "Technology"
  },
  "competencies": {
    "feedback": "Good",
    "listening": "Excellent",
    "presentation": "Good",
    "networking": "Fair",
    "teamwork": "Excellent"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "message": "User updated successfully",
    "user": {...}
  }
}
```

---

### 4. Complete Mentor Onboarding
**POST** `/api/onboarding/complete-mentor`

Mark onboarding as complete and set role to mentor.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Mentor onboarding completed",
  "data": {
    "_id": "...",
    "email": "user@example.com",
    "role": "mentor",
    "onboardingCompleted": true
  }
}
```

---

### 5. Complete Mentee Onboarding
**POST** `/api/onboarding/complete-mentee`

Mark onboarding as complete and set role to mentee.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Mentee onboarding completed",
  "data": {
    "_id": "...",
    "email": "user@example.com",
    "role": "mentee",
    "onboardingCompleted": true
  }
}
```

---

### 6. Check Onboarding Status
**GET** `/api/onboarding/status`

Check the current user's onboarding status.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Onboarding status fetched",
  "data": {
    "onboardingCompleted": false,
    "role": "mentee"
  }
}
```

---

## Mentor Routes (`/api/mentors`)

### 1. Create Mentor Profile
**POST** `/api/mentors/profile`

Create a mentor profile for the authenticated user.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "expertiseAreas": ["Web Development", "Career Guidance"],
  "experienceYears": 5,
  "availability": {
    "days": ["Monday", "Wednesday", "Friday"],
    "timeSlots": ["10:00 AM - 12:00 PM", "2:00 PM - 4:00 PM"]
  },
  "bio": "Experienced software engineer passionate about mentoring",
  "linkedIn": "https://linkedin.com/in/johndoe",
  "website": "https://johndoe.com",
  "menteeCountLimit": 5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mentor profile created successfully",
  "data": {
    "_id": "...",
    "user": "...",
    "expertiseAreas": ["Web Development", "Career Guidance"],
    "status": "pending"
  }
}
```

---

### 2. Get My Mentor Profile
**GET** `/api/mentors/profile/me`

Get the authenticated user's mentor profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Mentor profile fetched",
  "data": {
    "_id": "...",
    "user": {
      "email": "mentor@example.com",
      "personalInfo": {...},
      "professionalInfo": {...}
    },
    "expertiseAreas": ["Web Development"],
    "experienceYears": 5,
    "rating": {
      "average": 0,
      "totalReviews": 0
    }
  }
}
```

---

### 3. Get Mentor Profile by ID
**GET** `/api/mentors/profile/:id`

Get a specific mentor's profile by ID (public).

**Response:**
```json
{
  "success": true,
  "message": "Mentor profile fetched",
  "data": {
    "_id": "...",
    "user": {...},
    "expertiseAreas": ["Web Development"],
    "bio": "Experienced developer"
  }
}
```

---

### 4. Update Mentor Profile
**PUT** `/api/mentors/profile`

Update the authenticated user's mentor profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Body:**
```json
{
  "bio": "Updated bio",
  "experienceYears": 6,
  "availability": {
    "days": ["Monday", "Tuesday"],
    "timeSlots": ["9:00 AM - 11:00 AM"]
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Mentor profile updated",
  "data": {...}
}
```

---

### 5. Delete Mentor Profile
**DELETE** `/api/mentors/profile`

Delete the authenticated user's mentor profile.

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Mentor profile deleted",
  "data": null
}
```

---

### 6. Get All Mentors
**GET** `/api/mentors`

Get a list of all mentors with optional filters.

**Query Parameters:**
- `status` - Filter by status (pending, approved, rejected)
- `expertiseArea` - Filter by expertise area

**Example:**
```
GET /api/mentors?status=approved&expertiseArea=Web Development
```

**Response:**
```json
{
  "success": true,
  "message": "Mentors fetched successfully",
  "data": [
    {
      "_id": "...",
      "user": {...},
      "expertiseAreas": ["Web Development"],
      "status": "approved"
    }
  ]
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

Common status codes:
- `400` - Bad Request (validation error, missing fields)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (token expired)
- `404` - Not Found
- `500` - Internal Server Error

---

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Create `.env` file:
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/mentor-api
   JWT_SECRET=your-secret-key-here
   NODE_ENV=development
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. For development (with auto-reload):
   ```bash
   npm run dev
   ```

---

## Notes

- JWT tokens expire in 7 days
- OTP for prototype is always `1234`
- All timestamps are in ISO 8601 format
- Phone numbers should include country code
- Passwords are hashed using bcryptjs (10 rounds)
