const fs = require('fs').promises;
const { checkPermission, checkRole } = require('../src/middleware/rbacMiddleware');

// Mock fs.readFile
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn()
  }
}));

describe('RBAC Middleware - checkPermission', () => {
  let req, res, next;

  beforeEach(() => {
    jest.clearAllMocks();

    req = { user: null };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();

    // Mock roles.json data
    const mockRoles = JSON.stringify({
      admin: ['read:articles', 'write:articles', 'delete:articles'],
      editor: ['read:articles', 'write:articles'],
      viewer: ['read:articles']
    });
    fs.readFile.mockResolvedValue(mockRoles);
  });

  test('should return 401 if user is not authenticated', async () => {
    const middleware = checkPermission('read:articles');
    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Authentication required'
    });
  });

  test('should return 403 if user does not have required permission', async () => {
    req.user = { id: '123', email: 'test@test.com', roles: ['viewer'] };

    const middleware = checkPermission('write:articles');
    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Access denied. Required permission: write:articles'
      })
    );
  });

  test('should call next if user has required permission', async () => {
    req.user = { id: '123', email: 'test@test.com', roles: ['editor'] };

    const middleware = checkPermission('write:articles');
    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should call next if user has admin role with all permissions', async () => {
    req.user = { id: '123', email: 'admin@test.com', roles: ['admin'] };

    const middleware = checkPermission('delete:articles');
    await middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });
});

describe('RBAC Middleware - checkRole', () => {
  let req, res, next;

  beforeEach(() => {
    req = { user: null };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    next = jest.fn();
  });

  test('should return 401 if user is not authenticated', () => {
    const middleware = checkRole('admin');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: 'Authentication required'
    });
  });

  test('should return 403 if user does not have required role', () => {
    req.user = { id: '123', email: 'test@test.com', roles: ['viewer'] };

    const middleware = checkRole('admin');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        message: 'Access denied. Required role: admin'
      })
    );
  });

  test('should call next if user has required role', () => {
    req.user = { id: '123', email: 'admin@test.com', roles: ['admin'] };

    const middleware = checkRole('admin');
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should call next if user has one of multiple required roles', () => {
    req.user = { id: '123', email: 'test@test.com', roles: ['editor'] };

    const middleware = checkRole(['admin', 'editor']);
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });
});
