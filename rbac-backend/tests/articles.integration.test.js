// Load environment variables
require('dotenv').config();

// Ensure JWT_SECRET is set for tests
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-12345';
process.env.JWT_EXPIRES_IN = '1h';

const request = require('supertest');
const express = require('express');
const authRoutes = require('../src/routes/authRoutes');
const articleRoutes = require('../src/routes/articleRoutes');
const fs = require('fs').promises;
const path = require('path');

// Create test app
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);

const USERS_FILE = path.join(__dirname, '../data/users.json');

// Helper function to create user and get token
async function createUserAndGetToken(name, email, password, roles) {
  await fs.writeFile(USERS_FILE, JSON.stringify([]), 'utf8');
  
  const response = await request(app)
    .post('/api/auth/signup')
    .send({ name, email, password, roles });
  
  return response.body.data.token;
}

describe('Articles API - RBAC Integration Tests', () => {

  describe('GET /api/articles - Read Permission', () => {
    test('should return 401 if no token provided', async () => {
      const response = await request(app).get('/api/articles');

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('No token provided. Please login first.');
    });

    test('should allow viewer to read articles', async () => {
      const token = await createUserAndGetToken('Viewer', 'viewer@test.com', 'pass123', ['viewer']);
      
      const response = await request(app)
        .get('/api/articles')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.articles).toBeDefined();
    });

    test('should allow editor to read articles', async () => {
      const token = await createUserAndGetToken('Editor', 'editor@test.com', 'pass123', ['editor']);
      
      const response = await request(app)
        .get('/api/articles')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });

    test('should allow admin to read articles', async () => {
      const token = await createUserAndGetToken('Admin', 'admin@test.com', 'pass123', ['admin']);
      
      const response = await request(app)
        .get('/api/articles')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });

  describe('POST /api/articles - Write Permission', () => {
    test('should deny viewer from creating articles', async () => {
      const token = await createUserAndGetToken('Viewer', 'viewer2@test.com', 'pass123', ['viewer']);
      
      const response = await request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Test Article', content: 'Test content' });

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('write:articles');
    });

    test('should allow editor to create articles', async () => {
      const token = await createUserAndGetToken('Editor', 'editor2@test.com', 'pass123', ['editor']);
      
      const response = await request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Editor Article', content: 'Editor content' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe('Editor Article');
    });

    test('should allow admin to create articles', async () => {
      const token = await createUserAndGetToken('Admin', 'admin2@test.com', 'pass123', ['admin']);
      
      const response = await request(app)
        .post('/api/articles')
        .set('Authorization', `Bearer ${token}`)
        .send({ title: 'Admin Article', content: 'Admin content' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('DELETE /api/articles/:id - Delete Permission', () => {
    test('should deny viewer from deleting articles', async () => {
      const token = await createUserAndGetToken('Viewer', 'viewer3@test.com', 'pass123', ['viewer']);
      
      const response = await request(app)
        .delete('/api/articles/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('delete:articles');
    });

    test('should deny editor from deleting articles', async () => {
      const token = await createUserAndGetToken('Editor', 'editor3@test.com', 'pass123', ['editor']);
      
      const response = await request(app)
        .delete('/api/articles/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(403);
      expect(response.body.message).toContain('delete:articles');
    });

    test('should allow admin to delete articles', async () => {
      const token = await createUserAndGetToken('Admin', 'admin3@test.com', 'pass123', ['admin']);
      
      const response = await request(app)
        .delete('/api/articles/1')
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
});
