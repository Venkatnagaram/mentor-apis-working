# Complete Onboarding Flow - Detailed Guide

Base URL: `http://localhost:3000/api`

---

## Table of Contents
1. [Complete Flow Overview](#complete-flow-overview)
2. [Step-by-Step Implementation](#step-by-step-implementation)
3. [Progress Tracking Mechanism](#progress-tracking-mechanism)
4. [Resume After Leaving](#resume-after-leaving)
5. [All API Endpoints](#all-api-endpoints)
6. [Complete Working Examples](#complete-working-examples)

---

## Complete Flow Overview

### Phase 1: Registration & Verification
```
User → Register → Receive OTP → Verify OTP → Get JWT Token
```

### Phase 2: 5-Step Onboarding (Profile Completion)
```
Step 1 → Step 2 → Step 3 → Step 4 (Skip) → Step 5 → Profile Active ✓
```

### Key Points:
1. **After OTP verification**, you receive a **JWT token**
2. Use this **JWT token** in ALL subsequent requests (as Authorization header)
3. The system **automatically tracks** which step you're on
4. You can **leave anytime** and **resume later**
5. Profile becomes **active only after Step 5**

---

## Step-by-Step Implementation

### STEP 1: Register User

**Endpoint:** `POST /api/onboarding/register`

**Request:**
```json
{
  "email": "john.doe@example.com",
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
    "userId": "60d5f484f1b2c72b8c8e4f1a"
  }
}
```

**Note:** Static OTP for testing: **1234**

---

### STEP 2: Verify OTP

**Endpoint:** `POST /api/onboarding/verify-otp`

**Request:**
```json
{
  "phone": "9876543210",
  "country_code": "+91",
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
      "id": "60d5f484f1b2c72b8c8e4f1a",
      "email": "john.doe@example.com",
      "phone": "9876543210",
      "country_code": "+91",
      "role": "mentor",
      "verified": true,
      "onboarding_completed": false
    }
  }
}
```

**IMPORTANT:** Save the `token` value. You'll use it in ALL remaining requests!

---

### STEP 3: Check Current Onboarding Step (Optional but Recommended)

**Endpoint:** `GET /api/onboarding/current-step`

**Headers:**
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response:**
```json
{
  "success": true,
  "message": "Current onboarding status retrieved",
  "data": {
    "current_step": 0,
    "onboarding_completed": false,
    "data": {
      "step1": null,
      "step2": null,
      "step3": null,
      "step4": null,
      "step5": null
    }
  }
}
```

**Interpretation:**
- `current_step: 0` → User hasn't started any step yet
- `current_step: 1` → User completed Step 1, needs to do Step 2
- `current_step: 5` + `onboarding_completed: true` → Profile is active!

---

### STEP 4: Complete Step 1 (Personal Information 1)

**Endpoint:** `POST /api/onboarding/step-1`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "full_name": "John Doe",
  "date_of_birth": "1990-01-15",
  "gender": "Male",
  "city": "Delhi",
  "state": "Delhi"
}
```

**Field Requirements:**
- `full_name`: String (required)
- `date_of_birth`: ISO 8601 date format YYYY-MM-DD (required)
- `gender`: "Male", "Female", or "Other" (required)
- `city`: String (required)
- `state`: String (required)

**Response:**
```json
{
  "success": true,
  "message": "Step 1 completed successfully",
  "data": {
    "message": "Step 1 completed successfully",
    "onboarding_step": 1,
    "next_step": 2
  }
}
```

**What Happens Behind the Scenes:**
- System saves your data to database
- Updates `onboarding_step` to `1`
- Tells you next step is `2`

---

### STEP 5: Complete Step 2 (Personal Information 2)

**Endpoint:** `POST /api/onboarding/step-2`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "country": "India",
  "timezone": "Asia/Kolkata",
  "languages": ["English", "Hindi", "Tamil"],
  "hobby": "Hiking",
  "bio": "Passionate about mentoring and helping others grow in their tech careers."
}
```

**Field Requirements:**
- `country`: String (required)
- `timezone`: String (required) - e.g., "Asia/Kolkata", "America/New_York"
- `languages`: Array of strings, minimum 1 language (required)
- `hobby`: String (required)
- `bio`: String, max 140 characters (required)

**Response:**
```json
{
  "success": true,
  "message": "Step 2 completed successfully",
  "data": {
    "message": "Step 2 completed successfully",
    "onboarding_step": 2,
    "next_step": 3
  }
}
```

---

### STEP 6: Complete Step 3 (Company Information)

**Endpoint:** `POST /api/onboarding/step-3`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "working_status": "Employed",
  "job_title": "Senior Software Engineer",
  "company_name": "Tech Solutions Inc",
  "industry": "Information Technology"
}
```

**Field Requirements:**
- `working_status`: String (required) - e.g., "Employed", "Job Hunting", "Freelance", "Student"
- `job_title`: String (required)
- `company_name`: String (required)
- `industry`: String (required) - e.g., "IT", "Finance", "Healthcare", "Education"

**Response:**
```json
{
  "success": true,
  "message": "Step 3 completed successfully",
  "data": {
    "message": "Step 3 completed successfully",
    "onboarding_step": 3,
    "next_step": 4
  }
}
```

---

### STEP 7: Complete Step 4 (Upload Photo - SKIPPED)

**Endpoint:** `POST /api/onboarding/step-4`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{}
```

**Note:** This step is currently skipped for prototype. You can send an empty body `{}` or skip calling this endpoint. The system will automatically move you to step 5.

**Response:**
```json
{
  "success": true,
  "message": "Step 4 completed successfully (skipped photo upload)",
  "data": {
    "message": "Step 4 completed successfully (skipped photo upload)",
    "onboarding_step": 4,
    "next_step": 5
  }
}
```

---

### STEP 8: Complete Step 5 (Competencies Information) - FINAL STEP

**Endpoint:** `POST /api/onboarding/step-5`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
```

**Request Body:**
```json
{
  "giving_receiving_feedback": "Good",
  "listening_skills": "Excellent",
  "presentation_skills": "Good",
  "networking": "Fair",
  "teamwork": "Outstanding"
}
```

**Field Requirements:**
All fields are required and must be one of these values:
- "Fair"
- "Good"
- "Excellent"
- "Outstanding"

**Fields:**
- `giving_receiving_feedback`: Your rating
- `listening_skills`: Your rating
- `presentation_skills`: Your rating
- `networking`: Your rating
- `teamwork`: Your rating

**Response:**
```json
{
  "success": true,
  "message": "Onboarding completed successfully! Your profile is now active.",
  "data": {
    "message": "Onboarding completed successfully! Your profile is now active.",
    "onboarding_step": 5,
    "onboarding_completed": true
  }
}
```

**🎉 CONGRATULATIONS! Your profile is now ACTIVE!**

---

## Progress Tracking Mechanism

### How the System Tracks Your Progress

The system uses a field called `onboarding_step` in your user record:

| `onboarding_step` Value | Meaning |
|------------------------|---------|
| 0 | Not started - User verified OTP but hasn't begun steps |
| 1 | Completed Step 1 - User needs to do Step 2 next |
| 2 | Completed Step 2 - User needs to do Step 3 next |
| 3 | Completed Step 3 - User needs to do Step 4 next |
| 4 | Completed Step 4 - User needs to do Step 5 next |
| 5 | Completed Step 5 - Profile is ACTIVE ✓ |

### Additional Tracking Fields

```javascript
{
  onboarding_step: 2,              // Current step number (0-5)
  onboarding_completed: false,      // true only when step 5 is done
  personal_info_step1: {            // Saved data from Step 1
    full_name: "...",
    date_of_birth: "...",
    // ... etc
  },
  personal_info_step2: { ... },    // Saved data from Step 2
  company_info: { ... },            // Saved data from Step 3
  profile_photo: "...",             // Saved data from Step 4
  competencies: { ... }             // Saved data from Step 5
}
```

---

## Resume After Leaving

### Important: Incomplete Registration Handling

**If user left before completing registration (onboarding_completed: false):**

Users can re-register with the same phone number and email to continue their onboarding:

1. **Call the same registration endpoint** with the same details
2. **System recognizes the incomplete registration** and sends a new OTP
3. **After OTP verification**, user continues from their last completed step

**Example Flow:**
```bash
# Day 1: User registers but leaves after Step 2
POST /api/onboarding/register → OTP sent
POST /api/onboarding/verify-otp → Token received
POST /api/onboarding/step-1 → Step 1 saved
POST /api/onboarding/step-2 → Step 2 saved
# User closes app (onboarding_step = 2, onboarding_completed = false)

# Day 2: User returns and tries to register again
POST /api/onboarding/register
# (same phone, email, country_code)
# Response: "Welcome back! OTP sent to continue your registration"
# isReturningUser: true

POST /api/onboarding/verify-otp → Token received
GET /api/onboarding/current-step → Shows current_step = 2
POST /api/onboarding/step-3 → Continue from Step 3
```

**Key Benefits:**
- No need to remember if they registered before
- Seamless user experience
- Data preservation from previous steps
- Same phone/email validation ensures security

---

### Scenario 1: User Completes Step 1 and Closes App

**What happens:**
1. User completes Step 1
2. System saves data and sets `onboarding_step = 1`
3. User closes app/browser

**When user comes back:**
1. User re-registers OR logs in (if they remember) and gets JWT token
2. User calls: `GET /api/onboarding/current-step`

**Response:**
```json
{
  "success": true,
  "message": "Current onboarding status retrieved",
  "data": {
    "current_step": 1,
    "onboarding_completed": false,
    "data": {
      "step1": {
        "full_name": "John Doe",
        "date_of_birth": "1990-01-15",
        "gender": "Male",
        "city": "Delhi",
        "state": "Delhi"
      },
      "step2": null,
      "step3": null,
      "step4": null,
      "step5": null
    }
  }
}
```

**Your app should:**
- Check `current_step` value
- If `current_step = 1`, show Step 2 form to user
- User continues from Step 2

---

### Scenario 2: User Completes Step 3 and Logs Out

**What happens:**
1. User completes Step 1, 2, 3
2. System saves all data and sets `onboarding_step = 3`
3. User logs out

**When user comes back:**
1. User logs in with email → receives OTP → verifies OTP → gets new JWT token
2. User calls: `GET /api/onboarding/current-step`

**Response:**
```json
{
  "success": true,
  "message": "Current onboarding status retrieved",
  "data": {
    "current_step": 3,
    "onboarding_completed": false,
    "data": {
      "step1": { "full_name": "John Doe", ... },
      "step2": { "country": "India", ... },
      "step3": { "working_status": "Employed", ... },
      "step4": null,
      "step5": null
    }
  }
}
```

**Your app should:**
- Check `current_step = 3`
- Show Step 4 form (or directly Step 5 since Step 4 is skipped)
- User continues from where they left off

---

### Scenario 3: User Already Completed All Steps

**What happens:**
1. User previously completed all 5 steps
2. System has `onboarding_step = 5` and `onboarding_completed = true`

**When user calls current-step:**
```json
{
  "success": true,
  "message": "Current onboarding status retrieved",
  "data": {
    "current_step": 5,
    "onboarding_completed": true,
    "data": {
      "step1": { ... },
      "step2": { ... },
      "step3": { ... },
      "step4": null,
      "step5": { "giving_receiving_feedback": "Good", ... }
    }
  }
}
```

**Your app should:**
- Check `onboarding_completed = true`
- Skip onboarding flow
- Show main app dashboard/home screen

---

## All API Endpoints

### Authentication Endpoints

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| POST | `/api/onboarding/register` | Register new user | No |
| POST | `/api/onboarding/verify-otp` | Verify OTP and get token | No |
| POST | `/api/auth/login` | Login existing user | No |
| POST | `/api/auth/verify-login` | Verify login OTP | No |

### Onboarding Step Endpoints

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/onboarding/current-step` | Get current progress | Yes (JWT) |
| POST | `/api/onboarding/step-1` | Save Step 1 data | Yes (JWT) |
| POST | `/api/onboarding/step-2` | Save Step 2 data | Yes (JWT) |
| POST | `/api/onboarding/step-3` | Save Step 3 data | Yes (JWT) |
| POST | `/api/onboarding/step-4` | Save Step 4 data (skip) | Yes (JWT) |
| POST | `/api/onboarding/step-5` | Save Step 5 data (final) | Yes (JWT) |

### Other Endpoints

| Method | Endpoint | Purpose | Auth Required |
|--------|----------|---------|---------------|
| GET | `/api/onboarding/status` | Check onboarding status | Yes (JWT) |
| PUT | `/api/onboarding/update-user` | Update user data | Yes (JWT) |
| POST | `/api/onboarding/complete` | Manually mark complete | Yes (JWT) |

---

## Complete Working Examples

### Example 1: Fresh User - Complete All Steps

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

# Response: {"success": true, "data": {"userId": "..."}}

# 2. Verify OTP
curl -X POST http://localhost:3000/api/onboarding/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "country_code": "+91",
    "otp": "1234"
  }'

# Response: {"success": true, "data": {"token": "eyJhbG...", "user": {...}}}
# SAVE THIS TOKEN!

# 3. Check current step
curl -X GET http://localhost:3000/api/onboarding/current-step \
  -H "Authorization: Bearer eyJhbG..."

# Response: {"data": {"current_step": 0, ...}}

# 4. Complete Step 1
curl -X POST http://localhost:3000/api/onboarding/step-1 \
  -H "Authorization: Bearer eyJhbG..." \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Alice Smith",
    "date_of_birth": "1992-05-20",
    "gender": "Female",
    "city": "Mumbai",
    "state": "Maharashtra"
  }'

# Response: {"data": {"onboarding_step": 1, "next_step": 2}}

# 5. Complete Step 2
curl -X POST http://localhost:3000/api/onboarding/step-2 \
  -H "Authorization: Bearer eyJhbG..." \
  -H "Content-Type: application/json" \
  -d '{
    "country": "India",
    "timezone": "Asia/Kolkata",
    "languages": ["English", "Hindi", "Marathi"],
    "hobby": "Reading",
    "bio": "Experienced software engineer passionate about mentoring new developers."
  }'

# Response: {"data": {"onboarding_step": 2, "next_step": 3}}

# 6. Complete Step 3
curl -X POST http://localhost:3000/api/onboarding/step-3 \
  -H "Authorization: Bearer eyJhbG..." \
  -H "Content-Type: application/json" \
  -d '{
    "working_status": "Employed",
    "job_title": "Senior Software Engineer",
    "company_name": "TechCorp India",
    "industry": "Information Technology"
  }'

# Response: {"data": {"onboarding_step": 3, "next_step": 4}}

# 7. Complete Step 4 (Skip)
curl -X POST http://localhost:3000/api/onboarding/step-4 \
  -H "Authorization: Bearer eyJhbG..." \
  -H "Content-Type: application/json" \
  -d '{}'

# Response: {"data": {"onboarding_step": 4, "next_step": 5}}

# 8. Complete Step 5 (FINAL)
curl -X POST http://localhost:3000/api/onboarding/step-5 \
  -H "Authorization: Bearer eyJhbG..." \
  -H "Content-Type: application/json" \
  -d '{
    "giving_receiving_feedback": "Excellent",
    "listening_skills": "Good",
    "presentation_skills": "Excellent",
    "networking": "Fair",
    "teamwork": "Outstanding"
  }'

# Response: {"data": {"onboarding_step": 5, "onboarding_completed": true}}
# 🎉 PROFILE IS NOW ACTIVE!
```

---

### Example 2: User Leaves After Step 2 and Returns

```bash
# User previously completed Step 1 and Step 2, then left

# 1. Login again
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "alice@example.com"}'

# Response: OTP sent

# 2. Verify OTP
curl -X POST http://localhost:3000/api/auth/verify-login \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "9876543210",
    "country_code": "+91",
    "otp": "1234"
  }'

# Response: {"token": "eyJhbG...", ...}

# 3. Check where user left off
curl -X GET http://localhost:3000/api/onboarding/current-step \
  -H "Authorization: Bearer eyJhbG..."

# Response: {
#   "data": {
#     "current_step": 2,
#     "onboarding_completed": false,
#     "data": {
#       "step1": { "full_name": "Alice Smith", ... },
#       "step2": { "country": "India", ... },
#       "step3": null,
#       "step4": null,
#       "step5": null
#     }
#   }
# }

# User sees they're on step 2, so they should continue with Step 3

# 4. Continue with Step 3
curl -X POST http://localhost:3000/api/onboarding/step-3 \
  -H "Authorization: Bearer eyJhbG..." \
  -H "Content-Type: application/json" \
  -d '{ ... }'

# ... continue with remaining steps
```

---

## Frontend Implementation Logic

### Pseudo-code for your app:

```javascript
// After user logs in or verifies OTP
const token = response.data.token;
localStorage.setItem('jwt_token', token);

// Check onboarding status
async function checkOnboardingStatus() {
  const response = await fetch('http://localhost:3000/api/onboarding/current-step', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`
    }
  });

  const data = await response.json();
  const currentStep = data.data.current_step;
  const isCompleted = data.data.onboarding_completed;

  if (isCompleted) {
    // Show main app
    navigateTo('/dashboard');
  } else {
    // Show onboarding step
    navigateTo(`/onboarding/step-${currentStep + 1}`);
  }
}

// Save step data
async function saveStep(stepNumber, formData) {
  const response = await fetch(`http://localhost:3000/api/onboarding/step-${stepNumber}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('jwt_token')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(formData)
  });

  const result = await response.json();

  if (result.success) {
    const nextStep = result.data.next_step;

    if (result.data.onboarding_completed) {
      // All done!
      navigateTo('/dashboard');
    } else {
      // Go to next step
      navigateTo(`/onboarding/step-${nextStep}`);
    }
  }
}
```

---

## Link Between Steps

### The Connection Mechanism:

1. **Sequential Flow:**
   - Each step saves data and increments `onboarding_step` by 1
   - Step 1 sets `onboarding_step = 1`
   - Step 2 sets `onboarding_step = 2`
   - ... and so on

2. **Data Persistence:**
   - All step data is stored in the same user document
   - Each step has its own field (e.g., `personal_info_step1`, `personal_info_step2`)
   - Data is never lost

3. **Progress Indicator:**
   - `onboarding_step` field acts as the link
   - Frontend checks this value to know which step to show

4. **Completion Flag:**
   - `onboarding_completed` becomes `true` only after Step 5
   - This is the final indicator that profile is active

---

## Common Questions

### Q: Can I skip a step?
**A:** No. Steps must be completed in order (1 → 2 → 3 → 4 → 5). Except Step 4 which is automatically skipped.

### Q: Can I go back and edit previous steps?
**A:** Currently, no. But you can use the `/api/onboarding/update-user` endpoint to update data. We can add edit functionality if needed.

### Q: What happens if I call Step 3 before completing Step 1?
**A:** The API will still save Step 3 data, but the `onboarding_step` will be set to 3. It's recommended to follow the sequence, but the API doesn't enforce strict validation currently. (We can add this if needed.)

### Q: How long is the JWT token valid?
**A:** 7 days by default. After that, user needs to login again.

### Q: Can I get my saved data later?
**A:** Yes! Call `GET /api/onboarding/current-step` anytime to retrieve all saved data.

---

## Error Handling

### Common Errors:

**1. Missing Authorization Header:**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```
**Solution:** Add Authorization header with JWT token.

**2. Validation Error:**
```json
{
  "success": false,
  "errors": [
    {
      "msg": "Full name is required",
      "param": "full_name",
      "location": "body"
    }
  ]
}
```
**Solution:** Check request body and ensure all required fields are present.

**3. Invalid Token:**
```json
{
  "success": false,
  "message": "Invalid token"
}
```
**Solution:** Token expired or invalid. User needs to login again.

---

## Summary

### The Complete Journey:

1. **Register** → Get OTP
2. **Verify OTP** → Get JWT Token (Save this!)
3. **Check Progress** → `GET /current-step`
4. **Complete Steps 1-5** → POST to each step endpoint
5. **Profile Active** → Start using the app!

### Key Tracking Points:

- **JWT Token**: Required for all step requests
- **onboarding_step**: Tracks current progress (0-5)
- **onboarding_completed**: `true` when all done
- **GET /current-step**: Call this to resume from where user left

### Important URLs:

- **Check Progress:** `GET /api/onboarding/current-step`
- **Step 1:** `POST /api/onboarding/step-1`
- **Step 2:** `POST /api/onboarding/step-2`
- **Step 3:** `POST /api/onboarding/step-3`
- **Step 4:** `POST /api/onboarding/step-4`
- **Step 5:** `POST /api/onboarding/step-5`

---

## Need More Help?

Check the following files in the project:
- `ONBOARDING_STEPS_API.md` - API reference
- `API_ENDPOINTS.md` - All endpoints overview
- `test-api.js` - Working test examples

---

**Happy Onboarding! 🚀**
