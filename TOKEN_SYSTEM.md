# Token Management System

This document explains the new token management system that uses local JSON storage instead of database columns for verification and password reset tokens.

## Overview

Following the database schema in `database.md`, the `users` table no longer contains token columns. Instead, tokens are managed through a separate JSON-based storage system.

## Architecture

### File Structure
```
server/
├── services/
│   ├── TokenStorage.js     # Core token management
│   └── EmailService.js     # Email sending (unchanged)
├── data/
│   └── tokens.json         # Local token storage (auto-created)
├── cleanup-tokens.js       # Manual cleanup utility
└── server.js               # Auto-cleanup on startup
```

### Database Schema Compliance

The system now follows the exact schema from `database.md`:

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    profile_image VARCHAR(255),
    role ENUM('user', 'admin') DEFAULT 'user',
    theme_mode ENUM('light', 'dark') DEFAULT 'light',
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

**No token columns!** 🔥

## TokenStorage Class

### Features
- **Local JSON Storage**: Tokens stored in `server/data/tokens.json`
- **Type Separation**: Verification tokens vs password reset tokens
- **Automatic Expiration**: Tokens auto-expire (24h for verification, 1h for reset)
- **Usage Tracking**: Tokens marked as used after successful verification
- **Auto Cleanup**: Expired tokens automatically removed

### Token Types

#### Verification Tokens
- **Purpose**: Email verification for new accounts
- **Expires**: 24 hours
- **Stored Data**: `userId`, `email`, `username`, `createdAt`, `expiresAt`

#### Password Reset Tokens  
- **Purpose**: Password reset for existing accounts
- **Expires**: 1 hour
- **Stored Data**: `userId`, `email`, `createdAt`, `expiresAt`

### API Methods

```javascript
const TokenStorage = require('./services/TokenStorage');
const tokenStorage = new TokenStorage();

// Initialize storage
await tokenStorage.initialize();

// Generate tokens
const verificationToken = await tokenStorage.generateVerificationToken(userId, email, username);
const resetToken = await tokenStorage.generatePasswordResetToken(userId, email);

// Verify tokens
const result = await tokenStorage.verifyToken(token, 'verification');
if (result.valid) {
  const tokenData = result.data;
  // Use tokenData.userId, tokenData.email, etc.
}

// Mark as used
await tokenStorage.markTokenUsed(token, 'verification');

// Cleanup expired tokens
await tokenStorage.cleanup();

// Get stats
const stats = tokenStorage.getStats();
```

## Automatic Cleanup

### Server Startup
- Tokens cleaned up automatically when server starts
- Expired tokens removed before first request

### Scheduled Cleanup
- Automatic cleanup every hour via `setInterval`
- Keeps storage lean and performant

### Manual Cleanup
```bash
npm run cleanup-tokens
```

## User Controller Changes

### Registration Process
1. User created in database (no token data)
2. Verification token generated in TokenStorage
3. Email sent with token

### Email Verification
1. Token verified against TokenStorage
2. Token marked as used
3. User updated in database (`is_verified = true`)

### Password Reset
1. Reset token generated in TokenStorage
2. Email sent with token
3. Token verified against TokenStorage
4. Password updated in database
5. Token marked as used

## Benefits

### Database Cleanliness
- ✅ No token columns cluttering the `users` table
- ✅ Follows exact schema from `database.md`
- ✅ Simpler user table structure

### Performance
- ✅ Faster user queries (no token columns to read)
- ✅ Local JSON faster than DB queries for tokens
- ✅ Automatic cleanup prevents bloat

### Security
- ✅ Tokens automatically expire
- ✅ Tokens marked as used (one-time use)
- ✅ Tokens stored separately from sensitive user data

### Flexibility
- ✅ Easy to change token expiration times
- ✅ Easy to add new token types
- ✅ Can switch from JSON to Redis later if needed

## File Structure

The token storage creates this file structure:
```
server/data/tokens.json
{
  "verification": {
    "uuid-token-1": {
      "userId": 123,
      "email": "user@example.com",
      "username": "yourname",
      "createdAt": "2024-01-01T10:00:00Z",
      "expiresAt": "2024-01-02T10:00:00Z",
      "used": false,
      "usedAt": null
    }
  },
  "passwordReset": {
    "uuid-token-2": {
      "userId": 123,
      "email": "user@example.com", 
      "createdAt": "2024-01-01T10:00:00Z",
      "expiresAt": "2024-01-01T11:00:00Z",
      "used": false,
      "usedAt": null
    }
  }
}
```

## Testing

The email test utility still works:
```bash
cd server
node test-email.js
```

This will test both email sending and token generation.

## Migration Notes

If you're upgrading from the old system:

1. **Remove token columns** from your `users` table:
   ```sql
   ALTER TABLE users DROP COLUMN verification_token;
   ALTER TABLE users DROP COLUMN verification_token_expires;
   ALTER TABLE users DROP COLUMN reset_password_token;
   ALTER TABLE users DROP COLUMN reset_password_expires;
   ```

2. **Clean up old tokens** if any exist in your database

3. **Restart the server** to initialize the new token storage

The system is fully backward compatible and will work immediately with your existing user data.

