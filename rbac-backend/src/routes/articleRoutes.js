const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/authMiddleware');
const { checkPermission } = require('../middleware/rbacMiddleware');
const activityService = require('../services/activityService'); // ADD THIS

// In-memory article storage (for testing)
let articles = [
  { id: '1', title: 'First Article', content: 'Sample content', author: 'System' },
  { id: '2', title: 'Second Article', content: 'More content', author: 'System' }
];

// GET /api/articles - Read articles
router.get('/', authenticate, checkPermission('read:articles'), async (req, res) => {
  // LOG ACTIVITY - ADD THIS
  await activityService.addLog(
    req.user.id,
    req.user.name,
    'VIEW_ARTICLES',
    { count: articles.length }
  );

  res.json({
    success: true,
    message: 'Articles fetched successfully',
    data: {
      user: {
        email: req.user.email,
        roles: req.user.roles
      },
      articles
    }
  });
});

// POST /api/articles - Create article
router.post('/', authenticate, checkPermission('write:articles'), async (req, res) => {
  const { title, content } = req.body;

  if (!title || !content) {
    return res.status(400).json({
      success: false,
      message: 'Title and content are required'
    });
  }

  const newArticle = {
    id: Date.now().toString(),
    title,
    content,
    author: req.user.email,
    createdAt: new Date().toISOString()
  };

  articles.push(newArticle);

  // LOG ACTIVITY - ADD THIS
  await activityService.addLog(
    req.user.id,
    req.user.name,
    'CREATE_ARTICLE',
    { articleId: newArticle.id, title: newArticle.title }
  );

  res.status(201).json({
    success: true,
    message: 'Article created successfully',
    data: newArticle
  });
});

// DELETE /api/articles/:id - Delete article
router.delete('/:id', authenticate, checkPermission('delete:articles'), async (req, res) => {
  const { id } = req.params;
  
  const articleIndex = articles.findIndex(article => article.id === id);

  if (articleIndex === -1) {
    return res.status(404).json({
      success: false,
      message: 'Article not found'
    });
  }

  const deletedArticle = articles[articleIndex];
  articles = articles.filter(article => article.id !== id);

  // LOG ACTIVITY - ADD THIS
  await activityService.addLog(
    req.user.id,
    req.user.name,
    'DELETE_ARTICLE',
    { articleId: deletedArticle.id, title: deletedArticle.title }
  );

  res.json({
    success: true,
    message: 'Article deleted successfully',
    data: deletedArticle
  });
});

module.exports = router;
