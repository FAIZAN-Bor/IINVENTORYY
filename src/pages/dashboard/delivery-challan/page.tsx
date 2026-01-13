import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { inventoryItems as mockInventory } from '../../../data/mockData';
import QasimSewingLogo from '../../../images/Qasim.jpeg';
import { DeliveryChallan, ChallanItem } from '../../../types';




interface Party {
    id: string;
    name: string;
    partyNumber?: number;
    city?: string;
}

interface InventoryItem {
    id: string;
    name: string;
    articleCode: string;
    description: string;
    unit: string;
}

export default function DeliveryChallanPage() {
    const navigate = useNavigate();
    const location = useLocation();

    // Data List State
    const [allParties, setAllParties] = useState<Party[]>([]);
    const [allInventory, setAllInventory] = useState<InventoryItem[]>([]);

    // Form State
    const [dcNumber, setDcNumber] = useState('775');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);


    const [partyName, setPartyName] = useState('');
    const [partyAddress, setPartyAddress] = useState('');
    const [showPartySuggestions, setShowPartySuggestions] = useState(false);
    const [courierName, setCourierName] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);

    // New Item State
    const [newItemName, setNewItemName] = useState('');
    const [newPoNumber, setNewPoNumber] = useState('');
    const [newDemandNumber, setNewDemandNumber] = useState('');
    const [newQuantity, setNewQuantity] = useState<number | ''>('');
    const [newUnit, setNewUnit] = useState('PCS');

    const [items, setItems] = useState<ChallanItem[]>([]);
    const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
    const [showItemSuggestions, setShowItemSuggestions] = useState(false);
    const [showItemSelector, setShowItemSelector] = useState(false);
    const [itemSearchQuery, setItemSearchQuery] = useState('');

    useEffect(() => {
        // Check Company Access
        const savedCompany = localStorage.getItem('selectedCompany');
        if (savedCompany && savedCompany !== 'QASIM SEWING MACHINE' && savedCompany !== 'Qasim Sewing Machine') {
            alert('Access Denied. This page is only for Qasim Sewing Machine.');
            navigate('/dashboard');
            return;
        }

        // Load Data
        const partiesData = localStorage.getItem('parties');
        const inventoryData = localStorage.getItem('inventoryItems');

        if (partiesData) {
            setAllParties(JSON.parse(partiesData));
        }

        if (inventoryData) {
            setAllInventory(JSON.parse(inventoryData));
        } else {
            setAllInventory(mockInventory);
        }
    }, [navigate]);

    // Party Handling


    const selectParty = (party: Party) => {
        setPartyName(party.name);
        setPartyAddress(party.city || '');
        // Courier Name is now independent
        setShowPartySuggestions(false);
    };

    const handlePartyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setPartyName(e.target.value);
        setShowPartySuggestions(true);
    };

    // Item Handling
    const handleItemNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewItemName(e.target.value);
        setShowItemSuggestions(true);
    };

    const selectInventoryItem = (item: InventoryItem) => {
        setNewItemName(item.name || item.description);
        setNewUnit(item.unit || 'PCS');
        setShowItemSuggestions(false);
        setShowItemSelector(false);
    };

    const handleAddItem = () => {
        if (!newItemName || !newQuantity) {
            alert('Item Name and Quantity are required');
            return;
        }

        const newItem: ChallanItem = {
            id: Date.now().toString(),
            itemName: newItemName,
            poNumber: newPoNumber,
            demandNumber: newDemandNumber,
            quantity: Number(newQuantity),
            unit: newUnit
        };

        setItems([...items, newItem]);

        // Reset inputs and focus logic could go here
        setNewItemName('');
        setNewPoNumber('');
        setNewDemandNumber('');
        setNewQuantity('');
        setNewUnit('PCS');
        setShowItemSuggestions(false);
    };

    const updateItem = (id: string, field: keyof ChallanItem, value: any) => {
        setItems(items.map(item =>
            item.id === id ? { ...item, [field]: value } : item
        ));
    };

    const deleteItem = (id: string) => {
        if (window.confirm('Are you sure you want to delete this row?')) {
            setItems(items.filter(item => item.id !== id));
        }
    };



    const handlePrint = () => {
        window.print();
    };

    const handleSave = () => {
        if (!partyName) {
            alert('Please select a party');
            return;
        }

        if (items.length === 0) {
            alert('Please add at least one item');
            return;
        }

        const saved = localStorage.getItem('deliveryChallans');
        let challans: DeliveryChallan[] = saved ? JSON.parse(saved) : [];

        if (editingId) {
            // Update existing
            challans = challans.map(c => c.id === editingId ? {
                ...c,
                dcNumber,
                date,
                partyName,
                partyAddress,
                courierName,
                items,
                totalQty
            } : c);

            alert('Delivery Challan updated successfully!');
        } else {
            // Create new
            const newChallan: DeliveryChallan = {
                id: Date.now().toString(),
                dcNumber,
                date,
                partyName,
                partyAddress,
                courierName,
                items,
                totalQty
            };
            challans.push(newChallan);
            alert('Delivery Challan saved successfully!');
        }

        localStorage.setItem('deliveryChallans', JSON.stringify(challans));
    };

    // Load saved challan if editing
    useEffect(() => {
        const state = location.state as { challan?: DeliveryChallan };
        if (state?.challan) {
            const { challan } = state;
            setEditingId(challan.id);
            setDcNumber(challan.dcNumber);
            setDate(challan.date);
            setPartyName(challan.partyName);
            setPartyAddress(challan.partyAddress);
            setCourierName(challan.courierName);
            setItems(challan.items);
        }
    }, [location]);

    // Calculate totals
    const totalQty = items.reduce((sum, item) => sum + item.quantity, 0);

    const filteredInventory = allInventory.filter(i =>
        (i.name && i.name.toLowerCase().includes(itemSearchQuery.toLowerCase())) ||
        (i.articleCode && i.articleCode.toLowerCase().includes(itemSearchQuery.toLowerCase())) ||
        (i.description && i.description.toLowerCase().includes(itemSearchQuery.toLowerCase()))
    );

    const inlineInventorySuggestions = allInventory.filter(i =>
        (i.name && i.name.toLowerCase().includes(newItemName.toLowerCase())) ||
        (i.articleCode && i.articleCode.toLowerCase().includes(newItemName.toLowerCase())) ||
        (i.description && i.description.toLowerCase().includes(newItemName.toLowerCase()))
    ).slice(0, 8); // Limit suggestions





    return (
        <div className="p-4 max-w-6xl mx-auto bg-gray-50 min-h-screen">

            {/* PRINT STYLES */}
            <style>{`
                @media print {
                    @page {
                        size: A4;
                        margin: 0mm;
                    }
                    body * {
                        visibility: hidden;
                    }
                    #challan-container, #challan-container * {
                        visibility: visible;
                    }
                    #challan-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white;
                    }
                    .no-print {
                        display: none !important;
                    }

                    /* Sales Tax Invoice Style Classes */
                    .party-row {
                         display: flex; 
                         margin-bottom: 3mm; 
                         align-items: flex-end; 
                         font-size: 13pt;
                    }
                    .party-label { 
                        font-weight: bold; 
                        margin-right: 5px; 
                        white-space: nowrap; 
                        font-family: serif;
                    }
                    .party-value { 
                        border-bottom: 1px solid black; 
                        flex: 1; 
                        padding-left: 5px; 
                        font-family: monospace; /* Or serif/sans depending on preference, monospace looks like typed */
                        font-weight: bold;
                    }
                    
                    /* Table Styles */
                    table { width: 100%; border-collapse: collapse; font-size: 12pt; margin-top: 5mm; }
                    th { border: 1px solid black; padding: 2px; background: #e0e0e0 !important; font-weight: bold; text-align: center; }
                    td { border: 1px solid black; padding: 2px; }
                    
                    /* Hide inputs in print, just show value-like appearance */
                    input[type="text"], input[type="number"], input[type="date"], select {
                        border: none !important;
                        background: transparent !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        width: 100%;
                        font-family: inherit;
                        font-size: 12pt;
                        font-weight: inherit;
                    }
                }

                /* Screen Styles to mimic print layout */
                .party-row { display: flex; margin-bottom: 3mm; align-items: flex-end; }
                .party-label { font-weight: bold; margin-right: 5px; white-space: nowrap; }
                .party-value { border-bottom: 1px solid black; flex: 1; padding-left: 5px; }

                /* Print Header Styles */
                @media print {
                    .print-header {
                        display: block !important;
                        width: 100%;
                        height: 150px;
                        overflow: hidden;
                        border-bottom: 2px solid black;
                        margin-bottom: 2mm;
                    }
                    .party-row {
                        margin-bottom: 1mm !important;
                    }
                    table {
                        margin-top: 2mm !important;
                    }
                    .header-image {
                        width: 100%;
                        height: 100%;
                        object-fit: cover;
                        object-position: top;
                    }
                }
                @media screen {
                    .print-header { display: none; }
                }
            `}</style>

            <div id="challan-container" className="bg-white p-8 max-w-[210mm] mx-auto print:min-h-[297mm]">

                {/* Print Header */}
                <div className="print-header">
                    <img src={QasimSewingLogo} alt="Header" className="header-image" />
                </div>

                {/* Header Title */}
                <div className="flex justify-center mb-8 print:mb-2">
                    <div className="border-2 border-black px-8 py-2">
                        <h1 className="text-2xl font-bold font-serif uppercase tracking-wider">DELIVERY CHALLAN</h1>
                    </div>
                </div>

                {/* Info Section */}
                <div className="flex flex-col gap-4 mb-8 print:mb-4 print:gap-1 font-serif text-lg">
                    {/* Row 1: Challan # & Date */}
                    <div className="flex justify-between gap-8">
                        <div className="party-row w-1/3">
                            <span className="party-label">Challan #:</span>
                            <div className="party-value relative">
                                <input
                                    type="text"
                                    value={dcNumber}
                                    onChange={(e) => setDcNumber(e.target.value)}
                                    className="w-full bg-transparent border-none outline-none text-left pr-2"
                                />
                                <div className="absolute right-0 top-0 bottom-0 flex flex-col no-print">
                                    <button onClick={() => setDcNumber((Number(dcNumber) + 1).toString())} className="h-[50%] px-1 bg-gray-200 hover:bg-gray-300 text-[8px] leading-none">▲</button>
                                    <button onClick={() => setDcNumber((Number(dcNumber) - 1).toString())} className="h-[50%] px-1 bg-gray-200 hover:bg-gray-300 text-[8px] leading-none">▼</button>
                                </div>
                            </div>
                        </div>
                        <div className="party-row w-1/3">
                            <span className="party-label">Date:</span>
                            <div className="party-value relative">
                                <input
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                    className="w-full bg-transparent border-none outline-none"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Row 2: Party Name */}
                    <div className="party-row">
                        <span className="party-label">Party Name:</span>
                        <div className="party-value flex items-center relative z-20">
                            <input
                                type="text"
                                value={partyName}
                                onChange={handlePartyChange}
                                onFocus={() => setShowPartySuggestions(true)}
                                className="w-full bg-transparent border-none outline-none uppercase"
                                placeholder="Start typing Name or Code..."
                            />
                            {/* Buttons */}
                            <div className="flex items-center gap-1 no-print">
                                {partyName && (
                                    <button
                                        onClick={() => { setPartyName(''); setPartyAddress(''); }}
                                        className="text-gray-500 hover:text-red-500 px-1"
                                        title="Clear Party"
                                    >
                                        ✕
                                    </button>
                                )}
                                <button
                                    onClick={() => setShowPartySuggestions(true)}
                                    className="text-blue-600 hover:text-blue-800"
                                    title="Search Party"
                                >
                                    🔍
                                </button>
                            </div>

                            {/* Inline Suggestions */}
                            {showPartySuggestions && (
                                <>
                                    <div className="fixed inset-0 z-10" onClick={() => setShowPartySuggestions(false)}></div>
                                    <ul className="absolute top-full left-0 w-full bg-white border border-gray-300 shadow-lg max-h-60 overflow-y-auto z-30">
                                        {allParties
                                            .filter(p =>
                                                p.name.toLowerCase().includes(partyName.toLowerCase()) ||
                                                p.partyNumber?.toString().includes(partyName)
                                            )
                                            .map(party => (
                                                <li
                                                    key={party.id}
                                                    onClick={() => selectParty(party)}
                                                    className="p-2 hover:bg-blue-100 cursor-pointer border-b text-sm flex justify-between"
                                                >
                                                    <span>{party.name}</span>
                                                    <span className="text-gray-500 font-mono text-xs">{party.partyNumber}</span>
                                                </li>
                                            ))}
                                        {allParties.filter(p => p.name.toLowerCase().includes(partyName.toLowerCase()) || p.partyNumber?.toString().includes(partyName)).length === 0 && (
                                            <li className="p-2 text-gray-500 text-sm">No matches found</li>
                                        )}
                                    </ul>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Row 3: Address & Courier */}
                    <div className="flex justify-between gap-8">
                        <div className="party-row flex-1">
                            <span className="party-label">Address:</span>
                            <div className="party-value">
                                <input
                                    type="text"
                                    value={partyAddress}
                                    onChange={(e) => setPartyAddress(e.target.value)}
                                    placeholder=""
                                    className="w-full bg-transparent border-none outline-none uppercase"
                                />
                            </div>
                        </div>
                        <div className="party-row w-1/3">
                            <span className="party-label">Courier's Name:</span>
                            <div className="party-value">
                                <input
                                    type="text"
                                    value={courierName}
                                    onChange={(e) => setCourierName(e.target.value)}
                                    className="w-full bg-transparent border-none outline-none uppercase text-center"
                                />
                            </div>
                        </div>
                    </div>
                </div>



                {/* Main Table */}
                <div className="relative">
                    <table className="w-full">
                        <thead>
                            <tr>
                                <th className="w-[5%]">Sr #</th>
                                <th className="w-[12%]">P.O #</th>
                                <th className="w-[12%]">Demand #</th>
                                <th className="w-[45%] text-left pl-2">Description</th>
                                <th className="w-[13%]">Quantity</th>
                                <th className="w-[13%]">UOM</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Input Row (Always First, No Print) */}
                            <tr className="bg-blue-50 no-print border-b-2 border-blue-200">
                                <td className="text-center font-bold text-gray-500">+</td>
                                <td className="p-1">
                                    <input
                                        type="text"
                                        className="w-full bg-white border border-blue-300 rounded px-1 py-1 focus:outline-none focus:border-blue-500 text-center"
                                        value={newPoNumber}
                                        onChange={(e) => setNewPoNumber(e.target.value)}
                                        placeholder="PO #"
                                    />
                                </td>
                                <td className="p-1">
                                    <input
                                        type="text"
                                        className="w-full bg-white border border-blue-300 rounded px-1 py-1 focus:outline-none focus:border-blue-500 text-center"
                                        value={newDemandNumber}
                                        onChange={(e) => setNewDemandNumber(e.target.value)}
                                        placeholder="Demand"
                                    />
                                </td>
                                <td className="p-1 relative">
                                    <div className="flex items-center">
                                        <input
                                            type="text"
                                            className="w-full bg-white border border-blue-300 rounded-l px-2 py-1 focus:outline-none focus:border-blue-500"
                                            value={newItemName}
                                            onChange={handleItemNameChange}
                                            onFocus={() => setShowItemSuggestions(true)}
                                            placeholder="Item Name / Search..."
                                        />
                                        <button
                                            onClick={() => { setShowItemSelector(true); setItemSearchQuery(''); }}
                                            className="bg-blue-600 text-white px-2 py-1 rounded-r hover:bg-blue-700"
                                            title="Search Inventory"
                                        >
                                            🔍
                                        </button>
                                    </div>
                                    {/* Suggestions Dropdown */}
                                    {showItemSuggestions && newItemName && (
                                        <>
                                            <div className="fixed inset-0 z-10" onClick={() => setShowItemSuggestions(false)}></div>
                                            <div className="absolute left-0 top-full mt-1 w-[150%] bg-white border border-gray-300 shadow-xl max-h-60 overflow-y-auto z-20 rounded text-left">
                                                {inlineInventorySuggestions.map(item => (
                                                    <div
                                                        key={item.id}
                                                        className="p-2 hover:bg-blue-100 cursor-pointer border-b text-sm"
                                                        onClick={() => selectInventoryItem(item)}
                                                    >
                                                        <div className="font-bold">{item.name}</div>
                                                        <div className="text-xs text-gray-500">{item.articleCode}</div>
                                                    </div>
                                                ))}
                                                {filteredInventory.length === 0 && (
                                                    <div className="p-2 text-gray-500 text-sm">No matches found</div>
                                                )}
                                            </div>
                                        </>
                                    )}
                                </td>
                                <td className="p-1">
                                    <input
                                        type="number"
                                        className="w-full bg-white border border-blue-300 rounded px-1 py-1 text-center focus:outline-none focus:border-blue-500"
                                        value={newQuantity}
                                        onChange={(e) => setNewQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                                        onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                                        placeholder="Qty"
                                    />
                                </td>
                                <td className="p-1">
                                    <div className="flex items-center gap-1">
                                        <select
                                            className="w-full bg-white border border-blue-300 rounded px-1 py-1 text-sm focus:outline-none focus:border-blue-500 min-w-[70px]"
                                            value={newUnit}
                                            onChange={(e) => setNewUnit(e.target.value)}
                                        >
                                            <option>Meters</option>
                                            <option>PCS</option>
                                            <option>Box</option>
                                            <option>Kg</option>
                                            <option>Set</option>
                                            <option>DZN</option>
                                        </select>
                                        <button
                                            onClick={handleAddItem}
                                            className="bg-blue-600 text-white w-8 h-8 rounded hover:bg-blue-700 shadow flex items-center justify-center flex-shrink-0"
                                            title="Add Entry"
                                        >
                                            <span className="font-bold text-lg leading-none pb-1">+</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                            {items.map((item, index) => (
                                <tr
                                    key={item.id}
                                    onClick={() => setSelectedItemId(item.id)}
                                    className={`cursor-pointer ${selectedItemId === item.id ? 'bg-blue-100 print:bg-transparent' : 'hover:bg-gray-50'}`}
                                >
                                    <td className="text-center">{index + 1}</td>
                                    <td className="text-center">
                                        <input
                                            type="text"
                                            value={item.poNumber}
                                            onChange={(e) => updateItem(item.id, 'poNumber', e.target.value)}
                                            className="w-full bg-transparent border-none focus:ring-0 p-0 text-center"
                                        />
                                    </td>
                                    <td className="text-center">
                                        <input
                                            type="text"
                                            value={item.demandNumber}
                                            onChange={(e) => updateItem(item.id, 'demandNumber', e.target.value)}
                                            className="w-full bg-transparent border-none focus:ring-0 p-0 text-center"
                                        />
                                    </td>
                                    <td className="text-left px-2 font-medium">
                                        <textarea
                                            value={item.itemName}
                                            onChange={(e) => {
                                                updateItem(item.id, 'itemName', e.target.value);
                                                e.target.style.height = 'auto';
                                                e.target.style.height = e.target.scrollHeight + 'px';
                                            }}
                                            onFocus={(e) => {
                                                e.target.style.height = 'auto';
                                                e.target.style.height = e.target.scrollHeight + 'px';
                                            }}
                                            rows={1}
                                            className="w-full bg-transparent border-none focus:ring-0 p-0 resize-none overflow-hidden"
                                            style={{ minHeight: '1.5em' }}
                                        />
                                    </td>
                                    <td className="text-center font-bold">
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                                            className="w-full bg-transparent border-none focus:ring-0 p-0 text-center font-bold"
                                        />
                                    </td>
                                    <td className="text-center px-1">
                                        <div className="flex items-center justify-between w-full h-full">
                                            <select
                                                value={item.unit}
                                                onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                                                className="bg-transparent border-none focus:ring-0 p-0 text-center text-sm appearance-none w-full"
                                            >
                                                <option>Meters</option>
                                                <option>PCS</option>
                                                <option>Box</option>
                                                <option>Kg</option>
                                                <option>Set</option>
                                                <option>DZN</option>
                                            </select>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); deleteItem(item.id); }}
                                                className="text-red-600 hover:text-red-800 font-bold text-lg no-print ml-1"
                                                title="Delete Item"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {/* Fill empty rows to maintain look if needed, or just standard rows */}
                            <tr className="font-bold bg-gray-100 print:bg-transparent">
                                <td colSpan={4} className="text-right pr-2 border-r-0">Total:</td>
                                <td className="text-center border-l-0">{totalQty}</td>
                                <td></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Bottom Controls (No Print) */}
            {/* Bottom Controls (No Print) */}
            <div className="mt-8 flex justify-center gap-4 no-print flex-wrap">
                <button
                    onClick={handleSave}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition flex items-center gap-2"
                >
                    <span>💾</span> Save Challan
                </button>

                <button
                    onClick={handlePrint}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition flex items-center gap-2"
                >
                    <span>🖨️</span> Print Challan
                </button>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition"
                >
                    Exit
                </button>
            </div>


            {/* Item Select Modal */}
            {showItemSelector && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 no-print"
                    onClick={() => setShowItemSelector(false)}
                >
                    <div
                        className="bg-white rounded-lg shadow-xl p-6 max-w-2xl w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xl font-bold">Select Item</h3>
                            <button onClick={() => setShowItemSelector(false)} className="text-gray-500 hover:text-black">✕</button>
                        </div>

                        <input
                            type="text"
                            placeholder="Search by Item Name, Article Code, or Description..."
                            className="w-full border p-2 rounded mb-4"
                            value={itemSearchQuery}
                            onChange={(e) => setItemSearchQuery(e.target.value)}
                            autoFocus
                        />

                        <div className="max-h-80 overflow-y-auto border rounded">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-100 sticky top-0">
                                    <tr>
                                        <th className="p-2 text-left border-b">Name</th>
                                        <th className="p-2 text-left border-b">Article Code</th>
                                        <th className="p-2 text-left border-b">Unit</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredInventory.map(item => (
                                        <tr
                                            key={item.id}
                                            className="hover:bg-blue-50 border-b cursor-pointer"
                                            onClick={() => selectInventoryItem(item)}
                                        >
                                            <td className="p-2 font-medium">{item.name}</td>
                                            <td className="p-2">{item.articleCode}</td>
                                            <td className="p-2">{item.unit || '-'}</td>
                                        </tr>
                                    ))}
                                    {filteredInventory.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="p-4 text-center text-gray-500">No items found matching "{itemSearchQuery}"</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
