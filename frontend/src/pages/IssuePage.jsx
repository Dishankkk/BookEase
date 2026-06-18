const mongoose = require('mongoose');

const issuedBookSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student reference is required']
    },

    rollNumber: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    book: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      required: [true, 'Book reference is required']
    },

    bookId: {
      type: String,
      required: true,
      uppercase: true,
      trim: true
    },

    issueDate: {
      type: Date,
      default: Date.now
    },

    dueDate: {
      type: Date,
      required: true
    },

    returnDate: {
      type: Date,
      default: null
    },

    status: {
      type: String,
      enum: {
        values: ['issued', 'returned', 'overdue'],
        message: '{VALUE} is not a valid status'
      },
      default: 'issued'
    },

    fine: {
      type: Number,
      default: 0,
      min: 0
    },

    finePaid: {
      type: Boolean,
      default: false
    },

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
// VIRTUAL: Calculate days overdue
// ──────────────────────────────────────────────
issuedBookSchema.virtual('daysOverdue').get(function () {
  if (this.status === 'returned') return 0;

  const today = new Date();
  const due = new Date(this.dueDate);

  if (today <= due) return 0;

  const diffTime = Math.abs(today - due);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// ──────────────────────────────────────────────
// PRE-SAVE HOOK — Fixed version
// Using async/await instead of next() callback
// ──────────────────────────────────────────────
issuedBookSchema.pre('save', async function () {
  // Only calculate fine if book is being returned or marked overdue
  if (this.status !== 'issued') {
    const checkDate = this.returnDate || new Date();
    const dueDate = new Date(this.dueDate);

    if (checkDate > dueDate) {
      const diffTime = checkDate - dueDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      this.fine = diffDays * 2; // ₹2 per day
    }
  }
  // No next() needed with async/await
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