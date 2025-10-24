const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const activityService = require('../services/activityService'); // ADD THIS

// Generate JWT Token
const generateToken = (userId, email, roles) => {
  return jwt.sign(
    { userId, email, roles },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// SIGNUP - Register new user
const signup = async (req, res) => {
  try {
    const { email, password, name, roles } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email, password, and name' 
      });
    }

    const existingUser = await userService.findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await userService.createUser({
      email,
      password: hashedPassword,
      name,
      roles: roles || ['viewer']
    });

    const token = generateToken(newUser.id, newUser.email, newUser.roles);
    const { password: _, ...userWithoutPassword } = newUser;

    // LOG ACTIVITY - ADD THIS
    await activityService.addLog(
      newUser.id,
      newUser.name,
      'USER_SIGNUP',
      { email: newUser.email, roles: newUser.roles }
    );

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during signup' 
    });
  }
};

// LOGIN - Authenticate user
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }

    const user = await userService.findUserByEmail(email);
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    const token = generateToken(user.id, user.email, user.roles);
    const { password: _, ...userWithoutPassword } = user;

    // LOG ACTIVITY - ADD THIS
    await activityService.addLog(
      user.id,
      user.name,
      'USER_LOGIN',
      { email: user.email }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error during login' 
    });
  }
};

module.exports = { signup, login };
