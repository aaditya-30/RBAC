# RBAC API - Role-Based Access Control System

A complete Node.js + Express API demonstrating **Role-Based Access Control (RBAC)** with JWT authentication, permission-based authorization, and comprehensive testing.

## 🚀 Features

- ✅ User authentication with JWT tokens
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (Admin, Editor, Viewer)
- ✅ Permission-based route protection
- ✅ JSON file datastore (easy to upgrade to SQLite)
- ✅ Automated seed script for test users
- ✅ Comprehensive unit and integration tests
- ✅ RESTful API design
- ✅ Request logging with Morgan
- ✅ CORS enabled for frontend integration

## 📋 Table of Contents

- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Endpoints](#api-endpoints)
- [Roles & Permissions](#roles--permissions)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Deployment](#deployment)

## 🛠️ Installation

### Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)

### Setup

1. Clone the repository:
git clone <your-repo-url>
cd rbac-backen


2. Install dependencies:
npm install


3. Create `.env` file (copy from `.env.example`):
cp .env.example .env


4. Update `.env` with your values:
PORT=3000
NODE_ENV=development
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=1h

5. Seed the database with test users:
npm run seed


6. Start the server:
npm run dev


Server will be running at `http://localhost:3000`

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment (development/production) | `development` |
| `JWT_SECRET` | Secret key for JWT signing | Required |
| `JWT_EXPIRES_IN` | Token expiration time | `1h` |
| `DATA_PATH` | Path to JSON data files | `./data` |

## 🏃 Running the Application

### Development Mode (with auto-restart)
npm run dev


### Production Mode
npm start


### Seed Database
npm run seed


### Run Tests
npm test


### Run Tests with Coverage
npm run test:coverage


## 📡 API Endpoints

### Base URL: `http://localhost:3000`

### Authentication Endpoints

#### 1. Sign Up
**POST** `/api/auth/signup`

Create a new user account.

**Request Body:**
{
"name": "John Doe
, "email": "j.com",
"password": "password123
, "roles": ["view

**Response (201):**
{
"success": tru
, "message": "User registered successful
y", "da
a": {
"user": { "id":
john@example.com",
"name": "John
Doe", "roles":
["viewer"], "createdAt": "2025-10
24
10:30:56.789Z" }, "token": "eyJhbGciOiJIUz
1

#### 2. Login
**POST** `/api/auth/login`

Authenticate and receive JWT token.

**Request Body:**
{
"emailjohn@example.com",
"password": "password12

**Response (200):**
{
"success": tru
, "message": "Login successf
l", "da
a": {
"user": { "id":
john@example.com",
"name": "John
Doe", "roles"
[
viewer"] }, "token": "eyJhbGciOiJIUzI1NiIs
n

### Protected Endpoints (Require Authentication)

All endpoints below require a valid JWT token in the Authorization header:
Authorization: Bearer <your-token-here>


#### 3. Get Articles (Read Permission)
**GET** `/api/articles`

**Required Permission:** `read:articles` (Viewer, Editor, Admin)

**Response (200):**
{
"success": tru
, "message": "Articles fetched successful
y", "da
a": {
john@example.com",
"roles": ["vi
we
"] },
"
rticles":
{ "id": "1
, "title": "First Ar
icle", "co
t
n
"

#### 4. Create Article (Write Permission)
**POST** `/api/articles`

**Required Permission:** `write:articles` (Editor, Admin)

**Request Body:**
{
"title": "My New Article
, "content": "This is the article cont

**Response (201):**
{
"success": tru
, "message": "Article created successful
y", "da
a": { "id": "17297
3456790", "title": "My
New Article", "content": "This is the
john@example.com",
"createdAt": "2025-10-24T10:35:00.0
0

#### 5. Delete Article (Delete Permission)
**DELETE** `/api/articles/:id`

**Required Permission:** `delete:articles` (Admin only)

**Response (200):**
{
"success": tru
, "message": "Article deleted successful
y", "da
a": {
id": "1", "title": "F
rst Article", "content":
"Sample content",


### Health Check Endpoint

#### 6. Health Check
**GET** `/health`

Check if the server is running.

**Response (200):**
{
"status": "OK
, "timestamp": "2025-10-24T10:30:00.00
Z", "environment": "develo

## 👥 Roles & Permissions

### Available Roles

| Role | Description | Permissions |
|------|-------------|-------------|
| **viewer** | Can only read articles | `read:articles` |
| **editor** | Can read and create articles | `read:articles`, `write:articles` |
| **admin** | Full access | `read:articles`, `write:articles`, `delete:articles`, `manage:users` |

### Test Users (After Seeding)

| Name | Email | Password | Role |
|------|-------|----------|------|
| Admin User | admin@test.com | admin123 | admin |
| Editor User | editor@test.com | editor123 | editor |
| Viewer User | viewer@test.com | viewer123 | viewer |
| Multi-Role User | multi@test.com | multi123 | editor, viewer |

## 🧪 Testing

Run all tests:
npm test


Run tests in watch mode:
npm run test:watch


Run tests with coverage:
npm run test:coverage


### Test Coverage

- ✅ Unit tests for authentication middleware
- ✅ Unit tests for RBAC middleware
- ✅ Integration tests for auth endpoints
- ✅ Integration tests for protected routes

## 📁 Project Structure

rbac-backend/
├── src/
│ ├── config/ # Configuration files
│ ├── controllers/ # Route controllers
│ │ └── authController.js
│ ├── middleware/ # Custom middleware
│ │ ├── authMiddleware.js
│ │ └── rbacMiddleware.js
│ ├── routes/ # API routes
│ │ ├── authRoutes.js
│ │ └── articleRoutes.js
│ ├── services/ # Business logic
│ │ └── userService.js
│ └── server.js # Entry point
├── data/
│ ├── users.json # User datastore
│ └── roles.json # Role-permission mapping
├── scripts/
│ └── seed.js # Database seeding script
├── tests/ # Test files
│ ├── authMiddleware.test.js
│ ├── rbacMiddleware.test.js
│ ├── auth.integration.test.js
│ └── articles.integration.test.js
├── .env # Environment variables (not committed)
├── .env.example # Example environment variables
├── .gitignore
├── jest.config.js # Jest configuration
├── jest.setup.js # Jest setup file
├── package.json

## 📦 Dependencies

### Production
- `express` - Web framework
- `bcryptjs` - Password hashing
- `jsonwebtoken` - JWT authentication
- `dotenv` - Environment variables
- `morgan` - HTTP request logger
- `cors` - Cross-origin resource sharing

### Development
- `nodemon` - Auto-restart server
- `jest` - Testing framework
- `supertest` - HTTP assertions

## 🚀 Deployment

### Deploy to Render

1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com/)
3. Click "New" → "Web Service"
4. Connect your GitHub repository
5. Configure:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:** Add your `JWT_SECRET`
6. Click "Create Web Service"

### Deploy to Railway

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Add environment variables: `railway variables set JWT_SECRET=your-secret`
5. Deploy: `railway up`

## 🔒 Security Best Practices

- ✅ Passwords hashed with bcrypt (salt rounds: 10)
- ✅ JWT tokens expire after 1 hour
- ✅ Environment variables for sensitive data
- ✅ CORS enabled for controlled access
- ✅ Request rate limiting (recommended for production)
- ✅ Input validation on all endpoints

## 📝 curl Command Examples

### Sign Up
curl -X POST http://localhost:3000/api/auth/signup
-H "Content-Type: application/json"
-d '{"name":"Test User","email":"test@test.com","password":"test123","roles":["viewer"]}'


### Login
curl -X POST http://localhost:3000/api/auth/login
-H "Content-Type: application/json"
-d '{"email":"admin@test.com","password":"admin123"}'


### Get Articles (with token)
curl http://localhost:3000/api/articles
-H "Authorization: Bearer YOUR_TOKEN_HERE"


### Create Article (with token)
curl -X POST http://localhost:3000/api/articles
-H "Authorization: Bearer YOUR_TOKEN_HERE"
-H "Content-Type: application/json"
-d '{"title":"New Article","content":"Article content"}'


### Delete Article (with token)
curl -X DELETE http://localhost:3000/api/articles/1
-H "Authorization: Bearer YOUR_TOKEN_HERE"


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - feel free to use this project for learning and production applications.

## 👨‍💻 Author

Built with ❤️ as a learning project for RBAC implementation in Node.js

---

**Questions?** Open an issue or contact the maintainer.