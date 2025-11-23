# Connections API Documentation

## Overview
The Connections API enables mentees to send connection requests to mentors and allows mentors to accept or reject these requests. Once accepted, both users can view each other in their connections list.

## Base URL
```
/api/connections
```

## Authentication
All endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

---

## Endpoints

### 1. Send Connection Request (Mentee)
Send a connection request from a mentee to a mentor.

**Endpoint:** `POST /api/connections/request`

**Auth Required:** Yes (Mentee only)

**Request Body:**
```json
{
  "mentor_id": "string (required) - MongoDB ObjectId of the mentor",
  "request_message": "string (optional) - Message to mentor (max 500 chars)"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Connection request sent successfully",
  "data": {
    "_id": "connection_id",
    "mentee_id": "mentee_user_id",
    "mentor_id": "mentor_user_id",
    "status": "pending",
    "request_message": "Hi, I'd like to connect with you...",
    "requested_at": "2024-01-15T10:30:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `400` - Validation errors or business logic errors
- `401` - Unauthorized (no token or invalid token)

**Example:**
```bash
curl -X POST https://your-api.com/api/connections/request \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "mentor_id": "507f1f77bcf86cd799439011",
    "request_message": "I am interested in learning from you about web development."
  }'
```

---

### 2. Respond to Connection Request (Mentor)
Accept or reject a connection request.

**Endpoint:** `POST /api/connections/respond/:connection_id`

**Auth Required:** Yes (Mentor only)

**URL Parameters:**
- `connection_id` - MongoDB ObjectId of the connection request

**Request Body:**
```json
{
  "action": "string (required) - Either 'accept' or 'reject'",
  "reply_message": "string (optional) - Reply message (max 500 chars)"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Connection request accepted successfully",
  "data": {
    "_id": "connection_id",
    "mentee_id": {
      "_id": "mentee_user_id",
      "email": "mentee@example.com",
      "phone": "1234567890",
      "role": "mentee",
      "personal_info_step1": {
        "full_name": "John Doe"
      },
      "profile_photo": "url_to_photo"
    },
    "mentor_id": {
      "_id": "mentor_user_id",
      "email": "mentor@example.com",
      "phone": "9876543210",
      "role": "mentor",
      "personal_info_step1": {
        "full_name": "Jane Smith"
      },
      "profile_photo": "url_to_photo"
    },
    "status": "accepted",
    "request_message": "I am interested in learning from you...",
    "reply_message": "Happy to help you! Let's connect.",
    "requested_at": "2024-01-15T10:30:00.000Z",
    "responded_at": "2024-01-15T11:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

**Example:**
```bash
curl -X POST https://your-api.com/api/connections/respond/507f1f77bcf86cd799439011 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -d '{
    "action": "accept",
    "reply_message": "I would be happy to mentor you!"
  }'
```

---

### 3. Get Pending Requests (Mentor)
Retrieve all pending connection requests for a mentor.

**Endpoint:** `GET /api/connections/pending`

**Auth Required:** Yes (Mentor only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Pending requests retrieved successfully",
  "data": {
    "count": 2,
    "requests": [
      {
        "_id": "connection_id",
        "mentee_id": {
          "_id": "mentee_user_id",
          "email": "mentee@example.com",
          "phone": "1234567890",
          "role": "mentee",
          "personal_info_step1": {
            "full_name": "John Doe"
          },
          "profile_photo": "url_to_photo"
        },
        "mentor_id": "mentor_user_id",
        "status": "pending",
        "request_message": "I'd like to learn from you...",
        "requested_at": "2024-01-15T10:30:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

**Example:**
```bash
curl -X GET https://your-api.com/api/connections/pending \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 4. Get Sent Requests (Mentee)
Retrieve all connection requests sent by a mentee.

**Endpoint:** `GET /api/connections/sent`

**Auth Required:** Yes (Mentee only)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Sent requests retrieved successfully",
  "data": {
    "count": 3,
    "requests": [
      {
        "_id": "connection_id",
        "mentee_id": "mentee_user_id",
        "mentor_id": {
          "_id": "mentor_user_id",
          "email": "mentor@example.com",
          "phone": "9876543210",
          "role": "mentor",
          "personal_info_step1": {
            "full_name": "Jane Smith"
          },
          "profile_photo": "url_to_photo"
        },
        "status": "pending",
        "request_message": "I'd like to connect...",
        "requested_at": "2024-01-15T10:30:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z"
      }
    ]
  }
}
```

**Example:**
```bash
curl -X GET https://your-api.com/api/connections/sent \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 5. Get All Connections
Retrieve all accepted connections for the authenticated user (works for both mentors and mentees).

**Endpoint:** `GET /api/connections/list`

**Auth Required:** Yes

**Success Response (200):**
```json
{
  "success": true,
  "message": "Connections retrieved successfully",
  "data": {
    "count": 5,
    "connections": [
      {
        "_id": "connection_id",
        "mentee_id": {
          "_id": "mentee_user_id",
          "email": "mentee@example.com",
          "phone": "1234567890",
          "role": "mentee",
          "personal_info_step1": {
            "full_name": "John Doe"
          },
          "profile_photo": "url_to_photo"
        },
        "mentor_id": {
          "_id": "mentor_user_id",
          "email": "mentor@example.com",
          "phone": "9876543210",
          "role": "mentor",
          "personal_info_step1": {
            "full_name": "Jane Smith"
          },
          "profile_photo": "url_to_photo"
        },
        "status": "accepted",
        "request_message": "I'd like to learn from you...",
        "reply_message": "Happy to help!",
        "requested_at": "2024-01-15T10:30:00.000Z",
        "responded_at": "2024-01-15T11:00:00.000Z",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T11:00:00.000Z"
      }
    ]
  }
}
```

**Example:**
```bash
curl -X GET https://your-api.com/api/connections/list \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 6. Get Connection by ID
Retrieve details of a specific connection.

**Endpoint:** `GET /api/connections/:connection_id`

**Auth Required:** Yes (Must be either the mentee or mentor of this connection)

**URL Parameters:**
- `connection_id` - MongoDB ObjectId of the connection

**Success Response (200):**
```json
{
  "success": true,
  "message": "Connection retrieved successfully",
  "data": {
    "_id": "connection_id",
    "mentee_id": {
      "_id": "mentee_user_id",
      "email": "mentee@example.com",
      "phone": "1234567890",
      "role": "mentee",
      "personal_info_step1": {
        "full_name": "John Doe"
      },
      "profile_photo": "url_to_photo"
    },
    "mentor_id": {
      "_id": "mentor_user_id",
      "email": "mentor@example.com",
      "phone": "9876543210",
      "role": "mentor",
      "personal_info_step1": {
        "full_name": "Jane Smith"
      },
      "profile_photo": "url_to_photo"
    },
    "status": "accepted",
    "request_message": "I'd like to learn from you...",
    "reply_message": "Happy to help!",
    "requested_at": "2024-01-15T10:30:00.000Z",
    "responded_at": "2024-01-15T11:00:00.000Z",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  }
}
```

**Example:**
```bash
curl -X GET https://your-api.com/api/connections/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

### 7. Cancel Connection Request (Mentee)
Cancel a pending connection request.

**Endpoint:** `DELETE /api/connections/cancel/:connection_id`

**Auth Required:** Yes (Mentee only - must be the sender of the request)

**URL Parameters:**
- `connection_id` - MongoDB ObjectId of the connection request

**Success Response (200):**
```json
{
  "success": true,
  "message": "Connection request cancelled successfully",
  "data": null
}
```

**Error Responses:**
- `400` - Connection not found, unauthorized, or not in pending status
- `401` - Unauthorized (no token or invalid token)

**Example:**
```bash
curl -X DELETE https://your-api.com/api/connections/cancel/507f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## Connection Status Values
- `pending` - Request sent but not yet responded to
- `accepted` - Request accepted by mentor
- `rejected` - Request rejected by mentor

---

## Business Rules

1. **Only mentees can send connection requests** to mentors
2. **Cannot send requests to yourself**
3. **Cannot send duplicate requests** - only one request allowed per mentee-mentor pair
4. **Cannot send another request if previous was rejected**
5. **Only mentors can accept/reject** connection requests
6. **Only the mentor who received the request** can respond to it
7. **Only pending requests can be responded to**
8. **Only mentees can cancel their own pending requests**
9. **Cannot cancel non-pending requests**

---

## Error Handling

All endpoints return errors in the following format:

```json
{
  "success": false,
  "message": "Error message describing what went wrong"
}
```

Common error status codes:
- `400` - Bad Request (validation errors or business logic violations)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (token expired)
- `404` - Not Found
- `500` - Internal Server Error

---

## Example Flow

### Mentee Sending a Connection Request
```javascript
// Step 1: Mentee sends connection request
const response = await fetch('/api/connections/request', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    mentor_id: '507f1f77bcf86cd799439011',
    request_message: 'I would love to learn web development from you!'
  })
});

const data = await response.json();
console.log(data.data._id); // Save this connection_id
```

### Mentor Responding to Request
```javascript
// Step 2: Mentor accepts the request
const response = await fetch('/api/connections/respond/connection_id', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${mentorToken}`
  },
  body: JSON.stringify({
    action: 'accept',
    reply_message: 'Looking forward to mentoring you!'
  })
});
```

### Viewing Connections
```javascript
// Step 3: Both users can now view each other in their connections list
const response = await fetch('/api/connections/list', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data } = await response.json();
console.log(data.connections); // Array of accepted connections
```

---

## Notes
- All timestamps are in ISO 8601 format (UTC)
- MongoDB ObjectIds are 24-character hexadecimal strings
- Messages have a maximum length of 500 characters
- The API uses JWT tokens for authentication with a default expiry of 7 days
