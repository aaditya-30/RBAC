import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { activityAPI } from '../utils/api';

const ActivityLogs = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, login, articles, users

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = user.roles.includes('admin') 
        ? await activityAPI.getAll()
        : await activityAPI.getMine();
      setLogs(response.data.data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action) => {
    const icons = {
      USER_LOGIN: '🔓',
      USER_SIGNUP: '✨',
      VIEW_ARTICLES: '👁️',
      CREATE_ARTICLE: '📝',
      DELETE_ARTICLE: '🗑️',
      UPDATE_USER: '✏️',
      DELETE_USER: '❌',
    };
    return icons[action] || '📌';
  };

  const getActionColor = (action) => {
    if (action.includes('DELETE')) return 'bg-red-100 text-red-800 border-red-200';
    if (action.includes('CREATE')) return 'bg-green-100 text-green-800 border-green-200';
    if (action.includes('UPDATE')) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (action.includes('LOGIN')) return 'bg-purple-100 text-purple-800 border-purple-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const filteredLogs = logs.filter(log => {
    if (filter === 'all') return true;
    if (filter === 'login') return log.action.includes('LOGIN') || log.action.includes('SIGNUP');
    if (filter === 'articles') return log.action.includes('ARTICLE');
    if (filter === 'users') return log.action.includes('USER') && !log.action.includes('LOGIN') && !log.action.includes('SIGNUP');
    return true;
  });

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                  Activity Logs
                </h1>
                <p className="text-sm text-gray-500">
                  {user.roles.includes('admin') ? 'System-wide activity' : 'Your activity history'}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back</span>
              </button>
              <button
                onClick={() => { logout(); navigate('/login'); }}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Filter Bar */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All Activity
              </button>
              <button
                onClick={() => setFilter('login')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'login'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                🔓 Login/Signup
              </button>
              <button
                onClick={() => setFilter('articles')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  filter === 'articles'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                📝 Articles
              </button>
              {user.roles.includes('admin') && (
                <button
                  onClick={() => setFilter('users')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    filter === 'users'
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  👥 Users
                </button>
              )}
            </div>
            <span className="text-sm text-gray-500 font-medium">
              {filteredLogs.length} {filteredLogs.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>
        </div>

        {/* Logs Timeline */}
        <div className="bg-white rounded-xl shadow-xl p-6 border border-gray-200">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <svg className="animate-spin h-10 w-10 text-indigo-600" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No activity logs found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex items-start gap-4 p-4 bg-gradient-to-r from-white to-gray-50 rounded-lg border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-2xl">
                      {getActionIcon(log.action)}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getActionColor(log.action)}`}>
                        {log.action.replace(/_/g, ' ')}
                      </span>
                      <span className="text-xs text-gray-500">{formatTimestamp(log.timestamp)}</span>
                    </div>
                    <p className="text-gray-800 font-medium">{log.userName}</p>
                    {Object.keys(log.details).length > 0 && (
                      <div className="mt-2 text-sm text-gray-600">
                        {log.details.title && <p>Article: <span className="font-medium">{log.details.title}</span></p>}
                        {log.details.email && <p>Email: <span className="font-medium">{log.details.email}</span></p>}
                        {log.details.count !== undefined && <p>Count: <span className="font-medium">{log.details.count}</span></p>}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ActivityLogs;
