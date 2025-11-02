# Mentor API Documentation

Base URL: `http://localhost:5001/api`

## Table of Contents
1. [Authentication Endpoints](#authentication-endpoints)
2. [Onboarding Endpoints](#onboarding-endpoints)
3. [Mentor Endpoints](#mentor-endpoints)
4. [Response Format](#response-format)
5. [Error Codes](#error-codes)

---

## Authentication Endpoints

### 1. Login with OTP
**Endpoint:** `POST /auth/login`
**Description:** Login existing user and generate OTP
**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP sent successfully",
  "data": {
    "message": "OTP sent successfully",
    "userId": "507f1f77bcf86cd799439011"
  }
}
```

**Notes:**
- User must be registered and verified
- OTP is valid for 10 minutes
- OTP should be sent via SMS/Email (implementation required)
- For testing, check console logs or database
- After receiving OTP, use `/onboarding/verify-otp` to complete login

**Error Responses:**
- `400`: User not found or not verified

---

### 2. Get Current User
**Endpoint:** `GET /auth/me`
**Description:** Get logged-in user's information
**Authentication:** Required (Bearer Token)

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "phone": "1234567890",
    "role": "mentee",
    "verified": true,
    "onboarding_completed": false,
    "personal_info": {},
    "professional_info": {},
    "competencies": []
  }
}
```

**Error Responses:**
- `401`: Unauthorized (invalid or missing token)
- `404`: User not found

---

### 3. Logout
**Endpoint:** `POST /auth/logout`
**Description:** Logout current user (client-side token deletion)
**Authentication:** Required (Bearer Token)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Onboarding Endpoints

### 1. Register with OTP
**Endpoint:** `POST /onboarding/register`
**Description:** Register a new user and generate OTP
**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "phone": "1234567890"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP generated successfully",
  "data": {
    "message": "OTP generated successfully",
    "userId": "507f1f77bcf86cd799439011"
  }
}
```

**Notes:**
- OTP is valid for 10 minutes
- OTP should be sent via SMS/Email (implementation required)
- For testing, check console logs or database

**Error Responses:**
- `400`: Email or phone already registered

---

### 2. Verify OTP
**Endpoint:** `POST /onboarding/verify-otp`
**Description:** Verify OTP for registration or login
**Authentication:** Not required

**Request Body:**
```json
{
  "email": "user@example.com",
  "otp": "123456"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "data": {
    "message": "OTP verified successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "phone": "1234567890",
      "role": "mentee",
      "verified": true,
      "onboarding_completed": false
    }
  }
}
```

**Error Responses:**
- `400`: User not found, invalid OTP, or OTP expired

---

### 3. Update User Profile
**Endpoint:** `PUT /onboarding/update-user`
**Description:** Update user profile information
**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "userId": "507f1f77bcf86cd799439011",
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "age": 25,
    "location": "New York"
  },
  "professionalInfo": {
    "company": "Tech Corp",
    "position": "Software Engineer",
    "industry": "Technology"
  },
  "competencies": ["JavaScript", "React", "Node.js"],
  "role": "mentee"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User updated successfully",
  "data": {
    "message": "User updated successfully",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "personal_info": {...},
      "professional_info": {...},
      "competencies": [...]
    }
  }
}
```

---

### 4. Complete Mentor Onboarding
**Endpoint:** `POST /onboarding/complete-mentor`
**Description:** Mark mentor onboarding as complete
**Authentication:** Required (Bearer Token)

**Request Body:** None

**Success Response (200):**
```json
{
  "success": true,
  "message": "Mentor onboarding completed",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "onboarding_completed": true,
    "role": "mentor"
  }
}
```

---

### 5. Complete Mentee Onboarding
**Endpoint:** `POST /onboarding/complete-mentee`
**Description:** Mark mentee onboarding as complete
**Authentication:** Required (Bearer Token)

**Request Body:** None

**Success Response (200):**
```json
{
  "success": true,
  "message": "Mentee onboarding completed",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "onboarding_completed": true,
    "role": "mentee"
  }
}
```

---

### 6. Check Onboarding Status
**Endpoint:** `GET /onboarding/status`
**Description:** Get current user's onboarding status
**Authentication:** Required (Bearer Token)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Onboarding status fetched",
  "data": {
    "onboarding_completed": false,
    "role": "mentee"
  }
}
```

---

## Mentor Endpoints

### 1. Create Mentor Profile
**Endpoint:** `POST /mentor/profile`
**Description:** Create a mentor profile for logged-in user
**Authentication:** Required (Bearer Token)

**Request Body:**
```json
{
  "expertiseAreas": ["JavaScript", "React", "Career Development"],
  "experienceYears": 5,
  "availability": {
    "monday": ["9:00-12:00", "14:00-17:00"],
    "wednesday": ["10:00-15:00"]
  },
  "bio": "Experienced software engineer passionate about mentoring",
  "linkedIn": "https://linkedin.com/in/johndoe",
  "website": "https://johndoe.com",
  "menteeCountLimit": 5,
  "status": "active"
}
```

**Fields:**
- `expertiseAreas` (array): Areas of expertise
- `experienceYears` (number): Years of experience
- `availability` (object): Weekly availability schedule
- `bio` (string): Mentor biography
- `linkedIn` (string): LinkedIn profile URL
- `website` (string): Personal website URL
- `menteeCountLimit` (number): Maximum mentees, default 5
- `status` (string): "pending", "active", or "inactive"

**Success Response (200):**
```json
{
  "success": true,
  "message": "Mentor profile created successfully",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "user_id": "507f1f77bcf86cd799439011",
    "expertise_areas": ["JavaScript", "React", "Career Development"],
    "experience_years": 5,
    "availability": {...},
    "bio": "Experienced software engineer...",
    "linkedin": "https://linkedin.com/in/johndoe",
    "website": "https://johndoe.com",
    "rating_average": 0,
    "rating_total_reviews": 0,
    "mentee_count_limit": 5,
    "active_mentees": [],
    "status": "active"
  }
}
```

**Error Responses:**
- `400`: Mentor profile already exists
- `401`: Unauthorized

---

### 2. Get My Mentor Profile
**Endpoint:** `GET /mentor/profile/me`
**Description:** Get logged-in user's mentor profile
**Authentication:** Required (Bearer Token)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Mentor profile fetched",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "user_id": {
      "id": "507f1f77bcf86cd799439011",
      "email": "mentor@example.com",
      "phone": "1234567890"
    },
    "expertise_areas": ["JavaScript", "React"],
    "experience_years": 5,
    "bio": "Experienced software engineer...",
    "status": "active"
  }
}
```

**Error Responses:**
- `404`: Mentor profile not found
- `401`: Unauthorized

---

### 3. Get Mentor Profile by ID
**Endpoint:** `GET /mentor/profile/:id`
**Description:** Get any mentor's profile by mentor ID
**Authentication:** Not required

**Example:** `GET /mentor/profile/507f1f77bcf86cd799439012`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Mentor profile fetched",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "user_id": {
      "id": "507f1f77bcf86cd799439011",
      "email": "mentor@example.com"
    },
    "expertise_areas": ["JavaScript", "React"],
    "experience_years": 5,
    "rating_average": 4.5,
    "rating_total_reviews": 10
  }
}
```

**Error Responses:**
- `404`: Mentor not found

---

### 4. Update Mentor Profile
**Endpoint:** `PUT /mentor/profile`
**Description:** Update logged-in user's mentor profile
**Authentication:** Required (Bearer Token)

**Request Body (all fields optional):**
```json
{
  "expertiseAreas": ["JavaScript", "React", "Node.js"],
  "experienceYears": 6,
  "availability": {
    "monday": ["9:00-12:00"],
    "friday": ["14:00-17:00"]
  },
  "bio": "Updated bio",
  "linkedIn": "https://linkedin.com/in/johndoe",
  "website": "https://newwebsite.com",
  "menteeCountLimit": 10,
  "status": "active"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Mentor profile updated",
  "data": {
    "id": "507f1f77bcf86cd799439012",
    "expertise_areas": ["JavaScript", "React", "Node.js"],
    "experience_years": 6,
    "bio": "Updated bio"
  }
}
```

**Error Responses:**
- `404`: Mentor profile not found
- `401`: Unauthorized

---

### 5. Get All Mentors
**Endpoint:** `GET /mentor`
**Description:** Get list of all mentors with optional filtering
**Authentication:** Not required

**Query Parameters:**
- `status` (optional): Filter by status ("active", "pending", "inactive")
- `expertiseArea` (optional): Filter by expertise area

**Examples:**
- `GET /mentor`
- `GET /mentor?status=active`
- `GET /mentor?expertiseArea=JavaScript`
- `GET /mentor?status=active&expertiseArea=React`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Mentors fetched successfully",
  "data": [
    {
      "id": "507f1f77bcf86cd799439012",
      "user_id": {
        "id": "507f1f77bcf86cd799439011",
        "email": "mentor1@example.com"
      },
      "expertise_areas": ["JavaScript", "React"],
      "experience_years": 5,
      "rating_average": 4.5,
      "status": "active"
    },
    {
      "id": "507f1f77bcf86cd799439013",
      "user_id": {
        "id": "507f1f77bcf86cd799439014",
        "email": "mentor2@example.com"
      },
      "expertise_areas": ["Python", "Django"],
      "experience_years": 8,
      "rating_average": 4.8,
      "status": "active"
    }
  ]
}
```

---

### 6. Delete Mentor Profile
**Endpoint:** `DELETE /mentor/profile`
**Description:** Delete logged-in user's mentor profile
**Authentication:** Required (Bearer Token)

**Request Body:** None

**Success Response (200):**
```json
{
  "success": true,
  "message": "Mentor profile deleted",
  "data": null
}
```

**Error Responses:**
- `404`: Mentor profile not found
- `401`: Unauthorized

---

## Response Format

### Success Response Structure
```json
{
  "success": true,
  "message": "Operation description",
  "data": { }
}
```

### Error Response Structure
```json
{
  "success": false,
  "message": "Error description",
  "errors": []
}
```

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation errors) |
| 401 | Unauthorized (invalid or missing token) |
| 404 | Not Found |
| 409 | Conflict (e.g., email already exists) |
| 429 | Too Many Requests (rate limit exceeded or account locked) |
| 500 | Internal Server Error |

---

## Authentication

Most endpoints require authentication using JWT tokens.

**How to authenticate:**

1. Register or login to get a JWT token
2. Include the token in the Authorization header for protected endpoints:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

**Token expiry:** 7 days (configurable in .env)

---

## Testing the API

### Using cURL:

**Register with OTP:**
```bash
curl -X POST http://localhost:5001/api/onboarding/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","phone":"1234567890"}'
```

**Login with OTP:**
```bash
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

**Verify OTP:**
```bash
curl -X POST http://localhost:5001/api/onboarding/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","otp":"123456"}'
```

**Get Current User:**
```bash
curl -X GET http://localhost:5001/api/auth/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Using Postman:

1. Import the endpoints as a collection
2. Set up an environment variable for the token
3. Use {{token}} in Authorization headers

---

## Notes

- All timestamps are in ISO 8601 format
- All dates are stored in UTC
- Rate limiting: 5 requests per 15 minutes for onboarding endpoints
- OTP expiry: 10 minutes
- Default JWT expiry: 7 days

---

## Environment Variables

Required environment variables (see .env.example):

```
PORT=5001
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/mentor-api
JWT_SECRET=your-secret-key
JWT_EXPIRY=7d
```
