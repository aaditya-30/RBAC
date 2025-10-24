const jwt = require('jsonwebtoken');
const { authenticate } = require('../src/middleware/authMiddleware');
const userService = require('../src/services/userService');

// Mock the userService
jest.mock('../src/services/userService');

describe('Auth Middleware - authenticate', () => {
  let req, res, next;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();

    // Mock request, response, next
    req = {
      headers: {}
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    // Set JWT secret for tests
    process.env.JWT_SECRET = 'test-secret-key';
  });

  test('should return 401 if no authorization header', async () => {
    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'No token provided. Please login first.'
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 if authorization header does not start with Bearer', async () => {
    req.headers.authorization = 'InvalidToken';

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'No token provided. Please login first.'
    });
  });

  test('should return 401 if token is invalid', async () => {
    req.headers.authorization = 'Bearer invalid-token';

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Invalid token'
    });
  });

  test('should return 401 if user no longer exists', async () => {
    const token = jwt.sign(
      { userId: '123', email: 'test@test.com', roles: ['viewer'] },
      process.env.JWT_SECRET
    );
    req.headers.authorization = `Bearer ${token}`;

    // Mock user not found
    userService.findUserById.mockResolvedValue(null);

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'User no longer exists'
    });
  });

  test('should attach user to request and call next if token is valid', async () => {
    const mockUser = {
      id: '123',
      email: 'test@test.com',
      name: 'Test User',
      roles: ['viewer'],
      password: 'hashed-password'
    };

    const token = jwt.sign(
      { userId: mockUser.id, email: mockUser.email, roles: mockUser.roles },
      process.env.JWT_SECRET
    );
    req.headers.authorization = `Bearer ${token}`;

    // Mock user found
    userService.findUserById.mockResolvedValue(mockUser);

    await authenticate(req, res, next);

    // Check user attached to request (without password)
    expect(req.user).toBeDefined();
    expect(req.user.email).toBe('test@test.com');
    expect(req.user.password).toBeUndefined();
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should return 401 if token is expired', async () => {
    const expiredToken = jwt.sign(
      { userId: '123', email: 'test@test.com', roles: ['viewer'] },
      process.env.JWT_SECRET,
      { expiresIn: '-1s' } // Already expired
    );
    req.headers.authorization = `Bearer ${expiredToken}`;

    await authenticate(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Token expired. Please login again.'
    });
  });
});
