import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DeliveryChallan } from '../../../types';

export default function DeliveryChallanHistoryPage() {
    const navigate = useNavigate();
    const [challans, setChallans] = useState<DeliveryChallan[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewChallan, setViewChallan] = useState<DeliveryChallan | null>(null);

    useEffect(() => {
        loadChallans();
    }, []);

    const loadChallans = () => {
        const saved = localStorage.getItem('deliveryChallans');
        if (saved) {
            const allChallans = JSON.parse(saved);
            setChallans([...allChallans].reverse()); // Newest first
        }
    };

    const deleteChallan = (id: string) => {
        if (window.confirm('Are you sure you want to delete this challan?')) {
            const updated = challans.filter(c => c.id !== id);
            setChallans(updated);
            // Save in original chronological order (reverse of display)
            localStorage.setItem('deliveryChallans', JSON.stringify([...updated].reverse()));
        }
    };

    const filteredChallans = challans.filter(c =>
        c.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.dcNumber.includes(searchTerm) ||
        c.date.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Delivery Challan History</h1>
                    <p className="text-gray-600 mt-1">View and manage saved Delivery Challans</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/dashboard/delivery-challan')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                    >
                        + New Challan
                    </button>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-white hover:bg-gray-100 text-gray-700 border-2 border-gray-300 px-6 py-3 rounded-lg font-semibold transition"
                    >
                        ← Back
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="bg-white rounded-xl shadow-lg p-4">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Search by Party Name, Challan #, or Date..."
                />
            </div>

            {/* List */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-sm font-bold">
                        <tr>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Challan #</th>
                            <th className="px-6 py-4">Party Name</th>
                            <th className="px-6 py-4 text-center">Total Items</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredChallans.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    No challans found.
                                </td>
                            </tr>
                        ) : (
                            filteredChallans.map((challan) => (
                                <tr
                                    key={challan.id}
                                    className="hover:bg-blue-50 transition-colors cursor-pointer"
                                    onClick={() => setViewChallan(challan)}
                                >
                                    <td className="px-6 py-4">
                                        {new Date(challan.date).toLocaleDateString('en-GB')}
                                    </td>
                                    <td className="px-6 py-4 font-mono font-bold text-blue-600">
                                        {challan.dcNumber}
                                    </td>
                                    <td className="px-6 py-4 font-semibold">
                                        {challan.partyName}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {challan.totalQty} (Qty) / {challan.items.length} (Rows)
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-2">

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteChallan(challan.id);
                                            }}
                                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-100 rounded"
                                            title="Delete"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>


            {/* View Modal */}
            {
                viewChallan && (
                    <div
                        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
                        onClick={() => setViewChallan(null)}
                    >
                        <div
                            className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-900">Delivery Challan Details</h2>
                                        <div className="text-gray-500 font-mono mt-1">#{viewChallan.dcNumber}</div>
                                    </div>
                                    <button
                                        onClick={() => setViewChallan(null)}
                                        className="text-gray-400 hover:text-gray-600 font-bold text-xl"
                                    >
                                        ✕
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-6 mb-8 bg-gray-50 p-4 rounded-lg">
                                    <div>
                                        <label className="text-sm text-gray-500 font-medium">Date</label>
                                        <div className="font-semibold">{new Date(viewChallan.date).toLocaleDateString('en-GB')}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 font-medium">Total Quantity</label>
                                        <div className="font-semibold">{viewChallan.totalQty}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 font-medium">Party Name</label>
                                        <div className="font-semibold">{viewChallan.partyName}</div>
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-500 font-medium">Courier</label>
                                        <div className="font-semibold">{viewChallan.courierName || '-'}</div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-sm text-gray-500 font-medium">Address</label>
                                        <div className="font-semibold">{viewChallan.partyAddress || '-'}</div>
                                    </div>
                                </div>

                                <div className="border rounded-lg overflow-hidden mb-6">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-gray-100 font-bold text-gray-700">
                                            <tr>
                                                <th className="px-4 py-2">Item Name</th>
                                                <th className="px-4 py-2 border-l">PO #</th>
                                                <th className="px-4 py-2 border-l">Demand</th>
                                                <th className="px-4 py-2 border-l text-center">Qty</th>
                                                <th className="px-4 py-2 border-l text-center">Unit</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y">
                                            {viewChallan.items.map((item, idx) => (
                                                <tr key={idx}>
                                                    <td className="px-4 py-2">{item.itemName}</td>
                                                    <td className="px-4 py-2 border-l">{item.poNumber}</td>
                                                    <td className="px-4 py-2 border-l">{item.demandNumber}</td>
                                                    <td className="px-4 py-2 border-l text-center font-bold">{item.quantity}</td>
                                                    <td className="px-4 py-2 border-l text-center">{item.unit}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="flex justify-end gap-3 pt-4 border-t">
                                    <button
                                        onClick={() => setViewChallan(null)}
                                        className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
                                    >
                                        Close
                                    </button>
                                    <button
                                        onClick={() => navigate('/dashboard/delivery-challan', { state: { challan: viewChallan } })}
                                        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition flex items-center gap-2"
                                    >
                                        <span>✏️</span> Edit Challan
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
