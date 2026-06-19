import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, ArrowRightLeft, AlertTriangle, TrendingUp } from 'lucide-react';
import { issueAPI } from '../services/api';

// =========================================================================
// 1. HELPER COMPONENTS (DEFINED OUTSIDE HOME PAGE TO REMOVE REDLINES)
// =========================================================================

const StatCard = ({ title, value, subtitle, icon: Icon, color, bgColor, loading }) => (
  <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 flex items-center space-x-4">
    <div className={`p-3 rounded-full ${bgColor}`}>
      <Icon className={`h-7 w-7 ${color}`} />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <p className="text-3xl font-bold text-gray-800">
        {loading ? '...' : value}
      </p>
      {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
    </div>
  </div>
);

const QuickAction = ({ title, desc, to, color, icon: Icon }) => (
  <Link to={to} className="bg-white rounded-xl shadow-md p-6 border border-gray-100 hover:shadow-lg transition-shadow group block">
    <div className={`w-12 h-12 rounded-full ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <h3 className="font-bold text-gray-800 text-lg">{title}</h3>
    <p className="text-gray-500 text-sm mt-1">{desc}</p>
  </Link>
);


// =========================================================================
// 2. MAIN DASHBOARD COMPONENT
// =========================================================================

const HomePage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await issueAPI.getStats();
        setStats(response.data?.data || response.data);
      } catch (err) {
        console.error('Failed to load stats:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center space-x-3 mb-3">
          <BookOpen className="h-10 w-10 text-blue-200" />
          <div>
            <h1 className="text-3xl font-bold">JECRC University Library</h1>
            <p className="text-blue-200">Library Management System</p>
          </div>
        </div>
        <p className="text-blue-100 text-lg mt-2">
          Search books, issue, and return them with your college roll number.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            to="/books"
            className="bg-white text-blue-900 font-semibold px-6 py-2 rounded-lg hover:bg-blue-50 transition-colors"
          >
            Browse Books
          </Link>
          <Link
            to="/issue"
            className="border-2 border-white text-white font-semibold px-6 py-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            Issue a Book
          </Link>
        </div>
      </div>

      {/* Statistics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Books"
          value={stats?.books?.total ?? 0}
          subtitle={`${stats?.books?.available ?? 0} available`}
          icon={BookOpen}
          color="text-blue-600"
          bgColor="bg-blue-100"
          loading={loading}
        />
        <StatCard
          title="Registered Students"
          value={stats?.students?.total ?? 0}
          icon={Users}
          color="text-green-600"
          bgColor="bg-green-100"
          loading={loading}
        />
        <StatCard
          title="Active Issues"
          value={stats?.issues?.active ?? 0}
          subtitle={`${stats?.issues?.issuedToday ?? 0} issued today`}
          icon={ArrowRightLeft}
          color="text-orange-600"
          bgColor="bg-orange-100"
          loading={loading}
        />
        <StatCard
          title="Overdue Books"
          value={stats?.issues?.overdue ?? 0}
          subtitle="Need attention"
          icon={AlertTriangle}
          color="text-red-600"
          bgColor="bg-red-100"
          loading={loading}
        />
      </div>

      {/* Quick Actions */}
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <QuickAction
          title="Search Books"
          desc="Find books by title, author, or category"
          to="/books"
          color="bg-blue-600"
          icon={BookOpen}
        />
        <QuickAction
          title="Issue Book"
          desc="Issue a book using your roll number"
          to="/issue"
          color="bg-green-600"
          icon={ArrowRightLeft}
        />
        <QuickAction
          title="Return Book"
          desc="Return a book and check for fines"
          to="/return"
          color="bg-orange-500"
          icon={ArrowRightLeft}
        />
        <QuickAction
          title="Admin Panel"
          desc="Manage books, students, and reports"
          to="/admin"
          color="bg-purple-600"
          icon={TrendingUp}
        />
      </div>

      {/* Overdue Alert */}
      {stats?.issues?.overdue > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-center space-x-3">
          <AlertTriangle className="h-6 w-6 text-red-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-800">
              {stats.issues.overdue} book(s) are overdue!
            </p>
            <p className="text-red-600 text-sm">
              Fine of ₹2/day applies. Please return overdue books immediately.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomePage;