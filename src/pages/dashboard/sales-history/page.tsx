import { useState, useEffect, useRef } from 'react';
import { Invoice } from '../../../types';

export default function SalesHistoryPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'invoiceNo' | 'customer' | 'amount'>('date');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [currentCompany, setCurrentCompany] = useState('QASIM SEWING MACHINE');

  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load current company from localStorage
    const savedCompany = localStorage.getItem('selectedCompany');
    if (savedCompany) {
      setCurrentCompany(savedCompany);
    }

    loadInvoices();

    // Listen for company changes
    const handleCompanyChange = () => {
      const newCompany = localStorage.getItem('selectedCompany');
      if (newCompany) {
        setCurrentCompany(newCompany);
      }
      loadInvoices();
    };

    window.addEventListener('companyChanged', handleCompanyChange);
    return () => window.removeEventListener('companyChanged', handleCompanyChange);
  }, []);

  useEffect(() => {
    filterInvoices();
  }, [searchTerm, sortBy, invoices]);

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

  const loadInvoices = () => {
    const savedInvoices = localStorage.getItem('invoices');
    const savedCompany = localStorage.getItem('selectedCompany') || 'QASIM SEWING MACHINE';

    if (savedInvoices) {
      const allInvoices: Invoice[] = JSON.parse(savedInvoices);
      // Filter by current company - only show invoices for this company
      const companyInvoices = allInvoices.filter(invoice =>
        invoice.companyName === savedCompany
      );
      // Sort by date (newest first)
      const sorted = companyInvoices.sort((a, b) =>
        new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime()
      );
      setInvoices(sorted);
      setFilteredInvoices(sorted);
    }
  };

  const filterInvoices = () => {
    let filtered = [...invoices];

    // Apply search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(invoice =>
        invoice.invoiceNo.toLowerCase().includes(searchLower) ||
        invoice.customerName.toLowerCase().includes(searchLower)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime();
        case 'invoiceNo':
          return a.invoiceNo.localeCompare(b.invoiceNo);
        case 'customer':
          return a.customerName.localeCompare(b.customerName);
        case 'amount':
          return b.netTotal - a.netTotal;
        default:
          return 0;
      }
    });

    setFilteredInvoices(filtered);
  };

  const getTotalSales = () => {
    return invoices.reduce((sum, invoice) => sum + invoice.netTotal, 0);
  };

  const getTotalCashReceived = () => {
    return invoices.reduce((sum, invoice) => sum + invoice.cashReceived, 0);
  };

  const getTotalOutstanding = () => {
    return invoices.reduce((sum, invoice) => sum + (invoice.remainingBalance || 0), 0);
  };

  const viewInvoiceDetails = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowDetailModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Sales History</h1>
          <p className="text-gray-600 mt-1">View all sales invoices and transactions</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium">Total Invoices</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{invoices.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium">Total Sales</p>
          <p className="text-2xl font-bold text-green-600 mt-2">
            Rs. {getTotalSales().toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
          <p className="text-gray-600 text-sm font-medium">Cash Received</p>
          <p className="text-2xl font-bold text-purple-600 mt-2">
            Rs. {getTotalCashReceived().toLocaleString()}
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
              🔍 Search by Invoice Number or Customer Name
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Enter invoice number or customer name..."
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
              <option value="customer">Customer Name</option>
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
            Found {filteredInvoices.length} invoice(s) matching "{searchTerm}"
          </p>
        )}
      </div>

      {/* Invoices List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Invoice No</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Cash Received</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Payment Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center text-gray-500">
                    <div className="text-4xl mb-4">📋</div>
                    <p className="text-lg font-semibold">No invoices found</p>
                    <p className="text-sm mt-1">
                      {searchTerm ? 'Try a different search term' : 'Start creating sales invoices'}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((invoice, index) => (
                  <tr
                    key={invoice.id}
                    onClick={() => viewInvoiceDetails(invoice)}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 cursor-pointer transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-blue-600">
                      {invoice.invoiceNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(invoice.invoiceDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {invoice.customerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {invoice.customerType === 'party' ? (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800 flex items-center gap-1 w-fit">
                          <span>👤</span> Party
                        </span>
                      ) : (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 flex items-center gap-1 w-fit">
                          <span>🚶</span> Walk-in
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {invoice.items.length} item(s)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      Rs. {invoice.netTotal.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      Rs. {invoice.cashReceived.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {invoice.paymentOption === 'later' ? (
                        <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                          PAY LATER
                        </span>
                      ) : invoice.paymentOption === 'partial' ? (
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

      {/* Invoice Detail Modal - Matches PDF Invoice Format */}
      {showDetailModal && selectedInvoice && (
        <div ref={modalRef} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b-2 border-gray-800 p-6 z-10">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-4">
                  {/* Logo Box */}
                  <div className="border-2 border-gray-800 p-3 rounded flex items-center justify-center" style={{ minWidth: '60px' }}>
                    <div className="text-xs font-bold text-center">
                      {selectedInvoice.companyName === 'Q.S TRADERS' ? 'QST' :
                        selectedInvoice.companyName === 'ARFA TRADING COMPANY' ? 'ATC' :
                          selectedInvoice.companyName === 'QASIM & SONS' ? 'Q&S' : 'QSM'}
                    </div>
                  </div>
                  {/* Company Info */}
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">{selectedInvoice.companyName || 'QASIM SEWING MACHINE'}</h1>
                    <p className="text-xs text-gray-700 mt-1">6-ALLAMA IQBAL ROAD, BOHAR WALA CHOWK LAHORE</p>
                    <p className="text-xs text-gray-700">TEL: +92-42-36291732-33-34-35 | {
                      selectedInvoice.companyName === 'Q.S TRADERS' ? 'info@qstraders.com' :
                        selectedInvoice.companyName === 'ARFA TRADING COMPANY' ? 'info@arfatrading.com' :
                          selectedInvoice.companyName === 'QASIM & SONS' ? 'info@qasimsons.com' : 'info@qasimsewing.com'
                    }</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
                >
                  ×
                </button>
              </div>

              {/* Invoice Title */}
              <div className="mt-4 flex justify-center">
                <div className="border-2 border-gray-800 px-8 py-2 rounded">
                  <h2 className="text-lg font-bold text-gray-900">SALES INVOICE</h2>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {/* Customer Details Box */}
              <div className="border-2 border-gray-300 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm font-bold text-gray-700">Customer Name:</span>
                    <span className="text-sm text-gray-900 ml-2">{selectedInvoice.customerName}</span>
                  </div>
                  <div className="text-right border-2 border-gray-300 px-4 py-1 rounded">
                    <span className="text-sm font-bold text-gray-700">Invoice Date:</span>
                    <span className="text-sm text-gray-900 ml-2">
                      {new Date(selectedInvoice.invoiceDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <span className="text-sm font-bold text-gray-700">Invoice No:</span>
                    <span className="text-sm text-gray-900 ml-2">{selectedInvoice.invoiceNo}</span>
                  </div>
                  <div>
                    <span className="text-sm font-bold text-gray-700">Term Of Sale:</span>
                    <span className="text-sm text-gray-900 ml-2">{selectedInvoice.termOfSale || 'CREDIT'}</span>
                  </div>
                </div>
                {selectedInvoice.dcNo && (
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <span className="text-sm font-bold text-gray-700">DC No:</span>
                      <span className="text-sm text-gray-900 ml-2">{selectedInvoice.dcNo}</span>
                    </div>
                    <div>
                      <span className="text-sm font-bold text-gray-700">DC Date:</span>
                      <span className="text-sm text-gray-900 ml-2">{selectedInvoice.dcDate}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Items Table - Exact PDF Format */}
              <div className="border-2 border-gray-800">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-white border-b-2 border-gray-800">
                      <th className="border-r border-gray-800 px-2 py-2 text-xs font-bold text-left" style={{ width: '40px' }}>S.No</th>
                      <th className="border-r border-gray-800 px-2 py-2 text-xs font-bold text-left" style={{ width: '120px' }}>Article Code</th>
                      <th className="border-r border-gray-800 px-2 py-2 text-xs font-bold text-left">Description</th>
                      <th className="border-r border-gray-800 px-2 py-2 text-xs font-bold text-center" style={{ width: '60px' }}>Unit</th>
                      <th className="border-r border-gray-800 px-2 py-2 text-xs font-bold text-right" style={{ width: '60px' }}>Qty</th>
                      <th className="border-r border-gray-800 px-2 py-2 text-xs font-bold text-right" style={{ width: '80px' }}>Rate</th>
                      <th className="px-2 py-2 text-xs font-bold text-right" style={{ width: '100px' }}>Total Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedInvoice.items.map((item, index) => (
                      <tr key={item.id} className="border-b border-gray-800">
                        <td className="border-r border-gray-800 px-2 py-3 text-xs text-center">{index + 1}</td>
                        <td className="border-r border-gray-800 px-2 py-3 text-xs font-bold">{item.articleCode}</td>
                        <td className="border-r border-gray-800 px-2 py-3 text-xs">{item.description}</td>
                        <td className="border-r border-gray-800 px-2 py-3 text-xs text-center">{item.unit || 'PCS'}</td>
                        <td className="border-r border-gray-800 px-2 py-3 text-xs text-right">{item.quantity}</td>
                        <td className="border-r border-gray-800 px-2 py-3 text-xs text-right">{item.rate.toFixed(2)}</td>
                        <td className="px-2 py-3 text-xs text-right font-semibold">{item.totalAmount.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Amount Summary */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm">
                    <span className="font-bold text-gray-700">Amount in words:</span>
                  </div>
                  <div className="flex gap-8 text-sm">
                    <div>
                      <span className="font-bold text-gray-700">Total:</span>
                      <span className="ml-2">{selectedInvoice.items.reduce((sum, item) => sum + item.quantity, 0)}</span>
                      <span className="ml-4 font-semibold">{selectedInvoice.items.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-xs text-gray-700 capitalize">
                  {(() => {
                    const convertToWords = (num: number): string => {
                      const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
                      const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
                      const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

                      if (num === 0) return 'zero';
                      const numStr = Math.floor(num).toString();
                      let words = '';

                      if (numStr.length > 5) {
                        const lakhs = parseInt(numStr.slice(0, -5));
                        words += ones[lakhs] + ' lakh ';
                      }
                      if (numStr.length > 3) {
                        const thousands = parseInt(numStr.slice(-5, -3));
                        if (thousands > 0) {
                          if (thousands < 10) words += ones[thousands];
                          else if (thousands < 20) words += teens[thousands - 10];
                          else words += tens[Math.floor(thousands / 10)] + ' ' + ones[thousands % 10];
                          words += ' thousand ';
                        }
                      }
                      const hundreds = parseInt(numStr.slice(-3, -2));
                      if (hundreds > 0) words += ones[hundreds] + ' hundred ';
                      const last = parseInt(numStr.slice(-2));
                      if (last > 0) {
                        if (last < 10) words += ones[last];
                        else if (last < 20) words += teens[last - 10];
                        else words += tens[Math.floor(last / 10)] + ' ' + ones[last % 10];
                      }
                      return 'Rupees ' + words.trim() + ' only';
                    };
                    return convertToWords(selectedInvoice.netTotal);
                  })()}
                </div>

                <div className="flex justify-end gap-8 text-sm">
                  <div>
                    <span className="font-bold text-gray-700">TCS Charges:</span>
                    <span className="ml-2">{selectedInvoice.tcsCharges?.toFixed(2) || '0.00'}</span>
                  </div>
                  <div>
                    <span className="font-bold text-gray-700">Discount:</span>
                    <span className="ml-2">{selectedInvoice.discount?.toFixed(2) || '0.00'}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-8 text-base border-t-2 border-gray-300 pt-2">
                  <div>
                    <span className="font-bold text-gray-900">Net Total Rs:</span>
                    <span className="ml-2 font-bold">{selectedInvoice.netTotal.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex justify-end gap-8 text-base">
                  <div>
                    <span className="font-bold text-gray-900">Cash Received:</span>
                    <span className="ml-2 font-semibold text-green-600">{selectedInvoice.cashReceived.toFixed(2)}</span>
                  </div>
                </div>

                {selectedInvoice.remainingBalance !== undefined && selectedInvoice.remainingBalance > 0 && (
                  <>
                    <div className="flex justify-end gap-8 text-base">
                      <div>
                        <span className="font-bold text-red-700">Remaining Balance:</span>
                        <span className="ml-2 font-bold text-red-700">{selectedInvoice.remainingBalance.toFixed(2)}</span>
                      </div>
                    </div>
                    {selectedInvoice.dueDate && (
                      <div className="flex justify-end gap-8 text-sm">
                        <div>
                          <span className="font-bold text-gray-700">Due Date:</span>
                          <span className="ml-2 text-red-700 font-semibold">
                            {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                          </span>
                          {selectedInvoice.dueDays && (
                            <span className="ml-2 text-gray-600">({selectedInvoice.dueDays} days)</span>
                          )}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Payment Status Badge */}
                <div className="flex justify-end mt-3">
                  {selectedInvoice.paymentOption === 'later' ? (
                    <span className="px-6 py-2 text-sm font-bold rounded-full bg-red-100 text-red-800">
                      ❌ PAY LATER
                    </span>
                  ) : selectedInvoice.paymentOption === 'partial' ? (
                    <span className="px-6 py-2 text-sm font-bold rounded-full bg-orange-100 text-orange-800">
                      ⚠️ PARTIAL PAYMENT
                    </span>
                  ) : (
                    <span className="px-6 py-2 text-sm font-bold rounded-full bg-green-100 text-green-800">
                      ✅ FULLY PAID
                    </span>
                  )}
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-4 border-t-2 border-gray-300">
                <div>
                  <div className="text-sm font-semibold text-gray-700">{selectedInvoice.preparedBy || 'FAIZAN'}</div>
                  <div className="border-b-2 border-gray-800 w-full mt-1"></div>
                  <div className="text-xs font-bold text-gray-700 mt-1">Prepared By :</div>
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-700">&nbsp;</div>
                  <div className="border-b-2 border-gray-800 w-full mt-1"></div>
                  <div className="text-xs font-bold text-gray-700 mt-1">Verified By :</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-gray-900 mt-2">ACCEPTED</div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="text-xs text-gray-600 text-center mt-4 pb-2">
                Goods can be Exchanged within 14 days by presenting original invoice.
              </div>
            </div>

            <div className="border-t border-gray-200 p-6">
              <button
                onClick={() => setShowDetailModal(false)}
                className="w-full bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
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
