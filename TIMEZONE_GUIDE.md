# Timezone Support Guide

This application now includes comprehensive timezone support for all time-related data. All timestamps are stored in UTC in the database and can be converted to any timezone when sent to or received from the API.

## Global Configuration

Two environment variables control default timezones:

```env
BACKEND_TIMEZONE=UTC
FRONTEND_TIMEZONE=Asia/Kolkata
```

- `BACKEND_TIMEZONE`: Default timezone for the backend (recommended to keep as UTC)
- `FRONTEND_TIMEZONE`: Default timezone used when no timezone is specified in requests

## How to Specify Timezone in Requests

You can specify your preferred timezone in three ways:

### 1. Using HTTP Header (Recommended)
```bash
curl -H "X-Timezone: Asia/Kolkata" https://api.example.com/api/meetings
```

### 2. Using Query Parameter
```bash
curl https://api.example.com/api/meetings?timezone=Asia/Kolkata
```

### 3. Using Request Body
```json
{
  "timezone": "Asia/Kolkata",
  "start_at": "2024-01-15T10:00:00",
  "end_at": "2024-01-15T11:00:00"
}
```

## Supported Timezones

The system supports all IANA timezone identifiers. Common examples:

- `UTC` - Coordinated Universal Time
- `America/New_York` - Eastern Time (US & Canada)
- `America/Los_Angeles` - Pacific Time (US & Canada)
- `Europe/London` - London, United Kingdom
- `Europe/Paris` - Paris, France
- `Asia/Kolkata` - India Standard Time (IST)
- `Asia/Dubai` - Dubai, UAE
- `Asia/Tokyo` - Tokyo, Japan
- `Australia/Sydney` - Sydney, Australia

Full list: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

## How It Works

### Incoming Requests (Client → Server)
1. Client sends timestamp in their local timezone: `2024-01-15T10:00:00`
2. Client specifies timezone: `Asia/Kolkata`
3. Server converts to UTC before storing: `2024-01-15T04:30:00Z`

### Outgoing Responses (Server → Client)
1. Server retrieves timestamp from database: `2024-01-15T04:30:00Z` (UTC)
2. Server detects client's timezone: `Asia/Kolkata`
3. Server converts to client's timezone: `2024-01-15T10:00:00+05:30`

## API Endpoints with Timezone Support

### Availability
- `POST /api/availability` - Create availability (converts time_ranges to UTC)
- `PUT /api/availability/:id` - Update availability (converts time_ranges to UTC)
- `GET /api/availability` - Get availabilities (converts to client timezone)
- `GET /api/availability/:userId/slots` - Get available slots (converts slot times)

### Meetings
- `GET /api/meetings` - Get meetings (converts start_at, end_at to client timezone)
- `POST /api/availability/book` - Book meeting (converts start_at, end_at to UTC)
- `PUT /api/meetings/:meetingId/cancel` - Cancel meeting (returns times in client timezone)

### Messages
- `POST /api/messages` - Send message (converts created_at to client timezone)
- `GET /api/messages/:connection_id` - Get messages (converts timestamps)
- `GET /api/messages/unread` - Get unread messages (converts timestamps)
- `GET /api/messages/conversations` - Get conversation list (converts timestamps)

## Examples

### Example 1: Create Availability (IST → UTC)

**Request:**
```bash
curl -X POST https://api.example.com/api/availability \
  -H "X-Timezone: Asia/Kolkata" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "weekly",
    "days": ["monday", "tuesday"],
    "time_ranges": [
      {
        "start": "09:00",
        "end": "17:00"
      }
    ]
  }'
```

**What Happens:**
- Times are interpreted as IST (UTC+5:30)
- Stored in database as UTC (03:30 - 11:30)
- Response returns times in IST format

### Example 2: Get Available Slots (UTC → PST)

**Request:**
```bash
curl https://api.example.com/api/availability/USER_ID/slots \
  ?start=2024-01-15T00:00:00 \
  &end=2024-01-15T23:59:59 \
  &timezone=America/Los_Angeles
```

**What Happens:**
- Query times converted from PST to UTC for database query
- Retrieved slots converted from UTC back to PST
- Response contains slots in PST timezone

### Example 3: Book Meeting (EST → UTC)

**Request:**
```bash
curl -X POST https://api.example.com/api/availability/book \
  -H "X-Timezone: America/New_York" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "connection_id": "CONNECTION_ID",
    "start_at": "2024-01-15T14:00:00",
    "end_at": "2024-01-15T15:00:00",
    "duration_minutes": 60
  }'
```

**What Happens:**
- Times converted from EST (UTC-5) to UTC
- Stored as `2024-01-15T19:00:00Z` - `2024-01-15T20:00:00Z`
- Response returns times in EST

## Default Behavior

If no timezone is specified in the request:
- Incoming data: Interpreted using `BACKEND_TIMEZONE` (default: UTC)
- Outgoing data: Converted to `FRONTEND_TIMEZONE` (default: Asia/Kolkata)

## Frontend Integration

### JavaScript/TypeScript Example

```javascript
const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const response = await fetch('https://api.example.com/api/meetings', {
  headers: {
    'X-Timezone': timezone,
    'Authorization': `Bearer ${token}`
  }
});
```

### Axios Example

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com',
  headers: {
    'X-Timezone': Intl.DateTimeFormat().resolvedOptions().timeZone
  }
});

const meetings = await api.get('/api/meetings');
```

## Best Practices

1. **Always specify timezone**: Send timezone in every request to avoid ambiguity
2. **Use IANA timezone identifiers**: Use proper timezone names, not abbreviations (e.g., `America/New_York` not `EST`)
3. **Let the server handle conversions**: Send times in your local timezone and let the server convert
4. **Display times in user's timezone**: Always show times to users in their local timezone
5. **Store in UTC**: Database always stores in UTC (handled automatically)

## Troubleshooting

### Times appear incorrect
- Verify you're sending the correct timezone identifier
- Check that your times are in the timezone you specified
- Ensure your device's timezone settings are correct

### Invalid timezone error
- Use IANA timezone identifiers (e.g., `Asia/Kolkata` not `IST`)
- Check spelling and capitalization
- Refer to the full timezone list: https://en.wikipedia.org/wiki/List_of_tz_database_time_zones

### Meetings scheduled at wrong time
- Double-check the timezone parameter matches your local timezone
- Verify the time format is ISO 8601 compatible
- Ensure you're not mixing 12-hour and 24-hour formats
