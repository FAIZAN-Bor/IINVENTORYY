import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Party } from '../../../types';
import { parties as mockParties } from '../../../data/mockData';

export default function PartiesPage() {
  const navigate = useNavigate();
  const [parties, setParties] = useState<Party[]>([]);
  const [filteredParties, setFilteredParties] = useState<Party[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'partyNumber' | 'name' | 'balance' | 'lastTransaction'>('partyNumber');

  useEffect(() => {
    loadParties();

    // Listen for party data changes from sales
    const handlePartyDataChange = () => {
      loadParties();
    };
    window.addEventListener('partyDataChanged', handlePartyDataChange);

    return () => {
      window.removeEventListener('partyDataChanged', handlePartyDataChange);
    };
  }, []);

  useEffect(() => {
    filterAndSortParties();
  }, [searchTerm, statusFilter, sortBy, parties]);

  const loadParties = () => {
    const savedParties = localStorage.getItem('parties');
    if (savedParties) {
      try {
        const parsedParties = JSON.parse(savedParties);
        // Filter out suppliers - only keep customers/parties we sell to
        const customerParties = parsedParties.filter((p: any) => p.type !== 'supplier');

        // Check if parties array has items and has the new partyNumber field
        if (Array.isArray(customerParties) && customerParties.length > 0 && 'partyNumber' in customerParties[0]) {
          setParties(customerParties);
          setFilteredParties(customerParties);
        } else {
          // Old format or empty, load mock data
          setParties(mockParties);
          setFilteredParties(mockParties);
          localStorage.setItem('parties', JSON.stringify(mockParties));
        }
      } catch (error) {
        // Invalid data, load mock data
        setParties(mockParties);
        setFilteredParties(mockParties);
        localStorage.setItem('parties', JSON.stringify(mockParties));
      }
    } else {
      // Load mock data if no parties exist
      setParties(mockParties);
      setFilteredParties(mockParties);
      localStorage.setItem('parties', JSON.stringify(mockParties));
    }
  };

  const filterAndSortParties = () => {
    let filtered = [...parties];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(party =>
        party.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (party.phone && party.phone.includes(searchTerm)) ||
        (party.contactPerson && party.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (party.city && party.city.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(party => party.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'partyNumber':
          return a.partyNumber - b.partyNumber;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'balance':
          return b.currentBalance - a.currentBalance;
        case 'lastTransaction':
          const dateA = a.lastTransactionDate ? new Date(a.lastTransactionDate).getTime() : 0;
          const dateB = b.lastTransactionDate ? new Date(b.lastTransactionDate).getTime() : 0;
          return dateB - dateA;
        default:
          return 0;
      }
    });

    setFilteredParties(filtered);
  };

  const handleDeleteParty = (id: string) => {
    if (confirm('Are you sure you want to delete this party?')) {
      const updatedParties = parties.filter(p => p.id !== id);
      setParties(updatedParties);
      localStorage.setItem('parties', JSON.stringify(updatedParties));
    }
  };

  const getTotalReceivables = () => {
    return parties.reduce((sum, party) => sum + party.currentBalance, 0);
  };

  const getActiveParties = () => {
    return parties.filter(party => party.status === 'active').length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Party Management</h1>
          <p className="text-gray-600 mt-1">Manage customers and suppliers</p>
        </div>
        <Link
          to="/dashboard/parties/new"
          className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition flex items-center space-x-2"
        >
          <span className="text-xl">+</span>
          <span>Add New Party</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Parties</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{parties.length}</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Parties</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{getActiveParties()}</p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-orange-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Receivables</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                Rs. {getTotalReceivables().toLocaleString()}
              </p>
            </div>
            <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name, phone, person, city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="partyNumber">Party Number</option>
              <option value="name">Name (A-Z)</option>
              <option value="balance">Balance (High to Low)</option>
              <option value="lastTransaction">Last Transaction</option>
            </select>
          </div>
        </div>
      </div>

      {/* Parties List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-blue-600 to-blue-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Party #
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Party Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Contact Person
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Phone
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  City
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Payments Due
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredParties.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <p className="text-4xl mb-4">📋</p>
                      <p className="text-lg font-semibold">No parties found</p>
                      <p className="text-sm mt-2">Add your first party to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredParties.map((party, index) => (
                  <tr
                    key={party.id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-blue-50 transition-colors cursor-pointer`}
                    onClick={() => navigate(`/dashboard/parties/${party.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-blue-600">{party.partyNumber}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">{party.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {party.contactPerson || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {party.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {party.city || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-semibold ${(party.currentBalance || 0) > 0 ? 'text-red-600' :
                          (party.currentBalance || 0) < 0 ? 'text-green-600' :
                            'text-gray-600'
                        }`}>
                        Rs. {(party.currentBalance || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${party.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                        {party.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/parties/${party.id}`);
                          }}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteParty(party.id);
                          }}
                          className="text-red-600 hover:text-red-800 font-semibold text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
