import { useState } from 'react';
import { RotateCcw, Search, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { issueAPI, studentAPI } from '../services/api';

const ReturnPage = () => {
  const [rollNumber, setRollNumber] = useState('');
  const [bookId, setBookId] = useState('');
  const [loading, setLoading] = useState(false);
  const [returnResult, setReturnResult] = useState(null);
  const [studentBooks, setStudentBooks] = useState([]);

  // Look up issued books for a student
  const lookupStudentBooks = async () => {
    if (!rollNumber.trim()) return toast.error('Enter roll number');
    try {
      const res = await studentAPI.getByRoll(rollNumber.trim());
      setStudentBooks(res.data.currentlyIssuedBooks || []);
      if (res.data.currentlyIssuedBooks?.length === 0) {
        toast.error(`${res.data.name} has no books to return`);
      } else {
        toast.success(`${res.data.name} has ${res.data.currentlyIssuedBooks?.length} book(s) issued`);
      }
    } catch (err) {
      toast.error(err.message);
      setStudentBooks([]);
    }
  };

  // Return the book
  const handleReturn = async () => {
    if (!rollNumber.trim() || !bookId.trim()) {
      return toast.error('Both Roll Number and Book ID are required');
    }

    setLoading(true);
    try {
      const res = await issueAPI.return({
        rollNumber: rollNumber.trim(),
        bookId: bookId.trim()
      });

      setReturnResult(res.data);
      toast.success(res.message);
      setBookId('');
      lookupStudentBooks(); // Refresh the list

    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = (dueDate) => new Date() > new Date(dueDate);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
          <RotateCcw className="h-8 w-8 text-orange-600" />
          <span>Return a Book</span>
        </h1>
        <p className="text-gray-500 mt-2">Enter roll number to see issued books, then return.</p>
      </div>

      {/* Fine info banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 mb-6 flex items-start space-x-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-semibold text-yellow-800">Fine Policy</p>
          <p className="text-yellow-700 text-sm">Books not returned by due date incur a fine of ₹2 per day.</p>
        </div>
      </div>

      {/* Student Roll Number Input */}
      <div className="card mb-6">
        <h2 className="font-bold text-gray-700 mb-3">Step 1: Lookup Student</h2>
        <div className="flex space-x-2">
          <input
            type="text"
            placeholder="Enter Roll Number (e.g., 21CSE001)"
            className="input-field flex-1"
            value={rollNumber}
            onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
            onKeyPress={(e) => e.key === 'Enter' && lookupStudentBooks()}
          />
          <button onClick={lookupStudentBooks} className="btn-primary">
            <Search className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Currently Issued Books */}
      {studentBooks.length > 0 && (
        <div className="card mb-6">
          <h2 className="font-bold text-gray-700 mb-3">
            Currently Issued Books ({studentBooks.length})
          </h2>
          <div className="space-y-3">
            {studentBooks.map((issue) => (
              <div
                key={issue._id}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                  bookId === issue.book?.bookId
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                }`}
                onClick={() => setBookId(issue.book?.bookId || '')}
              >
                <div>
                  <p className="font-semibold text-gray-800">{issue.book?.title}</p>
                  <p className="text-sm text-gray-500">{issue.book?.author}</p>
                  <p className="text-xs text-gray-400 font-mono">
                    ID: {issue.book?.bookId}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Due Date</p>
                  <p className={`text-sm font-semibold ${
                    isOverdue(issue.dueDate) ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {new Date(issue.dueDate).toLocaleDateString('en-IN')}
                  </p>
                  {isOverdue(issue.dueDate) && (
                    <p className="text-xs text-red-500">⚠️ OVERDUE</p>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">* Click on a book to select it for return</p>
        </div>
      )}

      {/* Book ID Input */}
      <div className="card mb-6">
        <h2 className="font-bold text-gray-700 mb-3">Step 2: Enter Book ID to Return</h2>
        <input
          type="text"
          placeholder="Enter Book ID (e.g., CS001)"
          className="input-field"
          value={bookId}
          onChange={(e) => setBookId(e.target.value.toUpperCase())}
        />
      </div>

      {/* Return Button */}
      <button
        onClick={handleReturn}
        disabled={loading || !rollNumber || !bookId}
        className="w-full btn-danger text-lg py-3 flex items-center justify-center space-x-2 mb-6"
      >
        {loading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
        ) : (
          <>
            <RotateCcw className="h-5 w-5" />
            <span>Confirm Return</span>
          </>
        )}
      </button>

      {/* Return Result */}
      {returnResult && (
        <div className={`card border-2 ${
          returnResult.fine > 0
            ? 'border-red-300 bg-red-50'
            : 'border-green-300 bg-green-50'
        }`}>
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className={`h-6 w-6 ${returnResult.fine > 0 ? 'text-orange-500' : 'text-green-600'}`} />
            <h3 className="font-bold text-xl">Return Processed!</h3>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Book</span>
              <span className="font-semibold">{returnResult.bookTitle}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Student</span>
              <span className="font-semibold">{returnResult.studentName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Return Date</span>
              <span className="font-semibold">
                {new Date(returnResult.returnDate).toLocaleDateString('en-IN')}
              </span>
            </div>
            <div className="flex justify-between border-t pt-2 mt-2">
              <span className="text-gray-600 font-bold">Fine Amount</span>
              <span className={`font-bold text-lg ${
                returnResult.fine > 0 ? 'text-red-600' : 'text-green-600'
              }`}>
                {returnResult.fine > 0 ? `₹${returnResult.fine}` : 'No Fine ✓'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReturnPage;