import { useState, useEffect, useCallback } from 'react';
import { Search, Filter, BookOpen, CheckCircle, XCircle } from 'lucide-react';
import { bookAPI } from '../services/api';
import toast from 'react-hot-toast';

const BooksPage = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [available, setAvailable] = useState('');
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0
  });

  // Fetch categories once on mount
  useEffect(() => {
    bookAPI.getCategories()
      .then(res => setCategories(res.data || []))
      .catch(() => {});
  }, []);

  // Fetch books whenever search/filter/page changes
  const fetchBooks = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: 12 };
      if (search.trim()) params.search = search.trim();
      if (category !== 'all') params.category = category;
      if (available) params.available = available;

      const res = await bookAPI.getAll(params);
      setBooks(res.data || []);
      setPagination({
        currentPage: res.currentPage || 1,
        totalPages: res.totalPages || 1,
        total: res.total || 0
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, category, available]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => fetchBooks(1), 500);
    return () => clearTimeout(timer);
  }, [fetchBooks]);

  const BookCard = ({ book }) => (
    <div className="card hover:shadow-lg transition-shadow">
      {/* Availability badge */}
      <div className="flex justify-between items-start mb-3">
        <span className={`badge ${
          book.availableCopies > 0
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}>
          {book.availableCopies > 0
            ? `✓ ${book.availableCopies} Available`
            : '✗ Not Available'}
        </span>
        <span className="badge bg-blue-100 text-blue-700">
          {book.category}
        </span>
      </div>

      {/* Book icon */}
      <div className="bg-blue-50 rounded-lg p-6 flex items-center justify-center mb-4">
        <BookOpen className="h-12 w-12 text-blue-400" />
      </div>

      {/* Book details */}
      <h3 className="font-bold text-gray-800 text-lg leading-tight line-clamp-2">
        {book.title}
      </h3>
      <p className="text-gray-500 text-sm mt-1">{book.author}</p>

      <div className="mt-3 border-t pt-3 space-y-1 text-sm text-gray-500">
        <p>📚 ID: <span className="font-mono font-semibold text-gray-700">{book.bookId}</span></p>
        {book.shelfLocation && <p>📍 Shelf: {book.shelfLocation}</p>}
        {book.publishedYear && <p>📅 {book.publishedYear}{book.edition ? ` | ${book.edition} Ed.` : ''}</p>}
        <p>📦 {book.availableCopies} of {book.totalCopies} copies available</p>
      </div>

      {/* Issue button */}
      {book.availableCopies > 0 && (
        <a
          href={`/issue`}
          className="mt-4 block text-center btn-primary text-sm"
        >
          Issue This Book
        </a>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">📚 Book Catalogue</h1>
        <p className="text-gray-500 mt-1">Browse our complete collection of {pagination.total} books</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="relative md:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by title or author..."
              className="input-field pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <select
            className="input-field"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Availability Filter */}
          <select
            className="input-field"
            value={available}
            onChange={(e) => setAvailable(e.target.value)}
          >
            <option value="">All Books</option>
            <option value="true">Available Only</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <p className="text-gray-500 text-sm mb-4">
        Showing {books.length} of {pagination.total} books
      </p>

      {/* Books Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
        </div>
      ) : books.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-500">No books found</h3>
          <p className="text-gray-400 mt-1">Try a different search term or filter</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map(book => (
              <BookCard key={book._id} book={book} />
            ))}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: pagination.totalPages }, (_, i) => (
                <button
                  key={i + 1}
                  onClick={() => fetchBooks(i + 1)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    pagination.currentPage === i + 1
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 border hover:bg-gray-50'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default BooksPage;