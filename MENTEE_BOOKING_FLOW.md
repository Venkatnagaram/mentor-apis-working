# Mentee Meeting Booking Flow

## Overview

This guide explains how a mentee can check their connected mentor's availability and book meetings. The flow involves checking connections, viewing available slots, and booking meetings.

---

## Understanding the Flow

### Step 1: Mentor Creates Availability

The mentor first creates their availability schedule.

### Step 2: Mentee Views Their Connections

The mentee retrieves their accepted connections to see which mentors they can book meetings with.

### Step 3: Mentee Checks Mentor's Available Slots

Using the mentor's ID from the connection, the mentee fetches available time slots.

### Step 4: Mentee Books a Meeting

The mentee selects a slot and books a meeting with the mentor.

---

## Detailed Implementation Guide

### Step 1: Mentor Creates Availability

**Endpoint**: `POST /api/availability`

The mentor sets their available schedule.

```javascript
// Mentor creates weekly availability
const createAvailability = async (mentorToken) => {
  const response = await fetch('/api/availability', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${mentorToken}`,
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

  const result = await response.json();
  console.log(result);
  // {
  //   "success": true,
  //   "message": "Availability created",
  //   "data": { ... }
  // }
};
```

---

### Step 2: Mentee Views Their Connections

**Endpoint**: `GET /api/connections`

The mentee retrieves all their accepted connections.

```javascript
const getMentorConnections = async (menteeToken) => {
  const response = await fetch('/api/connections', {
    headers: {
      'Authorization': `Bearer ${menteeToken}`
    }
  });

  const result = await response.json();
  return result.data.connections;
  // Returns array of connections with mentor details
};
```

**Response Example**:

```json
{
  "success": true,
  "message": "Connections retrieved successfully",
  "data": {
    "count": 2,
    "connections": [
      {
        "_id": "65f1a2b3c4d5e6f7g8h9i0j1",
        "mentee_id": "65e1a2b3c4d5e6f7g8h9i0j2",
        "mentor_id": {
          "_id": "65e1a2b3c4d5e6f7g8h9i0j1",
          "first_name": "John",
          "last_name": "Doe",
          "email": "john.doe@example.com",
          "expertise": ["JavaScript", "React", "Node.js"],
          "bio": "Senior Software Engineer with 10 years experience",
          "profile_image": "https://example.com/profile.jpg"
        },
        "status": "accepted",
        "request_message": "I would like to learn React from you",
        "reply_message": "Happy to help!",
        "createdAt": "2024-03-15T10:00:00.000Z"
      }
    ]
  }
}
```

**Important Fields**:

- `mentor_id._id`: This is the **MENTOR's USER ID** needed for checking availability
- `mentor_id`: Contains populated mentor details (name, expertise, bio, etc.)
- `_id`: This is the **CONNECTION ID** needed for booking meetings
- `status`: Must be "accepted" to book meetings

---

### Step 3: Mentee Checks Mentor's Available Slots

**Endpoint**: `GET /api/availability/slots/:userId`

**Important**: The `:userId` parameter is the **MENTOR's USER ID** (not the mentee's ID).

```javascript
const getAvailableSlots = async (menteeToken, mentorUserId) => {
  // Define date range (e.g., next 14 days)
  const startDate = new Date().toISOString();
  const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  const response = await fetch(
    `/api/availability/slots/${mentorUserId}?start=${startDate}&end=${endDate}`,
    {
      headers: {
        'Authorization': `Bearer ${menteeToken}`
      }
    }
  );

  const result = await response.json();
  return result.data.slots;
};
```

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| start | ISO 8601 date | No | Start date (default: current date) |
| end | ISO 8601 date | No | End date (default: 7 days from start) |
| grouped | boolean | No | If `true`, returns slots grouped by availability type (default: false) |

**Response Example (Default - Flat List)**:

```json
{
  "success": true,
  "message": "Available slots retrieved successfully",
  "data": {
    "slots": [
      {
        "start": "2024-03-15T09:00:00.000Z",
        "end": "2024-03-15T09:30:00.000Z"
      },
      {
        "start": "2024-03-15T09:30:00.000Z",
        "end": "2024-03-15T10:00:00.000Z"
      },
      {
        "start": "2024-03-15T10:00:00.000Z",
        "end": "2024-03-15T10:30:00.000Z"
      },
      {
        "start": "2024-03-15T14:00:00.000Z",
        "end": "2024-03-15T14:30:00.000Z"
      }
    ]
  }
}
```

#### Alternative: Grouped Response Format

For a better UI experience, you can get slots grouped by how the mentor created their availability by adding `grouped=true`:

```javascript
const getGroupedAvailableSlots = async (menteeToken, mentorUserId) => {
  const startDate = new Date().toISOString();
  const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  const response = await fetch(
    `/api/availability/slots/${mentorUserId}?start=${startDate}&end=${endDate}&grouped=true`,
    {
      headers: {
        'Authorization': `Bearer ${menteeToken}`
      }
    }
  );

  const result = await response.json();
  return result.data.availabilities; // Note: returns 'availabilities' instead of 'slots'
};
```

**Grouped Response Example**:

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
        "total_slots": 24,
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
        "total_slots": 6,
        "slots": [
          {
            "start": "2024-03-20T10:00:00.000Z",
            "end": "2024-03-20T11:00:00.000Z",
            "date": "2024-03-20"
          }
        ]
      },
      {
        "availability_id": "65f1a2b3c4d5e6f7g8h9i0j3",
        "type": "single_dates",
        "date_ranges": [
          {
            "dates": ["2024-03-18T00:00:00.000Z"],
            "time_ranges": [
              { "from": "13:00", "to": "17:00" }
            ]
          }
        ],
        "slot_duration_minutes": 45,
        "total_slots": 5,
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

**Benefits of Grouped Format**:

- Shows how the mentor organized their availability (weekly schedule, special date ranges, specific dates)
- Makes it easier to display context in your UI (e.g., "Weekly availability on Mon, Wed, Fri" vs individual slots)
- Helps users understand the mentor's scheduling patterns
- Better for filtering and organizing large numbers of slots

**What This Endpoint Does**:

1. Retrieves all active availability schedules for the specified mentor
2. Generates time slots based on the mentor's availability patterns
3. Excludes slots that are already booked
4. Returns only future available slots

---

### Step 4: Mentee Books a Meeting

**Endpoint**: `POST /api/availability/book`

Once the mentee selects a slot, they book the meeting.

```javascript
const bookMeeting = async (menteeToken, bookingDetails) => {
  const response = await fetch('/api/availability/book', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${menteeToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(bookingDetails)
  });

  const result = await response.json();
  return result.data;
};
```

**Request Body**:

```json
{
  "connection_id": "65f1a2b3c4d5e6f7g8h9i0j1",
  "mentor_id": "65e1a2b3c4d5e6f7g8h9i0j1",
  "mentee_id": "65e1a2b3c4d5e6f7g8h9i0j2",
  "start_at": "2024-03-15T09:00:00.000Z",
  "end_at": "2024-03-15T09:30:00.000Z",
  "duration_minutes": 30
}
```

**Required Fields**:

| Field | Description | Source |
|-------|-------------|--------|
| connection_id | The connection ID between mentor and mentee | From Step 2: `connections[i]._id` |
| mentor_id | The mentor's user ID | From Step 2: `connections[i].mentor_id._id` |
| mentee_id | The mentee's user ID | From auth token (`req.user.id`) |
| start_at | Meeting start time | From Step 3: Selected slot's `start` |
| end_at | Meeting end time | From Step 3: Selected slot's `end` |
| duration_minutes | Meeting duration in minutes | Calculate from start_at and end_at |

**Response Example**:

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
    "end_at": "2024-03-15T09:30:00.000Z",
    "duration_minutes": 30,
    "status": "scheduled",
    "createdAt": "2024-03-15T08:00:00.000Z",
    "updatedAt": "2024-03-15T08:00:00.000Z"
  }
}
```

---

## Complete Working Example

Here's a complete example showing the entire flow from a mentee's perspective:

```javascript
class MenteeBookingService {
  constructor(menteeToken) {
    this.token = menteeToken;
    this.baseUrl = '/api';
  }

  // Step 1: Get all connections
  async getMyConnections() {
    const response = await fetch(`${this.baseUrl}/connections`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    // Filter only accepted connections
    return result.data.connections.filter(conn => conn.status === 'accepted');
  }

  // Step 2: Get available slots for a specific mentor
  async getMentorAvailability(mentorUserId, daysAhead = 14) {
    const startDate = new Date().toISOString();
    const endDate = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).toISOString();

    const response = await fetch(
      `${this.baseUrl}/availability/slots/${mentorUserId}?start=${startDate}&end=${endDate}`,
      {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      }
    );

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data.slots;
  }

  // Step 3: Book a meeting
  async bookMeeting(connectionId, mentorId, menteeId, selectedSlot) {
    const startTime = new Date(selectedSlot.start);
    const endTime = new Date(selectedSlot.end);
    const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));

    const response = await fetch(`${this.baseUrl}/availability/book`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        connection_id: connectionId,
        mentor_id: mentorId,
        mentee_id: menteeId,
        start_at: selectedSlot.start,
        end_at: selectedSlot.end,
        duration_minutes: durationMinutes
      })
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.message);
    }

    return result.data;
  }

  // Complete flow: List mentors and their availability
  async listMentorsWithAvailability() {
    // Get all connections
    const connections = await this.getMyConnections();

    // For each connection, get mentor's available slots
    const mentorsWithSlots = await Promise.all(
      connections.map(async (connection) => {
        const mentorId = connection.mentor_id._id;
        const slots = await this.getMentorAvailability(mentorId);

        return {
          connectionId: connection._id,
          mentor: connection.mentor_id,
          availableSlots: slots,
          hasAvailability: slots.length > 0
        };
      })
    );

    return mentorsWithSlots;
  }

  // Complete flow: Book with a specific mentor
  async bookWithMentor(connectionId, mentorUserId, menteeUserId, slotIndex = 0) {
    // Get available slots
    const slots = await this.getMentorAvailability(mentorUserId);

    if (slots.length === 0) {
      throw new Error('No available slots for this mentor');
    }

    // Book the selected slot (default: first available)
    const selectedSlot = slots[slotIndex];
    const meeting = await this.bookMeeting(
      connectionId,
      mentorUserId,
      menteeUserId,
      selectedSlot
    );

    return meeting;
  }
}

// Usage Example
const menteeService = new MenteeBookingService(menteeToken);

// Example 1: List all mentors with their availability
const mentors = await menteeService.listMentorsWithAvailability();
console.log('Available mentors:', mentors);

// Example 2: Book a meeting with a specific mentor
try {
  const meeting = await menteeService.bookWithMentor(
    connectionId,    // from connections list
    mentorUserId,    // from connections list
    menteeUserId,    // your user ID
    0                // book first available slot
  );

  console.log('Meeting booked successfully:', meeting);
} catch (error) {
  console.error('Booking failed:', error.message);
}
```

---

## UI Integration Example

Here's how you might integrate this into a React component:

```javascript
import { useState, useEffect } from 'react';

function BookMeetingPage({ menteeToken, menteeUserId }) {
  const [connections, setConnections] = useState([]);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [loading, setLoading] = useState(false);

  // Load connections on mount
  useEffect(() => {
    loadConnections();
  }, []);

  const loadConnections = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/connections', {
        headers: { 'Authorization': `Bearer ${menteeToken}` }
      });
      const result = await response.json();
      setConnections(result.data.connections.filter(c => c.status === 'accepted'));
    } catch (error) {
      console.error('Failed to load connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const selectMentor = async (connection) => {
    setSelectedMentor(connection);
    setLoading(true);

    try {
      const mentorId = connection.mentor_id._id;
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

      const response = await fetch(
        `/api/availability/slots/${mentorId}?start=${startDate}&end=${endDate}`,
        {
          headers: { 'Authorization': `Bearer ${menteeToken}` }
        }
      );

      const result = await response.json();
      setAvailableSlots(result.data.slots);
    } catch (error) {
      console.error('Failed to load slots:', error);
    } finally {
      setLoading(false);
    }
  };

  const bookSlot = async (slot) => {
    setLoading(true);

    try {
      const startTime = new Date(slot.start);
      const endTime = new Date(slot.end);
      const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));

      const response = await fetch('/api/availability/book', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${menteeToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          connection_id: selectedMentor._id,
          mentor_id: selectedMentor.mentor_id._id,
          mentee_id: menteeUserId,
          start_at: slot.start,
          end_at: slot.end,
          duration_minutes: durationMinutes
        })
      });

      const result = await response.json();

      if (result.success) {
        alert('Meeting booked successfully!');
        selectMentor(selectedMentor); // Refresh slots
      } else {
        alert('Failed to book meeting: ' + result.message);
      }
    } catch (error) {
      console.error('Booking failed:', error);
      alert('Failed to book meeting');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Book a Meeting</h1>

      {/* Step 1: Select Mentor */}
      <div>
        <h2>Your Mentors</h2>
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul>
            {connections.map(connection => (
              <li key={connection._id}>
                <button onClick={() => selectMentor(connection)}>
                  {connection.mentor_id.first_name} {connection.mentor_id.last_name}
                  <br />
                  <small>{connection.mentor_id.expertise?.join(', ')}</small>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Step 2: Select Slot */}
      {selectedMentor && (
        <div>
          <h2>
            Available Slots for {selectedMentor.mentor_id.first_name}
          </h2>
          {loading ? (
            <p>Loading slots...</p>
          ) : availableSlots.length === 0 ? (
            <p>No available slots in the next 14 days</p>
          ) : (
            <ul>
              {availableSlots.map((slot, index) => (
                <li key={index}>
                  <button onClick={() => bookSlot(slot)}>
                    {new Date(slot.start).toLocaleString()} -
                    {new Date(slot.end).toLocaleTimeString()}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## Key Points to Remember

1. **The userId in `/api/availability/slots/:userId` is the MENTOR's ID**, not the mentee's ID

2. **Connection Status Matters**: Only "accepted" connections can book meetings

3. **Required IDs for Booking**:
   - `connection_id`: From the connections list (`_id` field)
   - `mentor_id`: From the connection's mentor details (`mentor_id._id`)
   - `mentee_id`: Your authenticated user ID (from token)

4. **Slot Selection**: Pick slots from the availability API response (Step 3)

5. **Date Handling**: All dates are in ISO 8601 format (UTC timezone)

6. **Error Handling**: Always check for conflicts, as slots may be booked by another mentee between checking availability and booking

---

## Common Errors and Solutions

### Error: "Connection not found"
**Cause**: Invalid connection_id or connection doesn't exist
**Solution**: Ensure you're using the correct `_id` from the connections list

### Error: "Can only book meetings for accepted connections"
**Cause**: Connection status is not "accepted"
**Solution**: Wait for mentor to accept the connection request

### Error: "Selected slot conflicts with an existing meeting"
**Cause**: Another mentee booked the slot before you
**Solution**: Refresh available slots and select a different time

### Error: "Cannot book meetings in the past"
**Cause**: Selected slot's start time is in the past
**Solution**: Refresh available slots to get current times

### Error: "Mentor and mentee must match the connection"
**Cause**: mentor_id or mentee_id doesn't match the connection
**Solution**: Verify you're using the correct IDs from the connection object

---

## API Endpoints Summary

| Step | Endpoint | Method | Purpose |
|------|----------|--------|---------|
| 1 | `/api/connections` | GET | Get mentee's connections |
| 2 | `/api/availability/slots/:userId` | GET | Get mentor's available slots |
| 3 | `/api/availability/book` | POST | Book a meeting |

**Note**: Replace `:userId` with the **mentor's user ID** from the connection object.
