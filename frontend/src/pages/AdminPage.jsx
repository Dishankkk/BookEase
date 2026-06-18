import { useState, useEffect } from 'react';
import { BookOpen, Users, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { bookAPI, studentAPI, issueAPI } from '../services/api';

const AdminPage = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [issues, setIssues] = useState([]);
  const [formLoading, setFormLoading] = useState(false);

  const [bookForm, setBookForm] = useState({
    bookId: '',
    title: '',
    author: '',
    isbn: '',
    category: 'Computer Science',
    publisher: '',
    publishedYear: '',
    edition: '',
    shelfLocation: '',
    totalCopies: 1,
    description: ''
  });

  const [studentForm, setStudentForm] = useState({
    rollNumber: '',
    name: '',
    email: '',
    branch: 'CSE',
    semester: 6,
    phone: '',
    maxCredits: 3
  });

  // ─────────────────────────────────────────
  // Fetch data on page load
  // ─────────────────────────────────────────
  useEffect(() => {
    fetchStats();
    fetchIssues();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await issueAPI.getStats();
      setStats(res.data);
    } catch (err) {
      console.error('Failed to fetch stats:', err.message);
    }
  };

  const fetchIssues = async () => {
    try {
      const res = await issueAPI.getAll({ limit: 50 });
      setIssues(res.data || []);
    } catch (err) {
      console.error('Failed to fetch issues:', err.message);
    }
  };

  // ─────────────────────────────────────────
  // Handle Add Book form submit
  // ─────────────────────────────────────────
  const handleAddBook = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await bookAPI.create(bookForm);
      toast.success('Book added successfully!');
      setBookForm({
        bookId: '',
        title: '',
        author: '',
        isbn: '',
        category: 'Computer Science',
        publisher: '',
        publishedYear: '',
        edition: '',
        shelfLocation: '',
        totalCopies: 1,
        description: ''
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // Handle Add Student form submit
  // ─────────────────────────────────────────
  const handleAddStudent = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await studentAPI.register(studentForm);
      toast.success('Student registered successfully!');
      setStudentForm({
        rollNumber: '',
        name: '',
        email: '',
        branch: 'CSE',
        semester: 6,
        phone: '',
        maxCredits: 3
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setFormLoading(false);
    }
  };

  // ─────────────────────────────────────────
  // Reusable form input component
  // ─────────────────────────────────────────
  const FormInput = ({
    label,
    required,
    value,
    onChange,
    type = 'text',
    placeholder
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}{' '}
        {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-4 py-2
                   focus:outline-none focus:ring-2 focus:ring-blue-500
                   focus:border-transparent transition"
      />
    </div>
  );

  // ─────────────────────────────────────────
  // Static data
  // ─────────────────────────────────────────
  const tabs = [
    { id: 'dashboard',  label: '📊 Dashboard'  },
    { id: 'addBook',    label: '📚 Add Book'    },
    { id: 'addStudent', label: '👤 Add Student' },
    { id: 'allIssues',  label: '📋 All Issues'  }
  ];

  const categories = [
    'Computer Science', 'Mathematics', 'Physics',
    'Chemistry', 'Electronics', 'Mechanical',
    'Civil', 'Management', 'Literature',
    'History', 'Science', 'Reference', 'Other'
  ];

  const branches = ['CSE', 'ECE', 'ME', 'CE', 'EE', 'IT', 'Other'];

  const dashboardCards = [
    { label: 'Total Books',    value: stats?.books?.total          },
    { label: 'Available',      value: stats?.books?.available      },
    { label: 'Active Issues',  value: stats?.issues?.active        },
    { label: 'Overdue',        value: stats?.issues?.overdue       },
    { label: 'Students',       value: stats?.students?.total       },
    { label: 'Issued Today',   value: stats?.issues?.issuedToday   },
    { label: 'Returned Today', value: stats?.issues?.returnedToday }
  ];

  // ─────────────────────────────────────────
  // Shared select class
  // ─────────────────────────────────────────
  const selectClass = `w-full border border-gray-300 rounded-lg px-4 py-2
                       focus:outline-none focus:ring-2 focus:ring-blue-500
                       focus:border-transparent transition`;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Page Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        🔧 Admin Dashboard
      </h1>

      {/* Tab Navigation */}
      <div className="flex space-x-2 mb-6 border-b overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium text-sm transition-colors
                        border-b-2 -mb-px whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── DASHBOARD TAB ───────────────────── */}
      {activeTab === 'dashboard' && (
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {dashboardCards.map(item => (
              <div
                key={item.label}
                className="bg-white rounded-xl shadow-md p-6
                           border border-gray-100 text-center"
              >
                <p className="text-3xl font-bold text-gray-800">
                  {item.value ?? '...'}
                </p>
                <p className="text-gray-500 text-sm mt-1">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Overdue list preview */}
          {stats?.overdueList?.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <h3 className="font-bold text-red-800 mb-3">
                ⚠️ Overdue Books
              </h3>
              <div className="space-y-2">
                {stats.overdueList.map(item => (
                  <div
                    key={item._id}
                    className="flex justify-between items-center
                               bg-white rounded-lg p-3 border border-red-100"
                  >
                    <div>
                      <p className="font-semibold text-gray-800">
                        {item.student?.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {item.student?.rollNumber} — {item.book?.title}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">Due Date</p>
                      <p className="text-sm font-semibold text-red-600">
                        {new Date(item.dueDate).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── ADD BOOK TAB ────────────────────── */}
      {activeTab === 'addBook' && (
        <div className="bg-white rounded-xl shadow-md p-6
                        border border-gray-100 max-w-2xl">
          <h2 className="text-xl font-bold text-gray-800 mb-6
                         flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <span>Add New Book</span>
          </h2>

          <form
            onSubmit={handleAddBook}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <FormInput
              label="Book ID"
              required
              value={bookForm.bookId}
              placeholder="e.g., CS006"
              onChange={e =>
                setBookForm({ ...bookForm, bookId: e.target.value.toUpperCase() })
              }
            />
            <FormInput
              label="Title"
              required
              value={bookForm.title}
              placeholder="Book title"
              onChange={e =>
                setBookForm({ ...bookForm, title: e.target.value })
              }
            />
            <FormInput
              label="Author"
              required
              value={bookForm.author}
              placeholder="Author name"
              onChange={e =>
                setBookForm({ ...bookForm, author: e.target.value })
              }
            />
            <FormInput
              label="ISBN"
              value={bookForm.isbn}
              placeholder="ISBN number"
              onChange={e =>
                setBookForm({ ...bookForm, isbn: e.target.value })
              }
            />

            {/* Category dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                className={selectClass}
                value={bookForm.category}
                onChange={e =>
                  setBookForm({ ...bookForm, category: e.target.value })
                }
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <FormInput
              label="Publisher"
              value={bookForm.publisher}
              placeholder="Publisher name"
              onChange={e =>
                setBookForm({ ...bookForm, publisher: e.target.value })
              }
            />
            <FormInput
              label="Published Year"
              type="number"
              value={bookForm.publishedYear}
              placeholder="2023"
              onChange={e =>
                setBookForm({ ...bookForm, publishedYear: e.target.value })
              }
            />
            <FormInput
              label="Edition"
              value={bookForm.edition}
              placeholder="e.g., 3rd"
              onChange={e =>
                setBookForm({ ...bookForm, edition: e.target.value })
              }
            />
            <FormInput
              label="Shelf Location"
              value={bookForm.shelfLocation}
              placeholder="e.g., CS-A1"
              onChange={e =>
                setBookForm({ ...bookForm, shelfLocation: e.target.value })
              }
            />
            <FormInput
              label="Total Copies"
              required
              type="number"
              value={bookForm.totalCopies}
              placeholder="1"
              onChange={e =>
                setBookForm({ ...bookForm, totalCopies: e.target.value })
              }
            />

            {/* Description — full width */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={bookForm.description}
                placeholder="Brief book description..."
                onChange={e =>
                  setBookForm({ ...bookForm, description: e.target.value })
                }
                className="w-full border border-gray-300 rounded-lg px-4 py-2
                           focus:outline-none focus:ring-2 focus:ring-blue-500
                           focus:border-transparent transition"
              />
            </div>

            {/* Submit button — full width */}
            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white
                           font-semibold py-3 px-4 rounded-lg transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {formLoading ? 'Adding...' : '+ Add Book'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── ADD STUDENT TAB ─────────────────── */}
      {activeTab === 'addStudent' && (
        <div className="bg-white rounded-xl shadow-md p-6
                        border border-gray-100 max-w-2xl">
          <h2 className="text-xl font-bold text-gray-800 mb-6
                         flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-600" />
            <span>Register New Student</span>
          </h2>

          <form
            onSubmit={handleAddStudent}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            <FormInput
              label="Roll Number"
              required
              value={studentForm.rollNumber}
              placeholder="e.g., 21CSE001"
              onChange={e =>
                setStudentForm({
                  ...studentForm,
                  rollNumber: e.target.value.toUpperCase()
                })
              }
            />
            <FormInput
              label="Full Name"
              required
              value={studentForm.name}
              placeholder="Student full name"
              onChange={e =>
                setStudentForm({ ...studentForm, name: e.target.value })
              }
            />
            <FormInput
              label="Email"
              required
              type="email"
              value={studentForm.email}
              placeholder="student@jecrc.ac.in"
              onChange={e =>
                setStudentForm({ ...studentForm, email: e.target.value })
              }
            />
            <FormInput
              label="Phone"
              value={studentForm.phone}
              placeholder="10 digit number"
              onChange={e =>
                setStudentForm({ ...studentForm, phone: e.target.value })
              }
            />

            {/* Branch dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Branch <span className="text-red-500">*</span>
              </label>
              <select
                className={selectClass}
                value={studentForm.branch}
                onChange={e =>
                  setStudentForm({ ...studentForm, branch: e.target.value })
                }
              >
                {branches.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            <FormInput
              label="Semester"
              required
              type="number"
              value={studentForm.semester}
              placeholder="1 to 8"
              onChange={e =>
                setStudentForm({
                  ...studentForm,
                  semester: parseInt(e.target.value)
                })
              }
            />
            <FormInput
              label="Max Credits (Books Allowed)"
              required
              type="number"
              value={studentForm.maxCredits}
              placeholder="3"
              onChange={e =>
                setStudentForm({
                  ...studentForm,
                  maxCredits: parseInt(e.target.value)
                })
              }
            />

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-green-600 hover:bg-green-700 text-white
                           font-semibold py-3 px-4 rounded-lg transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed text-lg"
              >
                {formLoading ? 'Registering...' : '+ Register Student'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── ALL ISSUES TAB ──────────────────── */}
      {activeTab === 'allIssues' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">
              All Issues ({issues.length})
            </h2>
            <button
              onClick={fetchIssues}
              className="flex items-center space-x-1 bg-gray-200
                         hover:bg-gray-300 text-gray-800 font-semibold
                         py-2 px-4 rounded-lg transition-colors text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Refresh</span>
            </button>
          </div>

          {issues.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-gray-400 text-lg">No issue records found</p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="px-4 py-3 font-semibold text-gray-600">
                      Roll No.
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-600">
                      Book
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-600">
                      Issue Date
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-600">
                      Due Date
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="px-4 py-3 font-semibold text-gray-600">
                      Fine
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {issues.map(issue => (
                    <tr key={issue._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-semibold text-blue-700">
                        {issue.student?.rollNumber || issue.rollNumber}
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-medium text-gray-800">
                          {issue.book?.title}
                        </p>
                        <p className="text-gray-400 text-xs">
                          {issue.book?.bookId}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(issue.issueDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(issue.dueDate).toLocaleDateString('en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5
                                      rounded-full text-xs font-medium ${
                            issue.status === 'returned'
                              ? 'bg-green-100 text-green-700'
                              : issue.status === 'overdue'
                              ? 'bg-red-100 text-red-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}
                        >
                          {issue.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-700">
                        {issue.fine > 0 ? `₹${issue.fine}` : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

    </div>
  );
};

export default AdminPage;