import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { UserPlus } from 'lucide-react';

export function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.register({ name, email, password });
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed! Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-xl w-full max-w-md border border-white/50">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-emerald-600 rounded-full flex items-center justify-center shadow-lg">
            <UserPlus className="w-8 h-8 text-white" />
          </div>
        </div>
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8 tracking-tight">Create Account</h2>
        
        {error && (
          <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm mb-6 border border-red-100 font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-70 mt-4 flex justify-center items-center h-12"
          >
            {loading ? <span className="animate-pulse">Creating...</span> : 'Sign Up'}
          </button>
        </form>
        
        <p className="mt-6 text-center text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
