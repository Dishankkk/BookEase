require('dotenv').config();
const mongoose = require('mongoose');
const Student = require('./models/Student');
const Book = require('./models/Book');
const connectDB = require('./config/db');

const sampleBooks = [
  {
    bookId: 'CS001',
    title: 'Introduction to Algorithms',
    author: 'Thomas H. Cormen',
    isbn: '9780262033848',
    category: 'Computer Science',
    publisher: 'MIT Press',
    publishedYear: 2009,
    edition: '3rd',
    shelfLocation: 'CS-A1',
    totalCopies: 5,
    availableCopies: 5,
    description: 'The definitive reference for computer science algorithms'
  },
  {
    bookId: 'CS002',
    title: 'Clean Code',
    author: 'Robert C. Martin',
    isbn: '9780132350884',
    category: 'Computer Science',
    publisher: 'Prentice Hall',
    publishedYear: 2008,
    edition: '1st',
    shelfLocation: 'CS-A2',
    totalCopies: 3,
    availableCopies: 3,
    description: 'A handbook of agile software craftsmanship'
  },
  {
    bookId: 'CS003',
    title: 'JavaScript: The Good Parts',
    author: 'Douglas Crockford',
    category: 'Computer Science',
    publisher: "O'Reilly Media",
    publishedYear: 2008,
    shelfLocation: 'CS-B1',
    totalCopies: 4,
    availableCopies: 4,
    description: 'A deep dive into the good parts of JavaScript'
  },
  {
    bookId: 'MATH001',
    title: 'Higher Engineering Mathematics',
    author: 'B.S. Grewal',
    category: 'Mathematics',
    publisher: 'Khanna Publishers',
    publishedYear: 2020,
    edition: '44th',
    shelfLocation: 'MATH-A1',
    totalCopies: 10,
    availableCopies: 10,
    description: 'Essential mathematics for engineering students'
  },
  {
    bookId: 'CS004',
    title: 'Database System Concepts',
    author: 'Abraham Silberschatz',
    isbn: '9780073523323',
    category: 'Computer Science',
    publisher: 'McGraw-Hill',
    publishedYear: 2019,
    edition: '7th',
    shelfLocation: 'CS-C1',
    totalCopies: 6,
    availableCopies: 6,
    description: 'Complete guide to database management systems'
  },
  {
    bookId: 'CS005',
    title: 'Computer Networks',
    author: 'Andrew S. Tanenbaum',
    category: 'Computer Science',
    publisher: 'Pearson',
    publishedYear: 2010,
    edition: '5th',
    shelfLocation: 'CS-D1',
    totalCopies: 4,
    availableCopies: 4,
    description: 'Comprehensive guide to computer networking'
  },
  {
    bookId: 'CS006',
    title: 'Operating System Concepts',
    author: 'Abraham Silberschatz',
    isbn: '9781118063330',
    category: 'Computer Science',
    publisher: 'Wiley',
    publishedYear: 2018,
    edition: '10th',
    shelfLocation: 'CS-E1',
    totalCopies: 5,
    availableCopies: 5,
    description: 'The classic OS textbook known as the Dinosaur Book'
  },
  {
    bookId: 'CS007',
    title: 'The Pragmatic Programmer',
    author: 'Andrew Hunt',
    category: 'Computer Science',
    publisher: 'Addison-Wesley',
    publishedYear: 2019,
    edition: '2nd',
    shelfLocation: 'CS-F1',
    totalCopies: 3,
    availableCopies: 3,
    description: 'Your journey to mastery in software development'
  },
  {
    bookId: 'MATH002',
    title: 'Discrete Mathematics',
    author: 'Kenneth H. Rosen',
    category: 'Mathematics',
    publisher: 'McGraw-Hill',
    publishedYear: 2018,
    edition: '8th',
    shelfLocation: 'MATH-B1',
    totalCopies: 7,
    availableCopies: 7,
    description: 'Discrete mathematics and its applications'
  },
  {
    bookId: 'PHY001',
    title: 'Engineering Physics',
    author: 'Gaur and Gupta',
    category: 'Physics',
    publisher: 'Dhanpat Rai',
    publishedYear: 2018,
    shelfLocation: 'PHY-A1',
    totalCopies: 8,
    availableCopies: 8,
    description: 'Physics fundamentals for engineering students'
  }
];

const sampleStudents = [
  {
    rollNumber: '23BCON1821',
    name: 'Dishank Khatri',
    email: 'dishank.23bcon1821@jecrcu.edu.in',
    branch: 'CSE',
    semester: 4,
    phone: '9876543210',
    maxCredits: 3
  },
  {
    rollNumber: '23BCON1796',
    name: 'Anvesha Sindal',
    email: 'anvesha.23bcon1796@jecrcu.edu.in',
    branch: 'CSE',
    semester: 4,
    phone: '9876543211',
    maxCredits: 3
  },
  {
    rollNumber: '23BCON1631',
    name: 'Divya Shekhawat',
    email: 'divya.23bcon1631@jecrcu.edu.in',
    branch: 'CSE',
    semester: 4,
    phone: '9876543212',
    maxCredits: 3
  },
  {
    rollNumber: '23BCON1750',
    name: 'Rohan Sharma',
    email: 'rohan.sharma@jecrc.ac.in',
    branch: 'CSE',
    semester: 4,
    phone: '9876543213',
    maxCredits: 3
  },
  {
    rollNumber: '23BECE1045',
    name: 'Priya Verma',
    email: 'priya.verma@jecrc.ac.in',
    branch: 'ECE',
    semester: 4,
    phone: '9876543214',
    maxCredits: 3
  },
  {
    rollNumber: '23BCON1699',
    name: 'Aarav Joshi',
    email: 'aarav.joshi@jecrc.ac.in',
    branch: 'CSE',
    semester: 4,
    phone: '9876543215',
    maxCredits: 3
  }
];

const seedDatabase = async () => {
  try {
    await connectDB();
    console.log('🌱 Starting database seed...\n');

    // Clear existing data
    await Book.deleteMany({});
    await Student.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert books
    const books = await Book.insertMany(sampleBooks);
    console.log(`📚 Inserted ${books.length} books`);

    // Insert students
    const students = await Student.insertMany(sampleStudents);
    console.log(`👥 Inserted ${students.length} students`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Test Credentials:');
    console.log('   Roll Numbers: 23BCON1821, 23BCON1796, 23BCON1631');
    console.log('   Book IDs: CS001, CS002, CS003, MATH001, CS004');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error.message);
    process.exit(1);
  }
};

seedDatabase();