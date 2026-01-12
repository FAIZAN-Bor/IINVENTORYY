import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { categories as initialCategories } from '../../../data/mockData';
import { inventoryItems as initialItems } from '../../../data/mockData';
import { Category } from '../../../types';

export default function CategoriesPage() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [selectedCategoryName, setSelectedCategoryName] = useState('');
  const [itemSearchTerm, setItemSearchTerm] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState<Partial<Category>>({});

  const itemsModalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (itemsModalRef.current && event.target === itemsModalRef.current) {
        setShowItemsModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const savedItems = localStorage.getItem('inventoryItems');
    setItems(savedItems ? JSON.parse(savedItems) : initialItems);

    // Load categories from localStorage or use initial data
    const savedCategories = localStorage.getItem('categories');
    if (savedCategories) {
      setCategories(JSON.parse(savedCategories));
    } else {
      setCategories(initialCategories);
      localStorage.setItem('categories', JSON.stringify(initialCategories));
    }
  }, []);

  const getCategoryStats = (categoryName: string) => {
    const categoryItems = items.filter(item => item.category === categoryName);
    const totalValue = categoryItems.reduce((sum, item) => sum + (item.currentStock * item.rate), 0);
    const lowStock = categoryItems.filter(item => item.currentStock <= item.minStock).length;
    
    return {
      count: categoryItems.length,
      totalValue,
      lowStock,
    };
  };

  const handleSave = () => {
    if (!formData.name) {
      alert('Please enter category name');
      return;
    }

    let updatedCategories;
    if (editingCategory) {
      updatedCategories = categories.map((cat) =>
        cat.id === editingCategory.id ? { ...cat, ...formData } : cat
      );
    } else {
      const newCategory: Category = {
        id: Date.now().toString(),
        name: formData.name || '',
        description: formData.description || '',
        itemCount: 0,
      };
      updatedCategories = [...categories, newCategory];
    }

    setCategories(updatedCategories);
    localStorage.setItem('categories', JSON.stringify(updatedCategories));
    setShowModal(false);
    setEditingCategory(null);
    setFormData({});
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData(category);
    setShowModal(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this category?')) {
      const updatedCategories = categories.filter((cat) => cat.id !== id);
      setCategories(updatedCategories);
      localStorage.setItem('categories', JSON.stringify(updatedCategories));
    }
  };

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({});
    setShowModal(true);
  };

  const viewCategoryItems = (categoryName: string) => {
    setSelectedCategoryName(categoryName);
    setItemSearchTerm('');
    setShowItemsModal(true);
  };

  const getCategoryItems = () => {
    let categoryItems = items.filter(item => item.category === selectedCategoryName);
    
    if (itemSearchTerm) {
      categoryItems = categoryItems.filter(
        (item) =>
          item.name.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
          item.articleCode.toLowerCase().includes(itemSearchTerm.toLowerCase()) ||
          item.description?.toLowerCase().includes(itemSearchTerm.toLowerCase())
      );
    }
    
    return categoryItems;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Browse inventory by category</p>
        </div>
        <button
          onClick={openAddModal}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all flex items-center space-x-2"
        >
          <span>➕</span>
          <span>Add Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category, index) => {
          const stats = getCategoryStats(category.name);
          const colors = [
            'from-blue-500 to-blue-600',
            'from-green-500 to-green-600',
            'from-purple-500 to-purple-600',
            'from-orange-500 to-orange-600',
            'from-pink-500 to-pink-600',
            'from-indigo-500 to-indigo-600',
          ];
          const icons = ['💡', '⚙️', '🧵', '🎛️', '⚡', '🔧'];

          return (
            <div
              key={category.id}
              className="bg-white rounded-xl shadow-lg overflow-hidden card-hover animate-fadeIn"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className={`h-32 bg-gradient-to-br ${colors[index % colors.length]} flex items-center justify-center`}>
                <span className="text-6xl">{icons[index % icons.length]}</span>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-700 font-medium text-sm mb-4">{category.description}</p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700 font-medium text-sm">Total Items</span>
                    <span className="font-bold text-gray-900">{stats.count}</span>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-700 font-medium text-sm">Total Value</span>
                    <span className="font-bold text-green-600">₨{(stats.totalValue / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <span className="text-gray-700 font-medium text-sm">Low Stock Items</span>
                    <span className={`font-bold ${stats.lowStock > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {stats.lowStock}
                    </span>
                  </div>
                </div>

                <button 
                  onClick={() => viewCategoryItems(category.name)}
                  className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-900 py-2 rounded-lg font-semibold transition"
                >
                  View Items →
                </button>
                
                <div className="flex space-x-2 mt-2">
                  <button
                    onClick={() => handleEdit(category)}
                    className="flex-1 bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-300 py-2 rounded-lg font-semibold text-sm transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 px-4 py-2 rounded-lg font-semibold transition-all"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Category Summary</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Total Value</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Low Stock</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">% of Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {categories.map((category) => {
                const stats = getCategoryStats(category.name);
                const percentage = items.length > 0 ? ((stats.count / items.length) * 100).toFixed(1) : 0;
                
                return (
                  <tr key={category.id} className="hover:bg-blue-50 transition-colors">
                    <td className="px-6 py-4 font-semibold text-gray-900">{category.name}</td>
                    <td className="px-6 py-4 text-gray-600">{stats.count}</td>
                    <td className="px-6 py-4 font-semibold text-green-600">₨{stats.totalValue.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${stats.lowStock > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {stats.lowStock}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{percentage}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category Name *</label>
                  <input
                    type="text"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="e.g., Electrical Components"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    rows={3}
                    placeholder="Enter category description"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
                    setFormData({});
                  }}
                  className="bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-300 px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
                >
                  {editingCategory ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Items Modal */}
      {showItemsModal && (
        <div ref={itemsModalRef} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Items in {selectedCategoryName}
                </h2>
                <button
                  onClick={() => setShowItemsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
              <div>
                <input
                  type="text"
                  value={itemSearchTerm}
                  onChange={(e) => setItemSearchTerm(e.target.value)}
                  placeholder="Search items by name, code, or description..."
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6">
              {getCategoryItems().length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  No items found in this category.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Image</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Code</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Stock</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Rate</th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {getCategoryItems().map((item) => {
                        const stockStatus = item.currentStock <= item.minStock ? 'Low' : 'Good';
                        const stockColor = stockStatus === 'Low' ? 'text-red-600 bg-red-50' : 'text-green-600 bg-green-50';
                        
                        return (
                          <tr key={item.id} className="hover:bg-blue-50 transition-colors">
                            <td className="px-4 py-3">
                              {item.picture ? (
                                <img src={item.picture} alt={item.name} className="w-12 h-12 object-cover rounded-lg" />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                                  No Image
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">{item.articleCode}</td>
                            <td className="px-4 py-3">
                              <div className="text-sm font-semibold text-gray-900">{item.name}</div>
                              <div className="text-xs text-gray-600">{item.description?.substring(0, 40)}...</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-sm font-bold text-gray-900">{item.currentStock} {item.unit}</span>
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">₨{item.rate.toFixed(2)}</td>
                            <td className="px-4 py-3">
                              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${stockColor}`}>
                                {stockStatus}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowItemsModal(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
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
