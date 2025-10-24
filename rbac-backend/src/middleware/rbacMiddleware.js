const fs = require('fs').promises;
const path = require('path');

const ROLES_FILE = path.join(__dirname, '../../data/roles.json');

// Load role-permission mapping from JSON file
const loadRoles = async () => {
  try {
    const data = await fs.readFile(ROLES_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading roles:', error);
    return {};
  }
};

// Check if user has required permission
const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      // User must be authenticated first (from authMiddleware)
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required'
        });
      }

      const userRoles = req.user.roles || [];
      const rolePermissions = await loadRoles();

      // Collect all permissions for user's roles
      const userPermissions = [];
      for (const role of userRoles) {
        if (rolePermissions[role]) {
          userPermissions.push(...rolePermissions[role]);
        }
      }

      // Check if user has the required permission
      if (!userPermissions.includes(requiredPermission)) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required permission: ${requiredPermission}`,
          userRoles: userRoles,
          userPermissions: userPermissions
        });
      }

      // User has permission, continue
      next();

    } catch (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({
        success: false,
        message: 'Authorization check failed'
      });
    }
  };
};

// Check if user has specific role
const checkRole = (requiredRoles) => {
  return (req, res, next) => {
    // User must be authenticated first
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRoles = req.user.roles || [];
    
    // Convert single role to array
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    // Check if user has at least one of the required roles
    const hasRole = rolesArray.some(role => userRoles.includes(role));

    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${rolesArray.join(' or ')}`,
        userRoles: userRoles
      });
    }

    next();
  };
};

module.exports = { checkPermission, checkRole };
