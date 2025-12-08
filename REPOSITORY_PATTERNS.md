# Repository Patterns Guide

This document explains the repository method naming conventions used in this project to prevent errors when calling repository methods from services.

---

## Overview

The project uses two different repository patterns:

1. **Class-based Repositories** - Export an instance of a class
2. **Module-based Repositories** - Export individual functions

**CRITICAL:** Always check the repository file to see which pattern it uses before calling its methods.

---

## Repository Types

### 1. Class-Based Repositories

These repositories export a singleton instance of a class.

**Files:**
- `src/api/repositories/user.repository.js`
- `src/api/repositories/message.repository.js`

**Pattern:**
```javascript
class UserRepository {
  async findById(id) {
    return await User.findById(id).lean();
  }

  async findByEmail(email) {
    return await User.findOne({ email }).lean();
  }
}

module.exports = new UserRepository(); // Exports instance
```

**Usage in Services:**
```javascript
const userRepo = require("../repositories/user.repository");

// CORRECT ✅
const user = await userRepo.findById(userId);
const user = await userRepo.findByEmail(email);
```

### 2. Module-Based Repositories

These repositories export individual functions using `exports.functionName`.

**Files:**
- `src/api/repositories/connection.repository.js`

**Pattern:**
```javascript
exports.findConnectionById = async (connectionId) => {
  return await Connection.findById(connectionId)
    .populate("mentee_id", "...")
    .populate("mentor_id", "...");
};

exports.findConnectionByIds = async (menteeId, mentorId) => {
  return await Connection.findOne({
    mentee_id: menteeId,
    mentor_id: mentorId,
  });
};
```

**Usage in Services:**
```javascript
const connectionRepo = require("../repositories/connection.repository");

// CORRECT ✅
const connection = await connectionRepo.findConnectionById(connectionId);
const connection = await connectionRepo.findConnectionByIds(menteeId, mentorId);

// WRONG ❌ (This function doesn't exist)
const connection = await connectionRepo.findById(connectionId); // ERROR!
```

---

## Complete Method Reference

### User Repository (Class-Based)

| Method | Parameters | Returns |
|--------|-----------|---------|
| `createUser(data)` | User data object | Created user |
| `findById(id)` | User ID | User object or null |
| `findByEmail(email)` | Email string | User object or null |
| `findByPhone(phone)` | Phone string | User object or null |
| `findByEmailOrPhone(email, phone)` | Email and/or phone | User object or null |
| `updateUser(id, updateData)` | User ID, update object | Updated user |
| `deleteUser(id)` | User ID | Deleted user |
| `getAllUsers(filter)` | Query filter object | Array of users |
| `getUsersByRole(role)` | Role string | Array of users |

**Usage Example:**
```javascript
const userRepo = require("../repositories/user.repository");

const user = await userRepo.findById(userId);
const mentor = await userRepo.findByEmail("mentor@example.com");
const users = await userRepo.getUsersByRole("mentee");
```

---

### Message Repository (Class-Based)

| Method | Parameters | Returns |
|--------|-----------|---------|
| `createMessage(data)` | Message data object | Created message |
| `findMessageById(messageId)` | Message ID | Message object or null |
| `getMessagesByConnection(connectionId, limit, skip)` | Connection ID, limit, skip | Array of messages |
| `markAsRead(messageId, userId)` | Message ID, user ID | Updated message |
| `markMultipleAsRead(connectionId, userId)` | Connection ID, user ID | Update result |
| `getUnreadCount(userId)` | User ID | Number |
| `getUnreadCountByConnection(connectionId, userId)` | Connection ID, user ID | Number |
| `deleteMessage(messageId, userId)` | Message ID, user ID | Deleted message |
| `flagMessage(messageId, reason)` | Message ID, reason string | Updated message |
| `getConversationList(userId)` | User ID | Array of conversations |

**Usage Example:**
```javascript
const messageRepo = require("../repositories/message.repository");

const message = await messageRepo.findMessageById(messageId);
const messages = await messageRepo.getMessagesByConnection(connectionId, 50, 0);
const count = await messageRepo.getUnreadCount(userId);
```

---

### Connection Repository (Module-Based) ⚠️

| Method | Parameters | Returns |
|--------|-----------|---------|
| `createConnectionRequest(connectionData)` | Connection data object | Created connection |
| `findConnectionById(connectionId)` | Connection ID | Connection object or null |
| `findConnectionByIds(menteeId, mentorId)` | Mentee ID, mentor ID | Connection object or null |
| `updateConnection(connectionId, updateData)` | Connection ID, update object | Updated connection |
| `getPendingRequestsForMentor(mentorId)` | Mentor ID | Array of pending connections |
| `getSentRequestsForMentee(menteeId)` | Mentee ID | Array of sent connections |
| `getAcceptedConnectionsForUser(userId, role)` | User ID, role string | Array of accepted connections |
| `deleteConnection(connectionId)` | Connection ID | Deleted connection |

**⚠️ CRITICAL - Common Mistakes:**

```javascript
const connectionRepo = require("../repositories/connection.repository");

// WRONG ❌ - This function doesn't exist!
const connection = await connectionRepo.findById(connectionId);

// CORRECT ✅ - Use the full method name
const connection = await connectionRepo.findConnectionById(connectionId);

// WRONG ❌ - This function doesn't exist!
const connection = await connectionRepo.findByIds(menteeId, mentorId);

// CORRECT ✅ - Use the full method name
const connection = await connectionRepo.findConnectionByIds(menteeId, mentorId);
```

**Usage Example:**
```javascript
const connectionRepo = require("../repositories/connection.repository");

// Get single connection
const connection = await connectionRepo.findConnectionById(connectionId);

// Check if connection exists between two users
const existing = await connectionRepo.findConnectionByIds(menteeId, mentorId);

// Get all accepted connections
const connections = await connectionRepo.getAcceptedConnectionsForUser(userId, role);

// Update connection status
const updated = await connectionRepo.updateConnection(connectionId, { status: "accepted" });
```

---

## Common Error Patterns

### Error 1: `connectionRepo.findById is not a function`

**Problem:**
```javascript
const connection = await connectionRepo.findById(connectionId); // ❌
```

**Solution:**
```javascript
const connection = await connectionRepo.findConnectionById(connectionId); // ✅
```

**Root Cause:** Connection repository uses module-based exports, not class-based. The method is named `findConnectionById`, not `findById`.

---

### Error 2: `userRepo.findUserById is not a function`

**Problem:**
```javascript
const user = await userRepo.findUserById(userId); // ❌
```

**Solution:**
```javascript
const user = await userRepo.findById(userId); // ✅
```

**Root Cause:** User repository is class-based with shorter method names.

---

### Error 3: `messageRepo.findById is not a function`

**Problem:**
```javascript
const message = await messageRepo.findById(messageId); // ❌
```

**Solution:**
```javascript
const message = await messageRepo.findMessageById(messageId); // ✅
```

**Root Cause:** Message repository uses `findMessageById`, not `findById`.

---

## Quick Reference Cheat Sheet

```javascript
// USER REPOSITORY (Class-based)
const userRepo = require("../repositories/user.repository");
await userRepo.findById(userId);           // ✅
await userRepo.findByEmail(email);         // ✅
await userRepo.findByPhone(phone);         // ✅

// MESSAGE REPOSITORY (Class-based)
const messageRepo = require("../repositories/message.repository");
await messageRepo.findMessageById(messageId);              // ✅
await messageRepo.getMessagesByConnection(connectionId);   // ✅
await messageRepo.getConversationList(userId);             // ✅

// CONNECTION REPOSITORY (Module-based) ⚠️
const connectionRepo = require("../repositories/connection.repository");
await connectionRepo.findConnectionById(connectionId);     // ✅
await connectionRepo.findConnectionByIds(menteeId, mentorId); // ✅
await connectionRepo.getAcceptedConnectionsForUser(userId, role); // ✅

// WRONG - DON'T USE THESE ❌
await connectionRepo.findById(connectionId);               // ❌ ERROR!
await connectionRepo.findByIds(menteeId, mentorId);        // ❌ ERROR!
```

---

## Best Practices

### 1. Always Check Repository File First

Before calling any repository method, open the repository file and check:
- Is it class-based or module-based?
- What are the exact method names exported?

### 2. Use IDE Auto-Complete

Most modern IDEs will show you available methods when you type `repo.` - use this to verify method names.

### 3. Consistent Naming Convention

**When creating NEW repositories:**

**Option A: Class-Based (Recommended for most cases)**
```javascript
class ResourceRepository {
  async findById(id) { ... }
  async findByField(field) { ... }
}
module.exports = new ResourceRepository();
```

**Option B: Module-Based (Use when specific naming is important)**
```javascript
exports.findResourceById = async (id) => { ... };
exports.findResourceByField = async (field) => { ... };
```

Choose one pattern and stick with it for the entire repository.

### 4. Add JSDoc Comments

Always document repository methods:
```javascript
/**
 * Find a connection by its ID
 * @param {string} connectionId - MongoDB ObjectId of the connection
 * @returns {Promise<Object|null>} Connection object with populated user data
 */
exports.findConnectionById = async (connectionId) => {
  return await Connection.findById(connectionId)
    .populate("mentee_id", "email phone personal_info_step1 personal_info_step2 profile_photo role")
    .populate("mentor_id", "email phone personal_info_step1 personal_info_step2 profile_photo role");
};
```

---

## Testing Your Changes

After modifying any service that uses repositories, always test:

1. **Start the server:**
   ```bash
   npm start
   ```

2. **Test the endpoints:**
   ```bash
   # Test getting connections
   curl -X GET http://localhost:3000/api/connections/list \
     -H "Authorization: Bearer YOUR_TOKEN"

   # Test sending message
   curl -X POST http://localhost:3000/api/messages/send \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"connection_id": "CONNECTION_ID", "message_text": "Hello"}'
   ```

3. **Check for errors in logs:**
   - Look for `is not a function` errors
   - Verify all operations complete successfully

---

## Summary

### Fixed Issues ✅

1. **message.service.js (4 instances)**
   - Changed `connectionRepo.findById()` → `connectionRepo.findConnectionById()`
   - Affected methods:
     - `sendMessage()`
     - `getConversationMessages()`
     - `markMessagesAsRead()`
     - `getConversationList()`

### Repository Pattern Summary

| Repository | Pattern | Key Method Pattern |
|------------|---------|-------------------|
| User | Class-based | `findById()`, `findByEmail()` |
| Message | Class-based | `findMessageById()`, `getMessagesByConnection()` |
| Connection | Module-based | `findConnectionById()`, `findConnectionByIds()` |

**Remember:** Always use the exact method name as exported by the repository. When in doubt, check the repository file!
