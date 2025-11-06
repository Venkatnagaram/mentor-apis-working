# Incomplete Registration Handling Guide

Base URL: `http://localhost:3000/api`

---

## Overview

This guide explains how the system handles users who start registration but don't complete the onboarding process.

---

## The Problem

**Scenario:**
1. User registers with phone number and email
2. Verifies OTP successfully
3. Completes Step 1 and Step 2 of onboarding
4. Closes the app due to some reason
5. Next day, tries to register again with the same phone/email
6. Gets error: "Phone already registered" or "Email already registered"

**Issue:** User is stuck and cannot continue their registration!

---

## The Solution

The system now intelligently handles incomplete registrations:

### Logic Flow

```
User attempts registration
    ↓
Check if phone exists in database
    ↓
YES → Check onboarding_completed status
    ↓
    ├─→ TRUE (completed) → Return error: "Already registered, please login"
    │
    └─→ FALSE (incomplete) → Check if email matches
            ↓
            ├─→ YES (matches) → Check if country_code matches
            │       ↓
            │       ├─→ YES → ✅ UPDATE existing record with new OTP
            │       │           Return: "Welcome back! Continue your registration"
            │       │
            │       └─→ NO → ❌ Error: "Country code mismatch"
            │
            └─→ NO (different) → ❌ Error: "Phone registered with different email"

NO phone exists → Check if email exists
    ↓
    ├─→ YES → ❌ Error: "Email registered with different phone"
    │
    └─→ NO → ✅ CREATE new user record
```

---

## API Behavior

### Registration Endpoint: POST /api/onboarding/register

**Case 1: New User (First Time Registration)**

**Request:**
```json
{
  "email": "john@example.com",
  "phone": "9876543210",
  "country_code": "+91",
  "role": "mentor",
  "agree_terms": true,
  "agree_privacy": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "OTP generated successfully",
  "data": {
    "message": "OTP generated successfully",
    "userId": "507f1f77bcf86cd799439011",
    "isReturningUser": false
  }
}
```

---

**Case 2: Returning User (Incomplete Registration)**

**Request:** (Same details as original registration)
```json
{
  "email": "john@example.com",
  "phone": "9876543210",
  "country_code": "+91",
  "role": "mentor",
  "agree_terms": true,
  "agree_privacy": true
}
```

**Response:**
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

**What Happens Behind the Scenes:**
- System finds existing user with this phone number
- Checks `onboarding_completed` status → FALSE
- Validates email matches → YES
- Validates country_code matches → YES
- Updates the existing record with:
  - New OTP
  - New OTP expiry
  - Updated role (if changed)
  - Updated agree_terms and agree_privacy
  - Sets verified = false (to require OTP verification again)
- Returns same userId

---

**Case 3: Completed User (Should Login Instead)**

**Request:**
```json
{
  "email": "john@example.com",
  "phone": "9876543210",
  "country_code": "+91",
  "role": "mentor",
  "agree_terms": true,
  "agree_privacy": true
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Phone number already registered with a completed profile. Please login instead."
}
```

---

## Complete Flow Examples

### Example 1: User Leaves After Step 2

**Day 1:**
```bash
# 1. Register
curl -X POST http://localhost:3000/api/onboarding/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "phone": "9876543210",
    "country_code": "+91",
    "role": "mentor",
    "agree_terms": true,
    "agree_privacy": true
  }'
# Response: { "isReturningUser": false, "userId": "abc123" }

# 2. Verify OTP
curl -X POST http://localhost:3000/api/onboarding/verify-otp \
  -H "Content-Type: application/json" \
  -d '{ "phone": "9876543210", "country_code": "+91", "otp": "1234" }'
# Response: { "token": "jwt_token_here" }

# 3. Complete Step 1
curl -X POST http://localhost:3000/api/onboarding/step-1 \
  -H "Authorization: Bearer jwt_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Alice Smith",
    "date_of_birth": "1995-05-20",
    "gender": "Female",
    "city": "Mumbai",
    "state": "Maharashtra"
  }'
# Response: { "onboarding_step": 1 }

# 4. Complete Step 2
curl -X POST http://localhost:3000/api/onboarding/step-2 \
  -H "Authorization: Bearer jwt_token_here" \
  -H "Content-Type: application/json" \
  -d '{
    "country": "India",
    "timezone": "Asia/Kolkata",
    "languages": ["English", "Hindi"],
    "hobby": "Reading",
    "bio": "Tech enthusiast"
  }'
# Response: { "onboarding_step": 2 }

# User closes app
# Database state: onboarding_step = 2, onboarding_completed = false
```

**Day 2: User Returns**
```bash
# 1. User tries to "register" again (same details)
curl -X POST http://localhost:3000/api/onboarding/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "phone": "9876543210",
    "country_code": "+91",
    "role": "mentor",
    "agree_terms": true,
    "agree_privacy": true
  }'
# Response: {
#   "message": "Welcome back! OTP sent to continue your registration",
#   "isReturningUser": true,
#   "userId": "abc123"  // Same userId as Day 1
# }

# 2. Verify OTP (new OTP sent)
curl -X POST http://localhost:3000/api/onboarding/verify-otp \
  -H "Content-Type: application/json" \
  -d '{ "phone": "9876543210", "country_code": "+91", "otp": "1234" }'
# Response: { "token": "new_jwt_token" }

# 3. Check current progress
curl -X GET http://localhost:3000/api/onboarding/current-step \
  -H "Authorization: Bearer new_jwt_token"
# Response: {
#   "current_step": 2,
#   "onboarding_completed": false,
#   "data": {
#     "step1": { /* previously saved data */ },
#     "step2": { /* previously saved data */ },
#     "step3": null,
#     "step4": null,
#     "step5": null
#   }
# }

# 4. Continue from Step 3
curl -X POST http://localhost:3000/api/onboarding/step-3 \
  -H "Authorization: Bearer new_jwt_token" \
  -H "Content-Type: application/json" \
  -d '{
    "working_status": "Employed",
    "job_title": "Software Engineer",
    "company_name": "Tech Corp",
    "industry": "IT"
  }'

# Continue with Step 4 and Step 5...
```

---

## Error Cases

### Error 1: Phone Registered with Different Email

**Scenario:** User tries to register with same phone but different email

```bash
# Original registration: alice@example.com + 9876543210
# New attempt: bob@example.com + 9876543210

curl -X POST http://localhost:3000/api/onboarding/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "bob@example.com",
    "phone": "9876543210",
    "country_code": "+91",
    "role": "mentor",
    "agree_terms": true,
    "agree_privacy": true
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "This phone number is registered with a different email address."
}
```

---

### Error 2: Email Registered with Different Phone

**Scenario:** User tries to register with same email but different phone

```bash
# Original registration: alice@example.com + 9876543210
# New attempt: alice@example.com + 9999888877

curl -X POST http://localhost:3000/api/onboarding/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "phone": "9999888877",
    "country_code": "+91",
    "role": "mentor",
    "agree_terms": true,
    "agree_privacy": true
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "Email already registered with a different phone number."
}
```

---

### Error 3: Country Code Mismatch

**Scenario:** User tries to register with same phone/email but different country code

```bash
# Original registration: +91 9876543210
# New attempt: +1 9876543210

curl -X POST http://localhost:3000/api/onboarding/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "phone": "9876543210",
    "country_code": "+1",
    "role": "mentor",
    "agree_terms": true,
    "agree_privacy": true
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "Country code does not match the registered number."
}
```

---

### Error 4: Completed Profile (Should Login)

**Scenario:** User completed registration and tries to register again

```bash
# User completed all steps (onboarding_completed: true)

curl -X POST http://localhost:3000/api/onboarding/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "alice@example.com",
    "phone": "9876543210",
    "country_code": "+91",
    "role": "mentor",
    "agree_terms": true,
    "agree_privacy": true
  }'
```

**Response:**
```json
{
  "success": false,
  "message": "Phone number already registered with a completed profile. Please login instead."
}
```

**User should use:** `POST /api/auth/login` instead

---

## Frontend Implementation Guide

### Step 1: Handle Registration Response

```javascript
async function registerUser(userData) {
  const response = await fetch('http://localhost:3000/api/onboarding/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData)
  });

  const data = await response.json();

  if (data.success) {
    // Check if returning user
    if (data.data.isReturningUser) {
      console.log('Welcome back! Continue your registration');
      // Show: "We found your incomplete registration. Continue where you left off!"
    } else {
      console.log('New user registration');
      // Show: "Welcome! Let's get you started"
    }

    // Store userId for next step
    localStorage.setItem('userId', data.data.userId);

    // Proceed to OTP verification
    showOTPScreen();
  } else {
    // Handle errors
    if (data.message.includes('completed profile')) {
      // Redirect to login
      redirectToLogin();
    } else {
      // Show error message
      showError(data.message);
    }
  }
}
```

### Step 2: After OTP Verification, Check Progress

```javascript
async function afterOTPVerification(token) {
  // Save token
  localStorage.setItem('jwt_token', token);

  // Check current progress
  const response = await fetch('http://localhost:3000/api/onboarding/current-step', {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  const data = await response.json();

  if (data.success) {
    const currentStep = data.data.current_step;
    const isCompleted = data.data.onboarding_completed;

    if (isCompleted) {
      // Profile is complete, go to dashboard
      redirectToDashboard();
    } else {
      // Show the next step
      // If current_step = 2, show Step 3 form
      showOnboardingStep(currentStep + 1);
    }
  }
}
```

---

## Benefits of This Approach

1. **User-Friendly:** Users don't need to remember if they registered before
2. **Data Preservation:** All previously entered data is preserved
3. **Security:** Validates phone, email, and country code match
4. **Clear Separation:** Completed users are directed to login
5. **Seamless UX:** "Register" button works for both new and returning incomplete users

---

## Related Documentation

- `API_ENDPOINTS.md` - Complete API documentation
- `DETAILED_ONBOARDING_FLOW.md` - Step-by-step onboarding guide
- `AUTH_API.md` - Authentication endpoints

---

**Last Updated:** 2025-11-06
