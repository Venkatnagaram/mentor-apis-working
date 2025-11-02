# Onboarding Steps API Documentation

Base URL: `http://localhost:3000/api`

## Overview

After OTP verification, users must complete a 5-step onboarding process to activate their profile. The system tracks progress so users can complete steps across multiple sessions.

**Important:** Step 4 (Upload Photo) is currently skipped for prototype.

---

## Onboarding Flow

1. **Register** → `/api/onboarding/register` (with email, phone, country_code, role, agree_terms, agree_privacy)
2. **Verify OTP** → `/api/onboarding/verify-otp` (with phone, country_code, otp - receives JWT token)
3. **Complete 5 Steps** (using JWT token):
   - Step 1: Personal Information 1
   - Step 2: Personal Information 2
   - Step 3: Company Information
   - Step 4: Upload Photo (skipped)
   - Step 5: Competencies Information
4. **Profile Active** ✓

---

## Endpoints

### Get Current Onboarding Step

**GET** `/api/onboarding/current-step`

Returns the user's current onboarding progress and completed data.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Current onboarding status retrieved",
  "data": {
    "current_step": 2,
    "onboarding_completed": false,
    "data": {
      "step1": {
        "full_name": "John Doe",
        "date_of_birth": "1990-01-15",
        "gender": "Male",
        "city": "Delhi",
        "state": "Delhi"
      },
      "step2": {
        "country": "IN",
        "timezone": "Asia/Kolkata",
        "languages": ["English", "Hindi"],
        "hobby": "Hiking",
        "bio": "Passionate about mentoring and technology"
      },
      "step3": null,
      "step4": null,
      "step5": null
    }
  }
}
```

---

## Step 1: Personal Information 1

**POST** `/api/onboarding/step-1`

Collects basic personal information.

**Headers:**
```
Authorization: Bearer <jwt_token>
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

**Validation:**
- `full_name`: Required
- `date_of_birth`: Required, ISO 8601 format (YYYY-MM-DD)
- `gender`: Required, must be "Male", "Female", or "Other"
- `city`: Required
- `state`: Required

**Success Response (200):**
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

---

## Step 2: Personal Information 2

**POST** `/api/onboarding/step-2`

Collects additional personal information and preferences.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "country": "IN",
  "timezone": "Asia/Kolkata",
  "languages": ["English", "Hindi"],
  "hobby": "Hiking",
  "bio": "Passionate about mentoring and helping others grow in their careers"
}
```

**Validation:**
- `country`: Required
- `timezone`: Required
- `languages`: Required, array with at least one language
- `hobby`: Required
- `bio`: Required, max 140 characters

**Success Response (200):**
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

## Step 3: Company Information

**POST** `/api/onboarding/step-3`

Collects professional/company information.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "working_status": "Job Hunting",
  "job_title": "UX Designer",
  "company_name": "EDAAN",
  "industry": "IT"
}
```

**Validation:**
- `working_status`: Required (e.g., "Job Hunting", "Employed", "Freelance")
- `job_title`: Required
- `company_name`: Required
- `industry`: Required

**Success Response (200):**
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

## Step 4: Upload Photo (SKIPPED)

**POST** `/api/onboarding/step-4`

Photo upload step - currently skipped for prototype.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{}
```

**Note:** Can send empty body or skip this step entirely. It automatically advances to step 5.

**Success Response (200):**
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

## Step 5: Competencies Information

**POST** `/api/onboarding/step-5`

Final step - rate your competencies. Completing this step activates your profile.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Request Body:**
```json
{
  "giving_receiving_feedback": "Fair",
  "listening_skills": "Good",
  "presentation_skills": "Excellent",
  "networking": "Fair",
  "teamwork": "Outstanding"
}
```

**Validation:**
Each field must be one of: "Fair", "Good", "Excellent", "Outstanding"
- `giving_receiving_feedback`: Required
- `listening_skills`: Required
- `presentation_skills`: Required
- `networking`: Required
- `teamwork`: Required

**Success Response (200):**
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

---

## Complete Onboarding Flow Example

### 1. After OTP Verification

You receive a JWT token. Save it for all subsequent requests.

### 2. Check Current Step (Optional)

```bash
GET /api/onboarding/current-step
Authorization: Bearer <token>

# Response shows current_step: 0 (not started)
```

### 3. Complete Step 1

```bash
POST /api/onboarding/step-1
Authorization: Bearer <token>
{
  "full_name": "John Doe",
  "date_of_birth": "1990-01-15",
  "gender": "Male",
  "city": "Delhi",
  "state": "Delhi"
}
```

### 4. Complete Step 2

```bash
POST /api/onboarding/step-2
Authorization: Bearer <token>
{
  "country": "IN",
  "timezone": "Asia/Kolkata",
  "languages": ["English", "Hindi"],
  "hobby": "Hiking",
  "bio": "Passionate about mentoring"
}
```

### 5. Complete Step 3

```bash
POST /api/onboarding/step-3
Authorization: Bearer <token>
{
  "working_status": "Employed",
  "job_title": "Senior Developer",
  "company_name": "Tech Corp",
  "industry": "IT"
}
```

### 6. Skip Step 4

```bash
POST /api/onboarding/step-4
Authorization: Bearer <token>
{}
```

### 7. Complete Step 5

```bash
POST /api/onboarding/step-5
Authorization: Bearer <token>
{
  "giving_receiving_feedback": "Good",
  "listening_skills": "Excellent",
  "presentation_skills": "Good",
  "networking": "Fair",
  "teamwork": "Outstanding"
}

# Profile is now ACTIVE!
```

---

## Resume Onboarding Later

If a user completes Step 1 and logs out:

1. **Next Login:** Call `/api/onboarding-steps/current-step`
2. **Response shows:** `"current_step": 1`
3. **User continues from Step 2**

The system automatically tracks progress and returns all previously completed data.

---

## User Model Schema (Updated)

```javascript
{
  email: String (required, unique),
  phone: String (required, unique),
  country_code: String (required),
  role: String (enum: ["mentee", "mentor"]),
  verified: Boolean (default: false),

  // Onboarding tracking
  onboarding_completed: Boolean (default: false),
  onboarding_step: Number (0-5, default: 0),

  // Step 1: Personal Info 1
  personal_info_step1: {
    full_name: String,
    date_of_birth: Date,
    gender: String,
    city: String,
    state: String
  },

  // Step 2: Personal Info 2
  personal_info_step2: {
    country: String,
    timezone: String,
    languages: [String],
    hobby: String,
    bio: String (max 140 chars)
  },

  // Step 3: Company Info
  company_info: {
    working_status: String,
    job_title: String,
    company_name: String,
    industry: String
  },

  // Step 4: Photo (skipped)
  profile_photo: String,

  // Step 5: Competencies
  competencies: {
    giving_receiving_feedback: String (Fair/Good/Excellent/Outstanding),
    listening_skills: String,
    presentation_skills: String,
    networking: String,
    teamwork: String
  },

  createdAt: Date,
  updatedAt: Date
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "success": false,
  "message": "Error description"
}
```

Or with validation errors:

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

**Common Status Codes:**
- `200`: Success
- `400`: Validation error or bad request
- `401`: Unauthorized (missing/invalid token)
- `404`: User not found
- `500`: Server error

---

## Important Notes

1. **Progress Tracking:** System automatically saves progress after each step
2. **Resume Anytime:** Users can log out and resume from their last completed step
3. **Step 4 Skipped:** Photo upload functionality will be added later
4. **Step Order:** Steps can only be completed in order (1→2→3→4→5)
5. **JWT Required:** All step endpoints require authentication token
6. **Profile Activation:** Profile becomes active only after completing Step 5

---

## Testing the Flow

Use the static OTP **1234** for all authentication flows during prototype testing.
