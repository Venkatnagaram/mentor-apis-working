# Messaging API Documentation

Complete guide for the Messaging API endpoints in the Mentor platform.

The Messaging API enables secure chat functionality between mentees and mentors with advanced content moderation to prevent phone number sharing and inappropriate content.

---

## Table of Contents

1. [Authentication](#authentication)
2. [API Endpoints](#api-endpoints)
3. [Search Messages](#search-messages)
4. [Content Moderation](#content-moderation)
5. [OpenAI Integration](#openai-integration)
6. [Error Handling](#error-handling)
7. [Example Usage](#example-usage)

---

## Authentication

All messaging endpoints (except `/validate`) require JWT authentication.

**Header Format:**
```
Authorization: Bearer <your_jwt_token>
```

---

## API Endpoints

Base URL: `/api/messages`

### 1. Get Conversation List

Get all conversations for the authenticated user with the last message and unread count.

**Endpoint:** `GET /api/messages/conversations`

**Headers:**
```
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
        "connection_id": "507f1f77bcf86cd799439011",
        "connection_details": {
          "mentor_id": "507f191e810c19729de860ea",
          "mentee_id": "507f191e810c19729de860eb"
        },
        "other_user": {
          "_id": "507f191e810c19729de860ea",
          "full_name": "John Mentor",
          "profile_photo": "https://example.com/photo.jpg",
          "role": "mentor"
        },
        "last_message": {
          "_id": "507f1f77bcf86cd799439012",
          "message_text": "Thanks for the guidance!",
          "sender_id": "507f191e810c19729de860eb",
          "createdAt": "2024-01-15T10:30:00Z",
          "is_read": false
        },
        "unread_count": 3
      }
    ]
  }
}
```

---

### 2. Send Message

Send a new message in a conversation.

**Endpoint:** `POST /api/messages/send`

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "connection_id": "507f1f77bcf86cd799439011",
  "message_text": "Hello, I need some career guidance"
}
```

**Validation Rules:**
- `connection_id`: Required, valid MongoDB ObjectId
- `message_text`: Required, 1-2000 characters, string

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "connection_id": "507f1f77bcf86cd799439011",
    "sender_id": {
      "_id": "507f191e810c19729de860eb",
      "personal_info_step1": {
        "full_name": "Jane Mentee"
      },
      "profile_photo": "https://example.com/photo.jpg",
      "role": "mentee"
    },
    "receiver_id": {
      "_id": "507f191e810c19729de860ea",
      "personal_info_step1": {
        "full_name": "John Mentor"
      },
      "profile_photo": "https://example.com/photo.jpg",
      "role": "mentor"
    },
    "message_text": "Hello, I need some career guidance",
    "is_read": false,
    "is_flagged": false,
    "createdAt": "2024-01-15T10:30:00Z",
    "updatedAt": "2024-01-15T10:30:00Z"
  }
}
```

**Possible Errors:**
- `404`: Connection not found
- `403`: Cannot send messages to non-accepted connections / Not part of connection
- `400`: Message blocked due to content moderation (phone numbers, inappropriate content)

---

### 3. Get Conversation Messages

Get all messages in a specific conversation with pagination.

**Endpoint:** `GET /api/messages/conversation/:connection_id`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `page` (optional): Page number, default: 1
- `limit` (optional): Messages per page, default: 50, max: 100

**Example:**
```
GET /api/messages/conversation/507f1f77bcf86cd799439011?page=1&limit=50
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
        "_id": "507f1f77bcf86cd799439012",
        "connection_id": "507f1f77bcf86cd799439011",
        "sender_id": {
          "_id": "507f191e810c19729de860eb",
          "personal_info_step1": {
            "full_name": "Jane Mentee"
          },
          "profile_photo": "https://example.com/photo.jpg",
          "role": "mentee"
        },
        "receiver_id": {
          "_id": "507f191e810c19729de860ea",
          "personal_info_step1": {
            "full_name": "John Mentor"
          },
          "profile_photo": "https://example.com/photo.jpg",
          "role": "mentor"
        },
        "message_text": "Hello, I need some career guidance",
        "is_read": true,
        "read_at": "2024-01-15T10:35:00Z",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:35:00Z"
      }
    ]
  }
}
```

**Note:** Messages are returned in chronological order (oldest to newest).

---

### 4. Mark Messages as Read

Mark all unread messages in a conversation as read.

**Endpoint:** `PUT /api/messages/read/:connection_id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Messages marked as read",
  "data": {
    "modifiedCount": 5
  }
}
```

---

### 5. Get Unread Count

Get total unread message count for the authenticated user.

**Endpoint:** `GET /api/messages/unread-count`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Unread count retrieved successfully",
  "data": {
    "unread_count": 12
  }
}
```

---

### 6. Delete Message

Delete a message (only sender can delete their own messages).

**Endpoint:** `DELETE /api/messages/:message_id`

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "message": "Message deleted successfully",
  "data": {
    "success": true
  }
}
```

**Possible Errors:**
- `404`: Message not found
- `403`: You can only delete your own messages

---

### 7. Validate Message Content

Validate message content before sending (no authentication required).

**Endpoint:** `POST /api/messages/validate`

**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "message_text": "Can I share my phone number?"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message validation completed",
  "data": {
    "isValid": false,
    "reasons": [
      "Phone number detected"
    ],
    "sanitized": "Can I share my phone number?"
  }
}
```

---

## Search Messages

### 8. Search Messages

Search through message history across all conversations or within a specific conversation.

**Endpoint:** `GET /api/messages/search`

**Headers:**
```
Authorization: Bearer <token>
```

**Query Parameters:**
- `query` (required): Search text, 2-100 characters
- `connection_id` (optional): Search within specific conversation
- `page` (optional): Page number, default: 1
- `limit` (optional): Results per page, default: 50, max: 100

**Example 1: Search All Conversations**
```
GET /api/messages/search?query=career&page=1&limit=20
```

**Example 2: Search Within Specific Conversation**
```
GET /api/messages/search?query=guidance&connection_id=507f1f77bcf86cd799439011
```

**Response:**
```json
{
  "success": true,
  "message": "Search completed successfully",
  "data": {
    "messages": [
      {
        "_id": "507f1f77bcf86cd799439012",
        "connection_id": {
          "_id": "507f1f77bcf86cd799439011",
          "mentor_id": "507f191e810c19729de860ea",
          "mentee_id": "507f191e810c19729de860eb",
          "status": "accepted"
        },
        "sender_id": {
          "_id": "507f191e810c19729de860eb",
          "personal_info_step1": {
            "full_name": "Jane Mentee"
          },
          "profile_photo": "https://example.com/photo.jpg",
          "role": "mentee"
        },
        "receiver_id": {
          "_id": "507f191e810c19729de860ea",
          "personal_info_step1": {
            "full_name": "John Mentor"
          },
          "profile_photo": "https://example.com/photo.jpg",
          "role": "mentor"
        },
        "message_text": "I need career guidance for switching roles",
        "is_read": true,
        "read_at": "2024-01-15T10:35:00Z",
        "createdAt": "2024-01-15T10:30:00Z",
        "updatedAt": "2024-01-15T10:35:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 15,
      "totalPages": 1
    }
  }
}
```

**Search Features:**
- Case-insensitive search
- Partial word matching
- Search across all your conversations or narrow by connection
- Results sorted by most recent first
- Full message details with sender/receiver info
- Pagination support for large result sets

**Validation Rules:**
- `query`: Required, 2-100 characters
- `connection_id`: Optional, must be valid MongoDB ObjectId
- `page`: Optional, positive integer
- `limit`: Optional, 1-100
- User must be part of the connection to search within it

---

## Content Moderation

The messaging system includes advanced multi-layered content moderation with extremely strict phone number detection to prevent contact information sharing in ANY format.

### 1. Advanced Phone Number Detection

Our sophisticated detection system catches phone numbers in ALL possible formats:

#### Direct Number Formats:
- Standard: `555-123-4567`, `(555) 123-4567`, `555.123.4567`
- International: `+1-555-123-4567`, `+91 9876543210`
- No separators: `5551234567`, `9876543210`
- Indian format: `91-9876543210`, `+91 9876543210`
- Spaced: `987 654 3210`, `9 8 7 6 5 4 3 2 1 0`

#### Obfuscated Formats:
- Special characters: `9*8*7*6*5*4*3*2*1*0`, `987 @ 654 @ 3210`
- Brackets/Parentheses: `(9)(8)(7)(6)(5)(4)(3)(2)(1)(0)`
- Dots/Dashes: `9.8.7.6.5.4.3.2.1.0`, `9-8-7-6-5-4-3-2-1-0`
- Words: `987 at 654 at 3210`, `987 dot 654 dot 3210`

#### Numbers Spelled as Words:
- Full words: `nine eight seven six five four three two one zero`
- Misspellings: `won tu tree for fiv sicks ate ate ate`
- Mixed case: `Nine Eight Seven six FIVE four`
- With separators: `nine, eight, seven, six, five...`

#### Mixed Formats:
- Numbers and words: `nine 8 seven 6 five 4 three 2 one 0`
- Partial spelling: `9 eight 7 six 5 four 3 two 1 zero`
- Creative combinations: `nine hundred eighty-seven, six fifty-four...`

#### Emoji Numbers:
- Number emojis: `9️⃣8️⃣7️⃣6️⃣5️⃣4️⃣3️⃣2️⃣1️⃣0️⃣`
- Mixed with text: `My number is 9️⃣8️⃣7️⃣...`

#### Leet Speak:
- Common substitutions: `ph0ne`, `c4ll`, `numb3r`, `c0nt4ct`
- Text speak variations detected

#### Contact Sharing Intent:
Blocks messages containing phrases like:
- `call me`, `text me`, `whatsapp me`, `message me`
- `my number`, `phone number`, `contact me`
- `let's chat on WhatsApp/Telegram/Signal`
- `text me outside this app`, `move to WhatsApp`
- `reach me at`, `contact me at`, `add me on`
- `off platform`, `talk offline`, `connect outside`

### 2. AI-Powered Detection

Uses OpenAI GPT-4 for advanced pattern recognition:
- Detects creative obfuscation attempts
- Identifies context and intent
- Catches patterns traditional regex might miss
- Analyzes semantic meaning
- 80%+ confidence threshold for blocking

The AI is specifically trained to be EXTREMELY strict and catch ANY attempt to exchange contact information.

### 3. OpenAI Moderation API

Additional content filtering for:
- Harassment and threatening behavior
- Hate speech
- Self-harm content
- Sexual content
- Violence and graphic content
- Other inappropriate content

**Moderation Process:**
1. **Local Phone Detection** - Multi-pattern regex analysis
2. **Word-to-Number Conversion** - Converts spelled numbers to digits
3. **Obfuscation Detection** - Identifies hidden patterns
4. **Context Analysis** - Checks for contact sharing intent
5. **AI Analysis** - Advanced GPT-4 powered detection
6. **OpenAI Moderation** - Content appropriateness check
7. **Final Decision** - Block if ANY layer flags the message

**Suspicion Scoring:**
- Direct number found: Instant block (100 points)
- Spelled out numbers: 90 points
- Obfuscated format: 80 points
- Mixed format: 85 points
- Leet speak: 70 points
- Contact context: 50 points
- Threshold: 70 points or higher = BLOCKED

### 4. Examples of Blocked Messages

```
✗ "My number is 9876543210"
✗ "Call me at nine eight seven six five four three two one zero"
✗ "You can reach me at nine 8 seven 6 five 4"
✗ "My contact: 9 8 7 6 5 4 3 2 1 0"
✗ "Text me (987) 654-3210"
✗ "Let's chat on WhatsApp"
✗ "Text me outside this app"
✗ "won tu tree for fiv sicks ate" (misspelled numbers)
✗ "9️⃣8️⃣7️⃣6️⃣5️⃣4️⃣3️⃣2️⃣1️⃣0️⃣" (emoji numbers)
✗ "987 at 654 at 3210"
✗ "Call 987*654*3210"
✗ "My ph0ne numb3r" (leet speak)
✗ "(9)(8)(7)(6)(5)(4)(3)(2)(1)(0)"
```

### 5. Why This Approach?

This multi-layered detection system ensures mentors and mentees keep their conversations on the platform, maintaining:
- **User Safety** - Verified, monitored communications
- **Quality Control** - Professional mentoring relationships
- **Platform Integrity** - Prevents circumvention
- **Trust & Security** - Protected user information

---

## OpenAI Integration

The messaging system uses OpenAI's Moderation API for content filtering.

**Required Environment Variable:**
```
OPENAI_API_KEY=your_openai_api_key
```

**Moderation Categories Checked:**
- `harassment`
- `harassment/threatening`
- `hate`
- `hate/threatening`
- `self-harm`
- `self-harm/intent`
- `self-harm/instructions`
- `sexual`
- `sexual/minors`
- `violence`
- `violence/graphic`

If any category is flagged, the message is blocked.

---

## Error Handling

### Standard Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error message"
}
```

### Common HTTP Status Codes

- `200`: Success
- `201`: Created (message sent)
- `400`: Bad Request (validation failed, content blocked)
- `401`: Unauthorized (missing or invalid token)
- `403`: Forbidden (not part of connection, connection not accepted)
- `404`: Not Found (connection or message not found)
- `500`: Internal Server Error

### Error Scenarios

**Authentication Errors:**
```json
{
  "success": false,
  "message": "Unauthorized"
}
```

**Content Moderation Errors:**
```json
{
  "success": false,
  "message": "Message blocked: Phone number detected"
}
```

**Validation Errors:**
```json
{
  "success": false,
  "message": "Validation error",
  "error": {
    "errors": [
      {
        "msg": "Message text is required",
        "param": "message_text",
        "location": "body"
      }
    ]
  }
}
```

---

## Example Usage

### Node.js / JavaScript Example

```javascript
const axios = require('axios');

const API_BASE_URL = 'http://localhost:5001/api';
const token = 'your_jwt_token_here';

async function getConversations() {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/messages/conversations`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('Conversations:', response.data.data);
  } catch (error) {
    console.error(error.response.data);
  }
}

async function sendMessage(connectionId, messageText) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/messages/send`,
      {
        connection_id: connectionId,
        message_text: messageText
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('Message sent:', response.data.data);
  } catch (error) {
    console.error(error.response.data);
  }
}

async function getMessages(connectionId, page = 1) {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/messages/conversation/${connectionId}?page=${page}&limit=50`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('Messages:', response.data.data.messages);
  } catch (error) {
    console.error(error.response.data);
  }
}

async function markAsRead(connectionId) {
  try {
    const response = await axios.put(
      `${API_BASE_URL}/messages/read/${connectionId}`,
      {},
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('Marked as read:', response.data.data);
  } catch (error) {
    console.error(error.response.data);
  }
}

async function getUnreadCount() {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/messages/unread-count`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('Unread count:', response.data.data.unread_count);
  } catch (error) {
    console.error(error.response.data);
  }
}

async function deleteMessage(messageId) {
  try {
    const response = await axios.delete(
      `${API_BASE_URL}/messages/${messageId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('Message deleted:', response.data);
  } catch (error) {
    console.error(error.response.data);
  }
}

async function validateMessage(messageText) {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/messages/validate`,
      {
        message_text: messageText
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.data.isValid) {
      console.log('Message is valid');
      return true;
    } else {
      console.log('Message blocked:', response.data.data.reasons);
      return false;
    }
  } catch (error) {
    console.error(error.response.data);
    return false;
  }
}

async function searchMessages(searchQuery, connectionId = null, page = 1) {
  try {
    const params = new URLSearchParams({
      query: searchQuery,
      page: page.toString(),
      limit: '20'
    });

    if (connectionId) {
      params.append('connection_id', connectionId);
    }

    const response = await axios.get(
      `${API_BASE_URL}/messages/search?${params.toString()}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('Search results:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error(error.response.data);
    return null;
  }
}
```

### Frontend React Example

```javascript
import { useState, useEffect } from 'react';
import axios from 'axios';

function ChatComponent({ connectionId, token, userId }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:5001/api';

  useEffect(() => {
    loadMessages();
  }, [connectionId]);

  const loadMessages = async () => {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/messages/conversation/${connectionId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setMessages(response.data.data.messages);

      await axios.put(
        `${API_BASE_URL}/messages/read/${connectionId}`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load messages');
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await axios.post(
        `${API_BASE_URL}/messages/send`,
        {
          connection_id: connectionId,
          message_text: newMessage
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setMessages([...messages, response.data.data]);
      setNewMessage('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message');
    }
  };

  const searchInConversation = async (e) => {
    e.preventDefault();
    if (!searchQuery || searchQuery.length < 2) return;

    try {
      const response = await axios.get(
        `${API_BASE_URL}/messages/search`,
        {
          params: {
            query: searchQuery,
            connection_id: connectionId,
            limit: 20
          },
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      setSearchResults(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Search failed');
    }
  };

  return (
    <div className="chat-container">
      <div className="search-bar">
        <form onSubmit={searchInConversation}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search messages..."
            minLength={2}
          />
          <button type="submit">Search</button>
          {searchResults && (
            <button type="button" onClick={() => setSearchResults(null)}>
              Clear
            </button>
          )}
        </form>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="messages">
        {(searchResults ? searchResults.messages : messages).map((msg) => (
          <div key={msg._id} className={`message ${msg.sender_id._id === userId ? 'sent' : 'received'}`}>
            <p>{msg.message_text}</p>
            <span>{new Date(msg.createdAt).toLocaleString()}</span>
          </div>
        ))}
      </div>

      {searchResults && (
        <div className="pagination">
          Page {searchResults.pagination.page} of {searchResults.pagination.totalPages}
        </div>
      )}

      <form onSubmit={sendMessage}>
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          maxLength={2000}
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
}
```

---

## Best Practices

### 1. Message Validation
- Always validate messages client-side before sending
- Use the `/validate` endpoint for pre-send checks
- Display clear error messages to users

### 2. Real-time Updates
- Consider implementing WebSockets for real-time message delivery
- Poll `/unread-count` periodically for notification badges
- Refresh conversation list when new messages arrive

### 3. Pagination
- Load messages in chunks (50 per page recommended)
- Implement infinite scroll for better UX
- Cache loaded messages to reduce API calls

### 4. Error Handling
- Handle all error scenarios gracefully
- Show user-friendly error messages
- Retry failed requests with exponential backoff

### 5. Security
- Never expose JWT tokens in URLs
- Always use HTTPS in production
- Implement rate limiting on the client side
- Store tokens securely (httpOnly cookies or secure storage)

### 6. Performance
- Debounce search input (wait 300ms after user stops typing)
- Cache conversation lists
- Lazy load message history
- Optimize images in profile photos

---

## Summary

**Total Endpoints: 8**

1. `GET /api/messages/conversations` - List all conversations
2. `POST /api/messages/send` - Send a message
3. `GET /api/messages/conversation/:connection_id` - Get messages
4. `PUT /api/messages/read/:connection_id` - Mark as read
5. `GET /api/messages/unread-count` - Get unread count
6. `DELETE /api/messages/:message_id` - Delete message
7. `POST /api/messages/validate` - Validate content
8. `GET /api/messages/search` - Search messages

All endpoints use JSON format and require authentication (except validate endpoint).
