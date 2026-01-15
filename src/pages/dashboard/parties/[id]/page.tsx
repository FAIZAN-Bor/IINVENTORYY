import { useState, useEffect, FormEvent, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Party, PartyTransaction } from '../../../../types';

export default function PartyDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [party, setParty] = useState<Party | null>(null);
  const [transactions, setTransactions] = useState<PartyTransaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<PartyTransaction[]>([]);
  const [sortBy, setSortBy] = useState<'date' | 'amount' | 'type'>('date');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<PartyTransaction | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    ntn: '',
    strn: '',
    status: 'active' as 'active' | 'inactive',
    notes: '',
  });
  const [paymentData, setPaymentData] = useState({
    amount: 0,
    paymentMethod: 'cash' as 'cash' | 'bank' | 'cheque',
    chequeNo: '',
    bankName: '',
    description: '',
  });
  const [companyStats, setCompanyStats] = useState({
    balance: 0,
    totalPurchases: 0,
    totalPayments: 0
  });

  const paymentModalRef = useRef<HTMLDivElement>(null);
  const transactionModalRef = useRef<HTMLDivElement>(null);
  const ledgerModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (paymentModalRef.current && event.target === paymentModalRef.current) {
        setShowPaymentModal(false);
      }
      if (transactionModalRef.current && event.target === transactionModalRef.current) {
        setShowTransactionModal(false);
      }
      if (ledgerModalRef.current && event.target === ledgerModalRef.current) {
        setShowLedgerModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (id) {
      loadParty();
      loadTransactions();
    }

    // Listen for party data changes from sales
    const handlePartyDataChange = () => {
      if (id) {
        loadParty();
        loadTransactions();
      }
    };
    window.addEventListener('partyDataChanged', handlePartyDataChange);

    return () => {
      window.removeEventListener('partyDataChanged', handlePartyDataChange);
    };
  }, [id]);

  const loadParty = () => {
    const savedParties = localStorage.getItem('parties');
    if (savedParties) {
      const parties: Party[] = JSON.parse(savedParties);
      const foundParty = parties.find(p => p.id === id);
      if (foundParty) {
        setParty(foundParty);
        setFormData({
          name: foundParty.name,
          contactPerson: foundParty.contactPerson || '',
          phone: foundParty.phone || '',
          email: foundParty.email || '',
          address: foundParty.address || '',
          city: foundParty.city || '',
          ntn: foundParty.ntn || '',
          strn: foundParty.strn || '',
          status: foundParty.status,
          notes: foundParty.notes || '',
        });
      }
    }
  };

  const loadTransactions = () => {
    const savedParties = localStorage.getItem('parties');
    const currentCompany = localStorage.getItem('selectedCompany') || 'QASIM SEWING MACHINE';

    if (savedParties) {
      const parties: Party[] = JSON.parse(savedParties);
      const foundParty = parties.find(p => p.id === id);
      if (foundParty && foundParty.transactions) {
        // Filter transactions by current company
        const companyTransactions = foundParty.transactions.filter((t: any) =>
          t.companyName === currentCompany
        );
        // Calculate company specific stats
        let balance = 0;
        let purchases = 0;
        let payments = 0;

        // Sort by date ascending to calculate running balance correctly
        const ascTransactions = [...companyTransactions].sort((a: any, b: any) =>
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        // Re-calculate running balance for this company
        const transactionsWithBalance = ascTransactions.map(t => {
          if (t.type === 'sale') {
            purchases += t.amount || 0;
            // Payment received during sale is considered a payment
            payments += t.paymentReceived || 0;
            balance += (t.amount || 0) - (t.paymentReceived || 0);
          } else if (t.type === 'payment') {
            payments += t.amount || 0;
            balance -= t.amount || 0;
          } else if (t.type === 'return') {
            // Handle returns if any (reduce balance / purchases)
            // Assuming return reduces balance
            balance -= t.amount || 0;
          }
          return { ...t, balance };
        });

        // Update stats
        setCompanyStats({
          balance: balance,
          totalPurchases: purchases,
          totalPayments: payments
        });

        // Sort back to desired order for display
        const sortedTransactions = transactionsWithBalance.sort((a: any, b: any) =>
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTransactions(sortedTransactions);
      } else {
        setTransactions([]);
        setCompanyStats({ balance: 0, totalPurchases: 0, totalPayments: 0 });
      }
    }
  };

  useEffect(() => {
    let filtered = [...transactions];

    // Apply date filters
    if (fromDate) {
      filtered = filtered.filter(t => new Date(t.date) >= new Date(fromDate));
    }
    if (toDate) {
      filtered = filtered.filter(t => new Date(t.date) <= new Date(toDate));
    }

    // Apply sorting
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        case 'amount':
          return b.amount - a.amount;
        case 'type':
          return a.type.localeCompare(b.type);
        default:
          return 0;
      }
    });

    setFilteredTransactions(filtered);
  }, [transactions, sortBy, fromDate, toDate]);

  const handleUpdateParty = (e: FormEvent) => {
    e.preventDefault();
    if (!party) return;

    const savedParties = localStorage.getItem('parties');
    if (savedParties) {
      const parties: Party[] = JSON.parse(savedParties);
      const updatedParties = parties.map(p =>
        p.id === id ? { ...p, ...formData } : p
      );
      localStorage.setItem('parties', JSON.stringify(updatedParties));
      setParty({ ...party, ...formData });
      setIsEditing(false);
      alert('Party updated successfully!');
    }
  };

  const handleAddPayment = (e: FormEvent) => {
    e.preventDefault();
    if (!party || paymentData.amount === 0) return;

    const currentCompany = localStorage.getItem('selectedCompany') || 'QASIM SEWING MACHINE';
    // Use company specific balance for calculation
    const newBalance = companyStats.balance - paymentData.amount;

    // Create new transaction for party's transaction history
    const newTransaction: any = {
      id: Date.now().toString(),
      date: new Date().toISOString().split('T')[0],
      type: 'payment',
      companyName: currentCompany,
      description: paymentData.description || `Payment received via ${paymentData.paymentMethod}`,
      amount: paymentData.amount,
      paymentReceived: paymentData.amount,
      balance: newBalance,
    };

    // Update party with new balance and transaction
    const savedParties = localStorage.getItem('parties');
    if (savedParties) {
      const parties: Party[] = JSON.parse(savedParties);
      const updatedParties = parties.map(p => {
        if (p.id === id) {
          const partyTransactions = p.transactions || [];
          partyTransactions.push(newTransaction);

          return {
            ...p,
            // Only update global balance if needed, but for now we rely on re-calculation
            // However, to keep global somewhat consistent we might update it roughly or ignore
            // currentBalance is global, so we update it just to keep data structure valid
            currentBalance: p.currentBalance - paymentData.amount,
            totalPayments: p.totalPayments + paymentData.amount,
            lastTransactionDate: new Date().toISOString().split('T')[0],
            transactions: partyTransactions,
          };
        }
        return p;
      });

      localStorage.setItem('parties', JSON.stringify(updatedParties));

      // Dispatch event to notify other components
      window.dispatchEvent(new Event('partyDataChanged'));

      const updatedParty = updatedParties.find(p => p.id === id);
      if (updatedParty) {
        setParty(updatedParty);
      }
    }

    // Reset and close modal
    setPaymentData({
      amount: 0,
      paymentMethod: 'cash',
      chequeNo: '',
      bankName: '',
      description: '',
    });
    setShowPaymentModal(false);
    loadTransactions();
    alert('Payment recorded successfully!');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) || 0 : value
    }));
  };

  if (!party) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading party details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {party.name} <span className="text-blue-600">({party.partyNumber})</span>
          </h1>
          <p className="text-gray-600 mt-1">Party Details & Transaction History</p>
        </div>
        <div className="flex space-x-3">
          {!isEditing && (
            <>
              <button
                onClick={() => setShowLedgerModal(true)}
                className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition"
              >
                📒 Ledger
              </button>
              <button
                onClick={() => setShowPaymentModal(true)}
                className="bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition"
              >
                Record Payment
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition"
              >
                Edit Party
              </button>
            </>
          )}
          <button
            onClick={() => navigate('/dashboard/parties')}
            className="bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Back to List
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
          <p className="text-gray-600 text-sm font-medium">Payments Due</p>
          <p className={`text-2xl font-bold mt-2 ${companyStats.balance > 0 ? 'text-red-600' :
            companyStats.balance < 0 ? 'text-green-600' :
              'text-gray-600'
            }`}>
            Rs. {companyStats.balance.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {companyStats.balance > 0 ? 'Amount to receive' : companyStats.balance < 0 ? 'Amount to pay' : 'No dues'}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm font-medium">Total Purchases</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            Rs. {companyStats.totalPurchases.toLocaleString()}
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <p className="text-gray-600 text-sm font-medium">Total Payments Received</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">
            Rs. {companyStats.totalPayments.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Party Details / Edit Form */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        {isEditing ? (
          <form onSubmit={handleUpdateParty} className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Edit Party Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Party Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Person</label>
                <input
                  type="text"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">NTN Number</label>
                <input
                  type="text"
                  name="ntn"
                  value={formData.ntn}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter NTN number (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">STRN Number</label>
                <input
                  type="text"
                  name="strn"
                  value={formData.strn}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter STRN number (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Party Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600">Contact Person</p>
                <p className="font-semibold text-gray-900">{party.contactPerson || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-semibold text-gray-900">{party.phone || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-semibold text-gray-900">{party.email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">City</p>
                <p className="font-semibold text-gray-900">{party.city || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">NTN Number</p>
                <p className="font-semibold text-gray-900">{party.ntn || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">STRN Number</p>
                <p className="font-semibold text-gray-900">{party.strn || 'N/A'}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-600">Address</p>
                <p className="font-semibold text-gray-900">{party.address || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Created Date</p>
                <p className="font-semibold text-gray-900">{party.createdDate}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Last Transaction</p>
                <p className="font-semibold text-gray-900">{party.lastTransactionDate || 'No transactions'}</p>
              </div>
              {party.notes && (
                <div className="md:col-span-2">
                  <p className="text-sm text-gray-600">Notes</p>
                  <p className="font-semibold text-gray-900">{party.notes}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Transaction History</h2>

        {/* Filters */}
        {transactions.length > 0 && (
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount' | 'type')}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              >
                <option value="date">Date (Newest First)</option>
                <option value="amount">Amount (Highest First)</option>
                <option value="type">Type</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">From Date</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">To Date</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        )}

        {transactions.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-4">📜</p>
            <p className="text-lg font-semibold">No transactions yet</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Description</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase">Balance</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTransactions.map((transaction: any, index: number) => (
                  <tr
                    key={transaction.id}
                    onClick={() => {
                      setSelectedTransaction(transaction);
                      setShowTransactionModal(true);
                    }}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 cursor-pointer transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${transaction.type === 'sale' ? 'bg-blue-100 text-blue-800' :
                        transaction.type === 'payment' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {transaction.type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-blue-600">
                      Rs. {transaction.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                      Rs. {(transaction.paymentReceived || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold">
                      <span className={transaction.balance > 0 ? 'text-red-600' : transaction.balance < 0 ? 'text-green-600' : 'text-gray-600'}>
                        Rs. {transaction.balance.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <div ref={paymentModalRef} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Record Payment</h2>
            <form onSubmit={handleAddPayment} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount (Rs.)</label>
                <input
                  type="number"
                  name="amount"
                  value={paymentData.amount}
                  onChange={handlePaymentChange}
                  required
                  step="0.01"
                  min="0.01"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Method</label>
                <select
                  name="paymentMethod"
                  value={paymentData.paymentMethod}
                  onChange={handlePaymentChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="cash">Cash</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              {paymentData.paymentMethod === 'cheque' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Cheque No.</label>
                  <input
                    type="text"
                    name="chequeNo"
                    value={paymentData.chequeNo}
                    onChange={handlePaymentChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              {paymentData.paymentMethod === 'bank' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Bank Name</label>
                  <input
                    type="text"
                    name="bankName"
                    value={paymentData.bankName}
                    onChange={handlePaymentChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  name="description"
                  value={paymentData.description}
                  onChange={handlePaymentChange}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Payment details..."
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Record Payment
                </button>
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction Detail Modal */}
      {showTransactionModal && selectedTransaction && (
        <div ref={transactionModalRef} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Transaction Details</h2>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Transaction ID</p>
                  <p className="font-semibold text-gray-900">{selectedTransaction.id}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="font-semibold text-gray-900">{new Date(selectedTransaction.date).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Type</p>
                <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${selectedTransaction.type === 'sale' ? 'bg-blue-100 text-blue-800' :
                  selectedTransaction.type === 'payment' ? 'bg-green-100 text-green-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                  {selectedTransaction.type.toUpperCase()}
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">Description</p>
                <p className="font-semibold text-gray-900">{selectedTransaction.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm text-gray-600 mb-1">Transaction Amount</p>
                  <p className="text-xl font-bold text-blue-600">Rs. {selectedTransaction.amount.toLocaleString()}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <p className="text-sm text-gray-600 mb-1">Payment Received</p>
                  <p className="text-xl font-bold text-green-600">Rs. {(selectedTransaction.paymentReceived || 0).toLocaleString()}</p>
                </div>
              </div>

              <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                <p className="text-sm text-gray-600 mb-1">Balance After Transaction</p>
                <p className={`text-xl font-bold ${(selectedTransaction.balance || 0) > 0 ? 'text-red-600' :
                  (selectedTransaction.balance || 0) < 0 ? 'text-green-600' :
                    'text-gray-600'
                  }`}>
                  Rs. {(selectedTransaction.balance || 0).toLocaleString()}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {(selectedTransaction.balance || 0) > 0 ? 'Amount due from party' :
                    (selectedTransaction.balance || 0) < 0 ? 'Advance paid by party' :
                      'No outstanding balance'}
                </p>
              </div>

              {selectedTransaction.type === 'sale' && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Payment Status</p>
                  <p className="font-semibold text-gray-900">
                    {(selectedTransaction.paymentReceived || 0) === 0 ? '❌ Not Paid (Pay Later)' :
                      (selectedTransaction.paymentReceived || 0) < selectedTransaction.amount ? '⚠️ Partially Paid' :
                        '✅ Fully Paid'}
                  </p>
                  {(selectedTransaction.paymentReceived || 0) > 0 && (selectedTransaction.paymentReceived || 0) < selectedTransaction.amount && (
                    <p className="text-sm text-orange-600 mt-1">
                      Remaining: Rs. {(selectedTransaction.amount - (selectedTransaction.paymentReceived || 0)).toLocaleString()}
                    </p>
                  )}
                </div>
              )}

              {selectedTransaction.type === 'sale' && (selectedTransaction.dueDays || selectedTransaction.dueDate) && (
                <div className="grid grid-cols-2 gap-4">
                  {selectedTransaction.dueDays && (
                    <div className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-500">
                      <p className="text-sm text-gray-600 mb-1">Due Days</p>
                      <p className="text-xl font-bold text-purple-600">{selectedTransaction.dueDays} days</p>
                    </div>
                  )}
                  {selectedTransaction.dueDate && (
                    <div className="bg-orange-50 p-4 rounded-lg border-l-4 border-orange-500">
                      <p className="text-sm text-gray-600 mb-1">Due Date</p>
                      <p className="text-xl font-bold text-orange-600">
                        {new Date(selectedTransaction.dueDate).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(selectedTransaction.dueDate) < new Date() ? '⚠️ Overdue' : '✓ Upcoming'}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            <button
              onClick={() => setShowTransactionModal(false)}
              className="w-full mt-6 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Ledger Modal */}
      {showLedgerModal && party && (
        <div ref={ledgerModalRef} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Party Ledger - {party.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">Party Number: {party.partyNumber}</p>
                </div>
                <button
                  onClick={() => setShowLedgerModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-3xl font-bold leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Ledger Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Date</th>
                      <th className="border border-gray-300 px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Particulars</th>
                      <th className="border border-gray-300 px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Debit (Rs.)</th>
                      <th className="border border-gray-300 px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Credit (Rs.)</th>
                      <th className="border border-gray-300 px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Balance (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      let runningBalance = party.openingBalance || 0;
                      const ledgerEntries = [];

                      // Opening Balance
                      if (party.openingBalance !== 0) {
                        ledgerEntries.push(
                          <tr key="opening" className="bg-blue-50">
                            <td className="border border-gray-300 px-4 py-2 text-sm">{party.createdDate}</td>
                            <td className="border border-gray-300 px-4 py-2 text-sm font-semibold">Opening Balance</td>
                            <td className="border border-gray-300 px-4 py-2 text-sm text-right">
                              {party.openingBalance > 0 ? party.openingBalance.toLocaleString() : '-'}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-sm text-right">
                              {party.openingBalance < 0 ? Math.abs(party.openingBalance).toLocaleString() : '-'}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-sm text-right font-bold">
                              {runningBalance.toLocaleString()}
                            </td>
                          </tr>
                        );
                      }

                      // Process all transactions
                      const allTransactions = (party.transactions || []).sort((a: any, b: any) =>
                        new Date(a.date).getTime() - new Date(b.date).getTime()
                      );

                      allTransactions.forEach((txn: any, index: number) => {
                        let debit = 0;
                        let credit = 0;

                        if (txn.type === 'sale') {
                          // For sales: debit is the unpaid amount
                          const unpaidAmount = txn.amount - (txn.paymentReceived || 0);
                          debit = unpaidAmount;
                          runningBalance += unpaidAmount;
                        } else if (txn.type === 'payment') {
                          // For payments: credit is the payment amount
                          credit = txn.amount;
                          runningBalance -= txn.amount;
                        }

                        ledgerEntries.push(
                          <tr key={txn.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="border border-gray-300 px-4 py-2 text-sm">
                              {new Date(txn.date).toLocaleDateString()}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-sm">
                              <div className="flex items-center gap-2">
                                <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${txn.type === 'sale' ? 'bg-blue-100 text-blue-800' :
                                  'bg-green-100 text-green-800'
                                  }`}>
                                  {txn.type.toUpperCase()}
                                </span>
                                <span>{txn.description}</span>
                              </div>
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-sm text-right font-semibold text-red-600">
                              {debit > 0 ? debit.toLocaleString() : '-'}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-sm text-right font-semibold text-green-600">
                              {credit > 0 ? credit.toLocaleString() : '-'}
                            </td>
                            <td className="border border-gray-300 px-4 py-2 text-sm text-right font-bold">
                              <span className={runningBalance > 0 ? 'text-red-600' : runningBalance < 0 ? 'text-green-600' : 'text-gray-600'}>
                                {runningBalance.toLocaleString()}
                              </span>
                            </td>
                          </tr>
                        );
                      });

                      // Closing Balance
                      ledgerEntries.push(
                        <tr key="closing" className="bg-yellow-50 font-bold">
                          <td className="border border-gray-300 px-4 py-3 text-sm" colSpan={2}>
                            Closing Balance
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-right">
                            {runningBalance > 0 ? runningBalance.toLocaleString() : '-'}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-right">
                            {runningBalance < 0 ? Math.abs(runningBalance).toLocaleString() : '-'}
                          </td>
                          <td className="border border-gray-300 px-4 py-3 text-sm text-right">
                            <span className={runningBalance > 0 ? 'text-red-600' : runningBalance < 0 ? 'text-green-600' : 'text-gray-600'}>
                              {runningBalance.toLocaleString()}
                            </span>
                          </td>
                        </tr>
                      );

                      return ledgerEntries.length > 0 ? ledgerEntries : (
                        <tr>
                          <td colSpan={5} className="border border-gray-300 px-4 py-8 text-center text-gray-500">
                            No transactions found
                          </td>
                        </tr>
                      );
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Summary */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm text-gray-600 mb-1">Opening Balance</p>
                  <p className="text-xl font-bold text-blue-600">Rs. {(party.openingBalance || 0).toLocaleString()}</p>
                </div>
                <div className={`p-4 rounded-lg border-l-4 ${party.currentBalance > 0 ? 'bg-red-50 border-red-500' :
                  party.currentBalance < 0 ? 'bg-green-50 border-green-500' :
                    'bg-gray-50 border-gray-500'
                  }`}>
                  <p className="text-sm text-gray-600 mb-1">Current Balance</p>
                  <p className={`text-xl font-bold ${party.currentBalance > 0 ? 'text-red-600' :
                    party.currentBalance < 0 ? 'text-green-600' :
                      'text-gray-600'
                    }`}>
                    Rs. {party.currentBalance.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {party.currentBalance > 0 ? 'Receivable' : party.currentBalance < 0 ? 'Payable' : 'Settled'}
                  </p>
                </div>
                <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                  <p className="text-sm text-gray-600 mb-1">Total Payments</p>
                  <p className="text-xl font-bold text-green-600">Rs. {party.totalPayments.toLocaleString()}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => window.print()}
                  className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  🖨️ Print Ledger
                </button>
                <button
                  onClick={() => setShowLedgerModal(false)}
                  className="flex-1 bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
