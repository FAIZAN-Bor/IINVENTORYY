import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeFeature, setActiveFeature] = useState(0);
  const [selectedCompany, setSelectedCompany] = useState('QASIM SEWING MACHINE');

  useEffect(() => {
    setIsVisible(true);
    
    const savedCompany = localStorage.getItem('selectedCompany');
    if (savedCompany) {
      setSelectedCompany(savedCompany);
    }
    
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % 6);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-md shadow-sm z-50 border-b border-gray-100">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl blur opacity-75"></div>
                <div className="relative w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-2xl">
                    {selectedCompany === 'Q.S TRADERS' ? 'QST' : selectedCompany === 'EXPERT SEWING MACHINE' ? 'ES' : 'QS'}
                  </span>
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  {selectedCompany === 'QASIM SEWING MACHINE' ? 'Qasim Sewing Machine' : 
                   selectedCompany === 'Q.S TRADERS' ? 'Q.S Traders' : 
                   'Expert Sewing Machine'}
                </h1>
                <p className="text-xs text-gray-600 font-medium flex items-center gap-1">
                  <span className="text-blue-600">📍</span> Jinnah Colony, Faisalabad
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="#features"
                className="hidden md:block text-gray-700 hover:text-blue-600 font-semibold transition-colors"
              >
                Features
              </a>
              <a
                href="#about"
                className="hidden md:block text-gray-700 hover:text-blue-600 font-semibold transition-colors"
              >
                About
              </a>
              <Link
                to="/login"
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-md hover:shadow-lg"
              >
                Login →
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className={`text-center transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-full px-6 py-2 mb-8">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
              </span>
              <span className="text-sm font-semibold text-blue-800">Trusted by 50+ Businesses</span>
            </div>

            <h2 className="text-6xl md:text-7xl font-extrabold text-gray-900 mb-6 leading-tight">
              Smart Inventory
              <br />
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Management System
              </span>
            </h2>
            
            <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
              Revolutionize your sewing machine spare parts business with our comprehensive platform. 
              <span className="font-semibold text-gray-900"> Track inventory, manage quotations, generate invoices,</span> and make intelligent data-driven decisions—all in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link
                to="/login"
                className="group bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2"
              >
                Get Started Free
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
              <a
                href="#demo"
                className="group bg-white hover:bg-gray-50 text-gray-900 px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg border-2 border-gray-200 hover:border-blue-600 flex items-center justify-center gap-2"
              >
                <span>▶</span> Watch Demo
              </a>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-xl">✓</span>
                <span>No Credit Card Required</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-xl">✓</span>
                <span>Free Forever Plan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-500 text-xl">✓</span>
                <span>24/7 Support</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-20 max-w-5xl mx-auto">
            {[
              { label: 'Total Items', value: '500+', icon: '📦', gradient: 'from-blue-50 to-blue-100' },
              { label: 'Categories', value: '12+', icon: '📊', gradient: 'from-purple-50 to-purple-100' },
              { label: 'Happy Clients', value: '50+', icon: '👥', gradient: 'from-pink-50 to-pink-100' },
              { label: 'Daily Transactions', value: '₨1M+', icon: '💰', gradient: 'from-green-50 to-green-100' },
            ].map((stat, index) => (
              <div
                key={index}
                className={`relative group bg-gradient-to-br ${stat.gradient} p-6 rounded-2xl border border-gray-200 hover:border-transparent transition-all duration-300 hover:scale-105 hover:shadow-xl`}
              >
                <div className="text-5xl mb-3">{stat.icon}</div>
                <div className="text-3xl font-extrabold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm font-semibold text-gray-700">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <span className="text-blue-600 font-bold text-sm uppercase tracking-wider">Features</span>
            <h3 className="text-5xl font-extrabold text-gray-900 mt-2 mb-4">
              Everything You Need to Succeed
            </h3>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful tools designed to streamline your inventory operations
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: 'Smart Inventory Tracking',
                description: 'Real-time tracking of all spare parts with detailed categorization and alerts.',
                icon: '📋',
              },
              {
                title: 'Low Stock Intelligence',
                description: 'AI-powered alerts notify you when items fall below minimum levels.',
                icon: '⚠️',
              },
              {
                title: 'Professional Invoicing',
                description: 'Generate beautiful invoices with one-click PDF export functionality.',
                icon: '📄',
              },
              {
                title: 'Advanced Analytics',
                description: 'Comprehensive dashboards with interactive charts and insights.',
                icon: '📈',
              },
              {
                title: 'Quotation Management',
                description: 'Compare supplier prices and award orders to the best suppliers.',
                icon: '💼',
              },
              {
                title: 'Complete Audit Trail',
                description: 'Track every transaction with detailed history and timestamps.',
                icon: '🔄',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className={`group relative bg-white p-8 rounded-2xl border-2 border-gray-200 hover:border-blue-200 transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  activeFeature === index ? 'ring-4 ring-blue-200 scale-105 shadow-2xl' : ''
                }`}
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-4xl mb-6 shadow-lg group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h4 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h4>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="about" className="py-24 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto bg-gradient-to-br from-blue-600 to-purple-700 rounded-3xl p-12 text-center text-white shadow-2xl">
            <h3 className="text-5xl font-extrabold mb-6">
              Ready to Transform Your Business?
            </h3>
            <p className="text-xl mb-10 text-blue-100 max-w-2xl mx-auto leading-relaxed">
              Join thousands of businesses revolutionizing how they manage inventory. Start your free trial today!
            </p>
            <Link
              to="/login"
              className="group bg-white hover:bg-gray-50 text-blue-700 px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl inline-flex items-center gap-2"
            >
              Start Free Trial
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold text-xl">QS</span>
                </div>
                <h4 className="text-xl font-bold">QASIM SEWING</h4>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Leading inventory management solution for sewing machine spare parts businesses.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-6">Company</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">About</a></li>
                <li><Link to="/login" className="text-gray-400 hover:text-white transition-colors">Login</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-bold mb-6">Contact</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-1">📍</span>
                  <span>Jinnah Colony, Faisalabad</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">📞</span>
                  <span>+92-300-1234567</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-blue-500">✉️</span>
                  <span>info@qasimsewing.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              &copy; 2025 {selectedCompany === 'QASIM SEWING MACHINE' ? 'Qasim Sewing Machine' : 
                          selectedCompany === 'Q.S TRADERS' ? 'Q.S Traders' : 
                          'Expert Sewing Machine'}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
