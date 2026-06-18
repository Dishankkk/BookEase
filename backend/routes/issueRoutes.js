const express = require('express');
const router = express.Router();

const {
  issueBook,
  returnBook,
  getAllIssues,
  getDashboardStats
} = require('../controllers/issueController');

router.get('/', getAllIssues);
router.get('/stats', getDashboardStats);
router.post('/issue', issueBook);
router.post('/return', returnBook);

module.exports = router;