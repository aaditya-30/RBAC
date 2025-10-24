const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/rbacMiddleware');
const activityService = require('../services/activityService');

// Get all activity logs (Admin only)
router.get('/', authenticate, checkRole('admin'), async (req, res) => {
  try {
    const logs = await activityService.getAllLogs();
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Get logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch activity logs'
    });
  }
});

// Get current user's activity logs
router.get('/me', authenticate, async (req, res) => {
  try {
    const logs = await activityService.getLogsByUser(req.user.id);
    
    res.json({
      success: true,
      data: logs
    });
  } catch (error) {
    console.error('Get user logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch your activity logs'
    });
  }
});

module.exports = router;
