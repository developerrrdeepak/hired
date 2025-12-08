# API Documentation

## Authentication

All API routes require authentication via Firebase Auth token.

```typescript
headers: {
  'Authorization': `Bearer ${token}`
}
```

## Endpoints

### Candidates

#### GET /api/candidates
Get all candidates for organization

**Response:**
```json
{
  "candidates": [
    {
      "id": "string",
      "name": "string",
      "email": "string",
      "skills": ["string"],
      "experience": number
    }
  ]
}
```

### Jobs

#### POST /api/jobs
Create a new job posting

**Request:**
```json
{
  "title": "string",
  "description": "string",
  "location": "string",
  "salary": number
}
```

**Response:**
```json
{
  "id": "string",
  "message": "Job created successfully"
}
```

### AI Features

#### POST /api/ai/negotiation-practice
Practice salary negotiation with AI

**Request:**
```json
{
  "role": "string",
  "userResponse": "string",
  "history": []
}
```

**Response:**
```json
{
  "response": "string"
}
```

### Analytics

#### POST /api/analytics/track
Track user events

**Request:**
```json
{
  "event": "string",
  "properties": {},
  "timestamp": "string"
}
```

## Error Handling

All errors return:
```json
{
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

## Rate Limits

- 100 requests per minute per user
- 1000 requests per hour per organization
