import { useEffect, useState } from 'react';
import { inventoryItems as initialItems } from '../../../data/mockData';
import { InventoryItem, ItemPricing } from '../../../types';

export default function PricingPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [pricingData, setPricingData] = useState<ItemPricing[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [priceForm, setPriceForm] = useState<Partial<ItemPricing>>({});

  useEffect(() => {
    // Load items and pricing from localStorage
    const savedItems = localStorage.getItem('inventoryItems');
    const savedPricing = localStorage.getItem('itemPricing');
    
    if (savedItems) {
      setItems(JSON.parse(savedItems));
    } else {
      setItems(initialItems);
    }

    if (savedPricing) {
      setPricingData(JSON.parse(savedPricing));
    }
  }, []);

  useEffect(() => {
    let filtered = items;
    if (searchTerm) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.articleCode.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setFilteredItems(filtered);
  }, [items, searchTerm]);

  const getPricingForItem = (itemId: string): ItemPricing | undefined => {
    return pricingData.find((p) => p.itemId === itemId);
  };

  const handleSetPrice = (item: InventoryItem) => {
    setSelectedItem(item);
    const existingPricing = getPricingForItem(item.id);
    
    if (existingPricing) {
      setPriceForm(existingPricing);
    } else {
      setPriceForm({
        itemId: item.id,
        articleCode: item.articleCode,
        itemName: item.name,
        packRate: undefined,
        retailPrice: undefined,
        tradePrice: undefined,
      });
    }
    setShowModal(true);
  };

  const handleSavePrice = () => {
    if (!selectedItem) return;

    const newPricing: ItemPricing = {
      id: priceForm.id || Date.now().toString(),
      itemId: selectedItem.id,
      articleCode: selectedItem.articleCode,
      itemName: selectedItem.name,
      packRate: priceForm.packRate || undefined,
      retailPrice: priceForm.retailPrice || undefined,
      tradePrice: priceForm.tradePrice || undefined,
      minSalePrice: priceForm.minSalePrice || undefined,
      lastUpdated: new Date().toISOString().split('T')[0],
    };

    let updatedPricing;
    if (priceForm.id) {
      // Update existing
      updatedPricing = pricingData.map((p) => (p.id === priceForm.id ? newPricing : p));
    } else {
      // Add new
      updatedPricing = [...pricingData, newPricing];
    }

    setPricingData(updatedPricing);
    localStorage.setItem('itemPricing', JSON.stringify(updatedPricing));
    setShowModal(false);
    setSelectedItem(null);
    setPriceForm({});
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manage Pricing</h1>
          <p className="text-gray-700 font-medium mt-1">Set retail, trade, and pack prices for inventory items</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Search Items</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or article code..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Image</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Article Code</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Item Name</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Base Cost</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Pack Rate</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Retail Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Trade Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Min Sale Price</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Last Updated</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredItems.map((item) => {
                const pricing = getPricingForItem(item.id);
                return (
                  <tr key={item.id} className="hover:bg-gray-50 transition">
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
                      <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                      <p className="text-xs text-gray-600">{item.category}</p>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900">₨{item.rate.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {pricing?.packRate ? `₨${pricing.packRate.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {pricing?.retailPrice ? `₨${pricing.retailPrice.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {pricing?.tradePrice ? `₨${pricing.tradePrice.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-red-700">
                      {pricing?.minSalePrice ? `₨${pricing.minSalePrice.toFixed(2)}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {pricing?.lastUpdated || 'Not set'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleSetPrice(item)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition"
                      >
                        {pricing ? 'Update' : 'Set Prices'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Set Prices</h2>
              <p className="text-gray-600 mb-6">
                <span className="font-semibold">{selectedItem.name}</span> ({selectedItem.articleCode})
              </p>

              <div className="space-y-4">
                {/* Base Cost Reference */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-semibold text-blue-900">Base Cost: ₨{selectedItem.rate.toFixed(2)}</p>
                  <p className="text-xs text-blue-700 mt-1">This is the purchase/cost price from inventory</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Pack Rate (₨)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={priceForm.packRate || ''}
                      onChange={(e) => setPriceForm({ ...priceForm, packRate: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">Price per pack</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Retail Price (₨)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={priceForm.retailPrice || ''}
                      onChange={(e) => setPriceForm({ ...priceForm, retailPrice: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">Price for end customers</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Trade Price (₨)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={priceForm.tradePrice || ''}
                      onChange={(e) => setPriceForm({ ...priceForm, tradePrice: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-gray-500 mt-1">Price for wholesalers</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-red-700 mb-2">Minimum Sale Price (₨) 🚫</label>
                    <input
                      type="number"
                      step="0.01"
                      value={priceForm.minSalePrice || ''}
                      onChange={(e) => setPriceForm({ ...priceForm, minSalePrice: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border-2 border-red-300 rounded-lg focus:ring-2 focus:ring-red-500"
                      placeholder="0.00"
                    />
                    <p className="text-xs text-red-600 mt-1 font-semibold">Cannot sell below this price</p>
                  </div>
                </div>

                {/* Minimum Sale Price Warning */}
                {priceForm.minSalePrice && (
                  <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                    <p className="text-sm font-bold text-red-900 mb-2">⚠️ Floor Price Set</p>
                    <p className="text-xs text-red-700">
                      This item cannot be sold for less than ₨{priceForm.minSalePrice.toFixed(2)}
                    </p>
                    {priceForm.minSalePrice < selectedItem.rate && (
                      <p className="text-xs text-red-600 font-semibold mt-1">
                        ⚠️ Warning: Min sale price is below base cost (₨{selectedItem.rate.toFixed(2)})
                      </p>
                    )}
                  </div>
                )}

                {/* Profit Margin Preview */}
                {(priceForm.retailPrice || priceForm.tradePrice) && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm font-semibold text-green-900 mb-2">Profit Margins</p>
                    {priceForm.retailPrice && (
                      <p className="text-xs text-green-700">
                        Retail Margin: ₨{(priceForm.retailPrice - selectedItem.rate).toFixed(2)} ({(((priceForm.retailPrice - selectedItem.rate) / selectedItem.rate) * 100).toFixed(1)}%)
                      </p>
                    )}
                    {priceForm.tradePrice && (
                      <p className="text-xs text-green-700">
                        Trade Margin: ₨{(priceForm.tradePrice - selectedItem.rate).toFixed(2)} ({(((priceForm.tradePrice - selectedItem.rate) / selectedItem.rate) * 100).toFixed(1)}%)
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedItem(null);
                    setPriceForm({});
                  }}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePrice}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
                >
                  Save Prices
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
