const fs = require('fs').promises;
const path = require('path');

const USERS_FILE = path.join(__dirname, '../../data/users.json');

// Read all users from JSON file
const getAllUsers = async () => {
  try {
    const data = await fs.readFile(USERS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // If file doesn't exist or is empty, return empty array
    return [];
  }
};

// Find user by email
const findUserByEmail = async (email) => {
  const users = await getAllUsers();
  return users.find(user => user.email === email);
};

// Find user by ID
const findUserById = async (id) => {
  const users = await getAllUsers();
  return users.find(user => user.id === id);
};

// Create new user
const createUser = async (userData) => {
  const users = await getAllUsers();
  
  // Generate unique ID
  const newUser = {
    id: Date.now().toString(),
    ...userData,
    createdAt: new Date().toISOString()
  };
  
  users.push(newUser);
  
  // Write back to file
  await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2));
  
  return newUser;
};

module.exports = {
  getAllUsers,
  findUserByEmail,
  findUserById,
  createUser
};
