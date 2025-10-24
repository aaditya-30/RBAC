const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/rbacMiddleware');
const userService = require('../services/userService');
const bcrypt = require('bcryptjs');
const activityService = require('../services/activityService');

// ... existing routes ...

// Update own profile
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, email, currentPassword, newPassword } = req.body;

    const users = await userService.getAllUsers();
    const userIndex = users.findIndex(u => u.id === req.user.id);

    if (userIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // If changing password, verify current password
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password is required to change password'
        });
      }

      const isPasswordValid = await bcrypt.compare(currentPassword, users[userIndex].password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const salt = await bcrypt.genSalt(10);
      users[userIndex].password = await bcrypt.hash(newPassword, salt);
      
      await activityService.addLog(
        req.user.id,
        req.user.name,
        'PASSWORD_CHANGE',
        { email: req.user.email }
      );
    }

    // Update name and email
    users[userIndex].name = name || users[userIndex].name;
    users[userIndex].email = email || users[userIndex].email;
    users[userIndex].updatedAt = new Date().toISOString();

    // Save to file
    const fs = require('fs').promises;
    const path = require('path');
    const USERS_FILE = path.join(__dirname, '../../data/users.json');
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));

    const { password, ...userWithoutPassword } = users[userIndex];

    await activityService.addLog(
      req.user.id,
      req.user.name,
      'UPDATE_PROFILE',
      { email: userWithoutPassword.email }
    );

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: userWithoutPassword
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

module.exports = router;
