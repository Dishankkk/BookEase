const { validationResult } = require('express-validator');
const Book = require('../models/Book');

// ─────────────────────────────────────────
// @desc    Get all books (with optional search & filter)
// @route   GET /api/books
// @access  Public
// ─────────────────────────────────────────
const getAllBooks = async (req, res, next) => {
  try {
    // Extract query parameters from URL
    // Example: /api/books?search=python&category=Computer Science&page=1
    const {
      search,
      category,
      available,
      page = 1,
      limit = 12,
      sortBy = 'title',
      order = 'asc'
    } = req.query;

    // Build the query object dynamically
    let query = { isActive: true };

    // Text search (searches in title and author)
    if (search && search.trim()) {
      query.$text = { $search: search.trim() };
    }

    // Filter by category
    if (category && category !== 'all') {
      query.category = category;
    }

    // Filter by availability
    if (available === 'true') {
      query.availableCopies = { $gt: 0 };  // $gt = greater than
    }

    // Calculate pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;  // Skip records for pagination

    // Build sort object
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortObj = { [sortBy]: sortOrder };

    // Execute query with pagination
    const [books, totalCount] = await Promise.all([
      Book.find(query)
          .sort(sortObj)
          .skip(skip)
          .limit(limitNum),
      Book.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: books.length,
      total: totalCount,
      totalPages: Math.ceil(totalCount / limitNum),
      currentPage: pageNum,
      data: books
    });

  } catch (error) {
    next(error);  // Pass to error handler
  }
};

// ─────────────────────────────────────────
// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Public
// ─────────────────────────────────────────
const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book || !book.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.status(200).json({
      success: true,
      data: book
    });

  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// @desc    Get book by custom bookId
// @route   GET /api/books/code/:bookId
// @access  Public
// ─────────────────────────────────────────
const getBookByCode = async (req, res, next) => {
  try {
    const book = await Book.findOne({
      bookId: req.params.bookId.toUpperCase(),
      isActive: true
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `No book found with ID: ${req.params.bookId}`
      });
    }

    res.status(200).json({
      success: true,
      data: book
    });

  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// @desc    Add a new book (Admin only)
// @route   POST /api/books
// @access  Admin
// ─────────────────────────────────────────
const addBook = async (req, res, next) => {
  try {
    // Check for validation errors from express-validator
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      bookId, title, author, isbn, category,
      publisher, publishedYear, edition,
      shelfLocation, totalCopies, description
    } = req.body;

    // Check if book with this ID already exists
    const existingBook = await Book.findOne({
      bookId: bookId.toUpperCase()
    });

    if (existingBook) {
      return res.status(400).json({
        success: false,
        message: `A book with ID ${bookId} already exists`
      });
    }

    // Create new book
    const book = await Book.create({
      bookId: bookId.toUpperCase(),
      title,
      author,
      isbn,
      category,
      publisher,
      publishedYear,
      edition,
      shelfLocation,
      totalCopies: parseInt(totalCopies),
      availableCopies: parseInt(totalCopies), // Initially all copies available
      description
    });

    res.status(201).json({
      success: true,
      message: '✅ Book added successfully',
      data: book
    });

  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// @desc    Update a book's details
// @route   PUT /api/books/:id
// @access  Admin
// ─────────────────────────────────────────
const updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Fields that can be updated
    const allowedUpdates = [
      'title', 'author', 'isbn', 'category', 'publisher',
      'publishedYear', 'edition', 'shelfLocation',
      'description', 'coverImage'
    ];

    // Only update allowed fields
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        book[field] = req.body[field];
      }
    });

    // If total copies is updated, adjust available copies too
    if (req.body.totalCopies) {
      const oldTotal = book.totalCopies;
      const newTotal = parseInt(req.body.totalCopies);
      const issuedCopies = oldTotal - book.availableCopies;
      
      book.totalCopies = newTotal;
      book.availableCopies = Math.max(0, newTotal - issuedCopies);
    }

    const updatedBook = await book.save();

    res.status(200).json({
      success: true,
      message: '✅ Book updated successfully',
      data: updatedBook
    });

  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// @desc    Delete (deactivate) a book
// @route   DELETE /api/books/:id
// @access  Admin
// ─────────────────────────────────────────
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Soft delete: just mark as inactive (don't actually delete data)
    // This preserves historical records
    book.isActive = false;
    await book.save();

    res.status(200).json({
      success: true,
      message: '✅ Book removed from catalogue'
    });

  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// @desc    Get all unique categories
// @route   GET /api/books/categories
// @access  Public
// ─────────────────────────────────────────
const getCategories = async (req, res, next) => {
  try {
    const categories = await Book.distinct('category', { isActive: true });
    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  getBookByCode,
  addBook,
  updateBook,
  deleteBook,
  getCategories
};