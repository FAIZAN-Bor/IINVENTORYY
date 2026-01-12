import { useEffect, useState } from 'react';
import { inventoryItems as initialItems } from '../../../data/mockData';
import { InventoryItem } from '../../../types';
import { Link } from 'react-router-dom';
import { generateLowStockPDF } from '../../../utils/pdfGenerator';

export default function LowStockPage() {
  const [lowStockItems, setLowStockItems] = useState<InventoryItem[]>([]);
  const [sortBy, setSortBy] = useState<'stock' | 'value'>('stock');

  useEffect(() => {
    const savedItems = localStorage.getItem('inventoryItems');
    const items = savedItems ? JSON.parse(savedItems) : initialItems;
    
    let filtered = items.filter((item: InventoryItem) => item.currentStock <= item.minStock);
    
    if (sortBy === 'stock') {
      filtered.sort((a: InventoryItem, b: InventoryItem) => a.currentStock - b.currentStock);
    } else {
      filtered.sort((a: InventoryItem, b: InventoryItem) => 
        (b.currentStock * b.rate) - (a.currentStock * a.rate)
      );
    }
    
    setLowStockItems(filtered);
  }, [sortBy]);

  const getUrgencyColor = (item: InventoryItem) => {
    const percentageLeft = (item.currentStock / item.minStock) * 100;
    if (percentageLeft <= 30) return 'bg-red-100 border-red-500 text-red-900';
    if (percentageLeft <= 60) return 'bg-orange-100 border-orange-500 text-orange-900';
    return 'bg-yellow-100 border-yellow-500 text-yellow-900';
  };

  const getUrgencyLabel = (item: InventoryItem) => {
    const percentageLeft = (item.currentStock / item.minStock) * 100;
    if (percentageLeft <= 30) return 'Critical';
    if (percentageLeft <= 60) return 'Urgent';
    return 'Low';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Low Stock Items</h1>
          <p className="text-gray-600 mt-1">Items that need immediate attention</p>
        </div>
        <div className="flex gap-3">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'stock' | 'value')}
            className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all print:hidden"
          >
            <option value="stock">Sort by Stock Level</option>
            <option value="value">Sort by Value</option>
          </select>
          <button
            onClick={handlePrint}
            className="bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-300 px-6 py-2 rounded-lg font-semibold transition-all print:hidden"
            disabled={lowStockItems.length === 0}
          >
            🖨️ Print
          </button>
          <button
            onClick={() => generateLowStockPDF(lowStockItems)}
            className="bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-300 px-6 py-2 rounded-lg font-semibold transition-all print:hidden"
            disabled={lowStockItems.length === 0}
          >
            📄 Export PDF
          </button>
          <Link
            to="/dashboard/purchases"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all print:hidden"
          >
            Create Purchase Order
          </Link>
        </div>
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: 'Critical Items',
            count: lowStockItems.filter(i => (i.currentStock / i.minStock) * 100 <= 30).length,
            color: 'red',
            icon: '🔴',
          },
          {
            label: 'Urgent Items',
            count: lowStockItems.filter(i => {
              const p = (i.currentStock / i.minStock) * 100;
              return p > 30 && p <= 60;
            }).length,
            color: 'orange',
            icon: '🟠',
          },
          {
            label: 'Low Stock Items',
            count: lowStockItems.filter(i => (i.currentStock / i.minStock) * 100 > 60).length,
            color: 'yellow',
            icon: '🟡',
          },
        ].map((stat, index) => (
          <div key={index} className={`bg-${stat.color}-50 rounded-xl shadow-lg p-6 border-l-4 border-${stat.color}-500`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-${stat.color}-600 text-sm font-semibold mb-1`}>{stat.label}</p>
                <p className={`text-3xl font-bold text-${stat.color}-900`}>{stat.count}</p>
              </div>
              <span className="text-4xl">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Low Stock Items */}
      {lowStockItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">✅</div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">All Stock Levels Are Good!</h3>
          <p className="text-gray-600">No items are currently below minimum stock levels.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-blue-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Article Code</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Current Stock</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Min Stock</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Needed</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Rate</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Est. Cost</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Supplier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {lowStockItems.map((item) => {
                  const needed = item.maxStock - item.currentStock;
                  const estimatedCost = needed * item.rate;
                  
                  return (
                    <tr key={item.id} className={`border-l-4 ${getUrgencyColor(item)} hover:bg-blue-50 transition-colors`}>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${getUrgencyColor(item)}`}>
                          {getUrgencyLabel(item)}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">{item.articleCode}</td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                          <p className="text-xs text-gray-700 font-medium">{item.description.substring(0, 40)}...</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800 font-medium">{item.category}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-red-600">{item.currentStock} {item.unit}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{item.minStock} {item.unit}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-blue-600">{needed} {item.unit}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">₨{item.rate.toFixed(2)}</td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-green-600">₨{estimatedCost.toLocaleString()}</span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-800 font-medium">{item.supplier || 'N/A'}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                <tr>
                  <td colSpan={8} className="px-6 py-4 text-right font-bold text-gray-900">Total Estimated Cost:</td>
                  <td className="px-6 py-4 font-bold text-green-600 text-lg">
                    ₨{lowStockItems.reduce((sum, item) => sum + ((item.maxStock - item.currentStock) * item.rate), 0).toLocaleString()}
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      {lowStockItems.length > 0 && (
        <div className="flex justify-end space-x-4">
          <button
            onClick={() => {
              const data = lowStockItems.map(item => ({
                articleCode: item.articleCode,
                name: item.name,
                needed: item.maxStock - item.currentStock,
                rate: item.rate,
                supplier: item.supplier,
              }));
              console.log('Export data:', data);
              alert('Purchase order list prepared! (Check console for data)');
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            📄 Export Purchase List
          </button>
          <Link
            to="/dashboard/purchases"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition inline-block"
          >
            🛒 Create Purchase Order
          </Link>
        </div>
      )}
    </div>
  );
}
