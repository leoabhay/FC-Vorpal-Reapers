import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Menu, X, Home, Users, Calendar, Bell, Shield, LogOut, LogIn, UserPlus, Image } from 'lucide-react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-red-700 to-red-900 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          <Link to="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
          <img src="/transparent.png" alt="FC Vorpal Swords" className="h-10 w-10" />
            <span className="font-bold text-2xl bg-gradient-to-r from-white to-red-100 bg-clip-text text-transparent">FC Vorpal Swords</span>
          </Link>
          
          <div className="hidden md:flex space-x-2">
            <Link to="/" className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-red-800 transition-all font-medium">
              <Home className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link to="/team" className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-red-800 transition-all font-medium">
              <Users className="h-5 w-5" />
              <span>Team</span>
            </Link>
            <Link to="/matches" className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-red-800 transition-all font-medium">
              <Calendar className="h-5 w-5" />
              <span>Matches</span>
            </Link>
            <Link to="/news" className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-red-800 transition-all font-medium">
              <Bell className="h-5 w-5" />
              <span>News</span>
            </Link>
            <Link to="/gallery" className="flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-red-800 transition-all font-medium">
              <Image className="h-5 w-5" />
              <span>Gallery</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-sm font-medium">Welcome, {user.name}</span>
                {isAdmin && (
                  <Link to="/admin" className="px-4 py-2 bg-yellow-500 rounded-lg hover:bg-yellow-600 font-semibold shadow-md transition-all">
                    Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 flex items-center space-x-2 font-semibold shadow-md transition-all">
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="px-4 py-2 bg-white text-red-700 rounded-lg hover:bg-red-50 flex items-center space-x-2 font-semibold shadow-md transition-all">
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </Link>
                <Link to="/register" className="px-4 py-2 bg-red-800 rounded-lg hover:bg-red-900 flex items-center space-x-2 font-semibold shadow-md transition-all">
                  <UserPlus className="h-4 w-4" />
                  <span>Register</span>
                </Link>
              </>
            )}
          </div>

          <button className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {menuOpen && (
          <div className="md:hidden pb-4 space-y-2">
            <Link to="/" className="block px-4 py-2 hover:bg-red-800 rounded-lg transition-all font-medium" onClick={() => setMenuOpen(false)}>
              Home
            </Link>
            <Link to="/team" className="block px-4 py-2 hover:bg-red-800 rounded-lg transition-all font-medium" onClick={() => setMenuOpen(false)}>
              Team
            </Link>
            <Link to="/matches" className="block px-4 py-2 hover:bg-red-800 rounded-lg transition-all font-medium" onClick={() => setMenuOpen(false)}>
              Matches
            </Link>
            <Link to="/news" className="block px-4 py-2 hover:bg-red-800 rounded-lg transition-all font-medium" onClick={() => setMenuOpen(false)}>
              News
            </Link>
            <Link to="/gallery" className="block px-4 py-2 hover:bg-red-800 rounded-lg transition-all font-medium" onClick={() => setMenuOpen(false)}>
              Gallery
            </Link>
            {user ? (
              <>
                {isAdmin && (
                  <Link to="/admin" className="block px-4 py-2 bg-yellow-500 rounded-lg font-semibold" onClick={() => setMenuOpen(false)}>
                    Admin
                  </Link>
                )}
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="block w-full text-left px-4 py-2 bg-red-800 rounded-lg font-semibold">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="block px-4 py-2 bg-white text-red-700 rounded-lg font-semibold" onClick={() => setMenuOpen(false)}>
                  Login
                </Link>
                <Link to="/register" className="block px-4 py-2 bg-red-800 rounded-lg font-semibold" onClick={() => setMenuOpen(false)}>
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}