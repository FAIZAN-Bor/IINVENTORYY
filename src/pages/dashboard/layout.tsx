import { useLocation, useNavigate, Link, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const pathname = location.pathname;
  const [user, setUser] = useState<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState('QASIM SEWING MACHINE');

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    const userData = localStorage.getItem('user');

    if (!isAuthenticated) {
      navigate('/login');
    } else if (userData) {
      setUser(JSON.parse(userData));
    }

    // Load selected company
    const savedCompany = localStorage.getItem('selectedCompany');
    if (savedCompany) {
      setSelectedCompany(savedCompany);
    }

    // Listen for company changes
    const handleCompanyChange = () => {
      const newCompany = localStorage.getItem('selectedCompany');
      if (newCompany) {
        setSelectedCompany(newCompany);
      }
    };

    window.addEventListener('companyChanged', handleCompanyChange);
    return () => window.removeEventListener('companyChanged', handleCompanyChange);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('user');
    navigate('/');
  };

  const menuItems = [
    { icon: '📊', label: 'Desktop', path: '/dashboard' },
    { icon: '📦', label: 'Inventory', path: '/dashboard/inventory' },
    { icon: '⚠️', label: 'Low Stock', path: '/dashboard/low-stock' },
    { icon: '🗂️', label: 'Categories', path: '/dashboard/categories' },
    { icon: '👥', label: 'Parties', path: '/dashboard/parties' },
    { icon: '🏢', label: 'Suppliers', path: '/dashboard/suppliers' },
    { icon: '💼', label: 'Quotations', path: '/dashboard/quotations' },
    { icon: '📄', label: 'Sales Invoice', path: '/dashboard/sales' },
    { icon: '📋', label: 'Sales History', path: '/dashboard/sales-history' },
    { icon: '🛒', label: 'Purchase Invoice', path: '/dashboard/purchases' },
    { icon: '📜', label: 'Purchase History', path: '/dashboard/purchase-history' },
    // Conditional item for Qasim Sewing Machine only
    ...(selectedCompany === 'QASIM SEWING MACHINE' ? [
      { icon: '🧾', label: 'Sales Tax Invoice', path: '/dashboard/sales-tax-invoice' },
      { icon: '📑', label: 'Tax Invoice History', path: '/dashboard/sales-tax-invoice-history' },
      { icon: '🚚', label: 'Delivery Challan', path: '/dashboard/delivery-challan' },
      { icon: '📜', label: 'Delivery History', path: '/dashboard/delivery-challan-history' }
    ] : [])
  ];

  if (!user) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-lg fixed top-0 left-0 right-0 z-50 border-b-2 border-blue-100">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-gray-100 transition"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
              <Link to="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-800 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {selectedCompany === 'Q.S TRADERS' ? 'QST' :
                      selectedCompany === 'QASIM SEWING MACHINE' ? 'QSM' :
                        selectedCompany === 'ARFA TRADING COMPANY' ? 'ATC' :
                          selectedCompany === 'QASIM & SONS' ? 'Q&S' : 'QSM'}
                  </span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    {selectedCompany === 'QASIM SEWING MACHINE' ? 'Qasim Sewing Machine' :
                      selectedCompany === 'Q.S TRADERS' ? 'Q.S Traders' :
                        selectedCompany === 'ARFA TRADING COMPANY' ? 'Arfa Trading Company' :
                          selectedCompany === 'QASIM & SONS' ? 'Qasim & Sons' :
                            'Qasim Sewing Machine'}
                  </h1>
                  <p className="text-xs text-gray-700 font-medium">Inventory System</p>
                </div>
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-semibold transition text-sm"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex pt-[73px]">
        {/* Sidebar */}
        <aside
          className={`fixed left-0 top-[73px] bottom-0 bg-white shadow-lg transition-all duration-300 ${isSidebarOpen ? 'w-64' : 'w-0'
            } overflow-hidden`}
        >
          <div className="p-4 space-y-2 overflow-y-auto h-full">
            {menuItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive
                    ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                    }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-semibold">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-0'
            }`}
        >
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
