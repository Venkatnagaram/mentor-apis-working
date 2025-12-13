# Get User Meetings API

## Endpoint
```
GET /meetings
```

## Description
Retrieves meetings for the authenticated user (mentee or mentor) with flexible filtering options by status and date ranges.

## Authentication
Requires valid JWT token in Authorization header.

## Query Parameters

| Parameter | Type | Required | Description | Values |
|-----------|------|----------|-------------|---------|
| `status` | string | No | Filter by meeting status | `scheduled`, `completed`, `cancelled` (default: `scheduled`) |
| `view` | string | No | Date range view type | `current_week`, `weekly`, `monthly`, `custom` |
| `start_date` | string | No* | Start date for filtering (ISO 8601 format) | ISO date (e.g., `2024-01-15T00:00:00.000Z`) |
| `end_date` | string | No* | End date for filtering (ISO 8601 format) | ISO date (e.g., `2024-01-31T23:59:59.999Z`) |

\* Required based on the `view` parameter:
- `current_week`: No dates needed
- `weekly`: Requires `start_date` (any date within the desired week)
- `monthly`: Requires `start_date` (any date within the desired month)
- `custom`: Requires both `start_date` and `end_date`

## View Types

### 1. Current Week (`current_week`)
Returns meetings for the current week (Monday to Sunday).

**Example:**
```bash
GET /meetings?status=scheduled&view=current_week
```

### 2. Weekly View (`weekly`)
Returns meetings for a specific week. Provide any date within that week.

**Example:**
```bash
GET /meetings?status=scheduled&view=weekly&start_date=2024-01-15T00:00:00.000Z
```

### 3. Monthly View (`monthly`)
Returns meetings for a specific month. Provide any date within that month.

**Example:**
```bash
GET /meetings?status=scheduled&view=monthly&start_date=2024-01-01T00:00:00.000Z
```

### 4. Custom Date Range (`custom`)
Returns meetings within a custom date range.

**Example:**
```bash
GET /meetings?status=scheduled&view=custom&start_date=2024-01-15T00:00:00.000Z&end_date=2024-01-31T23:59:59.999Z
```

### 5. All Meetings (No View)
Returns all meetings matching the status filter without date restrictions.

**Example:**
```bash
GET /meetings?status=scheduled
```

## Response

### Success Response (200 OK)
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
        "_id": "mentor_id",
        "name": "John Doe",
        "email": "john@example.com",
        "profile_picture": "https://..."
      },
      "mentee_id": {
        "_id": "mentee_id",
        "name": "Jane Smith",
        "email": "jane@example.com",
        "profile_picture": "https://..."
      },
      "start_at": "2024-01-20T10:00:00.000Z",
      "end_at": "2024-01-20T11:00:00.000Z",
      "duration_minutes": 60,
      "status": "scheduled",
      "createdAt": "2024-01-15T08:00:00.000Z",
      "updatedAt": "2024-01-15T08:00:00.000Z"
    }
  ]
}
```

### Error Responses

#### 400 Bad Request
Invalid query parameters
```json
{
  "success": false,
  "message": "Validation errors",
  "errors": [
    {
      "field": "view",
      "message": "View must be one of: current_week, weekly, monthly, custom"
    }
  ]
}
```

#### 401 Unauthorized
Missing or invalid authentication token
```json
{
  "success": false,
  "message": "Authentication required"
}
```

## Usage Examples

### Frontend Integration (JavaScript)

#### Get Current Week's Scheduled Meetings
```javascript
const response = await fetch('/meetings?view=current_week&status=scheduled', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
```

#### Get Specific Week's Meetings
```javascript
const weekDate = new Date('2024-01-15').toISOString();
const response = await fetch(`/meetings?view=weekly&start_date=${weekDate}&status=scheduled`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
```

#### Get Specific Month's Meetings
```javascript
const monthDate = new Date('2024-01-01').toISOString();
const response = await fetch(`/meetings?view=monthly&start_date=${monthDate}&status=scheduled`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
```

#### Get Custom Date Range Meetings
```javascript
const startDate = new Date('2024-01-15').toISOString();
const endDate = new Date('2024-01-31').toISOString();
const response = await fetch(`/meetings?view=custom&start_date=${startDate}&end_date=${endDate}&status=scheduled`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
```

#### Get All Completed Meetings
```javascript
const response = await fetch('/meetings?status=completed', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const data = await response.json();
```

## Notes

- Meetings are sorted by `start_at` in ascending order (earliest first)
- Week starts on Monday (weekStartsOn: 1)
- All dates should be in ISO 8601 format
- The endpoint returns meetings where the user is either mentor or mentee
- Populated fields include mentor details, mentee details, and connection status
