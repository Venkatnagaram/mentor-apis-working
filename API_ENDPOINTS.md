# API Documentation

Base URL: `http://localhost:3000/api`

## Overview

This API provides authentication and onboarding functionality for a mentor-mentee platform. All users (both mentors and mentees) are managed through a unified User model, with role-based access control.

---

## Authentication Flow

### Registration Flow
1. User registers with email, phone, country code, and role → Receives OTP (Static OTP: **1234**)
2. User verifies OTP → Gets JWT token
3. User updates profile information
4. User completes onboarding

### Login Flow
1. User requests login with phone and country code → Receives OTP (Static OTP: **1234**)
2. User verifies OTP with phone, country code, and OTP → Gets JWT token

---

## API Endpoints

### 1. Onboarding APIs

#### 1.1 Register User
**POST** `/api/onboarding/register`

Creates a new user account and sends an OTP for verification.

**Request Body:**
```json
{
  "email": "user@example.com",
  "phone": "9876543210",
  "country_code": "+91",
  "role": "mentor",
  "agree_terms": true,
  "agree_privacy": true
}
```

**Validation:**
- `email`: Must be a valid email address (required)
- `phone`: Must be a valid mobile phone number (required)
- `country_code`: Required (e.g., "+1", "+91", "+44")
- `role`: Must be either "mentor" or "mentee" (required)
- `agree_terms`: Must be true (required) - User must agree to terms and conditions
- `agree_privacy`: Must be true (required) - User must agree to privacy policy

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

**OTP Note:** For prototype, a static OTP **1234** is used. The OTP is also logged to console.

**Incomplete Registration Handling:**
If a user previously started registration but didn't complete onboarding (`onboarding_completed: false`), they can re-register with the same phone number and email to continue where they left off. The system will:
- Send a new OTP to the same user
- Allow them to complete their onboarding from their last step
- Return `isReturningUser: true` in the response

**Success Response for Returning User (200):**
```json
{
  "success": true,
  "message": "Welcome back! OTP sent to continue your registration",
  "data": {
    "message": "Welcome back! OTP sent to continue your registration",
    "userId": "507f1f77bcf86cd799439011",
    "isReturningUser": true
  }
}
```

**Error Responses:**
- `400`: Phone number already registered with a completed profile. Please login instead.
- `400`: This phone number is registered with a different email address.
- `400`: Email already registered with a different phone number.
- `400`: Country code does not match the registered number.
- `400`: You must agree to the terms and conditions
- `400`: You must agree to the privacy policy
- `400`: Validation errors

---

#### 1.2 Verify OTP (Registration)
**POST** `/api/onboarding/verify-otp`

Verifies the OTP sent during registration and returns a JWT token.

**Request Body:**
```json
{
  "phone": "9876543210",
  "country_code": "+91",
  "otp": "1234"
}
```

**Validation:**
- `phone`: Must be a valid mobile phone number
- `country_code`: Required (e.g., "+1", "+91", "+44")
- `otp`: Must be 4-6 characters long

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
      "phone": "9876543210",
      "country_code": "+91",
      "role": "mentor",
      "verified": true,
      "onboarding_completed": false
    }
  }
}
```

**Error Responses:**
- `400`: User not found with this phone number
- `400`: Country code does not match the registered number
- `400`: Invalid OTP
- `400`: OTP expired
- `400`: Validation errors

---

#### 1.3 Update User Profile
**PUT** `/api/onboarding/update-user`

Updates user profile information. Uses authenticated user's ID from JWT token.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe",
    "age": 30,
    "location": "New York"
  },
  "professionalInfo": {
    "company": "Tech Corp",
    "position": "Senior Developer",
    "experience": 5
  },
  "competencies": ["JavaScript", "React", "Node.js"]
}
```

**Note:** All fields are optional. Send only the fields you want to update.

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
      "personal_info": { ... },
      "professional_info": { ... },
      "competencies": ["JavaScript", "React", "Node.js"]
    }
  }
}
```

**Error Responses:**
- `401`: Unauthorized (missing or invalid token)
- `404`: User not found

---

#### 1.4 Complete Onboarding
**POST** `/api/onboarding/complete`

Marks the user's onboarding as completed.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:** (None required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Onboarding completed successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "onboarding_completed": true,
    ...
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: User not found

---

#### 1.5 Check Onboarding Status
**GET** `/api/onboarding/status`

Returns the current onboarding status of the authenticated user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Onboarding status fetched",
  "data": {
    "onboarding_completed": false,
    "role": "mentor"
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: User not found

---

### 2. Authentication APIs

#### 2.1 Login (Request OTP)
**POST** `/api/auth/login`

Sends an OTP to the user's registered phone number for login verification.

**Request Body:**
```json
{
  "phone": "9876543210",
  "country_code": "+91"
}
```

**Validation:**
- `phone`: Must be a valid mobile phone number
- `country_code`: Required (e.g., "+1", "+91", "+44")

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

**OTP Note:** For prototype, a static OTP **1234** is used. The OTP is also logged to console.

**Error Responses:**
- `400`: User not found with this phone number
- `400`: User not verified (must complete registration first)
- `400`: Country code does not match the registered number

---

#### 2.2 Verify Login OTP
**POST** `/api/auth/verify-login`

Verifies the login OTP and returns a JWT token.

**Request Body:**
```json
{
  "phone": "9876543210",
  "country_code": "+91",
  "otp": "1234"
}
```

**Validation:**
- `phone`: Must be a valid mobile phone number
- `country_code`: Required (e.g., "+1", "+91", "+44")
- `otp`: Must be 4-6 characters long

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "message": "OTP verified successfully",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "phone": "+1234567890",
      "role": "mentor",
      "verified": true,
      "onboarding_completed": true
    }
  }
}
```

**Error Responses:**
- `400`: User not found
- `400`: Invalid OTP
- `400`: OTP expired

---

#### 2.3 Get Current User
**GET** `/api/auth/me`

Returns the authenticated user's profile information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "phone": "+1234567890",
    "role": "mentor",
    "verified": true,
    "onboarding_completed": true,
    "personal_info": { ... },
    "professional_info": { ... },
    "competencies": ["JavaScript", "React", "Node.js"],
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401`: Unauthorized
- `404`: User not found

---

#### 2.4 Logout
**POST** `/api/auth/logout`

Logs out the current user. (Note: Since we're using stateless JWT, this is mainly for client-side cleanup)

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### 3. User Profile APIs

#### 3.1 Get User Profile
**GET** `/api/users/profile`

Returns the authenticated user's profile information (excludes sensitive fields like role, verified status, and onboarding flags).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "personal_info_step1": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "personal_info_step2": {
      "age": 30,
      "location": "New York"
    },
    "company_info": {
      "company": "Tech Corp",
      "position": "Senior Developer"
    },
    "profile_photo": "https://example.com/photo.jpg",
    "competencies": ["JavaScript", "React", "Node.js"],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `401`: Unauthorized (missing or invalid token)
- `404`: User not found

---

#### 3.2 Get User By ID
**GET** `/api/users/:userId`

Returns a specific user's profile information by their user ID (excludes sensitive fields).

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `userId`: MongoDB ObjectId of the user

**Success Response (200):**
```json
{
  "success": true,
  "message": "User profile retrieved successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "personal_info_step1": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "personal_info_step2": {
      "age": 30,
      "location": "New York"
    },
    "company_info": {
      "company": "Tech Corp",
      "position": "Senior Developer"
    },
    "profile_photo": "https://example.com/photo.jpg",
    "competencies": ["JavaScript", "React", "Node.js"],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400`: User ID is required
- `401`: Unauthorized (missing or invalid token)
- `404`: User not found

---

#### 3.3 Update User Profile
**PUT** `/api/users/profile`

Updates the authenticated user's profile information. Only allows updating specific profile fields.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "personal_info_step1": {
    "firstName": "John",
    "lastName": "Doe"
  },
  "personal_info_step2": {
    "age": 30,
    "location": "New York"
  },
  "company_info": {
    "company": "Tech Corp",
    "position": "Senior Developer",
    "experience": 5
  },
  "profile_photo": "https://example.com/photo.jpg",
  "competencies": ["JavaScript", "React", "Node.js", "TypeScript"]
}

{
  "personal_info_step1": {
    "full_name": "Aryan Maharaj",
    "date_of_birth": "1981-07-13T00:00:00.000Z",
    "gender": "Male",
    "city": "Mumbai",
    "state": "Maharashtra"
  },
  "personal_info_step2": {
    "country": "India",
    "timezone": "Asia/Kolkata",
    "languages": ["English", "Hindi"],
    "hobby": ["Photography", "Reading"],
    "bio": "I have over 15 years of experience as a Data Scientist. I enjoy teaching and mentoring.",
    "skills_to_teach": ["UX Design", "React", "Data Science"]
  },
  "company_info": {
    "working_status": "Employed",
    "job_title": "Senior Data Scientist",
    "company_name": "Tech Corp",
    "industry": "Technology"
  },
  "profile_photo": "https://example.com/photos/profile.jpg",
  "competencies": {
    "giving_receiving_feedback": "Good",
    "listening_skills": "Excellent",
    "presentation_skills": "Good",
    "networking": "Fair",
    "teamwork": "Excellent"
  }
}

```

**Allowed Fields:**
- `personal_info_step1`: Object (flexible schema)
- `personal_info_step2`: Object (flexible schema)
- `company_info`: Object (flexible schema)
- `profile_photo`: String (URL)
- `competencies`: Array of Strings

**Note:** All fields are optional. Send only the fields you want to update. Protected fields (role, verified, onboarding_completed, onboarding_step) cannot be updated through this endpoint.

**Success Response (200):**
```json
{
  "success": true,
  "message": "Profile updated successfully",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "personal_info_step1": {
      "firstName": "John",
      "lastName": "Doe"
    },
    "personal_info_step2": {
      "age": 30,
      "location": "New York"
    },
    "company_info": {
      "company": "Tech Corp",
      "position": "Senior Developer",
      "experience": 5
    },
    "profile_photo": "https://example.com/photo.jpg",
    "competencies": ["JavaScript", "React", "Node.js", "TypeScript"],
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z"
  }
}
```

**Error Responses:**
- `400`: No valid fields to update
- `401`: Unauthorized (missing or invalid token)
- `404`: User not found

---

## Error Response Format

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error message here"
}
```

Or with validation errors:

```json
{
  "success": false,
  "errors": [
    {
      "msg": "Valid email required",
      "param": "email",
      "location": "body"
    }
  ]
}
```

---

## JWT Token

The JWT token contains:
```json
{
  "id": "user_id",
  "role": "mentor|mentee",
  "iat": 1234567890,
  "exp": 1234567890
}
```

**Token Expiry:** 7 days (configurable via `JWT_EXPIRY` environment variable)

**How to use:**
Include in Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Common Status Codes

- `200`: Success
- `400`: Bad Request (validation errors, business logic errors)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (token expired)
- `404`: Not Found
- `500`: Internal Server Error

---

## User Model Schema

```javascript
{
  email: String (required, unique),
  phone: String (required, unique),
  country_code: String (required),
  password: String (optional, for future use),
  role: String (enum: ["mentee", "mentor"], default: "mentee"),
  verified: Boolean (default: false),
  onboarding_completed: Boolean (default: false),
  personal_info: Object (flexible schema),
  professional_info: Object (flexible schema),
  competencies: Array of Strings,
  otp: String (hashed),
  otp_expiry: Date,
  login_attempts: Number (default: 0),
  lock_until: Date,
  createdAt: Date (auto-generated),
  updatedAt: Date (auto-generated)
}
```

---

## Environment Variables Required

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/mentor-app
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=7d
NODE_ENV=development
```

---

## Example Usage Flows

### Complete Registration Flow

```bash
# Step 1: Register
POST /api/onboarding/register
{
  "email": "mentor@example.com",
  "phone": "1234567890",
  "country_code": "+1",
  "role": "mentor"
}
# OTP is always: 1234

# Step 2: Verify OTP
POST /api/onboarding/verify-otp
{
  "email": "mentor@example.com",
  "otp": "1234"
}
# Save the JWT token from response

# Step 3: Update Profile (use token from step 2)
PUT /api/onboarding/update-user
Authorization: Bearer <token>
{
  "personalInfo": {
    "firstName": "John",
    "lastName": "Doe"
  },
  "professionalInfo": {
    "company": "Tech Corp",
    "position": "Senior Developer"
  },
  "competencies": ["JavaScript", "React"]
}

# Step 4: Complete Onboarding
POST /api/onboarding/complete
Authorization: Bearer <token>
```

### Login Flow

```bash
# Step 1: Request Login OTP
POST /api/auth/login
{
  "email": "mentor@example.com"
}
# OTP is always: 1234

# Step 2: Verify Login OTP
POST /api/auth/verify-login
{
  "email": "mentor@example.com",
  "otp": "5678"
}
# Save the JWT token from response

# Step 3: Get Current User Info
GET /api/auth/me
Authorization: Bearer <token>
```

---

## Rate Limiting

The API includes rate limiting middleware to prevent abuse. Default limits can be configured in the codebase.

---

## Notes

1. **OTP Generation**: Static OTP **1234** is used for prototype. OTP is logged to console. In production, integrate with SMS/Email service and use dynamic OTP generation.
2. **Security**: OTPs are hashed using bcrypt before storing in database.
3. **Token Security**: Store JWT tokens securely on the client (e.g., httpOnly cookies or secure storage).
4. **Role-Based Access**: Both mentors and mentees use the same endpoints, differentiated by the `role` field.
5. **Country Code**: Stored separately from phone number for better international support.
