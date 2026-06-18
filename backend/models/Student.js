const mongoose = require('mongoose');

// Define what a Student document looks like in MongoDB
const studentSchema = new mongoose.Schema(
  {
    // Roll number is the unique identifier for each student
    rollNumber: {
      type: String,
      required: [true, 'Roll number is required'],
      unique: true,
      uppercase: true,        // Always store as uppercase
      trim: true,             // Remove extra spaces
      match: [
        /^[A-Z0-9]+$/,        // Only letters and numbers allowed
        'Roll number can only contain letters and numbers'
      ]
    },

    // Student's full name
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name cannot exceed 100 characters']
    },

    // Student's email address
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email address'
      ]
    },

    // Which branch/department
    branch: {
      type: String,
      required: [true, 'Branch is required'],
      enum: {
        values: ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'Other'],
        message: '{VALUE} is not a valid branch'
      }
    },

    // Which semester (1-8)
    semester: {
      type: Number,
      required: [true, 'Semester is required'],
      min: [1, 'Semester must be between 1 and 8'],
      max: [8, 'Semester must be between 1 and 8']
    },

    // Phone number (optional)
    phone: {
      type: String,
      match: [/^[0-9]{10}$/, 'Phone number must be 10 digits']
    },

    // Credits system
    // maxCredits: maximum books this student can have at one time
    // usedCredits: how many books currently issued
    maxCredits: {
      type: Number,
      default: 3,       // Default: 3 books maximum
      min: 0,
      max: 10
    },

    usedCredits: {
      type: Number,
      default: 0,       // Starts at 0 (no books issued)
      min: 0
    },

    // Is this student account active?
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    // Automatically add createdAt and updatedAt fields
    timestamps: true
  }
);

// ──────────────────────────────────────────────
// VIRTUAL FIELD: Calculate remaining credits
// Virtual fields are computed, not stored in DB
// ──────────────────────────────────────────────
studentSchema.virtual('remainingCredits').get(function () {
  return this.maxCredits - this.usedCredits;
});

// Make virtual fields appear in JSON responses
studentSchema.set('toJSON', { virtuals: true });
studentSchema.set('toObject', { virtuals: true });

// ──────────────────────────────────────────────
// METHODS: Custom functions on student documents
// ──────────────────────────────────────────────

// Check if student can issue more books
studentSchema.methods.canIssueBook = function () {
  return this.usedCredits < this.maxCredits && this.isActive;
};

// ──────────────────────────────────────────────
// INDEXES: Speed up database searches
// ──────────────────────────────────────────────
studentSchema.index({ rollNumber: 1 });
studentSchema.index({ email: 1 });
studentSchema.index({ name: 'text' }); // Text search on name

const Student = mongoose.model('Student', studentSchema);

module.exports = Student;