import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

function Signup() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
        },
      });

      if (error) throw error;

      if (data.user) {
        navigate('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-400 via-blue-300 to-cyan-200 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-12 text-center drop-shadow-lg tracking-tight">
          Create Account
        </h1>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-gray-700 text-lg font-semibold mb-2">
              Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-sky-500 transition-colors text-gray-700"
              placeholder="Enter your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-gray-700 text-lg font-semibold mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-sky-500 transition-colors text-gray-700"
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-gray-700 text-lg font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-sky-500 transition-colors text-gray-700"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-8 py-4 bg-sky-600 text-white rounded-lg text-xl font-semibold shadow-lg hover:shadow-xl hover:bg-sky-700 transition-all duration-200 mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating Account...' : 'Signup'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
