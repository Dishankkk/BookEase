const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema(
  {
    // Unique identifier for the book (like ISBN but custom)
    bookId: {
      type: String,
      required: [true, 'Book ID is required'],
      unique: true,
      uppercase: true,
      trim: true
    },

    // Book title
    title: {
      type: String,
      required: [true, 'Book title is required'],
      trim: true,
      minlength: [1, 'Title cannot be empty'],
      maxlength: [300, 'Title too long']
    },

    // Author name(s)
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true
    },

    // ISBN number (optional but good to have)
    isbn: {
      type: String,
      trim: true,
      sparse: true  // Allow multiple null values (some books may not have ISBN)
    },

    // Book category/genre
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: {
        values: [
          'Computer Science',
          'Mathematics',
          'Physics',
          'Chemistry',
          'Electronics',
          'Mechanical',
          'Civil',
          'Management',
          'Literature',
          'History',
          'Science',
          'Reference',
          'Other'
        ],
        message: '{VALUE} is not a valid category'
      }
    },

    // Publisher information
    publisher: {
      type: String,
      trim: true
    },

    // Year published
    publishedYear: {
      type: Number,
      min: [1800, 'Year seems too old'],
      max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
    },

    // Edition number
    edition: {
      type: String,
      trim: true
    },

    // Where is the book located in the library?
    shelfLocation: {
      type: String,
      trim: true,
      // Example: "A-12" means Shelf A, Position 12
    },

    // Total number of copies owned by the library
    totalCopies: {
      type: Number,
      required: [true, 'Total copies is required'],
      min: [1, 'Must have at least 1 copy'],
      default: 1
    },

    // Currently available copies (totalCopies - issued copies)
    availableCopies: {
      type: Number,
      min: [0, 'Available copies cannot be negative'],
      default: 1
    },

    // Short description of the book
    description: {
      type: String,
      maxlength: [1000, 'Description too long']
    },

    // Book cover image URL (optional)
    coverImage: {
      type: String,
      default: ''
    },

    // Is this book active in the system?
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true  // Adds createdAt and updatedAt automatically
  }
);

// ──────────────────────────────────────────────
// VIRTUAL FIELD: Is the book currently available?
// ──────────────────────────────────────────────
bookSchema.virtual('isAvailable').get(function () {
  return this.availableCopies > 0 && this.isActive;
});

bookSchema.set('toJSON', { virtuals: true });
bookSchema.set('toObject', { virtuals: true });

// ──────────────────────────────────────────────
// INDEXES FOR FAST SEARCH
// ──────────────────────────────────────────────
bookSchema.index({ bookId: 1 });
bookSchema.index({ title: 'text', author: 'text' }); // Full-text search
bookSchema.index({ category: 1 });
bookSchema.index({ availableCopies: 1 });

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;