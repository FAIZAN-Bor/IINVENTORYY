import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Party } from '../../../types';

export default function SuppliersPage() {
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Party[]>([]);
  const [filteredSuppliers, setFilteredSuppliers] = useState<Party[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [sortBy, setSortBy] = useState<'partyNumber' | 'name' | 'balance' | 'lastTransaction'>('partyNumber');

  useEffect(() => {
    loadSuppliers();

    // Listen for supplier data changes from purchases
    const handleSupplierDataChange = () => {
      loadSuppliers();
    };
    window.addEventListener('supplierDataChanged', handleSupplierDataChange);

    return () => {
      window.removeEventListener('supplierDataChanged', handleSupplierDataChange);
    };
  }, []);

  useEffect(() => {
    filterAndSortSuppliers();
  }, [searchTerm, statusFilter, sortBy, suppliers]);

  const loadSuppliers = () => {
    // Get suppliers from both inventory items and parties storage
    const savedParties = localStorage.getItem('parties');
    const savedInventory = localStorage.getItem('inventoryItems');

    let allSuppliers: Party[] = [];
    const supplierMap = new Map<string, Party>();

    // First, load suppliers from parties storage (those created via purchases)
    if (savedParties) {
      try {
        const parsedParties = JSON.parse(savedParties);
        const existingSuppliers = parsedParties.filter((p: any) => p.type === 'supplier');
        existingSuppliers.forEach((supplier: Party) => {
          supplierMap.set(supplier.name.toLowerCase(), supplier);
        });
      } catch (error) {
        console.error('Error loading suppliers from parties:', error);
      }
    }

    // Then, get suppliers from inventory items
    if (savedInventory) {
      try {
        const items = JSON.parse(savedInventory);

        // Find the maximum supplier number to ensure uniqueness
        let maxSupplierNumber = 0;
        supplierMap.forEach(supplier => {
          if (supplier.partyNumber && supplier.partyNumber > maxSupplierNumber) {
            maxSupplierNumber = supplier.partyNumber;
          }
        });

        let counter = 0;

        items.forEach((item: any) => {
          if (item.supplier) {
            const suppliers = item.supplier.split(',').map((s: string) => s.trim()).filter((s: string) => s);
            suppliers.forEach((supplierName: string) => {
              const key = supplierName.toLowerCase();
              if (!supplierMap.has(key)) {
                // Create a new supplier entry with unique number
                counter++;
                const newSupplier: any = {
                  id: `supplier-${Date.now()}-${counter}`,
                  partyNumber: maxSupplierNumber + counter,
                  name: supplierName,
                  type: 'supplier',
                  status: 'active',
                  currentBalance: 0,
                  totalPurchases: 0,
                  totalPayments: 0,
                  creditLimit: 0,
                  openingBalance: 0,
                  createdDate: new Date().toISOString().split('T')[0],
                };
                supplierMap.set(key, newSupplier);
              }
            });
          }
        });

        // Save the newly discovered suppliers back to parties storage
        if (counter > 0 && savedParties) {
          const parsedParties = JSON.parse(savedParties);
          const newSuppliers = Array.from(supplierMap.values()).filter(s =>
            !parsedParties.some((p: any) => p.name.toLowerCase() === s.name.toLowerCase())
          );
          if (newSuppliers.length > 0) {
            const updatedParties = [...parsedParties, ...newSuppliers];
            localStorage.setItem('parties', JSON.stringify(updatedParties));
          }
        } else if (counter > 0 && !savedParties) {
          localStorage.setItem('parties', JSON.stringify(Array.from(supplierMap.values())));
        }
      } catch (error) {
        console.error('Error loading suppliers from inventory:', error);
      }
    }

    allSuppliers = Array.from(supplierMap.values());
    setSuppliers(allSuppliers);
    setFilteredSuppliers(allSuppliers);
  };

  const filterAndSortSuppliers = () => {
    let filtered = [...suppliers];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supplier.phone && supplier.phone.includes(searchTerm)) ||
        (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (supplier.city && supplier.city.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(supplier => supplier.status === statusFilter);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'partyNumber':
          return (a.partyNumber || 0) - (b.partyNumber || 0);
        case 'name':
          return a.name.localeCompare(b.name);
        case 'balance':
          return (b.currentBalance || 0) - (a.currentBalance || 0);
        case 'lastTransaction':
          const dateA = a.lastTransactionDate ? new Date(a.lastTransactionDate).getTime() : 0;
          const dateB = b.lastTransactionDate ? new Date(b.lastTransactionDate).getTime() : 0;
          return dateB - dateA;
        default:
          return 0;
      }
    });

    setFilteredSuppliers(filtered);
  };

  const handleDeleteSupplier = (id: string) => {
    if (confirm('Are you sure you want to delete this supplier?')) {
      const savedParties = localStorage.getItem('parties');
      if (savedParties) {
        const allParties = JSON.parse(savedParties);
        const updatedParties = allParties.filter((p: any) => p.id !== id);
        localStorage.setItem('parties', JSON.stringify(updatedParties));
        loadSuppliers();
      }
    }
  };

  const getTotalPayables = () => {
    return suppliers.reduce((sum, supplier) => sum + (supplier.currentBalance || 0), 0);
  };

  const getActiveSuppliers = () => {
    return suppliers.filter(supplier => supplier.status === 'active').length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Supplier Management</h1>
          <p className="text-gray-600 mt-1">Manage suppliers and vendors</p>
        </div>
        <Link
          to="/dashboard/suppliers/new"
          className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition flex items-center space-x-2"
        >
          <span className="text-xl">+</span>
          <span>Add New Supplier</span>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Suppliers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{suppliers.length}</p>
            </div>
            <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🏢</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Active Suppliers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{getActiveSuppliers()}</p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border-l-4 border-red-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Payables</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">
                Rs. {getTotalPayables().toLocaleString()}
              </p>
            </div>
            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">💸</span>
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="partyNumber">Supplier Number</option>
              <option value="name">Name (A-Z)</option>
              <option value="balance">Balance (High to Low)</option>
              <option value="lastTransaction">Last Transaction</option>
            </select>
          </div>
        </div>
      </div>

      {/* Suppliers List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-purple-600 to-purple-700">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Supplier #
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-white uppercase tracking-wider">
                  Supplier Name
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
                  Amount Due
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
              {filteredSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="text-gray-400">
                      <p className="text-4xl mb-4">🏢</p>
                      <p className="text-lg font-semibold">No suppliers found</p>
                      <p className="text-sm mt-2">Add your first supplier to get started</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredSuppliers.map((supplier, index) => (
                  <tr
                    key={supplier.id}
                    className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                      } hover:bg-purple-50 transition-colors cursor-pointer`}
                    onClick={() => navigate(`/dashboard/suppliers/${supplier.id}`)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-bold text-purple-600">{supplier.partyNumber || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900">{supplier.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {supplier.contactPerson || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {supplier.phone || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                      {supplier.city || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`font-semibold ${(supplier.currentBalance || 0) > 0 ? 'text-red-600' :
                          (supplier.currentBalance || 0) < 0 ? 'text-green-600' :
                            'text-gray-600'
                        }`}>
                        Rs. {(supplier.currentBalance || 0).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${supplier.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                        }`}>
                        {supplier.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/dashboard/suppliers/${supplier.id}`);
                          }}
                          className="text-purple-600 hover:text-purple-800 font-semibold text-sm"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSupplier(supplier.id);
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
