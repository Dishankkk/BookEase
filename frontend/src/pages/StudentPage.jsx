import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, BookOpen, Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { studentAPI } from '../services/api';

const StudentPage = () => {
  const { rollNumber } = useParams();
  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        const res = await studentAPI.getHistory(rollNumber);
        setStudent(res.data.student);
        setHistory(res.data.history);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStudentData();
  }, [rollNumber]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12
                        border-4 border-blue-600 border-t-transparent">
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-700">Student Not Found</h2>
        <p className="text-gray-500 mt-2">{error}</p>
        <Link
          to="/"
          className="mt-4 inline-block bg-blue-600 text-white
                     px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Go Home
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">

      {/* Student Info Card */}
      <div className="bg-white rounded-xl shadow-md p-6
                      border border-gray-100 mb-6">
        <div className="flex items-center space-x-4">
          <div className="bg-blue-100 p-4 rounded-full">
            <User className="h-10 w-10 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              {student?.name}
            </h1>
            <p className="text-gray-500 font-mono">{student?.rollNumber}</p>
            <p className="text-gray-400 text-sm">
              {student?.branch} — Semester {student?.semester}
            </p>
          </div>
        </div>

        {/* Credit bar */}
        <div className="mt-6">
          <div className="flex justify-between text-sm mb-2">
            <span className="font-medium text-gray-700">Books Issued</span>
            <span className="font-bold text-gray-800">
              {student?.usedCredits} / {student?.maxCredits}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all ${
                student?.usedCredits === student?.maxCredits
                  ? 'bg-red-500'
                  : 'bg-blue-500'
              }`}
              style={{
                width: `${(student?.usedCredits / student?.maxCredits) * 100}%`
              }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {student?.maxCredits - student?.usedCredits} credit(s) remaining
          </p>
        </div>
      </div>

      {/* Issue History */}
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Issue History ({history.length})
      </h2>

      {history.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl
                        border border-gray-100 shadow-md">
          <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">No books issued yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {history.map(issue => (
            <div
              key={issue._id}
              className="bg-white rounded-xl border border-gray-100
                         shadow-sm p-4 flex items-center justify-between"
            >
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-full ${
                  issue.status === 'returned'
                    ? 'bg-green-100'
                    : issue.status === 'overdue'
                    ? 'bg-red-100'
                    : 'bg-yellow-100'
                }`}>
                  {issue.status === 'returned'
                    ? <CheckCircle className="h-5 w-5 text-green-600" />
                    : issue.status === 'overdue'
                    ? <AlertTriangle className="h-5 w-5 text-red-600" />
                    : <Clock className="h-5 w-5 text-yellow-600" />
                  }
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {issue.book?.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    {issue.book?.author}
                  </p>
                  <p className="text-xs text-gray-400 font-mono">
                    {issue.book?.bookId}
                  </p>
                </div>
              </div>

              <div className="text-right text-sm">
                <p className="text-gray-500">
                  Issued:{' '}
                  {new Date(issue.issueDate).toLocaleDateString('en-IN')}
                </p>
                <p className="text-gray-500">
                  Due:{' '}
                  {new Date(issue.dueDate).toLocaleDateString('en-IN')}
                </p>
                {issue.returnDate && (
                  <p className="text-green-600 font-medium">
                    Returned:{' '}
                    {new Date(issue.returnDate).toLocaleDateString('en-IN')}
                  </p>
                )}
                {issue.fine > 0 && (
                  <p className="text-red-600 font-bold">
                    Fine: ₹{issue.fine}
                  </p>
                )}
                <span className={`inline-flex items-center px-2 py-0.5
                                  rounded-full text-xs font-medium mt-1 ${
                  issue.status === 'returned'
                    ? 'bg-green-100 text-green-700'
                    : issue.status === 'overdue'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {issue.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentPage;