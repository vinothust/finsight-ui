# FinSight API Endpoints Reference

## Overview
This document outlines all API endpoints required for the FinSight analytics platform. The application currently uses mock data; this serves as the specification for backend development.

---

## 1. Authentication Endpoints

| Method | Endpoint | Purpose | Request Body | Response | Status Codes |
|--------|----------|---------|--------------|----------|--------------|
| POST | `/auth/login` | User login | `{ email: string, password: string, role?: UserRole }` | `{ accessToken: string, refreshToken: string, user: User }` | 200, 401, 400 |
| POST | `/auth/refresh` | Refresh access token | `{ refreshToken: string }` | `{ accessToken: string, expiresIn: number }` | 200, 401 |
| POST | `/auth/logout` | Logout user | `{ refreshToken?: string }` | `{ success: boolean, message: string }` | 200, 400 |
| GET | `/auth/me` | Get current user profile | - | `{ user: User }` | 200, 401 |

### User Role Types
- `admin` — Full system access
- `cluster_head` — Cluster-level access
- `account_director` — Account-level access
- `project_manager` — Project-level access

---

## 2. User Management Endpoints (Admin)

| Method | Endpoint | Purpose | Query/Body Parameters | Response | Status Codes |
|--------|----------|---------|----------------------|----------|--------------|
| GET | `/users` | List all users | `page?=1&pageSize?=20&search?=string&role?=enum` | `{ users: User[], total: number, page: number, pageSize: number }` | 200, 401, 403 |
| GET | `/users/{id}` | Get user by ID | - | `{ user: User }` | 200, 401, 403, 404 |
| POST | `/users` | Create new user | `{ name: string, email: string, role: UserRole, department?: string }` | `{ user: User, tempPassword?: string }` | 201, 400, 401, 403 |
| PATCH | `/users/{id}` | Update user | `{ name?: string, email?: string, role?: UserRole, department?: string }` | `{ user: User }` | 200, 400, 401, 403, 404 |
| DELETE | `/users/{id}` | Deactivate/delete user | - | `{ success: boolean, message: string }` | 200, 401, 403, 404 |
| GET | `/roles` | Get available roles | - | `{ roles: { value: UserRole, label: string }[] }` | 200, 401 |

---

## 3. Cluster Management Endpoints

| Method | Endpoint | Purpose | Query/Body Parameters | Response | Status Codes |
|--------|----------|---------|----------------------|----------|--------------|
| GET | `/clusters` | List all clusters | `search?=string&page?=1&pageSize?=50` | `{ clusters: Cluster[], total: number }` | 200, 401 |
| GET | `/clusters/{id}` | Get cluster by ID | - | `{ cluster: ClusterDetail }` | 200, 401, 404 |
| POST | `/clusters` | Create cluster | `{ name: string, description?: string }` | `{ cluster: Cluster }` | 201, 400, 401, 403 |
| PATCH | `/clusters/{id}` | Update cluster | `{ name?: string, description?: string }` | `{ cluster: Cluster }` | 200, 400, 401, 403, 404 |
| DELETE | `/clusters/{id}` | Delete cluster | - | `{ success: boolean, message: string }` | 200, 401, 403, 404 |

### Cluster Response Structure
```json
{
  "id": "CL001",
  "name": "North America",
  "accountCount": 2,
  "totalRevenue": 5000000,
  "avgMargin": 35.5,
  "accounts": ["ACC001", "ACC002"]
}
```

---

## 4. Account Management Endpoints

| Method | Endpoint | Purpose | Query/Body Parameters | Response | Status Codes |
|--------|----------|---------|----------------------|----------|--------------|
| GET | `/accounts` | List accounts | `clusterId?=string&search?=string&page?=1&pageSize?=50` | `{ accounts: Account[], total: number }` | 200, 401 |
| GET | `/accounts/{id}` | Get account by ID | - | `{ account: AccountDetail }` | 200, 401, 404 |
| POST | `/accounts` | Create account | `{ name: string, clusterId: string, directors?: string[] }` | `{ account: Account }` | 201, 400, 401, 403 |
| PATCH | `/accounts/{id}` | Update account | `{ name?: string, clusterId?: string, directors?: string[] }` | `{ account: Account }` | 200, 400, 401, 403, 404 |
| DELETE | `/accounts/{id}` | Delete account | - | `{ success: boolean, message: string }` | 200, 401, 403, 404 |

### Account Response Structure
```json
{
  "id": "ACC001",
  "name": "Tech Giants Inc",
  "clusterId": "CL001",
  "projectCount": 2,
  "totalRevenue": 2500000,
  "avgMargin": 38.5,
  "directors": ["userid1", "userid2"],
  "projects": ["PRJ001", "PRJ002"]
}
```

---

## 5. Project Management Endpoints

| Method | Endpoint | Purpose | Query/Body Parameters | Response | Status Codes |
|--------|----------|---------|----------------------|----------|--------------|
| GET | `/projects` | List projects | `accountId?=string&search?=string&page?=1&pageSize?=50` | `{ projects: Project[], total: number }` | 200, 401 |
| GET | `/projects/{id}` | Get project by ID | - | `{ project: ProjectDetail }` | 200, 401, 404 |
| POST | `/projects` | Create project | `{ name: string, accountId: string, managers?: string[] }` | `{ project: Project }` | 201, 400, 401, 403 |
| PATCH | `/projects/{id}` | Update project | `{ name?: string, accountId?: string, managers?: string[] }` | `{ project: Project }` | 200, 400, 401, 403, 404 |
| DELETE | `/projects/{id}` | Delete project | - | `{ success: boolean, message: string }` | 200, 401, 403, 404 |

### Project Response Structure
```json
{
  "id": "PRJ001",
  "name": "Digital Transformation",
  "accountId": "ACC001",
  "totalRevenue": 1250000,
  "avgMargin": 42.0,
  "headcount": 12,
  "utilization": 85.5,
  "managers": ["userid4"],
  "status": "active"
}
```

---

## 6. P&L Data Endpoints

| Method | Endpoint | Purpose | Query/Body Parameters | Response | Status Codes |
|--------|----------|---------|----------------------|----------|--------------|
| GET | `/pnl` | Get P&L records | `clusterIds?=string[]&accountIds?=string[]&projectIds?=string[]&years?=number[]&months?=string[]&minMargin?=number&page?=1&pageSize?=100&sort?=field:asc\|desc` | `{ data: PnLData[], total: number, page: number, pageSize: number }` | 200, 400, 401 |
| GET | `/pnl/{id}` | Get single P&L record | - | `{ data: PnLData }` | 200, 401, 404 |
| GET | `/pnl/summary/kpis` | KPI summary | `clusterIds?=string[]&accountIds?=string[]&years?=number[]&months?=string[]` | `{ revenue: number, cost: number, grossProfit: number, margin: number, headcount: number, utilization: number, revenuePerHead: number, costPerHead: number }` | 200, 400, 401 |
| GET | `/pnl/summary/revenue-trend` | Revenue trend | `clusterIds?=string[]&accountIds?=string[]&projectIds?=string[]&years?=number[]` | `{ data: [{ month: string, revenue: number, cost: number, profit: number }] }` | 200, 400, 401 |
| GET | `/pnl/summary/revenue-by-cluster` | Revenue distribution | `years?=number[]&months?=string[]` | `{ data: [{ name: string, value: number }] }` | 200, 400, 401 |
| GET | `/pnl/summary/margin-by-account` | Margin analysis | `clusterIds?=string[]&years?=number[]&months?=string[]&limit?=10` | `{ data: [{ name: string, margin: number }] }` | 200, 400, 401 |
| GET | `/pnl/summary/utilization-trend` | Utilization metrics | `clusterIds?=string[]&accountIds?=string[]&years?=number[]` | `{ data: [{ month: string, utilization: number, headcount: number }] }` | 200, 400, 401 |
| GET | `/pnl/export` | Export P&L data | `clusterIds?=string[]&accountIds?=string[]&format?=csv\|xlsx\|json` | Binary file or JSON | 200, 400, 401 |

### PnLData Response Structure
```json
{
  "id": "CL001-ACC001-PRJ001-2025-January",
  "cluster": "North America",
  "account": "Tech Giants Inc",
  "project": "Digital Transformation",
  "year": 2025,
  "month": "January",
  "revenue": 250000,
  "cost": 145000,
  "grossProfit": 105000,
  "margin": 42.0,
  "headcount": 12,
  "utilization": 85.5
}
```

---

## 7. File Upload Endpoints

| Method | Endpoint | Purpose | Request Type | Parameters | Response | Status Codes |
|--------|----------|---------|--------------|------------|----------|--------------|
| POST | `/uploads/pnl-file` | Upload P&L file | `multipart/form-data` | `file: File(.xlsx, .xls, .csv), clusterId?: string, accountId?: string` | `{ jobId: string, fileName: string, rowCount: number, preview: PnLData[], issues: ValidationError[] }` | 202, 400, 401, 413 |
| GET | `/uploads/{jobId}` | Get upload status | - | - | `{ jobId: string, status: 'processing'\|'completed'\|'failed', progress: number, parsedRows: number, errorRows: ValidationError[], completedAt?: timestamp }` | 200, 401, 404 |
| GET | `/uploads/{jobId}/commit` | Commit upload to DB | - | - | `{ success: boolean, rowsInserted: number, message: string }` | 200, 400, 401, 404 |
| GET | `/templates/pnl` | Download template | - | - | Binary (XLSX) | 200, 401 |

### ValidationError Structure
```json
{
  "rowNumber": 5,
  "field": "revenue",
  "value": "abc",
  "message": "Expected number, got string"
}
```

---

## 8. AI Assistant Endpoints

| Method | Endpoint | Purpose | Request Body | Response | Status Codes |
|--------|----------|---------|--------------|----------|--------------|
| POST | `/ai/chat` | Send chat message | `{ messages: [{role: 'user'\|'assistant', content: string}], filters?: FilterState, conversationId?: string }` | `{ response: string, conversationId: string, timestamp: timestamp }` | 200, 400, 401 |
| POST | `/ai/insights` | Generate insights | `{ filters?: FilterState, focusArea?: string }` | `{ insights: [{ title: string, description: string, metric: string, change: number }], generatedAt: timestamp }` | 200, 400, 401 |
| GET | `/ai/conversation/{id}` | Get conversation | - | `{ messages: ChatMessage[], createdAt: timestamp, updatedAt: timestamp }` | 200, 401, 404 |

### ChatMessage Structure
```json
{
  "id": "msg-123",
  "role": "user|assistant",
  "content": "What is the overall margin trend?",
  "timestamp": "2025-01-15T10:30:00Z"
}
```

---

## 9. Settings & Preferences Endpoints

| Method | Endpoint | Purpose | Request Body | Response | Status Codes |
|--------|----------|---------|--------------|----------|--------------|
| GET | `/users/me/preferences` | Get user preferences | - | `{ theme: 'light'\|'dark', notifications: boolean, emailDigest: boolean, reportFrequency: 'daily'\|'weekly'\|'monthly' }` | 200, 401 |
| PATCH | `/users/me/preferences` | Update preferences | `{ theme?: string, notifications?: boolean, emailDigest?: boolean, reportFrequency?: string }` | `{ preferences: UserPreferences }` | 200, 400, 401 |
| PATCH | `/users/me/password` | Change password | `{ currentPassword: string, newPassword: string, confirmPassword: string }` | `{ success: boolean, message: string }` | 200, 400, 401 |
| PATCH | `/users/me` | Update profile | `{ name?: string, email?: string, avatar?: File, department?: string }` | `{ user: User }` | 200, 400, 401 |

---

## 10. Filter Options Endpoints

| Method | Endpoint | Purpose | Query Parameters | Response | Status Codes |
|--------|----------|---------|------------------|----------|--------------|
| GET | `/filters/options` | Get all filter options | `includeStats?=boolean` | `{ clusters: {id, name, value}[], accounts: {id, name, clusterId}[], projects: {id, name, accountId}[], years: number[], months: string[], kpis: string[] }` | 200, 401 |
| GET | `/filters/options/clusters` | Cluster filter options | - | `{ options: {id, name, value}[] }` | 200, 401 |
| GET | `/filters/options/accounts` | Account filter options | `clusterId?=string` | `{ options: {id, name, value, clusterId}[] }` | 200, 401 |
| GET | `/filters/options/projects` | Project filter options | `accountId?=string` | `{ options: {id, name, value, accountId}[] }` | 200, 401 |

---

## Common Type Definitions

### User
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "role": "admin|cluster_head|account_director|project_manager",
  "avatar": "string (optional)",
  "department": "string (optional)",
  "clusters": ["string"] (optional),
  "accounts": ["string"] (optional),
  "projects": ["string"] (optional),
  "createdAt": "timestamp",
  "updatedAt": "timestamp",
  "lastLogin": "timestamp (optional)"
}
```

### FilterState
```json
{
  "clusters": ["string"],
  "accounts": ["string"],
  "projects": ["string"],
  "analyzeBy": ["string"],
  "years": ["number"],
  "months": ["string"],
  "marginThreshold": "number"
}
```

### Error Response (All Endpoints)
```json
{
  "error": "string",
  "message": "string",
  "code": "string",
  "details": {} (optional),
  "timestamp": "timestamp"
}
```

---

## Authentication & Authorization

### Headers
- `Authorization: Bearer {accessToken}` — Required for all authenticated endpoints
- `Content-Type: application/json` — For JSON requests
- `Content-Type: multipart/form-data` — For file uploads

### Token Details
- **Access Token**: Valid for 1 hour
- **Refresh Token**: Valid for 7 days
- **Refresh Endpoint**: Use when access token expires

### Role-Based Access Control (RBAC)
| Endpoint Category | Admin | Cluster Head | Account Director | Project Manager |
|---|---|---|---|---|
| Users | ✅ | ❌ | ❌ | ❌ |
| Clusters | ✅ | ✅ (own only) | ❌ | ❌ |
| Accounts | ✅ | ✅ | ✅ (own only) | ❌ |
| Projects | ✅ | ✅ | ✅ | ✅ (own only) |
| P&L Data | ✅ | ✅ | ✅ | ✅ |
| Upload | ✅ | ✅ | ✅ | ❌ |
| AI Chat | ✅ | ✅ | ✅ | ✅ |
| Settings | ✅ (all) | ✅ (own) | ✅ (own) | ✅ (own) |

---

## Pagination

### Query Parameters
- `page` — Page number (1-indexed, default: 1)
- `pageSize` — Records per page (default: 20, max: 1000)

### Response Structure
```json
{
  "data": [...],
  "total": 150,
  "page": 1,
  "pageSize": 20,
  "totalPages": 8,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

---

## Sorting

### Query Format
`sort=field:asc` or `sort=field:desc` or `sort=field1:asc,field2:desc`

### Supported Sort Fields by Endpoint
- **P&L**: revenue, cost, margin, year, month, headcount, utilization
- **Users**: name, email, role, createdAt
- **Accounts**: name, totalRevenue, avgMargin, projectCount

---

## Rate Limiting

- **Rate Limit**: 1000 requests per hour per user
- **Headers**: 
  - `X-RateLimit-Limit: 1000`
  - `X-RateLimit-Remaining: 999`
  - `X-RateLimit-Reset: 1672531200`

---

## Implementation Priority

### Phase 1 (MVP)
1. Auth endpoints (`/auth/*`)
2. P&L data endpoints (`/pnl`, `/pnl/summary/*`)
3. Filter options (`/filters/options`)

### Phase 2 (Core Features)
4. File upload endpoints (`/uploads/*`)
5. User management (`/users`)
6. Settings endpoints (`/users/me/*`)

### Phase 3 (Advanced)
7. Hierarchy endpoints (Clusters, Accounts, Projects)
8. AI Assistant endpoints (`/ai/*`)
9. Advanced filtering and export

---

## Testing & Development

### Mock Server Options
- **MSW (Mock Service Worker)** — Browser-level mocking
- **json-server** — Quick JSON API mock
- **Postman** — API testing & documentation

### Example CURL Requests

**Login:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@finsight.com","password":"password123"}'
```

**Get P&L Data:**
```bash
curl -X GET "http://localhost:3000/pnl?clusterIds=CL001&years=2025&page=1" \
  -H "Authorization: Bearer {accessToken}"
```

**Upload File:**
```bash
curl -X POST http://localhost:3000/uploads/pnl-file \
  -H "Authorization: Bearer {accessToken}" \
  -F "file=@export.xlsx"
```

---

**Last Updated:** December 30, 2025  
**Status:** Specification Complete  
**Backend Implementation:** Pending
