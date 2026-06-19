import { useState } from 'react';
import { BookOpen, User, ArrowRightLeft } from 'lucide-react';
import api from '../services/api';

const IssuePage = () => {
  const [formData, setFormData] = useState({
    rollNumber: '',
    bookId: ''
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleIssueBook = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Automatically calculate a return due date (e.g., 14 days from today)
    const calculatedDueDate = new Date();
    calculatedDueDate.setDate(calculatedDueDate.getDate() + 14); 

    const payload = {
      ...formData,
      dueDate: calculatedDueDate.toISOString().split('T')[0] // Formats cleanly to YYYY-MM-DD
    };

    try {
      const response = await api.post('/issued-books', payload);
      alert(`📚 Book issued successfully! ID: ${response.data?.data?.issueId || response.data?.id || 'Success'}`);
      setFormData({ rollNumber: '', bookId: '' });
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || 'Failed to issue book. Please check details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        
        {/* Header Title Section */}
        <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
          <div className="p-2.5 bg-blue-100 rounded-xl">
            <ArrowRightLeft className="h-6 w-6 text-blue-700" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Issue a Book</h2>
            <p className="text-sm text-gray-500">Create a new student issuance ledger</p>
          </div>
        </div>

        <form onSubmit={handleIssueBook} className="space-y-5">
          
          {/* Roll Number Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
              <User className="h-4 w-4 text-gray-400" /> Student Roll Number
            </label>
            <input
              type="text"
              name="rollNumber"
              placeholder="e.g., 23BCON1821"
              value={formData.rollNumber}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all uppercase placeholder-gray-300"
              required
            />
          </div>

          {/* Book ID Field */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-gray-400" /> Book ID / Accession No.
            </label>
            <input
              type="text"
              name="bookId"
              placeholder="e.g., CS001"
              value={formData.bookId}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all uppercase placeholder-gray-300"
              required
            />
          </div>

          {/* Action Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-900 to-blue-700 text-white font-semibold py-3 rounded-xl shadow-md hover:from-blue-800 hover:to-blue-600 active:scale-[0.98] transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
          >
            {loading ? 'Processing...' : 'Confirm Issue Allocation'}
          </button>
        </form>

      </div>
    </div>
  );
};

export default IssuePage;