// Load environment variables
require('dotenv').config();

// Ensure JWT_SECRET is set for tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-12345';
process.env.JWT_EXPIRES_IN = '1h';

const request = require('supertest');
const express = require('express');
const authRoutes = require('../src/routes/authRoutes');

const fs = require('fs').promises;
const path = require('path');

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

const USERS_FILE = path.join(__dirname, '../data/users.json');

describe('Auth API Integration Tests', () => {
  
  beforeEach(async () => {
    // Clear users before each test
    await fs.writeFile(USERS_FILE, JSON.stringify([]), 'utf8');
  });

  describe('POST /api/auth/signup', () => {
    test('should create a new user successfully', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: 'password123',
          roles: ['viewer']
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe('test@test.com');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.password).toBeUndefined();
    });

    test('should return 400 if email already exists', async () => {
      // First signup
      await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: 'password123'
        });

      // Try to signup again with same email
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User 2',
          email: 'test@test.com',
          password: 'password456'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('User already exists with this email');
    });

    test('should return 400 if required fields are missing', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'test@test.com'
          // Missing name and password
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });

    test('should assign viewer role by default if no roles provided', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.data.user.roles).toEqual(['viewer']);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user before each login test
      await request(app)
        .post('/api/auth/signup')
        .send({
          name: 'Test User',
          email: 'test@test.com',
          password: 'password123',
          roles: ['viewer']
        });
    });

    test('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.user.email).toBe('test@test.com');
    });

    test('should return 401 with incorrect password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com',
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    test('should return 401 with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'password123'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    test('should return 400 if email or password is missing', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@test.com'
          // Missing password
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});
