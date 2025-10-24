const fs = require('fs').promises;
const path = require('path');

const LOGS_FILE = path.join(__dirname, '../../data/activity_logs.json');

// Initialize logs file if it doesn't exist
const initializeLogsFile = async () => {
  try {
    await fs.access(LOGS_FILE);
  } catch {
    await fs.writeFile(LOGS_FILE, JSON.stringify([], null, 2));
  }
};

// Get all logs
const getAllLogs = async () => {
  try {
    await initializeLogsFile();
    const data = await fs.readFile(LOGS_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    return [];
  }
};

// Add new log entry
const addLog = async (userId, userName, action, details = {}) => {
  try {
    const logs = await getAllLogs();
    
    const newLog = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      userId,
      userName,
      action,
      details,
      timestamp: new Date().toISOString(),
    };
    
    logs.unshift(newLog); // Add to beginning
    
    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.splice(100);
    }
    
    await fs.writeFile(LOGS_FILE, JSON.stringify(logs, null, 2));
    return newLog;
  } catch (error) {
    console.error('Error adding log:', error);
    return null;
  }
};

// Get logs by user
const getLogsByUser = async (userId) => {
  const logs = await getAllLogs();
  return logs.filter(log => log.userId === userId);
};

module.exports = {
  getAllLogs,
  addLog,
  getLogsByUser,
};
