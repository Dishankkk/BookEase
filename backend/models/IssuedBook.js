const mongoose = require('mongoose');

const issuedBookSchema = new mongoose.Schema(
  {
    // Reference to which student issued this book
    // mongoose.Schema.Types.ObjectId → This links to the Student collection
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',         // 'Student' refers to the Student model
      required: [true, 'Student reference is required']
    },

    // We also store rollNumber directly for quick lookups
    rollNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    // Reference to which book was issued
    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book reference is required']
    },

    // Store bookId directly for quick lookups
    bookId: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    // Date when book was issued
    issueDate: {
      type: Date,
      default: Date.now
    },

    // Date when book is due for return (default: 14 days from issue)
    dueDate: {
      type: Date,
      required: true
    },

    // Date when book was actually returned (null if not returned yet)
    returnDate: {
      type: Date,
      default: null
    },

    // Current status of this record
    status: {
      type: String,
      enum: {
        values: ['issued', 'returned', 'overdue'],
        message: '{VALUE} is not a valid status'
      },
      default: 'issued'
    },

    // Fine amount (if returned late)
    // Fine = ₹2 per day after due date
    fine: {
      type: Number,
      default: 0,
      min: 0
    },

    // Has fine been paid?
    finePaid: {
      type: Boolean,
      default: false
    },

    // Admin notes
    remarks: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true
  }
);

// ──────────────────────────────────────────────
// VIRTUAL: Calculate how many days overdue
// ──────────────────────────────────────────────
issuedBookSchema.virtual('daysOverdue').get(function () {
  if (this.status === 'returned') return 0;
  
  const today = new Date();
  const due = new Date(this.dueDate);
  
  if (today <= due) return 0;  // Not overdue
  
  const diffTime = Math.abs(today - due);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// ──────────────────────────────────────────────
// PRE-SAVE HOOK: Auto-calculate fine before saving
// This runs automatically every time we save a record
// ──────────────────────────────────────────────
issuedBookSchema.pre('save', function (next) {
  // If book is returned or overdue, calculate fine
  if (this.status !== 'issued') {
    const checkDate = this.returnDate || new Date();
    const dueDate = new Date(this.dueDate);
    
    if (checkDate > dueDate) {
      const diffTime = checkDate - dueDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      this.fine = diffDays * 2; // ₹2 per day fine
    }
  }
  next();
});

issuedBookSchema.set('toJSON', { virtuals: true });
issuedBookSchema.set('toObject', { virtuals: true });

// ──────────────────────────────────────────────
// INDEXES
// ──────────────────────────────────────────────
issuedBookSchema.index({ student: 1, status: 1 });
issuedBookSchema.index({ rollNumber: 1 });
issuedBookSchema.index({ book: 1 });
issuedBookSchema.index({ status: 1 });
issuedBookSchema.index({ dueDate: 1 });

const IssuedBook = mongoose.model('IssuedBook', issuedBookSchema);

module.exports = IssuedBook;