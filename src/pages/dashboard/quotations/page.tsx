import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

interface QuotationListItem {
  id: string;
  quotationNo: string;
  partyName: string;
  date: string;
  itemCount: number;
  totalAmount: number;
  companyName: string;
  status: 'draft' | 'sent' | 'accepted' | 'rejected';
}

export default function QuotationsPage() {
  const navigate = useNavigate();
  const [quotations, setQuotations] = useState<QuotationListItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [currentCompany, setCurrentCompany] = useState('Qasim Sewing Machine');

  useEffect(() => {
    // Load company from localStorage
    const savedCompany = localStorage.getItem('selectedCompany');
    if (savedCompany) {
      setCurrentCompany(savedCompany);
    }

    // Listen for company changes
    const handleCompanyChange = () => {
      const newCompany = localStorage.getItem('selectedCompany');
      if (newCompany) {
        setCurrentCompany(newCompany);
      }
      loadQuotations();
    };
    window.addEventListener('companyChanged', handleCompanyChange);

    // Load quotations from localStorage
    loadQuotations();

    return () => {
      window.removeEventListener('companyChanged', handleCompanyChange);
    };
  }, []);

  const loadQuotations = () => {
    const saved = localStorage.getItem('quotations');
    const currentCompanyName = localStorage.getItem('selectedCompany') || 'QASIM SEWING MACHINE';

    if (saved) {
      const allQuotations = JSON.parse(saved);
      // Filter by current company
      const companyQuotations = allQuotations.filter((q: QuotationListItem) =>
        q.companyName === currentCompanyName
      );
      setQuotations(companyQuotations);
    }
  };

  const deleteQuotation = (id: string) => {
    if (confirm('Are you sure you want to delete this quotation?')) {
      // Delete from all quotations, not just filtered
      const allSaved = localStorage.getItem('quotations');
      if (allSaved) {
        const allQuotations = JSON.parse(allSaved);
        const updated = allQuotations.filter((q: QuotationListItem) => q.id !== id);
        localStorage.setItem('quotations', JSON.stringify(updated));
        loadQuotations(); // Reload to show filtered list
      }
    }
  };

  const changeStatus = (id: string, newStatus: 'draft' | 'sent' | 'accepted' | 'rejected') => {
    // Update in all quotations, not just filtered
    const allSaved = localStorage.getItem('quotations');
    if (allSaved) {
      const allQuotations = JSON.parse(allSaved);
      const updated = allQuotations.map((q: QuotationListItem) =>
        q.id === id ? { ...q, status: newStatus } : q
      );
      localStorage.setItem('quotations', JSON.stringify(updated));
      loadQuotations(); // Reload to show filtered list
    }
  };

  const filteredQuotations = quotations.filter(quot => {
    const matchesSearch =
      quot.quotationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      quot.partyName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = filterStatus === 'all' || quot.status === filterStatus;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quotations</h1>
          <p className="text-gray-600 mt-1">Manage and track your quotations</p>
        </div>
        <Link
          to="/dashboard/quotations/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all flex items-center gap-2"
        >
          <span className="text-xl">+</span>
          Create Quotation
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Search Quotations
            </label>
            <input
              type="text"
              placeholder="Search by quotation no or party name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
          <div className="text-sm text-gray-600">Total Quotations</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{quotations.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
          <div className="text-sm text-gray-600">Draft</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">
            {quotations.filter(q => q.status === 'draft').length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
          <div className="text-sm text-gray-600">Sent</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">
            {quotations.filter(q => q.status === 'sent').length}
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
          <div className="text-sm text-gray-600">Accepted</div>
          <div className="text-2xl font-bold text-green-600 mt-1">
            {quotations.filter(q => q.status === 'accepted').length}
          </div>
        </div>
      </div>

      {/* Quotations Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100">
        {filteredQuotations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-5xl mb-4">📄</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quotations found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || filterStatus !== 'all'
                ? 'Try adjusting your filters'
                : 'Create your first quotation to get started'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <Link
                to="/dashboard/quotations/new"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
              >
                Create Quotation
              </Link>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">
                    Quotation No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">
                    Party Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">
                    Items
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">
                    Company
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotations.map((quotation) => (
                  <tr
                    key={quotation.id}
                    onClick={() => navigate(`/dashboard/quotations/${quotation.id}`)}
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{quotation.quotationNo}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-900">{quotation.partyName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-600">{quotation.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-600">{quotation.itemCount} items</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600">{quotation.companyName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(quotation.status)}`}>
                        {quotation.status.charAt(0).toUpperCase() + quotation.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2 items-center">
                        <select
                          value={quotation.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => {
                            e.stopPropagation();
                            changeStatus(quotation.id, e.target.value as any);
                          }}
                          className="px-2 py-1 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-xs"
                        >
                          <option value="draft">Draft</option>
                          <option value="sent">Sent</option>
                          <option value="accepted">Accepted</option>
                          <option value="rejected">Rejected</option>
                        </select>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteQuotation(quotation.id);
                          }}
                          className="text-red-600 hover:text-red-800 font-semibold transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
