# Authentication API Documentation

Base URL: `http://localhost:3000/api`

---

## Overview

This document describes the authentication endpoints for the mentor-mentee platform. Authentication is **phone-based** with OTP verification.

**Key Changes:**
- Login now uses **phone number** instead of email
- **Country code** is required for all authentication requests
- System validates country code matches registered number

---

## Authentication Endpoints

### 1. Login (Request OTP)

**Endpoint:** `POST /api/auth/login`

Sends an OTP to the user's registered phone number for login verification.

**Request Body:**
```json
{
  "phone": "9876543210",
  "country_code": "+91"
}
```

**Validation:**
- `phone`: Must be a valid mobile phone number (required)
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

**Error Responses:**
- `400`: User not found with this phone number
- `400`: User not verified (must complete registration first)
- `400`: Country code does not match the registered number
- `400`: Validation errors

**OTP Note:** For prototype, a static OTP **1234** is used. The OTP is also logged to console.

---

### 2. Verify Login OTP

**Endpoint:** `POST /api/auth/verify-login`

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
- `phone`: Must be a valid mobile phone number (required)
- `country_code`: Required (e.g., "+1", "+91", "+44")
- `otp`: Must be 4-6 characters long (required)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "message": "Login successful",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "phone": "9876543210",
      "country_code": "+91",
      "role": "mentor",
      "verified": true,
      "onboarding_completed": true,
      "onboarding_step": 5
    }
  }
}
```

**Error Responses:**
- `400`: User not found with this phone number
- `400`: Invalid OTP
- `400`: OTP expired
- `400`: Country code does not match
- `400`: Validation errors

**Note:** Save the `token` value for use in subsequent authenticated requests.

---

### 3. Get Current User (Me)

**Endpoint:** `GET /api/auth/me`

Returns the authenticated user's complete profile information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "User data retrieved",
  "data": {
    "id": "507f1f77bcf86cd799439011",
    "email": "user@example.com",
    "phone": "9876543210",
    "country_code": "+91",
    "role": "mentor",
    "verified": true,
    "onboarding_completed": true,
    "onboarding_step": 5,
    "personal_info_step1": { ... },
    "personal_info_step2": { ... },
    "company_info": { ... },
    "competencies": { ... },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T12:45:00.000Z"
  }
}
```

**Error Responses:**
- `401`: Unauthorized (missing or invalid token)
- `404`: User not found

---

### 4. Logout

**Endpoint:** `POST /api/auth/logout`

Logs out the current user.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully",
  "data": {
    "message": "Logged out successfully"
  }
}
```

**Error Responses:**
- `401`: Unauthorized (missing or invalid token)

**Client Action:** After receiving this response, delete the JWT token from local storage.

---

## Complete Login Flow Example

```bash
# 1. Request OTP
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "country_code": "+91"
  }'

# 2. Verify OTP and Get Token
curl -X POST http://localhost:3000/api/auth/verify-login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "country_code": "+91",
    "otp": "1234"
  }'

# 3. Use token to access protected endpoints
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

# 4. Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer $TOKEN"
```

---

## Important Notes

### Phone-Based Authentication

- Users login with **phone number + country code** (not email)
- Country code must match the one used during registration
- Phone numbers must be unique in the system

### JWT Token

- **Validity:** 7 days by default
- **Storage:** Store securely on client
- **Usage:** Include in `Authorization` header as `Bearer <token>`

### Security

- OTP expires after 10 minutes
- OTPs are hashed before storage
- Country code validation prevents unauthorized access
- Only verified users can login

---

## Related Documentation

- `DETAILED_ONBOARDING_FLOW.md` - Complete onboarding process
- `API_ENDPOINTS.md` - All available endpoints
- `ONBOARDING_STEPS_API.md` - Step-by-step onboarding

---
