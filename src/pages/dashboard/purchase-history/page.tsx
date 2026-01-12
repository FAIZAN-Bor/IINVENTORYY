import { useState, useEffect, useRef } from 'react';

interface PurchaseInvoice {
  id: string;
  invoiceNo: string;
  customerName: string;
  companyName?: string;
  date: string;
  items: number;
  amount: number;
  paidAmount: number;
  paymentStatus: 'full' | 'partial' | 'unpaid';
  termOfSale?: string;
  invoiceItems?: any[];
}

export default function PurchaseHistoryPage() {
  const [purchases, setPurchases] = useState<PurchaseInvoice[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<PurchaseInvoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'invoiceNo' | 'supplier' | 'amount'>('date');
  const [selectedPurchase, setSelectedPurchase] = useState<PurchaseInvoice | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadPurchases();

    // Listen for purchase changes and company changes
    const handlePurchaseChange = () => {
      loadPurchases();
    };

    const handleCompanyChange = () => {
      loadPurchases();
    };

    window.addEventListener('purchaseDataChanged', handlePurchaseChange);
    window.addEventListener('companyChanged', handleCompanyChange);
    return () => {
      window.removeEventListener('purchaseDataChanged', handlePurchaseChange);
      window.removeEventListener('companyChanged', handleCompanyChange);
    };
  }, []);

  useEffect(() => {
    filterPurchases();
  }, [searchTerm, sortBy, purchases]);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && event.target === modalRef.current) {
        setShowDetailModal(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadPurchases = () => {
    const savedTransactions = localStorage.getItem('transactions');
    const currentCompany = localStorage.getItem('selectedCompany') || 'QASIM SEWING MACHINE';

    if (savedTransactions) {
      const allTransactions = JSON.parse(savedTransactions);
      // Filter only purchase transactions for the current company
      const companyPurchases: PurchaseInvoice[] = allTransactions.filter((t: any) =>
        t.type === 'purchase' && t.companyName === currentCompany
      );
      // Sort by date (newest first)
      const sorted = companyPurchases.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setPurchases(sorted);
      setFilteredPurchases(sorted);
    }
  };

  const filterPurchases = () => {
    let filtered = [...purchases];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(purchase =>
        purchase.invoiceNo.toLowerCase().includes(searchLower) ||
        purchase.customerName.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'invoiceNo':
          return a.invoiceNo.localeCompare(b.invoiceNo);
        case 'supplier':
          return a.customerName.localeCompare(b.customerName);
        case 'amount':
          return b.amount - a.amount;
        default:
          return 0;
      }
    });

    setFilteredPurchases(filtered);
  };

  const getTotalPurchases = () => {
    return purchases.reduce((sum, purchase) => sum + purchase.amount, 0);
  };

  const getTotalPaid = () => {
    return purchases.reduce((sum, purchase) => sum + (purchase.paidAmount || 0), 0);
  };

  const getTotalOutstanding = () => {
    return purchases.reduce((sum, purchase) => sum + (purchase.amount - (purchase.paidAmount || 0)), 0);
  };

  const viewPurchaseDetails = (purchase: PurchaseInvoice) => {
    setSelectedPurchase(purchase);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Purchase History</h1>
          <p className="text-gray-600 mt-1">View all purchase invoices and transactions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium">Total Purchases</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{purchases.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm font-medium">Total Amount</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">
            Rs. {getTotalPurchases().toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium">Total Paid</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            Rs. {getTotalPaid().toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
          <p className="text-gray-600 text-sm font-medium">Outstanding</p>
          <p className="text-2xl font-bold text-red-600 mt-2">
            Rs. {getTotalOutstanding().toLocaleString()}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🔍 Search by Invoice Number or Supplier Name
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter invoice number or supplier name..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="w-64">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="date">Date (Newest First)</option>
              <option value="invoiceNo">Invoice Number</option>
              <option value="supplier">Supplier Name</option>
              <option value="amount">Amount (High to Low)</option>
            </select>
          </div>
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="self-end px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Clear
            </button>
          )}
        </div>
        {searchTerm && (
          <p className="text-sm text-gray-600 mt-2">
            Found {filteredPurchases.length} purchase(s) matching "{searchTerm}"
          </p>
        )}
      </div>

      {/* Purchases List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Invoice No</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Paid</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Payment Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPurchases.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="text-4xl mb-4">📋</div>
                    <p className="text-lg font-semibold">No purchases found</p>
                    <p className="text-sm mt-1">
                      {searchTerm ? 'Try a different search term' : 'Start creating purchase invoices'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredPurchases.map((purchase, index) => (
                  <tr
                    key={purchase.id}
                    onClick={() => viewPurchaseDetails(purchase)}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 cursor-pointer transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                      {purchase.invoiceNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(purchase.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {purchase.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {purchase.items} item(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      Rs. {purchase.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      Rs. {(purchase.paidAmount || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {purchase.paymentStatus === 'unpaid' ? (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          UNPAID
                        </span>
                      ) : purchase.paymentStatus === 'partial' ? (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">
                          PARTIAL
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          PAID
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchase Detail Modal */}
      {showDetailModal && selectedPurchase && (
        <div ref={modalRef} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Invoice Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Purchase Invoice</h2>
                  <p className="text-blue-100">{(selectedPurchase as any).companyName || 'QASIM SEWING MACHINE'}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-white hover:text-gray-200 text-3xl font-bold leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Invoice Body */}
            <div className="p-8 space-y-6">
              {/* Invoice Info */}
              <div className="grid grid-cols-2 gap-6 pb-6 border-b-2 border-gray-200">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">SUPPLIER DETAILS</h3>
                  <p className="text-lg font-bold text-gray-900">{selectedPurchase.customerName || 'Cash Purchase'}</p>
                  <p className="text-sm text-gray-600 mt-1">Term: {selectedPurchase.termOfSale || 'CASH'}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">INVOICE INFO</h3>
                  <p className="text-sm text-gray-900"><span className="font-semibold">Invoice No:</span> {selectedPurchase.invoiceNo}</p>
                  <p className="text-sm text-gray-900 mt-1"><span className="font-semibold">Date:</span> {new Date(selectedPurchase.date).toLocaleDateString()}</p>
                </div>
              </div>

              {/* Items Table */}
              {selectedPurchase.invoiceItems && selectedPurchase.invoiceItems.length > 0 && (
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-3">ITEMS PURCHASED</h3>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">S.No</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Article Code</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Description</th>
                          <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Unit</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Quantity</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Rate</th>
                          <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedPurchase.invoiceItems.map((item: any, index: number) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">{item.articleCode}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{item.description || item.name}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{item.unit}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">{item.quantity}</td>
                            <td className="px-4 py-3 text-sm text-right text-gray-900">₨{(item.rate || item.purchasePrice || 0).toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm text-right font-bold text-blue-600">₨{(item.totalAmount || ((item.quantity || 0) * (item.rate || item.purchasePrice || 0))).toFixed(2)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Totals */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <div className="flex justify-between text-xl font-bold text-blue-600 border-t-2 border-gray-300 pt-3">
                  <span>Net Total:</span>
                  <span>₨{selectedPurchase.amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border-2 border-green-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">PAYMENT DETAILS</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Amount Paid:</span>
                    <span className="text-xl font-bold text-green-600">₨{(selectedPurchase.paidAmount || 0).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Remaining Amount:</span>
                    <span className="text-xl font-bold text-red-600">₨{(selectedPurchase.amount - (selectedPurchase.paidAmount || 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                    <span className="font-semibold text-gray-700">Payment Status:</span>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${selectedPurchase.paymentStatus === 'full'
                      ? 'bg-green-100 text-green-700'
                      : selectedPurchase.paymentStatus === 'unpaid'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-orange-100 text-orange-700'
                      }`}>
                      {selectedPurchase.paymentStatus === 'full'
                        ? '✓ Fully Paid'
                        : selectedPurchase.paymentStatus === 'unpaid'
                          ? '⚠ Unpaid'
                          : '⚠ Partially Paid'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Info */}
              <div className="flex justify-between items-end pt-6 border-t-2 border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">Prepared By:</p>
                  <p className="text-lg font-bold text-gray-900">FAIZAN</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">6-ALLAMA IQBAL ROAD, BOHAR WALA CHOWK LAHORE</p>
                  <p className="text-xs text-gray-500">TEL: +92-42-36291732-33-34-35</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 px-8 py-4 flex gap-4 border-t border-gray-200">
              <button
                onClick={() => setShowDetailModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
