const express = require('express');
const router = express.Router();
const { body } = require('express-validator');

const {
  registerStudent,
  getAllStudents,
  getStudentByRoll,
  getStudentHistory,
  updateStudent
} = require('../controllers/studentController');

const studentValidation = [
  body('rollNumber').notEmpty().withMessage('Roll number is required'),
  body('name').notEmpty().withMessage('Name is required').isLength({ min: 2 }),
  body('email').isEmail().withMessage('Valid email is required'),
  body('branch').notEmpty().withMessage('Branch is required'),
  body('semester').isInt({ min: 1, max: 8 }).withMessage('Semester must be 1-8')
];

router.route('/').get(getAllStudents).post(studentValidation, registerStudent);
router.get('/roll/:rollNumber', getStudentByRoll);
router.get('/roll/:rollNumber/history', getStudentHistory);
router.put('/:id', updateStudent);

module.exports = router;