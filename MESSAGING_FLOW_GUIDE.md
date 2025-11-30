# Complete Messaging Flow Guide

This document explains the complete flow from finding a mentor to starting a conversation.

---

## Overview

The messaging system requires an **accepted connection** before users can exchange messages. Here's the complete flow:

1. **Connection Phase** - Mentee sends connection request to Mentor
2. **Acceptance Phase** - Mentor accepts the connection request
3. **Messaging Phase** - Both users can now exchange messages

---

## Step-by-Step Flow

### Phase 1: Connection Request

#### 1.1 Mentee Browses Mentors
```http
GET /api/users/mentors?page=1&limit=20
Authorization: Bearer <mentee_token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "mentors": [
      {
        "_id": "mentor_id_123",
        "personal_info_step1": {
          "full_name": "John Mentor"
        },
        "professional_info": { ... },
        "profile_photo": "https://..."
      }
    ]
  }
}
```

#### 1.2 Mentee Sends Connection Request
```http
POST /api/connections/request
Authorization: Bearer <mentee_token>
Content-Type: application/json

{
  "mentor_id": "mentor_id_123",
  "request_message": "Hi John, I'd love to learn from your experience in Product Management."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Connection request sent successfully",
  "data": {
    "_id": "connection_id_abc",
    "mentee_id": "mentee_id_456",
    "mentor_id": "mentor_id_123",
    "status": "pending",
    "request_message": "Hi John, I'd love to learn...",
    "requested_at": "2024-01-15T10:00:00Z"
  }
}
```

---

### Phase 2: Connection Acceptance

#### 2.1 Mentor Views Pending Requests
```http
GET /api/connections/pending
Authorization: Bearer <mentor_token>
```

**Response:**
```json
{
  "success": true,
  "message": "Pending requests retrieved successfully",
  "data": {
    "count": 3,
    "requests": [
      {
        "_id": "connection_id_abc",
        "mentee_id": {
          "_id": "mentee_id_456",
          "personal_info_step1": {
            "full_name": "Jane Mentee"
          },
          "profile_photo": "https://..."
        },
        "status": "pending",
        "request_message": "Hi John, I'd love to learn...",
        "requested_at": "2024-01-15T10:00:00Z"
      }
    ]
  }
}
```

#### 2.2 Mentor Accepts Request
```http
POST /api/connections/respond/connection_id_abc
Authorization: Bearer <mentor_token>
Content-Type: application/json

{
  "action": "accept",
  "reply_message": "Hi Jane! I'd be happy to help you. Let's connect!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Connection request accepted successfully",
  "data": {
    "_id": "connection_id_abc",
    "status": "accepted",
    "reply_message": "Hi Jane! I'd be happy to help you...",
    "responded_at": "2024-01-15T11:00:00Z"
  }
}
```

---

### Phase 3: Messaging

Now both users can start messaging each other using the `connection_id`.

#### 3.1 View All Accepted Connections

**Both mentor and mentee can use this endpoint:**

```http
GET /api/connections/list
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Connections retrieved successfully",
  "data": {
    "count": 5,
    "connections": [
      {
        "_id": "connection_id_abc",
        "mentee_id": {
          "_id": "mentee_id_456",
          "personal_info_step1": {
            "full_name": "Jane Mentee",
            "city": "San Francisco",
            "state": "California"
          },
          "personal_info_step2": {
            "country": "United States",
            "timezone": "America/Los_Angeles"
          },
          "profile_photo": "https://...",
          "role": "mentee"
        },
        "mentor_id": {
          "_id": "mentor_id_123",
          "personal_info_step1": {
            "full_name": "John Mentor",
            "city": "New York",
            "state": "New York"
          },
          "personal_info_step2": {
            "country": "United States",
            "timezone": "America/New_York"
          },
          "profile_photo": "https://...",
          "role": "mentor"
        },
        "status": "accepted",
        "responded_at": "2024-01-15T11:00:00Z"
      }
    ]
  }
}
```

**Key Point:** This endpoint returns ALL accepted connections, even if no messages have been exchanged yet. Use the `_id` field as `connection_id` for messaging.

#### 3.2 Check Existing Conversations

```http
GET /api/messages/conversations
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Conversation list retrieved successfully",
  "data": {
    "count": 2,
    "conversations": [
      {
        "connection_id": "connection_id_abc",
        "other_user": {
          "_id": "mentor_id_123",
          "full_name": "John Mentor",
          "profile_photo": "https://...",
          "role": "mentor"
        },
        "last_message": {
          "message_text": "Thanks for the guidance!",
          "createdAt": "2024-01-15T15:00:00Z",
          "is_read": false
        },
        "unread_count": 3
      }
    ]
  }
}
```

**Note:** This only shows connections where at least one message has been sent.

#### 3.3 Send First Message

Use the `connection_id` from **Step 3.1** (GET /api/connections/list):

```http
POST /api/messages/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "connection_id": "connection_id_abc",
  "message_text": "Hi! Thanks for accepting my connection request."
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "message_id_xyz",
    "connection_id": "connection_id_abc",
    "sender_id": {
      "_id": "mentee_id_456",
      "personal_info_step1": {
        "full_name": "Jane Mentee"
      },
      "profile_photo": "https://...",
      "role": "mentee"
    },
    "receiver_id": {
      "_id": "mentor_id_123",
      "personal_info_step1": {
        "full_name": "John Mentor"
      },
      "profile_photo": "https://...",
      "role": "mentor"
    },
    "message_text": "Hi! Thanks for accepting my connection request.",
    "is_read": false,
    "createdAt": "2024-01-15T12:00:00Z"
  }
}
```

#### 3.4 View Conversation Messages

```http
GET /api/messages/conversation/connection_id_abc?page=1&limit=50
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Messages retrieved successfully",
  "data": {
    "page": 1,
    "limit": 50,
    "messages": [
      {
        "_id": "message_id_xyz",
        "message_text": "Hi! Thanks for accepting my connection request.",
        "sender_id": {
          "full_name": "Jane Mentee"
        },
        "createdAt": "2024-01-15T12:00:00Z",
        "is_read": true
      }
    ]
  }
}
```

---

## Best Practices for Frontend Implementation

### Recommended UI Flow

#### 1. Connections Screen
Display two tabs:
- **Active Connections** (from `/api/connections/list`)
- **Conversations** (from `/api/messages/conversations`)

```
┌─────────────────────────────────┐
│  Connections  │  Conversations  │
├─────────────────────────────────┤
│                                 │
│  [Active Connections Tab]       │
│  ✓ John Mentor (accepted)       │
│  ✓ Sarah Coach (accepted)       │
│  ⏳ Mike Advisor (pending)      │
│                                 │
│  [Conversations Tab]            │
│  💬 John Mentor (3 unread)      │
│  💬 Sarah Coach                 │
│                                 │
└─────────────────────────────────┘
```

#### 2. Starting a New Conversation

When user clicks on an accepted connection (from connections list) that doesn't have messages yet:

```javascript
// User clicks on connection from /api/connections/list
const connection = {
  _id: "connection_id_abc",
  mentor_id: { ... },
  mentee_id: { ... }
};

// Navigate to chat screen with connection_id
navigateToChat(connection._id);

// In chat screen, check if messages exist
const messages = await fetchMessages(connection._id);

// If no messages, show empty state with option to send first message
if (messages.length === 0) {
  showEmptyState("Start your conversation!");
}
```

#### 3. Hybrid Approach (Recommended)

Merge both lists in the UI:

```javascript
async function getMessagingContacts() {
  // Get all accepted connections
  const connections = await fetch('/api/connections/list');

  // Get conversations with messages
  const conversations = await fetch('/api/messages/conversations');

  // Create a map of conversations by connection_id
  const conversationMap = new Map(
    conversations.data.conversations.map(conv => [conv.connection_id, conv])
  );

  // Merge: prioritize conversations, fill with connections
  const contacts = connections.data.connections.map(conn => {
    const conversation = conversationMap.get(conn._id);

    return {
      connection_id: conn._id,
      user: conn.mentor_id._id === currentUserId ? conn.mentee_id : conn.mentor_id,
      last_message: conversation?.last_message || null,
      unread_count: conversation?.unread_count || 0,
      has_messages: !!conversation
    };
  });

  // Sort: Unread first, then by last message time, then by connection time
  contacts.sort((a, b) => {
    if (a.unread_count !== b.unread_count) {
      return b.unread_count - a.unread_count;
    }

    if (a.last_message && b.last_message) {
      return new Date(b.last_message.createdAt) - new Date(a.last_message.createdAt);
    }

    return a.has_messages ? -1 : 1;
  });

  return contacts;
}
```

Display result:
```
┌─────────────────────────────────┐
│         Messages                │
├─────────────────────────────────┤
│ 💬 John Mentor          (3) 🔴 │
│    "Thanks for the guidance!"   │
│                                 │
│ 💬 Sarah Coach                  │
│    "Let's schedule a call"      │
│                                 │
│ 💬 Mike Advisor                 │
│    Start conversation...        │
│                                 │
└─────────────────────────────────┘
```

---

## Common Scenarios

### Scenario 1: New Connection (No Messages)

**User Journey:**
1. Connection just got accepted
2. User sees connection in "Active Connections" list
3. User clicks on the connection
4. Chat screen opens with empty state
5. User types and sends first message
6. Conversation now appears in "Conversations" tab

**API Calls:**
```
GET /api/connections/list → See new accepted connection
POST /api/messages/send → Send first message
GET /api/messages/conversations → Now shows this conversation
```

### Scenario 2: Existing Conversation

**User Journey:**
1. User opens app
2. Sees unread badge on "Conversations" tab
3. Clicks to view conversations
4. Selects conversation to view messages

**API Calls:**
```
GET /api/messages/conversations → See all conversations with last message
GET /api/messages/conversation/:connection_id → View full chat history
PUT /api/messages/read/:connection_id → Mark messages as read
```

### Scenario 3: Switching Between Connections and Messages

**User Journey:**
1. User is in "Connections" tab
2. Wants to message someone they already talked to
3. Can either:
   - Click from Connections tab (opens chat)
   - Switch to Conversations tab (shows recent chats)

**API Calls:**
```
GET /api/connections/list → All connections
GET /api/messages/conversations → Filter to only those with messages
```

---

## API Endpoint Summary

### Connection Endpoints

| Endpoint | Method | Purpose | Returns |
|----------|--------|---------|---------|
| `/api/connections/request` | POST | Send connection request | New connection |
| `/api/connections/respond/:id` | POST | Accept/reject request | Updated connection |
| `/api/connections/list` | GET | **All accepted connections** | All connections (even without messages) |
| `/api/connections/pending` | GET | Pending requests (mentors) | Pending connections |
| `/api/connections/sent` | GET | Sent requests (mentees) | Sent connections |
| `/api/connections/:id` | GET | Single connection details | One connection |
| `/api/connections/cancel/:id` | DELETE | Cancel pending request | Success message |

### Messaging Endpoints

| Endpoint | Method | Purpose | Returns |
|----------|--------|---------|---------|
| `/api/messages/conversations` | GET | **Conversations with messages** | Only connections with messages |
| `/api/messages/send` | POST | Send a message | New message |
| `/api/messages/conversation/:id` | GET | Get all messages in chat | Message history |
| `/api/messages/read/:id` | PUT | Mark messages as read | Update count |
| `/api/messages/unread-count` | GET | Total unread count | Number |
| `/api/messages/:message_id` | DELETE | Delete a message | Success |
| `/api/messages/validate` | POST | Validate message content | Validation result |
| `/api/messages/search` | GET | Search messages | Search results |

---

## Key Differences

### GET /api/connections/list vs GET /api/messages/conversations

| Feature | `/api/connections/list` | `/api/messages/conversations` |
|---------|-------------------------|-------------------------------|
| **Purpose** | All accepted connections | Only active conversations |
| **Returns** | Connections (even without messages) | Connections with at least one message |
| **Use Case** | Find who you can message | See recent conversations |
| **Includes** | New connections with 0 messages | Only connections with messages |
| **Last Message** | Not included | Included |
| **Unread Count** | Not included | Included |

---

## Implementation Checklist

### Backend (Already Implemented ✓)
- ✓ Connection request system
- ✓ Connection acceptance/rejection
- ✓ Get accepted connections list
- ✓ Send messages (requires accepted connection)
- ✓ Get conversation list (with messages)
- ✓ Phone number blocking system

### Frontend (Recommended Implementation)

**Step 1: Connections Screen**
```javascript
// Fetch accepted connections
const connections = await fetch('/api/connections/list');

// Display list of people you can message
connections.forEach(conn => {
  const otherUser = conn.mentor_id === currentUserId
    ? conn.mentee_id
    : conn.mentor_id;

  displayContact({
    connectionId: conn._id,
    name: otherUser.personal_info_step1.full_name,
    photo: otherUser.profile_photo,
    role: otherUser.role
  });
});
```

**Step 2: Start Conversation**
```javascript
// When user clicks on a connection
async function openChat(connectionId) {
  // Load existing messages (might be empty)
  const response = await fetch(`/api/messages/conversation/${connectionId}`);
  const { messages } = response.data;

  // Display chat UI
  displayChatScreen(connectionId, messages);

  // Mark as read if there are unread messages
  if (messages.some(m => !m.is_read && m.receiver_id === currentUserId)) {
    await fetch(`/api/messages/read/${connectionId}`, { method: 'PUT' });
  }
}
```

**Step 3: Send Message**
```javascript
async function sendMessage(connectionId, messageText) {
  // Validate locally first (optional but recommended)
  const validation = await fetch('/api/messages/validate', {
    method: 'POST',
    body: JSON.stringify({ message_text: messageText })
  });

  if (!validation.data.isValid) {
    showError(validation.data.reasons.join(', '));
    return;
  }

  // Send message
  const response = await fetch('/api/messages/send', {
    method: 'POST',
    body: JSON.stringify({
      connection_id: connectionId,
      message_text: messageText
    })
  });

  if (response.success) {
    appendMessageToUI(response.data);
  } else {
    showError(response.message);
  }
}
```

---

## Error Handling

### Common Errors

**1. Trying to message before connection is accepted:**
```json
{
  "success": false,
  "message": "Cannot send messages to non-accepted connections"
}
```
**Solution:** Check connection status first using `/api/connections/list`

**2. Invalid connection_id:**
```json
{
  "success": false,
  "message": "Connection not found"
}
```
**Solution:** Ensure you're using a valid connection ID from connections list

**3. Message contains phone number:**
```json
{
  "success": false,
  "message": "Message blocked: Phone number sharing attempt detected"
}
```
**Solution:** Inform user that contact information sharing is not allowed

---

## Conclusion

**The Correct Flow:**
1. Use `/api/connections/list` to see ALL people you can message (accepted connections)
2. Use `/api/messages/conversations` to see recent conversations with last messages
3. Merge both in UI for best user experience
4. Use `connection_id` from connections to start messaging
5. Messages automatically appear in conversations list after first message

This approach ensures users can:
- ✓ Start conversations with newly accepted connections
- ✓ Continue existing conversations
- ✓ See who they're connected with
- ✓ See recent chat activity
