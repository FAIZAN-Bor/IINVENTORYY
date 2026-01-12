import { useEffect, useState, useRef } from 'react';
import { inventoryItems as initialItems, categories as initialCategories } from '../../../data/mockData';
import { InventoryItem, Category } from '../../../types';

export default function InventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({});
  const [supplierInput, setSupplierInput] = useState('');
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [availableSuppliers, setAvailableSuppliers] = useState<string[]>([]);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [newSupplierData, setNewSupplierData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
  });

  const modalRef = useRef<HTMLDivElement>(null);
  const deleteModalRef = useRef<HTMLDivElement>(null);
  const supplierModalRef = useRef<HTMLDivElement>(null);
  const supplierDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load items from localStorage or use initial data
    const savedItems = localStorage.getItem('inventoryItems');
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    } else {
      setItems(initialItems);
      localStorage.setItem('inventoryItems', JSON.stringify(initialItems));
    }

    // Load categories from localStorage
    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      setCategories(initialCategories);
    }

    // Load available suppliers
    loadAvailableSuppliers();
  }, []);

  // Handle click outside to close modals and dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && event.target === modalRef.current) {
        setShowModal(false);
      }
      if (deleteModalRef.current && event.target === deleteModalRef.current) {
        setShowDeleteModal(false);
      }
      if (supplierModalRef.current && event.target === supplierModalRef.current) {
        setShowAddSupplierModal(false);
      }
      if (supplierDropdownRef.current && !supplierDropdownRef.current.contains(event.target as Node)) {
        setShowSupplierDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadAvailableSuppliers = () => {
    const savedParties = localStorage.getItem('parties');
    if (savedParties) {
      const parties = JSON.parse(savedParties);
      const suppliersList = parties
        .filter((p: any) => p.type === 'supplier')
        .map((p: any) => p.name);
      setAvailableSuppliers(suppliersList);
    }
  };

  useEffect(() => {
    let filtered = items;

    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.articleCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    setFilteredItems(filtered);
  }, [items, searchTerm, selectedCategory]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, picture: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!formData.articleCode || !formData.name || !formData.rate) {
      alert('Please fill in all required fields');
      return;
    }

    let updatedItems;
    if (editingItem) {
      updatedItems = items.map((item) =>
        item.id === editingItem.id ? { ...item, ...formData, supplier: suppliers.join(', ') } : item
      );
    } else {
      const newItem: InventoryItem = {
        id: Date.now().toString(),
        articleCode: formData.articleCode || '',
        name: formData.name || '',
        description: formData.description || '',
        category: formData.category || 'Sewing Machine Parts',
        unit: formData.unit || 'Pieces',
        location: formData.location || '',
        picture: formData.picture || '',
        rate: formData.rate || 0,
        salePrice: formData.salePrice || 0,
        currentStock: formData.currentStock || 0,
        minStock: formData.minStock || 10,
        minSalePrice: formData.minSalePrice || 0,
        lastRestocked: new Date().toISOString().split('T')[0],
        supplier: suppliers.join(', '),
      };
      updatedItems = [...items, newItem];
    }

    setItems(updatedItems);
    localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));
    setShowModal(false);
    setEditingItem(null);
    setFormData({});
    setSuppliers([]);
    setSupplierInput('');
  };

  const handleEdit = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData(item);
    // Parse suppliers from comma-separated string
    setSuppliers(item.supplier ? item.supplier.split(',').map(s => s.trim()).filter(s => s) : []);
    setSupplierInput('');
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      const updatedItems = items.filter((item) => item.id !== itemToDelete);
      setItems(updatedItems);
      localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));
      setShowDeleteModal(false);
      setItemToDelete(null);
    }
  };

  const openAddModal = () => {
    setEditingItem(null);
    setFormData({});
    setSuppliers([]);
    setSupplierInput('');
    setShowModal(true);
  };

  const handleAddNewSupplier = () => {
    if (!newSupplierData.name.trim()) {
      alert('Supplier name is required');
      return;
    }

    if (!newSupplierData.phone.trim()) {
      alert('Phone number is required');
      return;
    }

    // Load existing parties
    const savedParties = localStorage.getItem('parties');
    const parties = savedParties ? JSON.parse(savedParties) : [];

    // Check if supplier already exists
    const existingSupplier = parties.find(
      (p: any) => p.name.toLowerCase() === newSupplierData.name.toLowerCase() && p.type === 'supplier'
    );

    if (existingSupplier) {
      alert('Supplier with this name already exists');
      return;
    }

    // Find the maximum supplier number
    const maxSupplierNumber = parties
      .filter((p: any) => p.type === 'supplier')
      .reduce((max: number, p: any) => Math.max(max, p.partyNumber || 0), 0);

    // Create new supplier
    const newSupplier = {
      id: `supplier-${Date.now()}`,
      partyNumber: maxSupplierNumber + 1,
      name: newSupplierData.name.trim(),
      phone: newSupplierData.phone.trim(),
      address: newSupplierData.address.trim() || undefined,
      city: newSupplierData.city.trim() || undefined,
      type: 'supplier',
      status: 'active',
      currentBalance: 0,
      totalPurchases: 0,
      totalPayments: 0,
      creditLimit: 0,
      openingBalance: 0,
      createdDate: new Date().toISOString().split('T')[0],
      notes: 'Added from inventory',
    };

    parties.push(newSupplier);
    localStorage.setItem('parties', JSON.stringify(parties));
    window.dispatchEvent(new Event('supplierDataChanged'));

    // Add to current suppliers list
    if (!suppliers.includes(newSupplierData.name.trim())) {
      setSuppliers([...suppliers, newSupplierData.name.trim()]);
    }
    loadAvailableSuppliers();

    // Reset and close modal
    setNewSupplierData({
      name: '',
      phone: '',
      address: '',
      city: '',
    });
    setShowAddSupplierModal(false);
    alert('Supplier added successfully!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-600 mt-1">Manage all your spare parts inventory</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Add New Item</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, code, or description..."
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option>All</option>
              {categories.map((cat) => (
                <option key={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Image</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Article Code</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Cost</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const stockStatus = item.currentStock <= item.minStock ? 'Low' : 'Good';
                const stockColor = stockStatus === 'Low' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50';

                return (
                  <tr
                    key={item.id}
                    onClick={() => handleEdit(item)}
                    className="hover:bg-blue-50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      {item.picture ? (
                        <img src={item.picture} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                          No Image
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">{item.articleCode}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-700 font-medium">{item.description.substring(0, 40)}...</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{item.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{item.location || 'Not set'}</td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900">{item.currentStock} {item.unit}</span>
                      <p className="text-xs text-gray-600 font-medium">Min: {item.minStock}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">₨{item.rate.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${stockColor}`}>
                        {stockStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(item.id);
                          }}
                          className="text-red-600 hover:text-red-700 font-semibold text-sm transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div ref={modalRef} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingItem ? 'Edit Item' : 'Add New Item'}
              </h2>

              <div className="space-y-4">
                {/* Image Upload Section */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Item Picture</label>
                  <div className="flex items-center space-x-4">
                    {formData.picture && (
                      <div className="relative">
                        <img src={formData.picture} alt="Preview" className="w-20 h-20 object-cover rounded-lg border-2 border-gray-300" />
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, picture: '' })}
                          className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg transition-all"
                          title="Remove image"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Article Code *</label>
                    <input
                      type="text"
                      value={formData.articleCode || ''}
                      onChange={(e) => setFormData({ ...formData, articleCode: e.target.value })}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all w-full"
                      placeholder="LED-JK-9100BS"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all w-full"
                      placeholder="LED Light JK-9100BS"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    rows={3}
                    placeholder="Enter item description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category || 'Sewing Machine Parts'}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      {categories.map((cat) => (
                        <option key={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
                    <select
                      value={formData.unit || 'Pieces'}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    >
                      <option>Pieces</option>
                      <option>Kgs</option>
                      <option>Litres</option>
                      <option>Dozens</option>
                      <option>Pkt</option>
                      <option>Sets</option>
                      <option>Box</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Storage Location</label>
                  <input
                    type="text"
                    value={formData.location || ''}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Warehouse A - Shelf 3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Base Cost (₨) *</label>
                    <input
                      type="number"
                      value={formData.rate || ''}
                      onChange={(e) => setFormData({ ...formData, rate: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="475.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">Purchase/cost price per unit</p>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Price (₨)</label>
                    <input
                      type="number"
                      value={formData.salePrice || ''}
                      onChange={(e) => setFormData({ ...formData, salePrice: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="650.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">Standard selling price</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Sale Price (₨)</label>
                    <input
                      type="number"
                      value={formData.minSalePrice || ''}
                      onChange={(e) => setFormData({ ...formData, minSalePrice: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="500.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum selling price</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Min Stock</label>
                    <input
                      type="number"
                      value={formData.minStock || ''}
                      onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="10"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Current Stock</label>
                    <input
                      type="number"
                      value={formData.currentStock || ''}
                      onChange={(e) => setFormData({ ...formData, currentStock: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="45"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Suppliers</label>
                  <div className="space-y-2">
                    {/* Display existing suppliers as tags */}
                    {suppliers.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {suppliers.map((supplier, index) => (
                          <div key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-2">
                            <span>{supplier}</span>
                            <button
                              type="button"
                              onClick={() => setSuppliers(suppliers.filter((_, i) => i !== index))}
                              className="text-blue-600 hover:text-blue-800 font-bold"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    {/* Supplier selection with dropdown */}
                    <div className="flex gap-2">
                      <div className="flex-1 relative" ref={supplierDropdownRef}>
                        <input
                          type="text"
                          value={supplierInput}
                          onChange={(e) => {
                            setSupplierInput(e.target.value);
                            if (e.target.value) {
                              setShowSupplierDropdown(true);
                            }
                          }}
                          onFocus={() => setShowSupplierDropdown(true)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              const trimmed = supplierInput.trim();
                              if (trimmed && !suppliers.includes(trimmed)) {
                                setSuppliers([...suppliers, trimmed]);
                                setSupplierInput('');
                                setShowSupplierDropdown(false);
                              }
                            }
                          }}
                          className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Type or select supplier"
                        />
                        {/* Available Suppliers Dropdown */}
                        {showSupplierDropdown && availableSuppliers.length > 0 && (
                          <div className="absolute z-20 w-full mt-1 bg-white border-2 border-blue-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            {availableSuppliers
                              .filter(s => s.toLowerCase().includes(supplierInput.toLowerCase()) && !suppliers.includes(s))
                              .map((supplier, index) => (
                                <div
                                  key={index}
                                  onClick={() => {
                                    if (!suppliers.includes(supplier)) {
                                      setSuppliers([...suppliers, supplier]);
                                      setSupplierInput('');
                                      setShowSupplierDropdown(false);
                                    }
                                  }}
                                  className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                >
                                  <div className="font-semibold text-gray-900">{supplier}</div>
                                </div>
                              ))}
                            {availableSuppliers.filter(s => s.toLowerCase().includes(supplierInput.toLowerCase()) && !suppliers.includes(s)).length === 0 && (
                              <div className="px-4 py-3 text-gray-500 text-center text-sm">No suppliers found</div>
                            )}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAddSupplierModal(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap"
                      >
                        + New
                      </button>
                    </div>
                    <p className="text-xs text-gray-500">Select from existing suppliers or type a new one</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingItem(null);
                    setFormData({});
                    setSuppliers([]);
                    setSupplierInput('');
                  }}
                  className="bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-300 px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
                >
                  {editingItem ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div ref={deleteModalRef} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-center w-16 h-16 mx-auto bg-red-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 text-center mb-2">Delete Item?</h3>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete this item? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setItemToDelete(null);
                  }}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-lg font-semibold transition"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-lg font-semibold transition"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Supplier Modal */}
      {showAddSupplierModal && (
        <div ref={supplierModalRef} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Supplier</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier Name *</label>
                <input
                  type="text"
                  value={newSupplierData.name}
                  onChange={(e) => setNewSupplierData({ ...newSupplierData, name: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter supplier name"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Phone *</label>
                <input
                  type="tel"
                  value={newSupplierData.phone}
                  onChange={(e) => setNewSupplierData({ ...newSupplierData, phone: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter phone number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={newSupplierData.city}
                  onChange={(e) => setNewSupplierData({ ...newSupplierData, city: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter city"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Address</label>
                <textarea
                  value={newSupplierData.address}
                  onChange={(e) => setNewSupplierData({ ...newSupplierData, address: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter address"
                />
              </div>
            </div>
            <div className="flex space-x-4 pt-6">
              <button
                type="button"
                onClick={() => {
                  setShowAddSupplierModal(false);
                  setNewSupplierData({ name: '', phone: '', address: '', city: '' });
                }}
                className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddNewSupplier}
                className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
              >
                Add Supplier
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
