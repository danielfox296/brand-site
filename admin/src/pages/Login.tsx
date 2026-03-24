import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../lib/auth';

export default function Login() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Authentication failed');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-[#d7af74] tracking-tight">
            Entuned
          </h1>
          <p className="text-[#a0a0a0] text-sm mt-1">Admin Dashboard</p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-6 space-y-4"
        >
          <div>
            <label
              htmlFor="password"
              className="block text-xs font-medium text-[#a0a0a0] mb-1.5"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              autoFocus
              className="w-full px-3 py-2.5 rounded-lg bg-[#0a0a0a] border border-[#2a2a2a] text-white text-sm placeholder-[#555] outline-none focus:border-[#d7af74] transition-colors"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-2.5 rounded-lg bg-[#d7af74] text-[#0a0a0a] text-sm font-semibold hover:bg-[#e5c48a] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Authenticating...' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}
