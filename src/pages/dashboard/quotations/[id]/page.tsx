import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QasimSewingLogo from '../../../../images/Qasim.jpeg';

// Types (reusing from NewQuotationPage to ensure consistency)
interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number | string;
  brand?: string;
  remarks?: string;
}

interface InventoryItem {
  id: string;
  articleCode: string;
  name: string;
  description: string;
  currentStock: number;
  rate: number;
  unit: string;
}

interface Party {
  id: string;
  name: string;
  city?: string;
  phone?: string;
  type?: 'customer' | 'supplier';
  partyNumber?: number;
}

export default function ViewQuotationPage() {
  const params = useParams();
  const navigate = useNavigate();

  // Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Data State
  const [quotationId, setQuotationId] = useState('');
  const [currentCompany, setCurrentCompany] = useState('Qasim Sewing Machine');
  const [partyName, setPartyName] = useState('');
  const [date, setDate] = useState('');
  const [items, setItems] = useState<QuotationItem[]>([]);

  // Inventory/Party Selector State (for Edit Mode)
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [selectedInventoryItems, setSelectedInventoryItems] = useState<string[]>([]);
  const [searchInventory, setSearchInventory] = useState('');
  const [suggestions, setSuggestions] = useState<{ [key: string]: InventoryItem[] }>({});
  const [activeSuggestionRow, setActiveSuggestionRow] = useState<string | null>(null);

  const [parties, setParties] = useState<Party[]>([]);
  const [showPartySelector, setShowPartySelector] = useState(false);
  const [searchParty, setSearchParty] = useState('');

  // Load Quotation
  useEffect(() => {
    const saved = localStorage.getItem('quotations');
    const inventoryData = localStorage.getItem('inventory');
    const partiesData = localStorage.getItem('parties');

    if (inventoryData) setInventoryItems(JSON.parse(inventoryData));
    if (partiesData) setParties(JSON.parse(partiesData));

    if (saved) {
      const quotations = JSON.parse(saved);
      const found = quotations.find((q: any) => q.id === params.id);
      if (found) {
        setQuotationId(found.id);
        setCurrentCompany(found.companyName);
        setPartyName(found.partyName);
        setDate(found.date);
        setItems(found.items);
      } else {
        alert('Quotation not found!');
        navigate('/dashboard/quotations');
      }
    }
    setLoading(false);
  }, [params.id, navigate]);

  // --- Helper Functions (Edit Mode) ---
  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now().toString(),
        description: '',
        quantity: 1,
        unit: 'PCS',
        rate: '',
        brand: '',
        remarks: ''
      }
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof QuotationItem, value: any) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));

    if (field === 'description') {
      if (value.length > 0) {
        const searchTerm = value.toLowerCase();
        const matches = inventoryItems.filter(inv =>
          inv.articleCode.toLowerCase().includes(searchTerm) ||
          inv.name.toLowerCase().includes(searchTerm) ||
          inv.description.toLowerCase().includes(searchTerm)
        ).slice(0, 5);

        setSuggestions(prev => ({ ...prev, [id]: matches }));
        setActiveSuggestionRow(id);
      } else {
        setActiveSuggestionRow(null);
      }
    }
  };

  const selectSuggestion = (itemId: string, suggestion: InventoryItem) => {
    updateItem(itemId, 'description', suggestion.description || suggestion.name);
    updateItem(itemId, 'rate', suggestion.rate);
    updateItem(itemId, 'unit', suggestion.unit);
    setActiveSuggestionRow(null);
  };

  const addSelectedItems = () => {
    const newItems = selectedInventoryItems.map(id => {
      const invItem = inventoryItems.find(i => i.id === id);
      return {
        id: Date.now().toString() + Math.random(),
        description: invItem ? (invItem.description || invItem.name) : '',
        quantity: 1,
        unit: invItem?.unit || 'PCS',
        rate: invItem?.rate || 0,
        brand: '',
        remarks: ''
      };
    });
    setItems([...items, ...newItems]);
    setShowItemSelector(false);
    setSelectedInventoryItems([]);
  };

  const selectParty = (party: Party) => {
    setPartyName(party.name);
    setShowPartySelector(false);
  };

  const handleSave = () => {
    if (!partyName) {
      alert('Party Name is required');
      return;
    }
    if (items.length === 0) {
      alert('Please add at least one item');
      return;
    }

    const saved = localStorage.getItem('quotations');
    if (saved) {
      const quotations = JSON.parse(saved);
      const updatedQuotations = quotations.map((q: any) => {
        if (q.id === quotationId) {
          return {
            ...q,
            partyName,
            date,
            items,
            itemCount: items.length,
            totalAmount: items.reduce((sum, item) => sum + (Number(item.quantity) * Number(item.rate) || 0), 0)
          };
        }
        return q;
      });
      localStorage.setItem('quotations', JSON.stringify(updatedQuotations));
      alert('Quotation updated successfully!');
      setIsEditing(false); // Switch back to view mode
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this quotation permanently?')) {
      const saved = localStorage.getItem('quotations');
      if (saved) {
        const quotations = JSON.parse(saved);
        const updated = quotations.filter((q: any) => q.id !== quotationId);
        localStorage.setItem('quotations', JSON.stringify(updated));
        navigate('/dashboard/quotations');
      }
    }
  };

  // --- Filtering for Modals ---
  const filteredInventory = inventoryItems.filter(item =>
    item.articleCode.toLowerCase().includes(searchInventory.toLowerCase()) ||
    item.name.toLowerCase().includes(searchInventory.toLowerCase()) ||
    item.description.toLowerCase().includes(searchInventory.toLowerCase())
  );

  const filteredParties = parties.filter(party =>
    party.name.toLowerCase().includes(searchParty.toLowerCase()) ||
    (party.city || '').toLowerCase().includes(searchParty.toLowerCase())
  );

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
      {/* --- PRINT STYLES (Identical to New Page) --- */}
      <style>{`
          @media print {
            @page {
              size: 210mm 297mm;
              margin: 10mm;
            }
            body {
              background: white;
            }
            body * {
              visibility: hidden;
            }
            #printable-view, #printable-view * {
              visibility: visible;
            }
            #printable-view {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 0;
              background: white;
              z-index: 9999;
            }
            /* HIDE Buttons in Print */
            .no-print {
                display: none !important;
            }
            
            table {
              width: 100% !important;
              border-collapse: collapse !important;
              font-size: 12pt !important;
            }
            thead {
              display: table-header-group;
            }
            tr {
              page-break-inside: avoid;
            }
            th, td {
              border: 1px solid black !important;
              padding: 4px !important;
              vertical-align: top !important;
              font-size: 12pt !important;
            }
            th {
              background-color: #f0f0f0 !important;
              -webkit-print-color-adjust: exact;
              font-weight: bold;
            }
            .col-sr { width: 6%; }
            .col-desc { width: 34%; }
            .col-qty { width: 8%; }
            .col-unit { width: 8%; }
            .col-rate { width: 12%; }
            .col-brand { width: 12%; }
            .col-remarks { width: 20%; }
          }
      `}</style>

      {/* ================= VIEW MODE ================= */}
      {!isEditing && (
        <div id="printable-view" className="bg-white p-8 shadow-lg mx-auto max-w-[210mm] min-h-[297mm] relative">

          {/* ACTION BAR (Hidden on Print) */}
          <div className="no-print absolute top-0 right-[-140px] flex flex-col gap-4">
            <button
              onClick={() => setIsEditing(true)}
              className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded shadow flex items-center gap-2"
            >
              ✏️ Edit
            </button>
            <button
              onClick={handlePrint}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded shadow flex items-center gap-2"
            >
              🖨️ Print
            </button>
            <button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded shadow flex items-center gap-2"
            >
              🗑️ Delete
            </button>
            <button
              onClick={() => navigate('/dashboard/quotations')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded shadow flex items-center gap-2"
            >
              Exit
            </button>
          </div>

          {/* Header Image */}
          {currentCompany === 'QASIM SEWING MACHINE' || currentCompany === 'Qasim Sewing Machine' ? (
            <div className="mb-2 h-[40mm] w-full relative overflow-hidden">
              <img
                src={QasimSewingLogo}
                alt="Qasim Sewing Machine"
                className="w-full h-full object-cover object-top"
              />
            </div>
          ) : (
            <div className="text-center mb-6">
              <h1 className="text-4xl font-extrabold text-black tracking-tight uppercase">{currentCompany}</h1>
              <div className="mt-2 h-0.5 w-full bg-black"></div>
            </div>
          )}

          {/* Title */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-black border-b-2 border-black inline-block px-4 pb-1">QUOTATION</h2>
          </div>

          {/* Party / Date */}
          <div className="flex justify-between items-end mb-6">
            <div className="text-base font-bold text-black">
              <span className="block text-gray-600 text-sm font-normal mb-1">Customer / Party:</span>
              <span className="text-lg">{partyName}</span>
            </div>
            <div className="text-right">
              <span className="block text-gray-600 text-sm font-normal mb-1">Date:</span>
              <span className="font-bold">{new Date(date).toLocaleDateString('en-GB')}</span>
            </div>
          </div>

          {/* Table */}
          <table className="w-full border-collapse border border-black">
            <thead>
              <tr className="bg-gray-100">
                <th className="col-sr border border-black px-2 py-2 text-center font-bold text-black text-sm">SR#</th>
                <th className="col-desc border border-black px-2 py-2 text-left font-bold text-black text-sm">DESCRIPTION</th>
                <th className="col-qty border border-black px-2 py-2 text-center font-bold text-black text-sm">QTY</th>
                <th className="col-unit border border-black px-2 py-2 text-center font-bold text-black text-sm">UOM</th>
                <th className="col-rate border border-black px-2 py-2 text-center font-bold text-black text-sm">RATE</th>
                <th className="col-brand border border-black px-2 py-2 text-center font-bold text-black text-sm">BRAND</th>
                <th className="col-remarks border border-black px-2 py-2 text-center font-bold text-black text-sm">REMARKS</th>
              </tr>
            </thead>
            <tbody>
              {items.filter(item => item.description.trim()).map((item, index) => (
                <tr key={item.id}>
                  <td className="border border-black px-2 py-2 text-center text-black text-sm">{index + 1}</td>
                  <td className="border border-black px-2 py-2 text-left text-black text-sm whitespace-pre-wrap">{item.description}</td>
                  <td className="border border-black px-2 py-2 text-center text-black text-sm">{item.quantity}</td>
                  <td className="border border-black px-2 py-2 text-center text-black text-sm">{item.unit}</td>
                  <td className="border border-black px-2 py-2 text-center text-black text-sm">{item.rate}</td>
                  <td className="border border-black px-2 py-2 text-center text-black text-sm">{item.brand || '-'}</td>
                  <td className="border border-black px-2 py-2 text-center text-black text-sm">{item.remarks || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ================= EDIT MODE ================= */}
      {isEditing && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Edit Quotation</h2>
            <button onClick={() => setIsEditing(false)} className="text-gray-500 hover:text-gray-700">Cancel Editing</button>
          </div>

          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Party Name</label>
              <div className="flex gap-2">
                <input
                  value={partyName}
                  onChange={e => setPartyName(e.target.value)}
                  className="flex-1 px-4 py-2 border rounded-lg"
                />
                <button
                  onClick={() => setShowPartySelector(true)}
                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg"
                >
                  🔍 Search
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Items Editor */}
          <div className="mb-6">
            <div className="flex gap-2 mb-3">
              <button onClick={() => setShowItemSelector(true)} className="bg-green-600 text-white px-4 py-2 rounded">Select from Inventory</button>
              <button onClick={addItem} className="bg-blue-600 text-white px-4 py-2 rounded">+ Add Item</button>
            </div>

            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 w-24">Qty</th>
                  <th className="px-4 py-2 w-24">Unit</th>
                  <th className="px-4 py-2 w-32">Rate</th>
                  <th className="px-4 py-2 w-32">Brand</th>
                  <th className="px-4 py-2 w-40">Remarks</th>
                  <th className="px-4 py-2 w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => (
                  <tr key={item.id} className="border-b">
                    <td className="p-2 relative">
                      <input
                        value={item.description}
                        onChange={e => updateItem(item.id, 'description', e.target.value)}
                        onBlur={() => setTimeout(() => {
                          const newSuggestions = { ...suggestions };
                          delete newSuggestions[item.id];
                          setSuggestions(newSuggestions);
                          setActiveSuggestionRow(null);
                        }, 200)}
                        className="w-full border rounded px-2 py-1"
                      />
                      {/* Edit Mode Suggestions */}
                      {suggestions[item.id] && suggestions[item.id].length > 0 && activeSuggestionRow === item.id && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto left-0">
                          {suggestions[item.id].map((suggestion) => (
                            <div
                              key={suggestion.id}
                              onClick={() => selectSuggestion(item.id, suggestion)}
                              className="px-3 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100"
                            >
                              <div className="font-medium text-sm text-gray-900">{suggestion.articleCode}</div>
                              <div className="text-xs text-gray-600">{suggestion.description}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="p-2"><input type="number" value={item.quantity} onChange={e => updateItem(item.id, 'quantity', Number(e.target.value))} className="w-full border rounded px-2 py-1" /></td>
                    <td className="p-2">
                      <select value={item.unit} onChange={e => updateItem(item.id, 'unit', e.target.value)} className="w-full border rounded px-2 py-1">
                        <option value="PCS">PCS</option>
                        <option value="PKT">PKT</option>
                        <option value="BOX">BOX</option>
                        <option value="KG">KG</option>
                        <option value="METER">METER</option>
                        <option value="LITER">LITER</option>
                        <option value="DOZEN">DOZEN</option>
                      </select>
                    </td>
                    <td className="p-2"><input value={item.rate} onChange={e => updateItem(item.id, 'rate', e.target.value)} className="w-full border rounded px-2 py-1" /></td>
                    <td className="p-2"><input value={item.brand || ''} onChange={e => updateItem(item.id, 'brand', e.target.value)} className="w-full border rounded px-2 py-1" /></td>
                    <td className="p-2"><input value={item.remarks || ''} onChange={e => updateItem(item.id, 'remarks', e.target.value)} className="w-full border rounded px-2 py-1" /></td>
                    <td className="p-2"><button onClick={() => removeItem(item.id)} className="text-red-500">✕</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-center gap-4">
            <button onClick={handleSave} className="bg-green-600 text-white px-6 py-2 rounded font-bold">Save Changes</button>
            <button onClick={() => setIsEditing(false)} className="bg-gray-500 text-white px-6 py-2 rounded">Cancel</button>
          </div>
        </div>
      )}

      {/* Modals for Edit Mode */}
      {/* Item Selector */}
      {/* (Simplified version for brevity, similar to New Page) */}
      {showItemSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded p-6 max-w-2xl w-full h-[80vh] flex flex-col">
            <h2 className="text-xl font-bold mb-4">Select Items</h2>
            <input className="border p-2 mb-4 w-full" placeholder="Search..." value={searchInventory} onChange={e => setSearchInventory(e.target.value)} />
            <div className="flex-1 overflow-auto">
              {filteredInventory.map(item => (
                <div key={item.id} onClick={() => {
                  if (selectedInventoryItems.includes(item.id)) {
                    setSelectedInventoryItems(selectedInventoryItems.filter(id => id !== item.id));
                  } else {
                    setSelectedInventoryItems([...selectedInventoryItems, item.id]);
                  }
                }} className={`p-2 border mb-2 cursor-pointer ${selectedInventoryItems.includes(item.id) ? 'bg-blue-100' : ''}`}>
                  <div className="font-bold">{item.articleCode}</div>
                  <div>{item.name}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setShowItemSelector(false)} className="px-4 py-2 border rounded">Cancel</button>
              <button onClick={addSelectedItems} className="px-4 py-2 bg-blue-600 text-white rounded">Add Selected</button>
            </div>
          </div>
        </div>
      )}

      {showPartySelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Select Party</h2>
            <input className="border p-2 mb-4 w-full" placeholder="Search..." value={searchParty} onChange={e => setSearchParty(e.target.value)} />
            <div className="max-h-60 overflow-auto">
              {filteredParties.map(party => (
                <div key={party.id} onClick={() => selectParty(party)} className="p-2 border-b cursor-pointer hover:bg-gray-100">
                  {party.name}
                </div>
              ))}
            </div>
            <button onClick={() => setShowPartySelector(false)} className="mt-4 px-4 py-2 border rounded w-full">Close</button>
          </div>
        </div>
      )}

    </div>
  );
}
