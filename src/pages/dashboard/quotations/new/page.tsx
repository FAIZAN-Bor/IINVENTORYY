import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import QasimSewingLogo from '../../../../images/Qasim.jpeg';

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
  salePrice?: number;
  rate?: number;
}

interface Party {
  id: string;
  partyNumber?: number;
  name: string;
  city?: string;
  phone?: string;
  type?: 'customer' | 'supplier';
}

export default function NewQuotationPage() {
  const navigate = useNavigate();
  const [currentCompany, setCurrentCompany] = useState('Qasim Sewing Machine');
  const [partyName, setPartyName] = useState('');
  const [date, setDate] = useState('');

  const [items, setItems] = useState<QuotationItem[]>([]);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [selectedInventoryItems, setSelectedInventoryItems] = useState<string[]>([]);
  const [searchInventory, setSearchInventory] = useState('');
  const [suggestions, setSuggestions] = useState<{ [key: string]: InventoryItem[] }>({});
  const [activeSuggestionRow, setActiveSuggestionRow] = useState<string | null>(null);

  // Party Selection State
  const [parties, setParties] = useState<Party[]>([]);
  const [showPartySelector, setShowPartySelector] = useState(false);
  const [searchParty, setSearchParty] = useState('');

  useEffect(() => {
    // Set today's date
    const today = new Date().toISOString().split('T')[0];
    setDate(today);

    // Load company from localStorage
    const savedCompany = localStorage.getItem('selectedCompany');
    if (savedCompany) {
      setCurrentCompany(savedCompany);
    }

    // Load inventory items for autocomplete
    const savedInventory = localStorage.getItem('inventoryItems');
    if (savedInventory) {
      setInventoryItems(JSON.parse(savedInventory));
    }

    // Load parties
    const savedParties = localStorage.getItem('parties');
    if (savedParties) {
      setParties(JSON.parse(savedParties));
    }

    // Show item selector on initial load
    setShowItemSelector(true);

    // Listen for company changes
    const handleCompanyChange = (e: CustomEvent) => {
      setCurrentCompany(e.detail.company);
    };
    window.addEventListener('company-changed', handleCompanyChange as EventListener);

    return () => {
      window.removeEventListener('company-changed', handleCompanyChange as EventListener);
    };
  }, []);

  const toggleItemSelection = (itemId: string) => {
    if (selectedInventoryItems.includes(itemId)) {
      setSelectedInventoryItems(selectedInventoryItems.filter(id => id !== itemId));
    } else {
      setSelectedInventoryItems([...selectedInventoryItems, itemId]);
    }
  };

  const addSelectedItems = () => {
    const newItems = selectedInventoryItems.map(id => {
      const invItem = inventoryItems.find(i => i.id === id);
      if (invItem) {
        return {
          id: Date.now().toString() + Math.random(),
          description: invItem.description || invItem.name,
          quantity: 1,
          unit: 'PCS',
          rate: invItem.salePrice || invItem.rate || '',
          brand: '',
          remarks: ''
        };
      }
      return null;
    }).filter(item => item !== null) as QuotationItem[];

    setItems([...items, ...newItems]);
    setShowItemSelector(false);
    setSelectedInventoryItems([]);
  };

  const filteredInventory = inventoryItems.filter(item =>
    item.name.toLowerCase().includes(searchInventory.toLowerCase()) ||
    item.description.toLowerCase().includes(searchInventory.toLowerCase()) ||
    item.articleCode.toLowerCase().includes(searchInventory.toLowerCase())
  );

  const filteredParties = parties.filter(party => {
    // Basic filter: Only active customers
    // Note: Assuming 'type' exists. If not, we might show all or default to customer behavior if desired.
    // Given the requirement "only parties", we filter strictly if type is present.
    const isCustomer = !party.type || party.type === 'customer';

    // Search match
    const searchLower = searchParty.toLowerCase();
    const matchesSearch =
      party.name.toLowerCase().includes(searchLower) ||
      (party.city && party.city.toLowerCase().includes(searchLower)) ||
      (party.partyNumber && party.partyNumber.toString().includes(searchLower));

    return isCustomer && matchesSearch;
  });

  const selectParty = (party: Party) => {
    setPartyName(party.name);
    setShowPartySelector(false);
  };

  const addItem = () => {
    setItems([...items, {
      id: Date.now().toString(),
      description: '',
      quantity: 0,
      unit: 'PCS',
      rate: '',
      brand: '',
      remarks: ''
    }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    // Clear suggestions for this row
    const newSuggestions = { ...suggestions };
    delete newSuggestions[id];
    setSuggestions(newSuggestions);
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the form?')) {
      setPartyName('');
      setItems([]);
      setDate(new Date().toISOString().split('T')[0]);
    }
  };

  const updateItem = (id: string, field: keyof QuotationItem, value: any) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));

    // Handle autocomplete for description field
    if (field === 'description' && typeof value === 'string') {
      if (value.trim().length > 1) {
        const filtered = inventoryItems.filter(invItem =>
          invItem.description.toLowerCase().includes(value.toLowerCase()) ||
          invItem.name.toLowerCase().includes(value.toLowerCase()) ||
          invItem.articleCode.toLowerCase().includes(value.toLowerCase())
        ).slice(0, 5); // Limit to 5 suggestions

        setSuggestions({ ...suggestions, [id]: filtered });
        setActiveSuggestionRow(id);
      } else {
        const newSuggestions = { ...suggestions };
        delete newSuggestions[id];
        setSuggestions(newSuggestions);
        setActiveSuggestionRow(null);
      }
    }
  };

  const selectSuggestion = (itemId: string, suggestion: InventoryItem) => {
    // Update both description and rate
    setItems(items.map(item =>
      item.id === itemId
        ? {
          ...item,
          description: suggestion.description,
          rate: suggestion.salePrice || suggestion.rate || item.rate
        }
        : item
    ));

    // Clear suggestions
    const newSuggestions = { ...suggestions };
    delete newSuggestions[itemId];
    setSuggestions(newSuggestions);
    setActiveSuggestionRow(null);
  };



  const handleSave = () => {
    const validItems = items.filter(item => item.description.trim());

    const quotationNo = `Q-${Date.now().toString().slice(-6)}`;
    const quotation = {
      id: Date.now().toString(),
      quotationNo,
      partyName,
      date,
      items: validItems,
      companyName: currentCompany,
      status: 'draft' as const,
      itemCount: validItems.length,
      totalAmount: 0
    };

    // Save to localStorage
    const saved = localStorage.getItem('quotations');
    const quotations = saved ? JSON.parse(saved) : [];
    quotations.push(quotation);
    localStorage.setItem('quotations', JSON.stringify(quotations));

    alert('Quotation saved successfully!');
    navigate('/dashboard/quotations');
  };

  const handlePrint = () => {
    window.print();
  };



  return (
    <div className="p-6">
      <style>{`
          @media print {
            @page {
              size: 210mm 297mm; /* Force A4 dimensions */
              margin: 10mm;
            }
            body {
              background: white;
            }
            /* Hide everything by default */
            body * {
              visibility: hidden;
            }
            
            /* Show print container and its children */
            #printable-quotation, #printable-quotation * {
              visibility: visible;
            }

            /* Position the print container */
            #printable-quotation {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              margin: 0;
              padding: 0;
              background: white;
              z-index: 9999;
            }

            /* Table optimizations for printing */
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
            
            /* Column widths */
            .col-sr { width: 6%; }
            .col-desc { width: 34%; }
            .col-qty { width: 8%; }
            .col-unit { width: 8%; }
            .col-rate { width: 12%; }
            .col-brand { width: 12%; }
            .col-remarks { width: 20%; }
          }
        `}</style>

      {/* PRINT ONLY CONTENT */}
      <div
        id="printable-quotation"
        className="hidden print:block bg-white p-8 shadow-lg mx-auto"
      >
        {/* Company Name Header */}
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

        {/* QUOTATION Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-black border-b-2 border-black inline-block px-4 pb-1">QUOTATION</h2>
        </div>

        {/* Party and Date Row */}
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

      {/* SCREEN ONLY FORM */}
      <div className="print:hidden">
        {/* Item Selector Modal */}
        {showItemSelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Items from Inventory</h2>
                <input
                  type="text"
                  value={searchInventory}
                  onChange={(e) => setSearchInventory(e.target.value)}
                  placeholder="Search items by name, code, or description..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="grid gap-3">
                  {filteredInventory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No items found. Try a different search term.
                    </div>
                  ) : (
                    filteredInventory.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => toggleItemSelection(item.id)}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedInventoryItems.includes(item.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                checked={selectedInventoryItems.includes(item.id)}
                                onChange={() => { }}
                                className="w-4 h-4"
                              />
                              <div>
                                <div className="font-semibold text-gray-900">{item.articleCode}</div>
                                <div className="text-sm text-gray-600">{item.name}</div>
                                <div className="text-xs text-gray-500">{item.description}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {selectedInventoryItems.length} item(s) selected
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowItemSelector(false);
                      setSelectedInventoryItems([]);
                    }}
                    className="bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-300 px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addSelectedItems}
                    disabled={selectedInventoryItems.length === 0}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Add Selected Items
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Party Selector Modal */}
        {showPartySelector && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-900">Select Party</h2>
                <button onClick={() => setShowPartySelector(false)} className="text-gray-500 hover:text-gray-700">×</button>
              </div>

              <div className="p-4 border-b border-gray-100">
                <input
                  type="text"
                  value={searchParty}
                  onChange={(e) => setSearchParty(e.target.value)}
                  placeholder="Search party by name or city..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid gap-2">
                  {filteredParties.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No parties found matching "{searchParty}"
                    </div>
                  ) : (
                    filteredParties.map((party) => (
                      <div
                        key={party.id}
                        onClick={() => selectParty(party)}
                        className="p-3 border rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all group"
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold text-gray-900 group-hover:text-blue-700">
                              {party.partyNumber ? `#${party.partyNumber} - ` : ''}{party.name}
                            </div>
                            <div className="text-xs text-gray-500">
                              {party.city ? `📍 ${party.city}` : ''} {party.phone ? ` • 📞 ${party.phone}` : ''}
                            </div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full ${(party.type || 'customer') === 'customer' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                            }`}>
                            {(party.type || 'customer').toUpperCase()}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Create New Quotation</h1>
            <p className="text-gray-600 mt-1">Fill in the details below</p>
          </div>
          <button
            onClick={() => navigate(-1)}
            className="bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-300 px-6 py-3 rounded-lg font-semibold transition-all"
          >
            Cancel
          </button>
        </div>

        {/* Quotation Form */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
          {/* Company & Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              <input
                type="text"
                value={currentCompany}
                readOnly
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Party Name <span className="text-red-500">*</span>
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={partyName}
                onChange={(e) => setPartyName(e.target.value)}
                placeholder="Enter party/customer name"
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              <button
                onClick={() => setShowPartySelector(true)}
                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-semibold transition-colors flex items-center gap-2"
                title="Search Parties"
              >
                <span>🔍</span> Search
              </button>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <label className="block text-sm font-medium text-gray-700">
                Items <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowItemSelector(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all text-sm"
                >
                  📦 Select from Inventory
                </button>
                <button
                  onClick={addItem}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all text-sm"
                >
                  + Add Custom Item
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-gray-200 rounded-lg">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      SR#
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">
                      Qty
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Unit (UOM)
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Rate
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">
                      Brand
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">
                      Remarks
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">
                      Remove
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {items.map((item, index) => (
                    <tr key={item.id}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {index + 1}
                      </td>
                      <td className="px-4 py-3 relative">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          onBlur={() => setTimeout(() => {
                            const newSuggestions = { ...suggestions };
                            delete newSuggestions[item.id];
                            setSuggestions(newSuggestions);
                            setActiveSuggestionRow(null);
                          }, 200)}
                          placeholder="Enter item description"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                        {/* Autocomplete suggestions */}
                        {suggestions[item.id] && suggestions[item.id].length > 0 && activeSuggestionRow === item.id && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
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
                      <td className="px-4 py-3">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          min="0"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={item.unit}
                          onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="PCS">PCS</option>
                          <option value="PKT">PKT</option>
                          <option value="BOX">BOX</option>
                          <option value="KG">KG</option>
                          <option value="METER">METER</option>
                          <option value="LITER">LITER</option>
                          <option value="DOZEN">DOZEN</option>
                        </select>
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.rate}
                          onChange={(e) => updateItem(item.id, 'rate', e.target.value)}
                          placeholder="Rate or range"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.brand || ''}
                          onChange={(e) => updateItem(item.id, 'brand', e.target.value)}
                          placeholder="Brand name"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          value={item.remarks || ''}
                          onChange={(e) => updateItem(item.id, 'remarks', e.target.value)}
                          placeholder="Remarks"
                          className="w-full px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 mt-8 flex-wrap">
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



            <button
              onClick={handleClear}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition flex items-center gap-2"
            >
              <span>🗑️</span> Delete
            </button>

            <button
              onClick={() => navigate(-1)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-bold shadow-lg transition"
            >
              Exit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
