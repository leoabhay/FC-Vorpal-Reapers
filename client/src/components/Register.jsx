import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useForm } from '../hooks/useForm';

export default function Register() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  
  const { values, handleChange } = useForm({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (values.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    
    setLoading(true);
    
    try {
      await register(values.name, values.email, values.password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white p-8 rounded-2xl shadow-2xl border-2 border-gray-100">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold text-red-600 mb-2">Register</h2>
            <p className="text-gray-600">Join FC Vorpal Swords</p>
          </div>
          
          {error && (
            <div className="bg-red-100 border-l-4 border-red-600 text-red-700 p-4 rounded-lg mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Name</label>
              <input
                type="text"
                name="name"
                value={values.name}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                required
                disabled={loading}
                placeholder="Enter your name"
              />
            </div>
            
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Email</label>
              <input
                type="email"
                name="email"
                value={values.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                required
                disabled={loading}
                placeholder="Enter your email"
              />
            </div>
            
            <div>
              <label className="block mb-2 font-semibold text-gray-700">Password</label>
              <input
                type="password"
                name="password"
                value={values.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
                required
                minLength={6}
                disabled={loading}
                placeholder="Enter your password"
              />
              <p className="text-sm text-gray-500 mt-1">Minimum 6 characters</p>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg hover:from-red-700 hover:to-red-800 disabled:bg-gray-400 font-semibold text-lg shadow-lg transition-all transform hover:scale-105 disabled:transform-none"
            >
              {loading ? 'Registering...' : 'Register'}
            </button>
          </form>
          
          <p className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-red-600 hover:text-red-700 font-semibold hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
