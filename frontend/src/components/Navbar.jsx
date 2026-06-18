import { Link, useLocation } from 'react-router-dom';
import { BookOpen, Search, ArrowRightLeft, User, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();

  // Helper to check if a link is currently active
  const isActive = (path) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home', icon: BookOpen },
    { path: '/books', label: 'Browse Books', icon: Search },
    { path: '/issue', label: 'Issue Book', icon: ArrowRightLeft },
    { path: '/return', label: 'Return Book', icon: ArrowRightLeft },
    { path: '/admin', label: 'Admin', icon: LayoutDashboard }
  ];

  return (
    <nav className="bg-blue-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo / Brand */}
          <Link to="/" className="flex items-center space-x-2 hover:opacity-90">
            <BookOpen className="h-8 w-8 text-blue-300" />
            <div>
              <span className="text-xl font-bold">JECRC Library</span>
              <span className="text-xs text-blue-300 block leading-none">Management System</span>
            </div>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(path)
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </Link>
            ))}
          </div>

          {/* Mobile menu indicator */}
          <div className="md:hidden text-blue-300 text-sm">
            JECRC Library
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;