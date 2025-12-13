# Meetings API Documentation

## Endpoints

### 1. Get User Meetings

Retrieve all meetings for the authenticated user (as mentor or mentee).

**Endpoint:** `GET /api/meetings`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status` (optional): Filter by meeting status
  - Values: `scheduled`, `completed`, `cancelled`
  - Default: `scheduled`

**Success Response (200):**
```json
{
  "success": true,
  "message": "Meetings retrieved successfully",
  "data": [
    {
      "_id": "meeting_id",
      "connection_id": {
        "_id": "connection_id",
        "status": "accepted"
      },
      "mentor_id": {
        "_id": "mentor_user_id",
        "name": "John Mentor",
        "email": "mentor@example.com",
        "profile_picture": "https://..."
      },
      "mentee_id": {
        "_id": "mentee_user_id",
        "name": "Jane Mentee",
        "email": "mentee@example.com",
        "profile_picture": "https://..."
      },
      "start_at": "2024-01-15T10:00:00.000Z",
      "end_at": "2024-01-15T10:30:00.000Z",
      "duration_minutes": 30,
      "status": "scheduled",
      "createdAt": "2024-01-10T12:00:00.000Z",
      "updatedAt": "2024-01-10T12:00:00.000Z"
    }
  ]
}
```

**Example:**
```bash
# Get all scheduled meetings
curl -X GET "http://localhost:3000/api/meetings" \
  -H "Authorization: Bearer your_jwt_token"

# Get all completed meetings
curl -X GET "http://localhost:3000/api/meetings?status=completed" \
  -H "Authorization: Bearer your_jwt_token"

# Get all cancelled meetings
curl -X GET "http://localhost:3000/api/meetings?status=cancelled" \
  -H "Authorization: Bearer your_jwt_token"
```

---

### 2. Cancel Meeting

Cancel a scheduled meeting. Only the mentor or mentee can cancel their own meeting.

**Endpoint:** `DELETE /api/meetings/:meetingId`

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**URL Parameters:**
- `meetingId`: The MongoDB ObjectId of the meeting to cancel

**Success Response (200):**
```json
{
  "success": true,
  "message": "Meeting cancelled successfully",
  "data": {
    "_id": "meeting_id",
    "connection_id": "connection_id",
    "mentor_id": "mentor_user_id",
    "mentee_id": "mentee_user_id",
    "start_at": "2024-01-15T10:00:00.000Z",
    "end_at": "2024-01-15T10:30:00.000Z",
    "duration_minutes": 30,
    "status": "cancelled",
    "createdAt": "2024-01-10T12:00:00.000Z",
    "updatedAt": "2024-01-14T09:00:00.000Z"
  }
}
```

**Error Responses:**

**400 - Bad Request:**
```json
{
  "success": false,
  "message": "Can only cancel scheduled meetings"
}
```

**403 - Forbidden:**
```json
{
  "success": false,
  "message": "Unauthorized to cancel this meeting"
}
```

**404 - Not Found:**
```json
{
  "success": false,
  "message": "Meeting not found"
}
```

**Example:**
```bash
curl -X DELETE "http://localhost:3000/api/meetings/60d5ec49f1b2c8b1f8c4e123" \
  -H "Authorization: Bearer your_jwt_token"
```

---

## Notes

- Meetings are automatically sorted by `start_at` in ascending order
- Only participants (mentor or mentee) can cancel their meetings
- Once cancelled, meetings cannot be un-cancelled
- The slot blocking system automatically excludes scheduled meetings from available slots
- Populated fields include mentor/mentee details (name, email, profile_picture) and connection status
