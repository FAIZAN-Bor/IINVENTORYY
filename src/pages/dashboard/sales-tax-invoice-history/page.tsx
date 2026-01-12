import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { SalesTaxInvoice } from '../../../types';

export default function SalesTaxInvoiceHistoryPage() {
    const navigate = useNavigate();
    const [selectedCompany, setSelectedCompany] = useState('');
    const [invoices, setInvoices] = useState<SalesTaxInvoice[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedInvoice, setSelectedInvoice] = useState<SalesTaxInvoice | null>(null);

    // Company info
    const salesTaxRegNo = '08-00-8452-002-46';
    const ntnNo = '2725463-1';

    useEffect(() => {
        const company = localStorage.getItem('selectedCompany');
        setSelectedCompany(company || '');

        if (company !== 'QASIM SEWING MACHINE') {
            alert('This feature is only available for Qasim Sewing Machine');
            navigate('/dashboard');
            return;
        }

        // Load saved invoices
        loadInvoices();
    }, [navigate]);

    const loadInvoices = () => {
        const saved = localStorage.getItem('salesTaxInvoices');
        if (saved) {
            const allInvoices = JSON.parse(saved);
            setInvoices([...allInvoices].reverse()); // Show newest first
        }
    };

    const filteredInvoices = invoices.filter(inv =>
        inv.partyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inv.voucherNo.includes(searchTerm) ||
        inv.partyCode.includes(searchTerm)
    );

    const deleteInvoice = (id: string) => {
        if (window.confirm('Are you sure you want to delete this invoice?')) {
            const updated = invoices.filter(inv => inv.id !== id);
            setInvoices(updated);
            // Save in original order (not reversed)
            localStorage.setItem('salesTaxInvoices', JSON.stringify([...updated].reverse()));
            setSelectedInvoice(null);
        }
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (selectedCompany !== 'QASIM SEWING MACHINE') {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Sales Tax Invoice History</h1>
                    <p className="text-gray-600 mt-1">View and manage saved GST/Sales Tax invoices</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => navigate('/dashboard/sales-tax-invoice')}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition"
                    >
                        + New Invoice
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
                    placeholder="Search by party name, voucher no, or party code..."
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Invoice List */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-lg overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4">
                        <h2 className="font-bold">Saved Invoices ({filteredInvoices.length})</h2>
                    </div>
                    <div className="max-h-[700px] overflow-y-auto">
                        {filteredInvoices.length === 0 ? (
                            <div className="p-6 text-center text-gray-500">
                                No invoices found
                            </div>
                        ) : (
                            filteredInvoices.map((invoice) => (
                                <div
                                    key={invoice.id}
                                    onClick={() => setSelectedInvoice(invoice)}
                                    className={`p-4 border-b cursor-pointer transition-colors ${selectedInvoice?.id === invoice.id
                                        ? 'bg-purple-50 border-l-4 border-l-purple-600'
                                        : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <div className="font-semibold text-gray-900 text-sm">{invoice.partyName}</div>
                                            <div className="text-xs text-gray-500">Ref: {invoice.voucherNo}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-green-600 text-sm">
                                                ₨ {invoice.grandTotal.toLocaleString('en-PK')}
                                            </div>
                                            <div className="text-xs text-gray-500">{formatDate(invoice.date)}</div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Invoice Details - Full Invoice Format */}
                <div className="lg:col-span-3 bg-white rounded-xl shadow-lg overflow-hidden">
                    {selectedInvoice ? (
                        <>
                            {/* Action Buttons */}
                            <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 flex justify-between items-center">
                                <h2 className="font-bold">Invoice Details</h2>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => navigate(`/dashboard/sales-tax-invoice/${selectedInvoice.id}`)}
                                        className="px-4 py-2 bg-green-500 text-white rounded font-semibold text-sm hover:bg-green-600"
                                    >
                                        ✏️ Edit Invoice
                                    </button>
                                    <button
                                        onClick={() => deleteInvoice(selectedInvoice.id)}
                                        className="px-4 py-2 bg-red-500 text-white rounded font-semibold text-sm hover:bg-red-600"
                                    >
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>

                            {/* Full Invoice Display */}
                            <div className="p-6">
                                {/* Invoice Header */}
                                <div className="text-center mb-4 border-b-2 border-black pb-4">
                                    <h2 className="text-xl font-bold">SALES-TAX INVOICE</h2>
                                    <div className="flex justify-between items-start mt-2 text-sm">
                                        <div className="text-left">
                                            <span><strong>Ref:</strong> {selectedInvoice.voucherNo}</span>
                                        </div>
                                        <div className="text-center">
                                            <div>Sales Tax Reg # <strong>{salesTaxRegNo}</strong></div>
                                            <div>NTN# <strong>{ntnNo}</strong></div>
                                        </div>
                                        <div className="text-right">
                                            <span><strong>Date:</strong> {formatDate(selectedInvoice.date)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Party Details */}
                                <div className="mb-4 text-sm border-b border-gray-300 pb-4">
                                    <div className="grid grid-cols-12 gap-2 mb-2">
                                        <span className="col-span-2 font-semibold">Party Name:</span>
                                        <span className="col-span-10 font-semibold border-b border-black px-2">{selectedInvoice.partyName}</span>
                                    </div>
                                    <div className="grid grid-cols-12 gap-2 mb-2">
                                        <span className="col-span-2 font-semibold">Address:</span>
                                        <span className="col-span-10 border-b border-black px-2">{selectedInvoice.partyAddress || '-'}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid grid-cols-6 gap-2">
                                            <span className="col-span-2 font-semibold">N.T.N#:</span>
                                            <span className="col-span-4 border-b border-black px-2">{selectedInvoice.partyNTN || '-'}</span>
                                        </div>
                                        <div className="grid grid-cols-6 gap-2">
                                            <span className="col-span-2 font-semibold">G.S.T#:</span>
                                            <span className="col-span-4 border-b border-black px-2">{selectedInvoice.partyGST || '-'}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Items Table */}
                                <div className="mb-4">
                                    <table className="w-full text-xs border-collapse border border-black">
                                        <thead>
                                            <tr className="bg-gray-100">
                                                <th className="border border-black px-2 py-2 w-10">Sr #</th>
                                                <th className="border border-black px-2 py-2 text-left">Description</th>
                                                <th className="border border-black px-2 py-2 w-24">HS Code</th>
                                                <th className="border border-black px-2 py-2 w-16">Kgs</th>
                                                <th className="border border-black px-2 py-2 w-16">Quantity</th>
                                                <th className="border border-black px-2 py-2 w-20">Unit Price</th>
                                                <th className="border border-black px-2 py-2 w-24">Value Exc. ST</th>
                                                <th className="border border-black px-2 py-2 w-20">S.T.Amt<br />18.00%</th>
                                                <th className="border border-black px-2 py-2 w-24">Amt. Incl.<br />S.T.</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedInvoice.items.map((item, index) => (
                                                <tr key={item.id} className="hover:bg-gray-50">
                                                    <td className="border border-black px-2 py-1 text-center">{index + 1}</td>
                                                    <td className="border border-black px-2 py-1">{item.itemName}</td>
                                                    <td className="border border-black px-2 py-1 text-center">{item.hsCode}</td>
                                                    <td className="border border-black px-2 py-1 text-right">{item.weightKgs.toFixed(2)}</td>
                                                    <td className="border border-black px-2 py-1 text-center">{item.quantity}</td>
                                                    <td className="border border-black px-2 py-1 text-right">{item.rate.toLocaleString('en-PK')}</td>
                                                    <td className="border border-black px-2 py-1 text-right font-semibold">{item.amtExclTax.toLocaleString('en-PK')}</td>
                                                    <td className="border border-black px-2 py-1 text-right text-blue-700">{item.salesTax.toLocaleString('en-PK')}</td>
                                                    <td className="border border-black px-2 py-1 text-right font-bold">{item.valIncTax.toLocaleString('en-PK')}</td>
                                                </tr>
                                            ))}

                                            {/* Totals Row */}
                                            <tr className="font-bold bg-gray-100">
                                                <td colSpan={3} className="border border-black px-2 py-2 text-right">Total:</td>
                                                <td className="border border-black px-2 py-2 text-right">{selectedInvoice.totalWeight.toFixed(2)}</td>
                                                <td className="border border-black px-2 py-2 text-center">{selectedInvoice.totalQuantity}</td>
                                                <td className="border border-black px-2 py-2"></td>
                                                <td className="border border-black px-2 py-2 text-right">{selectedInvoice.totalAmtExclTax.toLocaleString('en-PK')}</td>
                                                <td className="border border-black px-2 py-2 text-right text-blue-700">{selectedInvoice.totalSalesTax.toLocaleString('en-PK')}</td>
                                                <td className="border border-black px-2 py-2 text-right text-green-700">{selectedInvoice.grandTotal.toLocaleString('en-PK')}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Footer Note */}
                                <div className="text-center text-sm mt-6 mb-4 italic">
                                    This is a system generated invoice & does not require any sign and stamp.
                                </div>

                                {/* Signature Section */}
                                <div className="flex justify-between mt-8 text-sm">
                                    <div className="border-t border-black pt-2 w-40 text-center">
                                        <span className="italic">Authorised Signature</span>
                                    </div>
                                    <div className="border-t border-black pt-2 w-40 text-center">
                                        <span className="italic">Consumer</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-96 text-gray-500">
                            <div className="text-center">
                                <div className="text-6xl mb-4">📄</div>
                                <p className="text-lg">Select an invoice to view details</p>
                                <p className="text-sm mt-2">Click on any invoice from the list</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
