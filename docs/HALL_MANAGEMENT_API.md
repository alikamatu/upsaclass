# Admin Hall Management API Documentation

## Overview
The Hall Management API provides comprehensive CRUD operations for managing lecture halls in the classroom allocation system. All endpoints require admin authentication.

## Authentication
All endpoints require:
- Valid JWT session from NextAuth.js
- User role must be "admin"
- HTTP-only cookie with session token

## Base URL
```
/api/admin/halls
```

## Endpoints

### 1. Get All Lecture Halls
**Endpoint:** `GET /api/admin/halls`

**Authentication:** Required (Admin only)

**Response (Success - 200):**
```json
{
  "success": true,
  "data": [
    {
      "_id": "507f1f77bcf86cd799439011",
      "hallCode": "LT001",
      "name": "Nelson Mandela Lecture Theatre",
      "capacity": 120,
      "building": "Faculty Block A",
      "features": ["projector", "ac", "whiteboard"],
      "createdAt": "2025-04-07T10:30:00.000Z",
      "updatedAt": "2025-04-07T10:30:00.000Z"
    },
    {
      "_id": "507f1f77bcf86cd799439012",
      "hallCode": "LT002",
      "name": "Martin Luther King Hall",
      "capacity": 85,
      "building": "Faculty Block B",
      "features": ["projector", "ac"],
      "createdAt": "2025-04-07T11:00:00.000Z",
      "updatedAt": "2025-04-07T11:00:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `403 Forbidden`: User is not an admin
- `500 Internal Server Error`: Database error

---

### 2. Create a New Lecture Hall
**Endpoint:** `POST /api/admin/halls`

**Authentication:** Required (Admin only)

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "hallCode": "LT003",
  "name": "Mandela Conference Hall",
  "capacity": 150,
  "building": "Central Building",
  "features": ["projector", "ac", "whiteboard", "audio_system"]
}
```

**Request Validation:**
- `hallCode`: String, required, must be unique
- `name`: String, required
- `capacity`: Number, required, must be > 0
- `building`: String, required
- `features`: Array of strings, optional

**Response (Success - 201):**
```json
{
  "success": true,
  "message": "Lecture hall created successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "hallCode": "LT003",
    "name": "Mandela Conference Hall",
    "capacity": 150,
    "building": "Central Building",
    "features": ["projector", "ac", "whiteboard", "audio_system"],
    "createdAt": "2025-04-07T12:00:00.000Z",
    "updatedAt": "2025-04-07T12:00:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Missing required fields or invalid data
  ```json
  {
    "error": "Missing required fields: hallCode, name, capacity, building"
  }
  ```
- `409 Conflict`: Hall code already exists
  ```json
  {
    "error": "Hall code already exists"
  }
  ```
- `403 Forbidden`: User is not an admin
- `500 Internal Server Error`: Database error

---

### 3. Update a Lecture Hall
**Endpoint:** `PUT /api/admin/halls/{id}`

**Authentication:** Required (Admin only)

**URL Parameters:**
- `id`: MongoDB ObjectId of the hall to update

**Request Headers:**
```
Content-Type: application/json
```

**Request Body (all fields optional):**
```json
{
  "hallCode": "LT003_UPDATED",
  "name": "Updated Hall Name",
  "capacity": 160,
  "building": "Central Building",
  "features": ["projector", "ac", "whiteboard", "audio_system", "video_conferencing"]
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Lecture hall updated successfully",
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "hallCode": "LT003_UPDATED",
    "name": "Updated Hall Name",
    "capacity": 160,
    "building": "Central Building",
    "features": ["projector", "ac", "whiteboard", "audio_system", "video_conferencing"],
    "createdAt": "2025-04-07T12:00:00.000Z",
    "updatedAt": "2025-04-07T12:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid hall ID or invalid data
- `404 Not Found`: Hall not found
- `409 Conflict`: Hall code already exists (for another hall)
- `403 Forbidden`: User is not an admin
- `500 Internal Server Error`: Database error

---

### 4. Delete a Lecture Hall
**Endpoint:** `DELETE /api/admin/halls/{id}`

**Authentication:** Required (Admin only)

**URL Parameters:**
- `id`: MongoDB ObjectId of the hall to delete

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "Lecture hall deleted successfully"
}
```

**Constraints:**
- Hall cannot be deleted if it is referenced in active allocations (where `isActive: true`)

**Error Responses:**
- `400 Bad Request`: Invalid hall ID format
- `404 Not Found`: Hall not found
- `409 Conflict`: Hall is referenced in active allocations
  ```json
  {
    "error": "Cannot delete hall: it is referenced in active allocations. Deactivate allocations first."
  }
  ```
- `403 Forbidden`: User is not an admin
- `500 Internal Server Error`: Database error

---

## cURL Examples

### Get all halls
```bash
curl -X GET http://localhost:3000/api/admin/halls \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

### Create a new hall
```bash
curl -X POST http://localhost:3000/api/admin/halls \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "hallCode": "LT004",
    "name": "Innovation Hub",
    "capacity": 200,
    "building": "Tech Building",
    "features": ["projector", "ac", "whiteboard"]
  }'
```

### Update a hall
```bash
curl -X PUT http://localhost:3000/api/admin/halls/507f1f77bcf86cd799439013 \
  -H "Content-Type: application/json" \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN" \
  -d '{
    "capacity": 250,
    "features": ["projector", "ac", "whiteboard", "audio_system"]
  }'
```

### Delete a hall
```bash
curl -X DELETE http://localhost:3000/api/admin/halls/507f1f77bcf86cd799439013 \
  -H "Cookie: next-auth.session-token=YOUR_TOKEN"
```

---

## JavaScript/TypeScript Examples

### Fetch all halls
```typescript
const response = await fetch('/api/admin/halls');
const { data: halls } = await response.json();
console.log(halls);
```

### Create a new hall
```typescript
const newHall = {
  hallCode: 'LT005',
  name: 'Main Lecture Hall',
  capacity: 300,
  building: 'Main Building',
  features: ['projector', 'ac', 'whiteboard']
};

const response = await fetch('/api/admin/halls', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newHall)
});

const { data: createdHall } = await response.json();
```

### Update a hall
```typescript
const updates = {
  capacity: 350,
  features: ['projector', 'ac', 'whiteboard', 'video_conferencing']
};

const response = await fetch(`/api/admin/halls/${hallId}`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updates)
});

const { data: updatedHall } = await response.json();
```

### Delete a hall
```typescript
const response = await fetch(`/api/admin/halls/${hallId}`, {
  method: 'DELETE'
});

if (response.ok) {
  console.log('Hall deleted successfully');
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Request succeeded |
| 201 | Resource created successfully |
| 400 | Bad request (validation error) |
| 403 | Forbidden (authentication/authorization error) |
| 404 | Resource not found |
| 409 | Conflict (duplicate entry, referential constraint violation) |
| 500 | Internal server error |

---

## Notes

1. **Authentication**: All endpoints require the user to be logged in and have the "admin" role.
2. **Unique hallCode**: Hall codes must be unique. Attempting to create or update with a duplicate code will result in a 409 error.
3. **Delete Protection**: Halls referenced in active allocations cannot be deleted. You must first deactivate or remove the allocation.
4. **Features**: Features are optional and provided as a comma-separated string in the UI, which is converted to an array before sending to the API.
5. **Timestamps**: All resources include `createdAt` and `updatedAt` timestamps automatically.
