import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';

// Company credentials
const COMPANY_CREDENTIALS = [
  { email: 'admin@qasim.com', password: 'qasim123', company: 'QASIM SEWING MACHINE', name: 'Admin' },
  { email: 'admin@qstraders.com', password: 'qst123', company: 'Q.S TRADERS', name: 'Admin' },
  { email: 'admin@arfa.com', password: 'arfa123', company: 'ARFA TRADING COMPANY', name: 'Admin' },
  { email: 'admin@qasimsons.com', password: 'sons123', company: 'QASIM & SONS', name: 'Admin' },
];

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      if (email && password) {
        // Check credentials
        const matchedCompany = COMPANY_CREDENTIALS.find(
          cred => cred.email === email && cred.password === password
        );

        if (matchedCompany) {
          const user = {
            id: '1',
            name: matchedCompany.name,
            email: email,
            role: 'admin' as const,
          };
          localStorage.setItem('user', JSON.stringify(user));
          localStorage.setItem('isAuthenticated', 'true');
          localStorage.setItem('selectedCompany', matchedCompany.company);
          navigate('/dashboard');
        } else {
          setError('Invalid email or password');
          setIsLoading(false);
        }
      } else {
        setError('Please enter both email and password');
        setIsLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <span className="text-white font-bold text-2xl">QS</span>
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-700 font-medium">Sign in to manage your inventory</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                placeholder="admin@qasimsewing.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition text-gray-900"
                placeholder="Enter your password"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-semibold">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span className="ml-2">Signing in...</span>
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Demo Credentials:
            </p>
            <div className="mt-2 space-y-1 text-xs text-gray-500">
              <p>Qasim: admin@qasim.com / qasim123</p>
              <p>QS Traders: admin@qstraders.com / qst123</p>
              <p>Arfa: admin@arfa.com / arfa123</p>
              <p>Qasim & Sons: admin@qasimsons.com / sons123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
