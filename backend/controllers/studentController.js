const { validationResult } = require('express-validator');
const Student = require('../models/Student');
const IssuedBook = require('../models/IssuedBook');

// ─────────────────────────────────────────
// @desc    Register a new student
// @route   POST /api/students
// @access  Admin
// ─────────────────────────────────────────
const registerStudent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { rollNumber, name, email, branch, semester, phone, maxCredits } = req.body;

    // Check if roll number already registered
    const existingStudent = await Student.findOne({
      rollNumber: rollNumber.toUpperCase()
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: `Student with roll number ${rollNumber} already registered`
      });
    }

    const student = await Student.create({
      rollNumber: rollNumber.toUpperCase(),
      name,
      email,
      branch,
      semester: parseInt(semester),
      phone,
      maxCredits: maxCredits || parseInt(process.env.MAX_BOOKS_PER_STUDENT) || 3
    });

    res.status(201).json({
      success: true,
      message: '✅ Student registered successfully',
      data: student
    });

  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// @desc    Get all students
// @route   GET /api/students
// @access  Admin
// ─────────────────────────────────────────
const getAllStudents = async (req, res, next) => {
  try {
    const { search, branch, page = 1, limit = 20 } = req.query;

    let query = { isActive: true };

    if (search) {
      // Search by name or roll number
      query.$or = [
        { name: { $regex: search, $options: 'i' } },  // case-insensitive
        { rollNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (branch) query.branch = branch;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [students, total] = await Promise.all([
      Student.find(query)
             .select('-__v')  // Exclude internal Mongoose field
             .sort({ rollNumber: 1 })
             .skip(skip)
             .limit(parseInt(limit)),
      Student.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      count: students.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      data: students
    });

  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// @desc    Get student by roll number (with issued books)
// @route   GET /api/students/roll/:rollNumber
// @access  Public
// ─────────────────────────────────────────
const getStudentByRoll = async (req, res, next) => {
  try {
    const student = await Student.findOne({
      rollNumber: req.params.rollNumber.toUpperCase(),
      isActive: true
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `No student found with roll number: ${req.params.rollNumber}`
      });
    }

    // Get all currently issued books for this student
    const issuedBooks = await IssuedBook.find({
      student: student._id,
      status: { $in: ['issued', 'overdue'] }
    }).populate('book', 'title author bookId category');
    // populate() fetches the full Book document instead of just the ID

    res.status(200).json({
      success: true,
      data: {
        ...student.toJSON(),
        currentlyIssuedBooks: issuedBooks
      }
    });

  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// @desc    Get student's full history
// @route   GET /api/students/roll/:rollNumber/history
// @access  Public
// ─────────────────────────────────────────
const getStudentHistory = async (req, res, next) => {
  try {
    const student = await Student.findOne({
      rollNumber: req.params.rollNumber.toUpperCase()
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Get complete issue history sorted by date
    const history = await IssuedBook.find({ student: student._id })
      .populate('book', 'title author bookId category')
      .sort({ issueDate: -1 }); // Most recent first

    res.status(200).json({
      success: true,
      count: history.length,
      data: {
        student: student,
        history: history
      }
    });

  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────
// @desc    Update student details
// @route   PUT /api/students/:id
// @access  Admin
// ─────────────────────────────────────────
const updateStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    const allowedUpdates = ['name', 'email', 'branch', 'semester', 'phone', 'maxCredits'];
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        student[field] = req.body[field];
      }
    });

    const updated = await student.save();

    res.status(200).json({
      success: true,
      message: '✅ Student updated successfully',
      data: updated
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerStudent,
  getAllStudents,
  getStudentByRoll,
  getStudentHistory,
  updateStudent
};