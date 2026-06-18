const IssuedBook = require('../models/IssuedBook');
const Book = require('../models/Book');
const Student = require('../models/Student');

// Helper: Calculate due date (14 days from today)
const calculateDueDate = () => {
  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 14); // 14 days loan period
  return dueDate;
};

// ─────────────────────────────────────────
// @desc    Issue a book to a student
// @route   POST /api/issues/issue
// @access  Admin/Librarian
// ─────────────────────────────────────────
const issueBook = async (req, res, next) => {
  try {
    const { rollNumber, bookId } = req.body;

    // VALIDATION STEP 1: Check required fields
    if (!rollNumber || !bookId) {
      return res.status(400).json({
        success: false,
        message: 'Roll number and Book ID are required'
      });
    }

    // VALIDATION STEP 2: Find the student
    const student = await Student.findOne({
      rollNumber: rollNumber.toUpperCase(),
      isActive: true
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with roll number ${rollNumber} not found`
      });
    }

    // VALIDATION STEP 3: Check if student can issue more books
    if (!student.canIssueBook()) {
      return res.status(400).json({
        success: false,
        message: `Student ${student.name} has reached the maximum book limit (${student.maxCredits} books). Please return a book before issuing a new one.`
      });
    }

    // VALIDATION STEP 4: Find the book
    const book = await Book.findOne({
      bookId: bookId.toUpperCase(),
      isActive: true
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: `Book with ID ${bookId} not found`
      });
    }

    // VALIDATION STEP 5: Check if book is available
    if (book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: `"${book.title}" is currently not available. All copies are issued.`
      });
    }

    // VALIDATION STEP 6: Check if student already has THIS book
    const alreadyIssued = await IssuedBook.findOne({
      student: student._id,
      book: book._id,
      status: { $in: ['issued', 'overdue'] }
    });

    if (alreadyIssued) {
      return res.status(400).json({
        success: false,
        message: `Student ${student.name} already has "${book.title}" issued`
      });
    }

    // ✅ All validations passed! Now issue the book

    // Create issue record
    const issuedBook = await IssuedBook.create({
      student: student._id,
      rollNumber: student.rollNumber,
      book: book._id,
      bookId: book.bookId,
      issueDate: new Date(),
      dueDate: calculateDueDate(),
      status: 'issued'
    });

    // Update book availability (decrease by 1)
    await Book.findByIdAndUpdate(book._id, {
      $inc: { availableCopies: -1 }  // $inc decrements by 1
    });

    // Update student's used credits (increase by 1)
    await Student.findByIdAndUpdate(student._id, {
      $inc: { usedCredits: 1 }
    });

    // Fetch the created record with populated data
    const populatedIssue = await IssuedBook.findById(issuedBook._id)
      .populate('student', 'rollNumber name email branch')
      .populate('book', 'bookId title author category shelfLocation');

    res.status(201).json({
      success: true,
      message: `✅ "${book.title}" issued successfully to ${student.name}`,
      data: populatedIssue
    });

  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// @desc    Return a book
// @route   POST /api/issues/return
// @access  Admin/Librarian
// ─────────────────────────────────────────
const returnBook = async (req, res, next) => {
  try {
    const { rollNumber, bookId } = req.body;

    if (!rollNumber || !bookId) {
      return res.status(400).json({
        success: false,
        message: 'Roll number and Book ID are required'
      });
    }

    // Find the student
    const student = await Student.findOne({
      rollNumber: rollNumber.toUpperCase()
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Find the book
    const book = await Book.findOne({
      bookId: bookId.toUpperCase()
    });

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Find the issued record
    const issuedRecord = await IssuedBook.findOne({
      student: student._id,
      book: book._id,
      status: { $in: ['issued', 'overdue'] }
    });

    if (!issuedRecord) {
      return res.status(404).json({
        success: false,
        message: `No active issue record found for ${student.rollNumber} with book ${bookId}`
      });
    }

    // Calculate fine if overdue
    const returnDate = new Date();
    const dueDate = new Date(issuedRecord.dueDate);
    let fine = 0;

    if (returnDate > dueDate) {
      const diffTime = returnDate - dueDate;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      fine = diffDays * 2; // ₹2 per day
    }

    // Update the issue record
    issuedRecord.returnDate = returnDate;
    issuedRecord.status = 'returned';
    issuedRecord.fine = fine;
    await issuedRecord.save();

    // Increase book availability
    await Book.findByIdAndUpdate(book._id, {
      $inc: { availableCopies: 1 }
    });

    // Decrease student's used credits
    await Student.findByIdAndUpdate(student._id, {
      $inc: { usedCredits: -1 }
    });

    const responseMessage = fine > 0
      ? `✅ "${book.title}" returned. Fine: ₹${fine} (${Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24))} days overdue)`
      : `✅ "${book.title}" returned successfully. No fine.`;

    res.status(200).json({
      success: true,
      message: responseMessage,
      data: {
        ...issuedRecord.toJSON(),
        bookTitle: book.title,
        studentName: student.name,
        fine: fine,
        isOverdue: fine > 0
      }
    });

  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// @desc    Get all issued books
// @route   GET /api/issues
// @access  Admin
// ─────────────────────────────────────────
const getAllIssues = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;

    let query = {};
    if (status) query.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [issues, total] = await Promise.all([
      IssuedBook.find(query)
        .populate('student', 'rollNumber name branch semester')
        .populate('book', 'bookId title author category')
        .sort({ issueDate: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      IssuedBook.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: issues.length,
      total,
      data: issues
    });

  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// @desc    Get dashboard statistics
// @route   GET /api/issues/stats
// @access  Admin
// ─────────────────────────────────────────
const getDashboardStats = async (req, res, next) => {
  try {
    // Run all queries at the same time for performance
    const [
      totalBooks,
      availableBooks,
      totalStudents,
      activeIssues,
      overdueIssues,
      returnedToday,
      issuedToday
    ] = await Promise.all([
      Book.countDocuments({ isActive: true }),
      Book.countDocuments({ isActive: true, availableCopies: { $gt: 0 } }),
      Student.countDocuments({ isActive: true }),
      IssuedBook.countDocuments({ status: 'issued' }),
      IssuedBook.countDocuments({ status: 'overdue' }),
      IssuedBook.countDocuments({
        status: 'returned',
        returnDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))  // Today at midnight
        }
      }),
      IssuedBook.countDocuments({
        status: 'issued',
        issueDate: {
          $gte: new Date(new Date().setHours(0, 0, 0, 0))
        }
      })
    ]);

    // Get overdue issues list
    const overdueList = await IssuedBook.find({
      status: 'issued',
      dueDate: { $lt: new Date() }  // Due date is in the past
    })
    .populate('student', 'rollNumber name phone')
    .populate('book', 'title bookId')
    .sort({ dueDate: 1 })
    .limit(10);

    // Auto-mark overdue (update status)
    await IssuedBook.updateMany(
      { status: 'issued', dueDate: { $lt: new Date() } },
      { $set: { status: 'overdue' } }
    );

    res.status(200).json({
      success: true,
      data: {
        books: {
          total: totalBooks,
          available: availableBooks,
          issued: totalBooks - availableBooks
        },
        students: {
          total: totalStudents
        },
        issues: {
          active: activeIssues,
          overdue: overdueIssues,
          returnedToday,
          issuedToday
        },
        overdueList
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  issueBook,
  returnBook,
  getAllIssues,
  getDashboardStats
};