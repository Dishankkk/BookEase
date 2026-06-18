const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const {
  getAllBooks,
  getBookById,
  getBookByCode,
  addBook,
  updateBook,
  deleteBook,
  getCategories
} = require('../controllers/bookController');

// Validation rules for adding a book
const bookValidation = [
  body('bookId')
    .notEmpty().withMessage('Book ID is required')
    .isAlphanumeric().withMessage('Book ID must be alphanumeric'),
  body('title')
    .notEmpty().withMessage('Title is required')
    .isLength({ min: 1, max: 300 }).withMessage('Title must be between 1-300 characters'),
  body('author')
    .notEmpty().withMessage('Author is required'),
  body('category')
    .notEmpty().withMessage('Category is required'),
  body('totalCopies')
    .isInt({ min: 1 }).withMessage('Total copies must be at least 1')
];

// ── ROUTES ──────────────────────────────────
// GET    /api/books           → Get all books (with search/filter)
// POST   /api/books           → Add a new book
// GET    /api/books/categories → Get all categories
// GET    /api/books/:id       → Get book by MongoDB ID
// GET    /api/books/code/:bookId → Get book by custom bookId
// PUT    /api/books/:id       → Update a book
// DELETE /api/books/:id       → Delete (soft) a book

router.get('/categories', getCategories);
router.get('/code/:bookId', getBookByCode);
router.route('/').get(getAllBooks).post(bookValidation, addBook);
router.route('/:id').get(getBookById).put(updateBook).delete(deleteBook);

module.exports = router;