import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { SalesTaxInvoiceItem, SalesTaxInvoice } from '../../../types';
import { parties as mockParties, inventoryItems as defaultInventory } from '../../../data/mockData';
import QasimSewingLogo from '../../../images/Qasim.jpeg';

export default function SalesTaxInvoicePage() {
    const navigate = useNavigate();
    const { id: editingId } = useParams<{ id: string }>();
    const [selectedCompany, setSelectedCompany] = useState('');
    const [refNo, setRefNo] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isEditMode, setIsEditMode] = useState(false);

    // Party fields
    const [partyCode, setPartyCode] = useState('');
    const [partyName, setPartyName] = useState('');
    const [partyAddress, setPartyAddress] = useState('');
    const [partyNTN, setPartyNTN] = useState('');
    const [partyGST, setPartyGST] = useState('');
    const [parties, setParties] = useState<any[]>([]);
    const [showPartyDropdown, setShowPartyDropdown] = useState(false);
    const [partySearch, setPartySearch] = useState('');

    // Items
    const [items, setItems] = useState<SalesTaxInvoiceItem[]>([]);
    const [inventoryItems, setInventoryItems] = useState<any[]>([]);
    const [showItemDropdown, setShowItemDropdown] = useState<string | null>(null);
    const [itemSearch, setItemSearch] = useState('');

    // Kgs popup
    const [showKgsModal, setShowKgsModal] = useState(false);
    const [kgsModalItemId, setKgsModalItemId] = useState<string | null>(null);
    const [kgsRate, setKgsRate] = useState('');

    // History Modal State
    const [showHistoryModal, setShowHistoryModal] = useState(false);
    const [historySearch, setHistorySearch] = useState('');
    const [savedInvoices, setSavedInvoices] = useState<SalesTaxInvoice[]>([]);
    const [currentEditingId, setCurrentEditingId] = useState<string | null>(null);

    // Initialize editing ID from params if available
    useEffect(() => {
        if (editingId) {
            setCurrentEditingId(editingId);
        }
    }, [editingId]);

    // Load saved invoices for history
    useEffect(() => {
        if (showHistoryModal) {
            const saved = localStorage.getItem('salesTaxInvoices');
            if (saved) {
                setSavedInvoices(JSON.parse(saved).reverse()); // Show newest first
            }
        }
    }, [showHistoryModal]);



    // Company info
    const salesTaxRegNo = '08-00-8452-002-46';
    const ntnNo = '2725463-1';

    // Ref for party dropdown click outside detection
    const partyDropdownRef = useRef<HTMLDivElement>(null);

    // Check company access
    useEffect(() => {
        const company = localStorage.getItem('selectedCompany');
        setSelectedCompany(company || '');

        if (company !== 'QASIM SEWING MACHINE') {
            alert('This feature is only available for Qasim Sewing Machine');
            navigate('/dashboard');
            return;
        }

        // Load parties
        const savedParties = localStorage.getItem('parties');
        setParties(savedParties ? JSON.parse(savedParties) : mockParties);

        // Load inventory items
        const savedInventory = localStorage.getItem('inventoryItems');
        setInventoryItems(savedInventory ? JSON.parse(savedInventory) : defaultInventory);

        // Generate ref number or load existing invoice for editing
        if (editingId) {
            loadInvoiceForEditing(editingId);
        } else {
            generateRefNo();
        }

        // Click outside handler for party dropdown
        const handleClickOutside = (event: MouseEvent) => {
            if (partyDropdownRef.current && !partyDropdownRef.current.contains(event.target as Node)) {
                setShowPartyDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [navigate]);

    // Click outside handler for item dropdowns
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (showItemDropdown) {
                const target = event.target as HTMLElement;
                if (!target.closest('.item-search-wrapper')) {
                    setShowItemDropdown(null);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showItemDropdown]);

    const generateRefNo = () => {
        const saved = localStorage.getItem('salesTaxInvoices');
        const invoices = saved ? JSON.parse(saved) : [];
        const nextNo = invoices.length + 5657;
        setRefNo(nextNo.toString());
    };

    const loadInvoiceForEditing = (invoiceId: string) => {
        const saved = localStorage.getItem('salesTaxInvoices');
        if (saved) {
            const invoices = JSON.parse(saved);
            const invoice = invoices.find((inv: SalesTaxInvoice) => inv.id === invoiceId);
            if (invoice) {
                setIsEditMode(true);
                setRefNo(invoice.voucherNo);
                setDate(invoice.date);
                setPartyCode(invoice.partyCode);
                setPartyName(invoice.partyName);
                setPartySearch(invoice.partyName);
                setPartyAddress(invoice.partyAddress || '');
                setPartyNTN(invoice.partyNTN || '');
                setPartyGST(invoice.partyGST || '');
                setItems(invoice.items);
            }
        }
    };

    const addItem = () => {
        const newItem: SalesTaxInvoiceItem = {
            id: Date.now().toString(),
            itemName: '',
            hsCode: '8452.9090',
            poNumber: '',
            demandNumber: '',
            weightKgs: 0,
            quantity: 0,
            unit: 'Pieces',
            rate: 0, // Unit Price (Sale Price)
            amtExclTax: 0, // Value Exc. ST = Quantity Ã— Unit Price
            stPercent: 18,
            salesTax: 0, // S.T. Amt = Value Exc. ST Ã— 18%
            valIncTax: 0, // Amt. Incl. S.T. = Value Exc. ST + S.T. Amt
        };
        setItems([...items, newItem]);
    };

    const removeItem = (id: string) => {
        setItems(items.filter(item => item.id !== id));
    };

    const updateItem = (id: string, field: keyof SalesTaxInvoiceItem, value: any) => {
        setItems(prevItems => prevItems.map(item => {
            if (item.id === id) {
                const updated = { ...item, [field]: value };

                // Recalculate based on field changed
                if (field === 'quantity' || field === 'rate') {
                    // Value Exc. ST = Quantity Ã— Unit Price
                    updated.amtExclTax = updated.quantity * updated.rate;
                    // S.T. Amt = Value Exc. ST Ã— 18%
                    updated.salesTax = Math.round((updated.amtExclTax * updated.stPercent) / 100);
                    // Amt. Incl. S.T. = Value Exc. ST + S.T. Amt
                    updated.valIncTax = updated.amtExclTax + updated.salesTax;
                }

                if (field === 'stPercent') {
                    updated.salesTax = Math.round((updated.amtExclTax * updated.stPercent) / 100);
                    updated.valIncTax = updated.amtExclTax + updated.salesTax;
                }

                return updated;
            }
            return item;
        }));
    };

    // Calculate Kgs from rate
    const calculateKgs = () => {
        if (!kgsModalItemId || !kgsRate) return;

        const rate = parseFloat(kgsRate);
        if (rate <= 0) {
            alert('Please enter a valid rate greater than 0');
            return;
        }

        const item = items.find(i => i.id === kgsModalItemId);
        if (item && item.amtExclTax > 0) {
            // Kgs = Value Exc. ST / Rate
            const kgs = item.amtExclTax / rate;
            updateItem(kgsModalItemId, 'weightKgs', parseFloat(kgs.toFixed(2)));
        }

        setShowKgsModal(false);
        setKgsModalItemId(null);
        setKgsRate('');
    };

    // Open Kgs modal
    const openKgsModal = (itemId: string) => {
        setKgsModalItemId(itemId);
        setKgsRate('');
        setShowKgsModal(true);
    };

    // Search party by code or name
    const selectParty = (party: any) => {
        setPartyCode(party.partyNumber?.toString() || party.id);
        setPartyName(party.name);
        setPartyAddress(party.address || '');
        setPartyNTN(party.ntn || '');
        setPartyGST(party.strn || party.gst || '');
        setPartySearch('');
        setShowPartyDropdown(false);
    };

    // Clear party details
    const clearParty = () => {
        setPartyCode('');
        setPartyName('');
        setPartyAddress('');
        setPartyNTN('');
        setPartyGST('');
        setPartySearch('');
    };

    // Select item from inventory
    const selectItem = (itemId: string, inventoryItem: any) => {
        setItems(prevItems => prevItems.map(item => {
            if (item.id === itemId) {
                return {
                    ...item,
                    itemName: `${inventoryItem.name || inventoryItem.description}\n${inventoryItem.articleCode}`,
                    hsCode: inventoryItem.hsCode || '8452.9090',
                    rate: inventoryItem.salePrice || inventoryItem.rate || 0, // Use sale price as Unit Price
                };
            }
            return item;
        }));
        setShowItemDropdown(null);
        setItemSearch('');
    };

    // Filter parties by code or name
    const filteredParties = parties.filter(p =>
        p.name?.toLowerCase().includes(partySearch.toLowerCase()) ||
        (p.partyNumber?.toString() || '').includes(partySearch) ||
        p.id?.includes(partySearch)
    );

    const filteredInventory = inventoryItems.filter(item =>
        item.name?.toLowerCase().includes(itemSearch.toLowerCase()) ||
        item.articleCode?.toLowerCase().includes(itemSearch.toLowerCase()) ||
        item.description?.toLowerCase().includes(itemSearch.toLowerCase())
    );

    // Totals
    const totalKgs = items.reduce((sum, item) => sum + item.weightKgs, 0);
    const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalAmtExclTax = items.reduce((sum, item) => sum + item.amtExclTax, 0);
    const totalSalesTax = items.reduce((sum, item) => sum + item.salesTax, 0);
    const grandTotal = items.reduce((sum, item) => sum + item.valIncTax, 0);

    const handleSave = () => {
        if (!partyName) {
            alert('Please select a party');
            return;
        }
        if (items.length === 0) {
            alert('Please add at least one item');
            return;
        }

        const invoice: SalesTaxInvoice = {
            id: isEditMode && currentEditingId ? currentEditingId : Date.now().toString(),
            voucherNo: refNo,
            partyCode,
            partyName,
            partyAddress,
            partyNTN,
            partyGST,
            date,
            items,
            totalQuantity,
            totalWeight: totalKgs,
            totalAmtExclTax,
            totalSalesTax,
            grandTotal,
            createdBy: 'Admin',
            companyName: 'QASIM SEWING MACHINE',
        };

        const saved = localStorage.getItem('salesTaxInvoices');
        let invoices = saved ? JSON.parse(saved) : [];

        if (isEditMode && currentEditingId) {
            // Update existing invoice
            invoices = invoices.map((inv: SalesTaxInvoice) =>
                inv.id === currentEditingId ? invoice : inv
            );
            localStorage.setItem('salesTaxInvoices', JSON.stringify(invoices));
            alert('Sales Tax Invoice updated successfully!');
            // navigate('/dashboard/sales-tax-invoice-history');
        } else {
            // Create new invoice
            invoices.push(invoice);
            localStorage.setItem('salesTaxInvoices', JSON.stringify(invoices));
            alert('Sales Tax Invoice saved successfully!');

            // Reset form
            setPartyCode('');
            setPartyName('');
            setPartyAddress('');
            setPartyNTN('');
            setPartyGST('');
            setPartySearch('');
            setItems([]);
            generateRefNo();
        }
    };

    const handleSelectInvoice = (invoice: SalesTaxInvoice) => {
        setIsEditMode(true);
        setCurrentEditingId(invoice.id);

        // Load data
        setRefNo(invoice.voucherNo);
        setDate(invoice.date);
        setPartyCode(invoice.partyCode);
        setPartyName(invoice.partyName);
        setPartySearch(invoice.partyName);
        setPartyAddress(invoice.partyAddress || '');
        setPartyNTN(invoice.partyNTN || '');
        setPartyGST(invoice.partyGST || '');
        setItems(invoice.items);

        setShowHistoryModal(false);
    };

    const filteredHistory = savedInvoices.filter(inv =>
        inv.voucherNo?.toLowerCase().includes(historySearch.toLowerCase()) ||
        inv.partyName?.toLowerCase().includes(historySearch.toLowerCase()) ||
        inv.date?.includes(historySearch)
    );

    const handlePrint = () => {
        window.print();
    };

    const handleDelete = () => {
        if (!isEditMode || !currentEditingId) return;

        if (window.confirm('Are you sure you want to delete this invoice?')) {
            const saved = localStorage.getItem('salesTaxInvoices');
            if (saved) {
                const invoices = JSON.parse(saved);
                const updated = invoices.filter((inv: SalesTaxInvoice) => inv.id !== currentEditingId);
                localStorage.setItem('salesTaxInvoices', JSON.stringify(updated));

                // Update local history list if modal is open (optional, but good practice if we had shared state)
                setSavedInvoices(updated.reverse());

                alert('Invoice deleted successfully');
                handleNewInvoice();
            }
        }
    };

    const handleNewInvoice = () => {
        setIsEditMode(false);
        setCurrentEditingId(null);
        setPartyCode('');
        setPartyName('');
        setPartyAddress('');
        setPartyNTN('');
        setPartyGST('');
        setPartySearch('');
        setItems([]);
        setDate(new Date().toISOString().split('T')[0]);
        generateRefNo();
    };

    if (selectedCompany !== 'QASIM SEWING MACHINE') {
        return null;
    }

    return (
        <div className="space-y-6">
            {/* History Modal */}
            {showHistoryModal && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 no-print"
                    onClick={() => setShowHistoryModal(false)}
                >
                    <div
                        className="bg-white rounded-xl p-6 shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Invoice History</h3>
                            <button onClick={() => setShowHistoryModal(false)} className="text-gray-500 hover:text-gray-700">×</button>
                        </div>

                        <input
                            type="text"
                            placeholder="Search by Ref #, Party Name, or Date..."
                            value={historySearch}
                            onChange={(e) => setHistorySearch(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
                            autoFocus
                        />

                        <div className="overflow-y-auto flex-1">
                            {filteredHistory.length > 0 ? (
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-gray-100 sticky top-0">
                                        <tr>
                                            <th className="p-3 border-b">Ref #</th>
                                            <th className="p-3 border-b">Date</th>
                                            <th className="p-3 border-b">Party</th>
                                            <th className="p-3 border-b text-right">Amount</th>
                                            <th className="p-3 border-b text-center">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredHistory.map(inv => (
                                            <tr key={inv.id} className="hover:bg-blue-50 transition-colors border-b">
                                                <td className="p-3 font-semibold">{inv.voucherNo}</td>
                                                <td className="p-3">{new Date(inv.date).toLocaleDateString('en-GB')}</td>
                                                <td className="p-3">{inv.partyName}</td>
                                                <td className="p-3 text-right font-bold">Rs. {inv.grandTotal.toLocaleString()}</td>
                                                <td className="p-3 text-center">
                                                    <button
                                                        onClick={() => handleSelectInvoice(inv)}
                                                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-semibold"
                                                    >
                                                        Edit
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="text-center py-8 text-gray-500">No invoices found matching "{historySearch}"</div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Print Styles */}
            <style>{`
        @media print {
            /* Hide everything by default (Screen content) */
            body * {
                visibility: hidden;
            }
            
            /* Show only the print view and its children */
            #invoice-print-view, #invoice-print-view * {
                visibility: visible;
            }
            
            /* Print View Styling */
            /* Add top padding to clear pre-printed header (~45mm) */
            /* Print View Styling */
            #invoice-print-view {
                position: absolute;
                left: 0;
                top: 0;
                width: 210mm;
                background: white;
            }
            
            .invoice-header-container {
                position: relative;
                width: 100%;
                height: 50mm; /* Fixed height to crop A4 scan whitespace */
                overflow: hidden;
                margin-bottom: 2mm;
            }
            
            .header-image {
                width: 100%;
                height: 100%;
                object-fit: cover; /* Crop bottom */
                object-position: top;
                display: block;
            }
            }
            
            .invoice-info { 
                display: flex; 
                justify-content: space-between; 
                align-items: flex-end; 
                margin-bottom: 5mm; 
                font-size: 11pt; 
                padding-top: 5mm;
            }

            .invoice-info { 
                display: flex; 
                justify-content: center; 
                margin-bottom: 5mm; 
                font-size: 13pt; 
            }
            
            .party-details { margin-bottom: 3mm; font-size: 11pt; }
            .party-row { display: flex; margin-bottom: 2mm; }
            .party-label { width: 90px; font-weight: bold; }
            .party-value { border-bottom: 1px solid black; flex: 1; padding-left: 3mm; }
            
            table { width: 100%; border-collapse: collapse; page-break-inside: auto; font-size: 13pt; }
            thead { display: table-header-group; }
            tbody { display: table-row-group; }
            tr { page-break-inside: avoid; page-break-after: auto; }
            
            th { border: 1px solid black; padding: 5px; background: #f0f0f0 !important; font-weight: bold; }
            td { border: 1px solid black; padding: 5px; }
            
            .text-center { text-align: center; }
            .text-right { text-align: right; }
            .text-left { text-align: left; }
            .font-bold { font-weight: bold; }
            
            .footer { margin-top: 8mm; text-align: center; font-style: italic; font-size: 13pt; }
            .signatures { display: flex; justify-content: space-between; margin-top: 15mm; font-size: 11pt; }
            .signature-line { border-top: 1px solid black; width: 120px; padding-top: 3mm; text-align: center; }
        }
        
        @media screen {
            #invoice-print-view { display: none; }
        }
      `}</style>

            {/* Kgs Rate Modal */}
            {showKgsModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 shadow-2xl max-w-sm w-full mx-4">
                        <h3 className="text-lg font-bold mb-4">Calculate Weight (Kgs)</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Enter the rate per Kg. Weight will be calculated as:<br />
                            <strong>Kgs = Value Exc. ST ÷ Rate</strong>
                        </p>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold mb-2">Rate per Kg:</label>
                            <input
                                type="number"
                                value={kgsRate}
                                onChange={(e) => setKgsRate(e.target.value)}
                                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter rate..."
                                autoFocus
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowKgsModal(false)}
                                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={calculateKgs}
                                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold"
                            >
                                Calculate
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex justify-between items-center no-print">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Sales Tax Invoice</h1>
                    <p className="text-gray-600 mt-1">GST/Sales Tax compliant invoices for Qasim Sewing Machine</p>
                </div>
                <button
                    onClick={() => setShowHistoryModal(true)}
                    className="bg-purple-600 hover:bg-purple-700 text-white border-2 border-purple-800 px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2"
                >
                    <span>📜</span> History
                </button>
            </div>

            {/* Invoice Form */}
            <div id="printable-invoice" className="bg-white rounded-xl shadow-lg border border-gray-300 p-6">

                {/* Company Logo - Shows on print */}
                <div className="print-header hidden print:flex justify-center mb-4">
                    <img
                        src={QasimSewingLogo}
                        alt="Qasim Sewing Machine"
                        className="invoice-logo w-32 h-auto"
                    />
                </div>

                {/* Invoice Header */}
                <div className="text-center mb-4 border-b-2 border-black pb-4">
                    <h2 className="text-xl font-bold">SALES-TAX INVOICE</h2>
                    <div className="flex justify-between items-start mt-2 text-sm">
                        <div className="text-left">
                            <div className="flex gap-4">
                                <span><strong>Ref:</strong></span>
                                <input
                                    type="text"
                                    value={refNo}
                                    onChange={(e) => setRefNo(e.target.value)}
                                    className="border-b border-black w-20 text-center font-semibold"
                                />
                            </div>
                        </div>
                        <div className="text-center">
                            <div>Sales Tax Reg # <strong>{salesTaxRegNo}</strong></div>
                            <div>NTN# <strong>{ntnNo}</strong></div>
                        </div>
                        <div className="text-right">
                            <span><strong>Date:</strong></span>
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="ml-2 border border-gray-300 rounded px-2 py-1 no-print"
                            />
                            <span className="hidden print:inline ml-2">{new Date(date).toLocaleDateString('en-GB')}</span>
                        </div>
                    </div>
                </div>

                {/* Party Details */}
                <div className="mb-4 text-sm border-b border-gray-300 pb-4">
                    <div className="grid grid-cols-12 gap-2 mb-2">
                        <span className="col-span-2 font-semibold">Party Name:</span>
                        <div className="col-span-9 relative" ref={partyDropdownRef}>
                            <input
                                type="text"
                                value={partySearch || partyName}
                                onChange={(e) => {
                                    setPartySearch(e.target.value);
                                    setPartyName('');
                                    setShowPartyDropdown(true);
                                }}
                                onFocus={() => setShowPartyDropdown(true)}
                                className="w-full border-b border-black px-2 py-1 font-semibold no-print"
                                placeholder="Search by name or party code..."
                            />
                            <span className="hidden print:block font-semibold">{partyName}</span>

                            {showPartyDropdown && filteredParties.length > 0 && (
                                <div className="absolute z-30 w-full mt-1 bg-white border-2 border-blue-400 rounded-lg shadow-xl max-h-60 overflow-y-auto no-print">
                                    {filteredParties.slice(0, 15).map((party) => (
                                        <div
                                            key={party.id}
                                            onClick={() => selectParty(party)}
                                            className="px-4 py-3 hover:bg-blue-100 cursor-pointer border-b last:border-b-0 transition-colors"
                                        >
                                            <div className="font-semibold text-gray-900">{party.name}</div>
                                            <div className="text-xs text-gray-500">
                                                Code: {party.partyNumber || party.id} | {party.city || 'N/A'}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="col-span-1 flex items-center no-print">
                            <button
                                onClick={clearParty}
                                className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-semibold"
                                title="Clear party details"
                            >
                                Clear
                            </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-12 gap-2 mb-2">
                        <span className="col-span-2 font-semibold">Address:</span>
                        <input
                            type="text"
                            value={partyAddress}
                            onChange={(e) => setPartyAddress(e.target.value)}
                            className="col-span-10 border-b border-black px-2 py-1"
                            placeholder="Party address"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="grid grid-cols-6 gap-2">
                            <span className="col-span-2 font-semibold">N.T.N#:</span>
                            <input
                                type="text"
                                value={partyNTN}
                                onChange={(e) => setPartyNTN(e.target.value)}
                                className="col-span-4 border-b border-black px-2 py-1"
                                placeholder="NTN Number"
                            />
                        </div>
                        <div className="grid grid-cols-6 gap-2">
                            <span className="col-span-2 font-semibold">G.S.T#:</span>
                            <input
                                type="text"
                                value={partyGST}
                                onChange={(e) => setPartyGST(e.target.value)}
                                className="col-span-4 border-b border-black px-2 py-1"
                                placeholder="GST/STRN Number"
                            />
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
                                <th className="border border-black px-2 py-2 w-16 cursor-pointer" title="Click on value to calculate">Kgs</th>
                                <th className="border border-black px-2 py-2 w-16">Quantity</th>
                                <th className="border border-black px-2 py-2 w-20">Unit Price</th>
                                <th className="border border-black px-2 py-2 w-24">Value Exc. ST</th>
                                <th className="border border-black px-2 py-2 w-20">S.T.Amt<br />18.00%</th>
                                <th className="border border-black px-2 py-2 w-24">Amt. Incl.<br />S.T.</th>
                                <th className="border border-black px-2 py-2 w-12 no-print">×</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="border border-black px-2 py-1 text-center">{index + 1}</td>
                                    <td className="border border-black px-2 py-1 relative item-search-wrapper">
                                        <input
                                            type="text"
                                            value={item.itemName}
                                            onChange={(e) => {
                                                updateItem(item.id, 'itemName', e.target.value);
                                                setItemSearch(e.target.value);
                                                setShowItemDropdown(item.id);
                                            }}
                                            onFocus={() => {
                                                setShowItemDropdown(item.id);
                                                setItemSearch(item.itemName || '');
                                            }}
                                            className="w-full px-1 py-0.5 border-0 focus:ring-1 focus:ring-blue-500 text-xs"
                                            placeholder="Click to search item..."
                                        />
                                        {showItemDropdown === item.id && (
                                            <div className="absolute z-30 left-0 w-80 mt-1 bg-white border-2 border-blue-400 rounded-lg shadow-xl max-h-48 overflow-y-auto no-print">
                                                {filteredInventory.length > 0 ? (
                                                    filteredInventory.slice(0, 10).map((inv) => (
                                                        <div
                                                            key={inv.id}
                                                            onClick={() => selectItem(item.id, inv)}
                                                            className="px-4 py-3 hover:bg-blue-100 cursor-pointer border-b last:border-b-0 transition-colors"
                                                        >
                                                            <div className="font-semibold text-sm text-gray-900">{inv.articleCode}</div>
                                                            <div className="text-xs text-gray-600">{inv.name || inv.description}</div>
                                                            <div className="text-xs text-green-600 font-semibold">
                                                                Sale Price: Rs. {inv.salePrice || inv.rate || 0}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="px-4 py-3 text-gray-500 text-center">No items found</div>
                                                )}
                                            </div>
                                        )}
                                    </td>
                                    <td className="border border-black px-1 py-1">
                                        <input
                                            type="text"
                                            value={item.hsCode}
                                            onChange={(e) => updateItem(item.id, 'hsCode', e.target.value)}
                                            className="w-full px-1 py-0.5 border-0 text-center text-xs"
                                        />
                                    </td>
                                    <td
                                        className="border border-black px-2 py-1 text-right bg-yellow-50 cursor-pointer hover:bg-yellow-100"
                                        onClick={() => openKgsModal(item.id)}
                                        title="Click to calculate Kgs"
                                    >
                                        {item.weightKgs.toFixed(2)}
                                    </td>
                                    <td className="border border-black px-1 py-1">
                                        <input
                                            type="number"
                                            value={item.quantity || ''}
                                            onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                                            className="w-full px-1 py-0.5 border-0 text-center text-xs"
                                            placeholder="0"
                                        />
                                    </td>
                                    <td className="border border-black px-1 py-1">
                                        <input
                                            type="number"
                                            value={item.rate || ''}
                                            onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                                            className="w-full px-1 py-0.5 border-0 text-right text-xs"
                                            step="0.01"
                                            placeholder="0.00"
                                        />
                                    </td>
                                    <td className="border border-black px-2 py-1 text-right font-semibold bg-gray-50">
                                        {item.amtExclTax.toLocaleString('en-PK')}
                                    </td>
                                    <td className="border border-black px-2 py-1 text-right text-blue-700 bg-blue-50">
                                        {item.salesTax.toLocaleString('en-PK')}
                                    </td>
                                    <td className="border border-black px-2 py-1 text-right font-bold bg-green-50">
                                        {item.valIncTax.toLocaleString('en-PK')}
                                    </td>
                                    <td className="border border-black px-2 py-1 text-center no-print">
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="text-red-600 hover:text-red-800 font-bold text-lg"
                                        >
                                            ×
                                        </button>
                                    </td>
                                </tr>
                            ))}

                            {/* Totals Row */}
                            <tr className="font-bold bg-gray-100">
                                <td colSpan={3} className="border border-black px-2 py-2 text-right">Total:</td>
                                <td className="border border-black px-2 py-2 text-right">{totalKgs.toFixed(2)}</td>
                                <td className="border border-black px-2 py-2 text-center">{totalQuantity}</td>
                                <td className="border border-black px-2 py-2"></td>
                                <td className="border border-black px-2 py-2 text-right">{totalAmtExclTax.toLocaleString('en-PK')}</td>
                                <td className="border border-black px-2 py-2 text-right text-blue-700">{totalSalesTax.toLocaleString('en-PK')}</td>
                                <td className="border border-black px-2 py-2 text-right text-green-700">{grandTotal.toLocaleString('en-PK')}</td>
                                <td className="border border-black no-print"></td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Add Item Button */}
                    <div className="mt-4 no-print">
                        <button
                            onClick={addItem}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition"
                        >
                            + Add Item
                        </button>
                        <span className="ml-4 text-sm text-gray-500">
                            💡 Click on Kgs cell to calculate weight from rate
                        </span>
                    </div>
                </div>

                {/* Footer Note */}
                <div className="text-center text-sm mt-8 mb-4 italic">
                    This is a system generated invoice & does not require any sign and stamp.
                </div>

                {/* Signature Section */}
                <div className="flex justify-between mt-12 text-sm">
                    <div className="border-t border-black pt-2 w-40 text-center">
                        <span className="italic">Authorised Signature</span>
                    </div>
                    <div className="border-t border-black pt-2 w-40 text-center">
                        <span className="italic">Consumer</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4 mt-8 no-print flex-wrap">
                    <button
                        onClick={handleSave}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition flex items-center gap-2"
                    >
                        <span>💾</span> Save
                    </button>

                    <button
                        onClick={handlePrint}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition flex items-center gap-2"
                    >
                        <span>🖨️</span> Print
                    </button>

                    {isEditMode && (
                        <button
                            onClick={handleDelete}
                            className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition flex items-center gap-2"
                        >
                            <span>🗑️</span> Delete
                        </button>
                    )}

                    <button
                        onClick={handleNewInvoice}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition flex items-center gap-2"
                    >
                        <span>✨</span> Clear / New
                    </button>

                    <button
                        onClick={() => navigate('/dashboard')}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition"
                    >
                        Exit
                    </button>
                </div>
            </div>
            {/* Native Print View - Hidden on Screen, Visible on Print */}
            <div id="invoice-print-view" className="hidden print:block">


                <div className="invoice-header-container">
                    <img src={QasimSewingLogo} alt="Header" className="header-image" />
                </div>

                <div className="invoice-info">
                    <div style={{ width: '200px' }}>
                        <strong>Ref:</strong> <span style={{ textDecoration: 'underline', fontWeight: 'bold' }}>&nbsp;&nbsp;{refNo}&nbsp;&nbsp;</span>
                    </div>

                    <div className="text-center" style={{ flex: 1 }}>
                        <span className="font-bold text-xl under">SALES-TAX INVOICE</span><br />
                        Sales Tax Reg # <strong>{salesTaxRegNo}</strong><br />
                        NTN # <strong>{ntnNo}</strong>
                    </div>

                    <div style={{ width: '200px', textAlign: 'right' }}>
                        <strong>Date:</strong> <span style={{ textDecoration: 'underline', fontWeight: 'bold' }}>&nbsp;&nbsp;{new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}&nbsp;&nbsp;</span>
                    </div>
                </div>

                <div className="party-details">
                    <div className="party-row">
                        <span className="party-label">Party Name:</span>
                        <span className="party-value"><strong>{partyName}</strong></span>
                    </div>
                    <div className="party-row">
                        <span className="party-label">Address:</span>
                        <span className="party-value">{partyAddress || '-'}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <div className="party-row" style={{ flex: 1 }}>
                            <span className="party-label">N.T.N#:</span>
                            <span className="party-value">{partyNTN || '-'}</span>
                        </div>
                        <div className="party-row" style={{ flex: 1 }}>
                            <span className="party-label">G.S.T#:</span>
                            <span className="party-value">{partyGST || '-'}</span>
                        </div>
                    </div>
                </div>

                <table>
                    <thead>
                        <tr>
                            <th style={{ width: '30px' }}>Sr #</th>
                            <th className="text-left">Description</th>
                            <th style={{ width: '70px' }}>HS Code</th>
                            <th style={{ width: '45px' }}>Kgs</th>
                            <th style={{ width: '50px' }}>Quantity</th>
                            <th style={{ width: '65px' }}>Unit Price</th>
                            <th style={{ width: '80px' }}>Value Exc. S.T.</th>
                            <th style={{ width: '65px' }}>S.T.Amt 18.00%</th>
                            <th style={{ width: '80px' }}>Amt. Incl. S.T.</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item, index) => (
                            <tr key={item.id || index}>
                                <td className="text-center">{index + 1}</td>
                                <td>{item.itemName}</td>
                                <td className="text-center">{item.hsCode}</td>
                                <td className="text-right">{item.weightKgs.toFixed(2)}</td>
                                <td className="text-center">{item.quantity}</td>
                                <td className="text-right">{item.rate.toLocaleString('en-PK')}</td>
                                <td className="text-right">{item.amtExclTax.toLocaleString('en-PK')}</td>
                                <td className="text-right">{item.salesTax.toLocaleString('en-PK')}</td>
                                <td className="text-right font-bold">{item.valIncTax.toLocaleString('en-PK')}</td>
                            </tr>
                        ))}
                        <tr className="font-bold bg-gray-100">
                            <td colSpan={3} className="text-right">Total:</td>
                            <td className="text-right">{totalKgs.toFixed(2)}</td>
                            <td className="text-center">{totalQuantity}</td>
                            <td></td>
                            <td className="text-right">{totalAmtExclTax.toLocaleString('en-PK')}</td>
                            <td className="text-right">{totalSalesTax.toLocaleString('en-PK')}</td>
                            <td className="text-right">{grandTotal.toLocaleString('en-PK')}</td>
                        </tr>
                    </tbody>
                </table>

                <div className="footer">
                    This is a system generated invoice & does not require any sign and stamp.
                </div>

                <div className="signatures">
                    <div className="signature-line">Authorised Signature</div>
                    <div className="signature-line">Consumer</div>
                </div>
            </div>
        </div>
    );
}
