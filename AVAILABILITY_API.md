# Availability & Meeting Booking API

## Overview

The Availability module allows mentors to define their available time slots and enables mentees to book meetings with mentors. It supports flexible availability patterns including weekly recurring schedules, date ranges, and specific single dates.

## Base URL

All endpoints are prefixed with `/api/availability`

## Authentication

All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

---

## Endpoints

### 1. Create Availability

**POST** `/api/availability`

Create a new availability schedule for the authenticated mentor.

#### Request Body

```json
{
  "type": "weekly",
  "days": ["mon", "wed", "fri"],
  "time_ranges": [
    {
      "from": "09:00",
      "to": "12:00"
    },
    {
      "from": "14:00",
      "to": "17:00"
    }
  ],
  "slot_duration_minutes": 30,
  "valid_from": "2024-01-01T00:00:00.000Z",
  "valid_to": "2024-12-31T23:59:59.999Z"
}
```

#### Availability Types

##### Weekly Recurring
```json
{
  "type": "weekly",
  "days": ["mon", "tue", "wed", "thu", "fri"],
  "time_ranges": [
    { "from": "09:00", "to": "17:00" }
  ],
  "slot_duration_minutes": 60
}
```

##### Weekly Recurring with Date Ranges (Advanced)
You can optionally add `date_ranges` to weekly availability to specify additional time slots for specific date ranges:

```json
{
  "type": "weekly",
  "days": ["mon", "wed", "fri"],
  "time_ranges": [
    { "from": "09:00", "to": "12:00" }
  ],
  "date_ranges": [
    {
      "start_date": "2025-12-15",
      "end_date": "2026-01-15",
      "time_ranges": [
        { "from": "14:00", "to": "17:00" }
      ]
    }
  ],
  "slot_duration_minutes": 30
}
```

This example generates:
- Monday/Wednesday/Friday slots from 09:00-12:00 (regular weekly pattern)
- PLUS additional Monday/Wednesday/Friday slots from 14:00-17:00 only between Dec 15, 2025 - Jan 15, 2026

##### Date Range
```json
{
  "type": "date_range",
  "date_ranges": [
    {
      "start_date": "2024-03-01",
      "end_date": "2024-03-15",
      "time_ranges": [
        { "from": "10:00", "to": "16:00" }
      ]
    }
  ],
  "slot_duration_minutes": 45
}
```

##### Single Dates
```json
{
  "type": "single_dates",
  "date_ranges": [
    {
      "dates": ["2024-03-10", "2024-03-12", "2024-03-14"],
      "time_ranges": [
        { "from": "09:00", "to": "12:00" }
      ]
    }
  ],
  "slot_duration_minutes": 30
}
```

#### Field Validation

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| type | string | Yes | Must be: "weekly", "date_range", or "single_dates" |
| slot_duration_minutes | integer | No | 15-180 minutes (default: 60) |
| days | array | Conditional | Required for "weekly" type. Valid values: "mon", "tue", "wed", "thu", "fri", "sat", "sun" |
| time_ranges | array | Conditional | Required for "weekly" type. Each range must have "from" and "to" in HH:mm format |
| date_ranges | array | Conditional | Required for "date_range" and "single_dates" types. Optional for "weekly" type (for date-specific overrides) |
| date_ranges[].start_date | ISO 8601 date | Conditional | Required when date_ranges is used |
| date_ranges[].end_date | ISO 8601 date | No | Optional. Must be after start_date if provided |
| date_ranges[].time_ranges | array | Conditional | Required for "date_range" and "single_dates". Optional for "weekly" with date_ranges |
| valid_from | ISO 8601 date | No | Start date for this availability |
| valid_to | ISO 8601 date | No | End date (must be after valid_from) |

#### Response (201 Created)

```json
{
  "success": true,
  "message": "Availability created",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "user_id": "65e1a2b3c4d5e6f7g8h9i0j1",
    "type": "weekly",
    "days": ["mon", "wed", "fri"],
    "time_ranges": [
      { "from": "09:00", "to": "12:00" }
    ],
    "slot_duration_minutes": 30,
    "active": true,
    "createdAt": "2024-03-15T10:00:00.000Z",
    "updatedAt": "2024-03-15T10:00:00.000Z"
  }
}
```

---

### 2. Get User's Availabilities

**GET** `/api/availability`

Retrieve all availability schedules for the authenticated user.

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Availabilities retrieved successfully",
  "data": [
    {
      "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
      "user_id": "65e1a2b3c4d5e6f7g8h9i0j1",
      "type": "weekly",
      "days": ["mon", "wed", "fri"],
      "time_ranges": [
        { "from": "09:00", "to": "17:00" }
      ],
      "slot_duration_minutes": 60,
      "active": true
    }
  ]
}
```

---

### 3. Update Availability

**PUT** `/api/availability/:id`

Update an existing availability schedule. Users can only update their own availabilities.

#### Path Parameters

- `id` (required): MongoDB ObjectId of the availability

#### Request Body

Any fields from the create endpoint can be updated:

```json
{
  "active": false,
  "slot_duration_minutes": 45,
  "time_ranges": [
    { "from": "10:00", "to": "16:00" }
  ]
}
```

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Availability updated",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "active": false,
    "slot_duration_minutes": 45,
    "updatedAt": "2024-03-15T11:00:00.000Z"
  }
}
```

#### Error Responses

- **404 Not Found**: Availability not found
- **403 Forbidden**: User doesn't own this availability

---

### 4. Delete Availability

**DELETE** `/api/availability/:id`

Delete an availability schedule. Users can only delete their own availabilities.

#### Path Parameters

- `id` (required): MongoDB ObjectId of the availability

#### Response (200 OK)

```json
{
  "success": true,
  "message": "Availability deleted"
}
```

#### Error Responses

- **404 Not Found**: Availability not found
- **403 Forbidden**: User doesn't own this availability

---

### 5. Get Available Slots

**GET** `/api/availability/slots/:userId`

Generate available time slots for a specific user (typically a mentor) based on their availability schedules and existing bookings.

**Important**: This endpoint is typically used by mentees to check their connected mentor's availability before booking a meeting.

#### Path Parameters

- `userId` (required): MongoDB ObjectId of the **mentor** whose availability you want to check. Mentees should use the `mentor_id._id` from their connections list.

#### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| start | ISO 8601 date | No | Start date (default: current date) |
| end | ISO 8601 date | No | End date (default: 7 days from start) |
| grouped | boolean | No | If `true`, returns slots grouped by availability type (default: false) |

#### Example Requests

**Simple flat list of slots:**
```
GET /api/availability/slots/65e1a2b3c4d5e6f7g8h9i0j1?start=2024-03-15T00:00:00.000Z&end=2024-03-22T23:59:59.999Z
```

**Grouped by availability configuration:**
```
GET /api/availability/slots/65e1a2b3c4d5e6f7g8h9i0j1?start=2024-03-15T00:00:00.000Z&end=2024-03-22T23:59:59.999Z&grouped=true
```

#### Response Format 1: Simple Flat List (default)

```json
{
  "success": true,
  "message": "Available slots retrieved successfully",
  "data": {
    "slots": [
      {
        "start": "2024-03-15T09:00:00.000Z",
        "end": "2024-03-15T10:00:00.000Z"
      },
      {
        "start": "2024-03-15T10:00:00.000Z",
        "end": "2024-03-15T11:00:00.000Z"
      },
      {
        "start": "2024-03-15T14:00:00.000Z",
        "end": "2024-03-15T15:00:00.000Z"
      }
    ]
  }
}
```

#### Response Format 2: Grouped by Availability (grouped=true)

When you pass `grouped=true`, slots are organized by how the mentor created their availability (weekly, date_range, single_dates):

```json
{
  "success": true,
  "message": "Available slots retrieved successfully",
  "data": {
    "availabilities": [
      {
        "availability_id": "65f1a2b3c4d5e6f7g8h9i0j1",
        "type": "weekly",
        "days": ["mon", "wed", "fri"],
        "time_ranges": [
          { "from": "09:00", "to": "12:00" },
          { "from": "14:00", "to": "17:00" }
        ],
        "slot_duration_minutes": 30,
        "valid_from": "2024-03-01T00:00:00.000Z",
        "valid_to": "2024-06-30T23:59:59.999Z",
        "active": true,
        "total_slots": 48,
        "slots": [
          {
            "start": "2024-03-15T09:00:00.000Z",
            "end": "2024-03-15T09:30:00.000Z",
            "date": "2024-03-15"
          },
          {
            "start": "2024-03-15T09:30:00.000Z",
            "end": "2024-03-15T10:00:00.000Z",
            "date": "2024-03-15"
          }
        ]
      },
      {
        "availability_id": "65f1a2b3c4d5e6f7g8h9i0j2",
        "type": "date_range",
        "date_ranges": [
          {
            "start_date": "2024-03-20T00:00:00.000Z",
            "end_date": "2024-03-25T23:59:59.999Z",
            "time_ranges": [
              { "from": "10:00", "to": "16:00" }
            ]
          }
        ],
        "slot_duration_minutes": 60,
        "active": true,
        "total_slots": 12,
        "slots": [
          {
            "start": "2024-03-20T10:00:00.000Z",
            "end": "2024-03-20T11:00:00.000Z",
            "date": "2024-03-20"
          },
          {
            "start": "2024-03-20T11:00:00.000Z",
            "end": "2024-03-20T12:00:00.000Z",
            "date": "2024-03-20"
          }
        ]
      },
      {
        "availability_id": "65f1a2b3c4d5e6f7g8h9i0j3",
        "type": "single_dates",
        "date_ranges": [
          {
            "dates": [
              "2024-03-18T00:00:00.000Z",
              "2024-03-25T00:00:00.000Z"
            ],
            "time_ranges": [
              { "from": "13:00", "to": "17:00" }
            ]
          }
        ],
        "slot_duration_minutes": 45,
        "active": true,
        "total_slots": 8,
        "slots": [
          {
            "start": "2024-03-18T13:00:00.000Z",
            "end": "2024-03-18T13:45:00.000Z",
            "date": "2024-03-18"
          }
        ]
      }
    ]
  }
}
```

**Grouped Response Fields:**

| Field | Description |
|-------|-------------|
| `availability_id` | The unique ID of the availability configuration |
| `type` | Type of availability: "weekly", "date_range", or "single_dates" |
| `days` | (weekly only) Array of days when available |
| `time_ranges` | (weekly only) Time ranges for the days |
| `date_ranges` | (date_range/single_dates) Date configurations |
| `slot_duration_minutes` | Duration of each slot in minutes |
| `valid_from` | Start date for this availability (if set) |
| `valid_to` | End date for this availability (if set) |
| `active` | Whether this availability is active |
| `total_slots` | Total number of available slots for this configuration |
| `slots` | Array of available time slots |
| `slots[].start` | Slot start time (ISO 8601) |
| `slots[].end` | Slot end time (ISO 8601) |
| `slots[].date` | Slot date (YYYY-MM-DD format) |

**Benefits of Grouped Format:**

1. **Better UI Organization**: Display slots grouped by how they were created
2. **Context Preservation**: Shows the original availability settings
3. **Easier Filtering**: Frontend can filter/sort by availability type
4. **Better UX**: Users can see patterns like "Weekly Monday/Wednesday" or "Special availability for March 20-25"

#### Slot Generation Logic

1. Retrieves all active availability schedules for the user
2. Generates potential time slots based on slot_duration_minutes
3. Filters out slots that overlap with existing scheduled meetings
4. Returns only future available slots

---

### 6. Book Meeting

**POST** `/api/availability/book`

Book a meeting between a mentor and mentee.

**For Mentees**: See the [Mentee Booking Flow Guide](./MENTEE_BOOKING_FLOW.md) for a complete step-by-step guide on how to check connections, view mentor availability, and book meetings.

#### Request Body

```json
{
  "connection_id": "65f1a2b3c4d5e6f7g8h9i0j1",
  "mentor_id": "65e1a2b3c4d5e6f7g8h9i0j1",
  "mentee_id": "65e1a2b3c4d5e6f7g8h9i0j2",
  "start_at": "2024-03-15T09:00:00.000Z",
  "end_at": "2024-03-15T10:00:00.000Z",
  "duration_minutes": 60
}
```

#### Field Validation

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| mentor_id | MongoDB ObjectId | Yes | Must be a user with "mentor" role |
| mentee_id | MongoDB ObjectId | Yes | Must be a user with "mentee" role |
| start_at | ISO 8601 date | Yes | Must be in the future |
| end_at | ISO 8601 date | Yes | Must be after start_at |
| duration_minutes | integer | Yes | 15-180 minutes |
| connection_id | MongoDB ObjectId | No | If provided, must be an "accepted" connection |

#### Business Rules

1. **Time Validation**:
   - Meeting cannot be booked in the past
   - End time must be after start time

2. **Role Validation**:
   - mentor_id must belong to a user with role "mentor"
   - mentee_id must belong to a user with role "mentee"

3. **Connection Validation** (if connection_id provided):
   - Connection must exist
   - Connection status must be "accepted"
   - Connection's mentor_id and mentee_id must match the booking

4. **Conflict Detection**:
   - No overlapping meetings for the mentor
   - No overlapping meetings for the mentee
   - Both participants must be available during the requested time

#### Response (201 Created)

```json
{
  "success": true,
  "message": "Meeting scheduled successfully",
  "data": {
    "_id": "65f1a2b3c4d5e6f7g8h9i0j3",
    "connection_id": "65f1a2b3c4d5e6f7g8h9i0j1",
    "mentor_id": "65e1a2b3c4d5e6f7g8h9i0j1",
    "mentee_id": "65e1a2b3c4d5e6f7g8h9i0j2",
    "start_at": "2024-03-15T09:00:00.000Z",
    "end_at": "2024-03-15T10:00:00.000Z",
    "duration_minutes": 60,
    "status": "scheduled",
    "createdAt": "2024-03-15T08:00:00.000Z"
  }
}
```

#### Error Responses

- **400 Bad Request**:
  - "Missing required fields"
  - "Cannot book meetings in the past"
  - "End time must be after start time"
  - "Mentor or mentee not found"
  - "Specified mentor_id must belong to a user with mentor role"
  - "Specified mentee_id must belong to a user with mentee role"
  - "Connection not found"
  - "Can only book meetings for accepted connections"
  - "Mentor and mentee must match the connection"
  - "Selected slot conflicts with an existing meeting"

---

## Error Responses

All endpoints follow a consistent error response format:

```json
{
  "success": false,
  "message": "Error description"
}
```

### Common HTTP Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **400 Bad Request**: Validation error or business rule violation
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: User lacks permission for the requested operation
- **404 Not Found**: Requested resource not found
- **500 Internal Server Error**: Server-side error

---

## Usage Examples

### Example 1: Mentor Sets Weekly Availability

```javascript
// Mentor creates weekly availability
const response = await fetch('/api/availability', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    type: 'weekly',
    days: ['mon', 'tue', 'wed', 'thu', 'fri'],
    time_ranges: [
      { from: '09:00', to: '12:00' },
      { from: '14:00', to: '17:00' }
    ],
    slot_duration_minutes: 30
  })
});
```

### Example 2: Mentee Views Available Slots

```javascript
// Get available slots for a mentor
const mentorId = '65e1a2b3c4d5e6f7g8h9i0j1';
const startDate = new Date().toISOString();
const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

const response = await fetch(
  `/api/availability/slots/${mentorId}?start=${startDate}&end=${endDate}`,
  {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  }
);

const { data } = await response.json();
console.log(data.slots); // Array of available time slots
```

### Example 3: Mentee Books a Meeting

```javascript
// Book a meeting with the mentor
const response = await fetch('/api/availability/book', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    connection_id: '65f1a2b3c4d5e6f7g8h9i0j1',
    mentor_id: '65e1a2b3c4d5e6f7g8h9i0j1',
    mentee_id: '65e1a2b3c4d5e6f7g8h9i0j2',
    start_at: '2024-03-15T09:00:00.000Z',
    end_at: '2024-03-15T09:30:00.000Z',
    duration_minutes: 30
  })
});
```

---

## Notes

1. **Timezone Handling**: All dates and times are stored and returned in UTC (ISO 8601 format). Client applications are responsible for timezone conversions.

2. **Slot Generation**: The system automatically excludes already booked time slots when generating available slots.

3. **Conflict Detection**: When booking a meeting, the system checks for overlaps with existing scheduled meetings for both mentor and mentee.

4. **Authorization**: Users can only modify (update/delete) their own availability schedules.

5. **Active Flag**: Set `active: false` to temporarily disable an availability schedule without deleting it.

6. **Recurring Patterns**: Weekly availability automatically repeats every week within the valid_from/valid_to date range (if specified).
