import { useState, useEffect, useRef } from 'react';
import { inventoryItems as initialItems } from '../../../data/mockData';
import { InventoryItem, Invoice, InvoiceItem } from '../../../types';
import { generateInvoicePDF } from '../../../utils/pdfGenerator';

export default function PurchasesPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [supplierName, setSupplierName] = useState('');
  const [company, setCompany] = useState('QASIM SEWING MACHINE');
  const [termOfSale, setTermOfSale] = useState('CASH');
  const [discount, setDiscount] = useState(0);
  const [selectedItem, setSelectedItem] = useState('');
  const [itemSearch, setItemSearch] = useState('');
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);

  const [availableSuppliers, setAvailableSuppliers] = useState<string[]>([]);
  const [showAddSupplierModal, setShowAddSupplierModal] = useState(false);
  const [newSupplierData, setNewSupplierData] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
  });
  const [paidAmount, setPaidAmount] = useState(0);
  const [paymentStatus, setPaymentStatus] = useState<'full' | 'partial' | 'unpaid'>('full');
  const [quantity, setQuantity] = useState(1);
  const [purchaseRate, setPurchaseRate] = useState(0);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);

  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [newItemData, setNewItemData] = useState<Partial<InventoryItem>>({
    unit: 'Pieces',
    category: 'Sewing Machine Parts',
    minStock: 10,
    currentStock: 0,
  });

  const itemDropdownRef = useRef<HTMLDivElement>(null);
  const supplierDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedItems = localStorage.getItem('inventoryItems');
    setItems(savedItems ? JSON.parse(savedItems) : initialItems);

    const savedTransactions = localStorage.getItem('transactions');
    if (savedTransactions) {
      // purchaseHistory logic removed as it was unused
    }

    // Load selected company from localStorage
    const savedCompany = localStorage.getItem('selectedCompany');
    if (savedCompany) {
      setCompany(savedCompany);
    }

    // Load available suppliers
    loadAvailableSuppliers();
  }, []);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (itemDropdownRef.current && !itemDropdownRef.current.contains(event.target as Node)) {
        setShowItemDropdown(false);
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

  // Auto-update paid amount when netTotal changes (default to full payment)
  useEffect(() => {
    if (invoiceItems.length > 0 && paymentStatus === 'full') {
      const total = invoiceItems.reduce((sum, item) => sum + item.totalAmount, 0);
      const netAmount = total - discount;
      setPaidAmount(Math.round(netAmount));
    }
  }, [invoiceItems, discount]);

  const loadAvailableSuppliers = () => {
    const savedParties = localStorage.getItem('parties');
    if (savedParties) {
      const parties = JSON.parse(savedParties);
      const suppliers = parties
        .filter((p: any) => p.type === 'supplier')
        .map((p: any) => p.name);
      setAvailableSuppliers(suppliers);
    }
  };

  const handleSaveNewItem = () => {
    if (!newItemData.articleCode || !newItemData.name || !newItemData.rate) {
      alert('Please fill in Article Code, Name, and Rate');
      return;
    }

    const newItem: InventoryItem = {
      id: Date.now().toString(),
      articleCode: newItemData.articleCode,
      name: newItemData.name,
      description: newItemData.description || '',
      category: newItemData.category || 'Sewing Machine Parts',
      unit: newItemData.unit || 'Pieces',
      location: newItemData.location || '',
      picture: '',
      rate: newItemData.rate,
      salePrice: newItemData.salePrice || 0,
      currentStock: 0, // Will be updated when purchase is completed
      minStock: newItemData.minStock || 10,
      minSalePrice: newItemData.minSalePrice || 0,
      lastRestocked: new Date().toISOString().split('T')[0],
      supplier: newItemData.supplier || supplierName,
    };

    const updatedItems = [...items, newItem];
    setItems(updatedItems);
    localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));

    // Auto-select the newly created item
    setSelectedItem(newItem.id);
    setPurchaseRate(newItem.rate);

    // Close modal and reset form
    setShowAddItemModal(false);
    setNewItemData({
      unit: 'Pieces',
      category: 'Sewing Machine Parts',
      minStock: 10,
      currentStock: 0,
    });

    alert('Item added to inventory successfully!');
  };

  const addInvoiceItem = async () => {
    const item = items.find(i => i.id === selectedItem);
    if (!item) {
      alert('Please select an item');
      return;
    }

    const rateToUse = purchaseRate || item.rate;

    // Check if purchase rate is higher than base rate
    if (rateToUse > item.rate) {
      const confirmed = window.confirm(
        `Warning: Purchase rate (₨${rateToUse.toFixed(2)}) is higher than the current base rate (₨${item.rate.toFixed(2)}).\n\nDo you want to update the base rate and add this item?`
      );

      if (!confirmed) {
        return; // Don't add item
      }
    }

    // Update supplier list if new supplier is provided
    let updatedSuppliers = item.supplier || '';
    if (supplierName && supplierName.trim()) {
      const existingSuppliers = item.supplier ? item.supplier.split(',').map(s => s.trim()) : [];
      const newSupplier = supplierName.trim();

      if (!existingSuppliers.includes(newSupplier)) {
        // Add new supplier to the list
        updatedSuppliers = existingSuppliers.length > 0
          ? `${item.supplier}, ${newSupplier}`
          : newSupplier;
      }
    }

    // Update item in inventory with new rate and/or supplier
    const updatedItems = items.map(i => {
      if (i.id === item.id) {
        const updates: any = { supplier: updatedSuppliers };
        if (rateToUse > item.rate) {
          updates.rate = rateToUse;
        }
        return { ...i, ...updates };
      }
      return i;
    });
    setItems(updatedItems);
    localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));

    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      articleCode: item.articleCode,
      description: item.description,
      unit: item.unit,
      quantity: quantity,
      rate: rateToUse,
      totalAmount: quantity * rateToUse,
    };

    setInvoiceItems([...invoiceItems, newItem]);
    setSelectedItem('');
    setItemSearch('');
    setQuantity(1);
    setPurchaseRate(0);
  };

  const clearFields = () => {
    setSelectedItem('');
    setItemSearch('');
    setQuantity(1);
    setPurchaseRate(0);

    setShowItemDropdown(false);
  };

  const removeItem = (id: string) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== id));
  };

  const updateInvoiceItem = async (itemId: string, field: 'quantity' | 'rate' | 'description', value: number | string) => {
    const invoiceItem = invoiceItems.find(i => i.id === itemId);
    if (!invoiceItem) return;

    // Handle description update
    if (field === 'description') {
      const updatedInvoiceItems = invoiceItems.map(item =>
        item.id === itemId
          ? { ...item, description: value as string }
          : item
      );
      setInvoiceItems(updatedInvoiceItems);
      return;
    }

    const inventoryItem = items.find(i => i.articleCode === invoiceItem.articleCode);
    if (!inventoryItem) return;

    const newQuantity = field === 'quantity' ? value as number : invoiceItem.quantity;
    const newRate = field === 'rate' ? value as number : invoiceItem.rate;

    // Check if new rate is higher than base rate
    if (field === 'rate' && newRate > inventoryItem.rate) {
      const confirmed = window.confirm(
        `Warning: Purchase rate (₨${newRate.toFixed(2)}) is higher than the current base rate (₨${inventoryItem.rate.toFixed(2)}).\n\nDo you want to update the base rate?`
      );

      if (confirmed) {
        // Update base rate in inventory
        const updatedItems = items.map(i =>
          i.articleCode === inventoryItem.articleCode ? { ...i, rate: newRate } : i
        );
        setItems(updatedItems);
        localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));
      } else {
        // Revert to original rate
        return;
      }
    }

    // Update invoice item
    const updatedInvoiceItems = invoiceItems.map(item =>
      item.id === itemId
        ? {
          ...item,
          quantity: newQuantity,
          rate: newRate,
          totalAmount: newQuantity * newRate
        }
        : item
    );
    setInvoiceItems(updatedInvoiceItems);
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
      notes: 'Added from purchase form',
    };

    parties.push(newSupplier);
    localStorage.setItem('parties', JSON.stringify(parties));
    window.dispatchEvent(new Event('supplierDataChanged'));

    // Set as current supplier
    setSupplierName(newSupplierData.name.trim());
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

  const generatePurchase = () => {
    // Validation
    if (invoiceItems.length === 0) {
      alert('Please add at least one item');
      return;
    }

    // For partial or unpaid purchases, supplier name is mandatory
    if (paymentStatus !== 'full' && !supplierName) {
      alert('Supplier name is required for partial or unpaid purchases. Please select or add a supplier.');
      return;
    }

    const total = invoiceItems.reduce((sum, item) => sum + item.totalAmount, 0);
    const netTotal = total - discount;

    // Validate payment amount
    if (paidAmount > netTotal) {
      alert('Paid amount cannot be greater than net total');
      return;
    }

    const invoiceNo = `PI-${new Date().getMonth() + 1}${new Date().getDate()}-${Date.now().toString().slice(-4)}`;

    // Determine actual payment status with proper comparison (accounting for floating point)
    let actualPaymentStatus: 'full' | 'partial' | 'unpaid';
    const roundedPaid = Math.round(paidAmount * 100) / 100;
    const roundedTotal = Math.round(netTotal * 100) / 100;

    if (roundedPaid === 0) {
      actualPaymentStatus = 'unpaid';
    } else if (roundedPaid >= roundedTotal) {
      actualPaymentStatus = 'full';
    } else {
      actualPaymentStatus = 'partial';
    }

    const remainingAmount = Math.max(0, netTotal - paidAmount);

    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNo,
      type: 'purchase',
      customerName: supplierName,
      companyName: company,
      termOfSale,
      invoiceDate: new Date().toLocaleString(),
      items: invoiceItems,
      total,
      tcsCharges: 0,
      discount,
      netTotal,
      cashReceived: paidAmount,
      preparedBy: 'FAIZAN',
    };

    setCurrentInvoice(invoice);

    // Update inventory - add stock and update rate
    const updatedItems = items.map(item => {
      const invoiceItem = invoiceItems.find(ii => ii.articleCode === item.articleCode);
      if (invoiceItem) {
        return {
          ...item,
          currentStock: item.currentStock + invoiceItem.quantity,
          rate: invoiceItem.rate, // Update rate with latest purchase rate
          lastRestocked: new Date().toISOString().split('T')[0],
        };
      }
      return item;
    });
    setItems(updatedItems);
    localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));

    // Save transaction with payment details
    const savedTransactions = localStorage.getItem('transactions');
    const transactions = savedTransactions ? JSON.parse(savedTransactions) : [];
    transactions.push({
      id: Date.now().toString(),
      type: 'purchase',
      invoiceNo,
      customerName: supplierName,
      companyName: company,
      amount: netTotal,
      paidAmount: paidAmount,
      remainingAmount: remainingAmount,
      paymentStatus: actualPaymentStatus,
      date: new Date().toISOString().split('T')[0],
      items: invoiceItems.length,
      termOfSale: termOfSale,
      invoiceItems: invoiceItems,
    });
    localStorage.setItem('transactions', JSON.stringify(transactions));

    // Update supplier ledger with purchase transaction (only if supplier name is provided)
    if (supplierName && supplierName.trim()) {
      const savedParties = localStorage.getItem('parties');
      const parties = savedParties ? JSON.parse(savedParties) : [];

      let supplier = parties.find((p: any) => p.name.toLowerCase() === supplierName.toLowerCase() && p.type === 'supplier');

      const purchaseTransaction = {
        id: Date.now().toString(),
        date: new Date().toISOString().split('T')[0],
        type: 'purchase',
        companyName: company,
        description: `Purchase Invoice - ${invoiceItems.length} items`,
        invoiceNo: invoiceNo,
        amount: netTotal,
        paidAmount: paidAmount,
        remainingAmount: remainingAmount,
        paymentStatus: actualPaymentStatus,
        balance: 0,
        items: invoiceItems.map(item => ({
          articleCode: item.articleCode,
          description: item.description,
          quantity: item.quantity,
          rate: item.rate,
          totalAmount: item.totalAmount,
        })),
      };

      if (supplier) {
        // Update existing supplier
        const oldBalance = supplier.currentBalance || 0;
        const newBalance = oldBalance + remainingAmount;
        purchaseTransaction.balance = newBalance;

        supplier.currentBalance = newBalance;
        supplier.totalPurchases = (supplier.totalPurchases || 0) + netTotal;
        supplier.totalPayments = (supplier.totalPayments || 0) + paidAmount;
        supplier.lastTransactionDate = new Date().toISOString().split('T')[0];

        if (!supplier.transactions) {
          supplier.transactions = [];
        }
        supplier.transactions.push(purchaseTransaction);

        const supplierIndex = parties.findIndex((p: any) => p.id === supplier.id);
        parties[supplierIndex] = supplier;
      } else {
        // Create new supplier with unique number
        purchaseTransaction.balance = remainingAmount;

        // Find the maximum supplier number to ensure uniqueness
        const maxSupplierNumber = parties
          .filter((p: any) => p.type === 'supplier')
          .reduce((max: number, p: any) => Math.max(max, p.partyNumber || 0), 0);

        supplier = {
          id: `supplier-${Date.now()}`,
          partyNumber: maxSupplierNumber + 1,
          name: supplierName,
          type: 'supplier',
          contactPerson: '',
          phone: '',
          email: '',
          address: '',
          city: '',
          status: 'active',
          currentBalance: remainingAmount,
          totalPurchases: netTotal,
          totalPayments: paidAmount,
          creditLimit: 0,
          openingBalance: 0,
          createdDate: new Date().toISOString().split('T')[0],
          lastTransactionDate: new Date().toISOString().split('T')[0],
          transactions: [purchaseTransaction],
          notes: 'Auto-created from purchase',
        };
        parties.push(supplier);
      }

      localStorage.setItem('parties', JSON.stringify(parties));
      window.dispatchEvent(new Event('supplierDataChanged'));
    }

    // Reload purchase history


    // Clear form
    setSupplierName('');
    setInvoiceItems([]);
    setDiscount(0);
    setPaidAmount(0);
    setPaymentStatus('full');

    const statusMessage = actualPaymentStatus === 'full'
      ? 'Purchase completed and fully paid!'
      : actualPaymentStatus === 'unpaid'
        ? `Purchase recorded. Full amount of ₨${netTotal.toFixed(2)} is pending.`
        : `Purchase recorded. Paid ₨${paidAmount.toFixed(2)}, Remaining ₨${remainingAmount.toFixed(2)} is pending.`;

    alert(statusMessage);
  };

  const total = invoiceItems.reduce((sum, item) => sum + item.totalAmount, 0);
  const netTotal = total - discount;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create Purchase Invoice</h1>
          <p className="text-gray-600 mt-1">Record inventory purchases and update stock</p>
        </div>
        <button
          onClick={() => window.location.href = '/dashboard/purchase-history'}
          className="bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-300 px-6 py-3 rounded-lg font-semibold transition-all shadow-lg"
        >
          📋 Purchase History
        </button>
      </div>

      {/* Supplier Details */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Supplier Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Supplier Name {paymentStatus !== 'full' && <span className="text-red-600">*</span>}
              {paymentStatus === 'full' && <span className="text-xs text-gray-500 ml-2">(Optional for full payment)</span>}
            </label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <div className="flex-1 relative" ref={supplierDropdownRef}>
                  <input
                    type="text"
                    value={supplierName}
                    onChange={(e) => {
                      setSupplierName(e.target.value);
                      if (e.target.value) {
                        setShowSupplierDropdown(true);
                      }
                    }}
                    onFocus={() => setShowSupplierDropdown(true)}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder={paymentStatus === 'full' ? "Optional - Select or enter supplier" : "Required - Select or add supplier"}
                  />

                  {/* Available Suppliers Dropdown */}
                  {showSupplierDropdown && availableSuppliers.length > 0 && (
                    <div className="absolute z-20 w-full mt-1 bg-white border-2 border-blue-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {availableSuppliers
                        .filter(s => s.toLowerCase().includes(supplierName.toLowerCase()))
                        .map((supplier, index) => (
                          <div
                            key={index}
                            onClick={() => {
                              setSupplierName(supplier);
                              setShowSupplierDropdown(false);
                            }}
                            className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-semibold text-gray-900">{supplier}</div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddSupplierModal(true)}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition whitespace-nowrap"
                >
                  + Add New
                </button>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Terms</label>
            <select
              value={termOfSale}
              onChange={(e) => setTermOfSale(e.target.value)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            >
              <option>CASH</option>
              <option>CREDIT</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Company</label>
            <input
              type="text"
              value={company}
              readOnly
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Add Items */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Add Items</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Item</label>
            <div className="flex gap-2">
              <div className="flex-1 relative" ref={itemDropdownRef}>
                <input
                  type="text"
                  value={itemSearch}
                  onChange={(e) => {
                    setItemSearch(e.target.value);
                    setShowItemDropdown(true);
                    setSelectedItem('');
                  }}
                  onFocus={() => setShowItemDropdown(true)}
                  placeholder="Search by code or name..."
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                />
                {showItemDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border-2 border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {items
                      .filter(item =>
                        item.articleCode.toLowerCase().includes(itemSearch.toLowerCase()) ||
                        item.name.toLowerCase().includes(itemSearch.toLowerCase())
                      )
                      .slice(0, 10)
                      .map((item) => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedItem(item.id);
                            setItemSearch(`${item.articleCode} - ${item.name}`);
                            setPurchaseRate(item.rate);
                            setShowItemDropdown(false);
                          }}
                          className="px-4 py-2 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="font-semibold text-gray-900">{item.articleCode} - {item.name}</div>
                          <div className="text-xs text-gray-600">Stock: {item.currentStock} {item.unit} | Rate: ₨{item.rate.toFixed(2)}</div>
                        </div>
                      ))}
                    {items.filter(item =>
                      item.articleCode.toLowerCase().includes(itemSearch.toLowerCase()) ||
                      item.name.toLowerCase().includes(itemSearch.toLowerCase())
                    ).length === 0 && (
                        <div className="px-4 py-3 text-gray-500 text-center">No items found</div>
                      )}
                  </div>
                )}
              </div>
              <button
                onClick={() => setShowAddItemModal(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap"
                title="Add new item to inventory"
              >
                + New
              </button>
              <button
                onClick={clearFields}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-all whitespace-nowrap"
                title="Clear all fields"
              >
                Clear
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              min="1"
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Rate (₨)</label>
            <input
              type="number"
              value={purchaseRate}
              onChange={(e) => setPurchaseRate(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
        <button
          onClick={addInvoiceItem}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
        >
          Add Item
        </button>

        {invoiceItems.length > 0 && (
          <div className="mt-6">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-50 to-blue-100 border-b-2 border-blue-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">S.No</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Article Code</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Rate</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-blue-900 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {invoiceItems.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">{index + 1}</td>
                    <td className="px-4 py-3 font-semibold">{item.articleCode}</td>
                    <td className="px-4 py-3">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateInvoiceItem(item.id, 'description', e.target.value)}
                        className="w-full px-2 py-1 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        placeholder="Item description"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updateInvoiceItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        min="1"
                        className="w-20 px-2 py-1 border-2 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </td>
                    <td className="px-4 py-3 font-semibold text-gray-900">₨{item.rate.toFixed(2)}</td>
                    <td className="px-4 py-3 font-bold text-blue-600">₨{item.totalAmount.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-800 font-semibold transition-colors"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Totals */}
      {invoiceItems.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-100">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Discount (₨)</label>
              <input
                type="number"
                value={discount}
                onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                min="0"
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-700">
                <span>Subtotal:</span>
                <span className="font-semibold">₨{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Discount:</span>
                <span className="font-semibold">₨{discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-blue-600 border-t-2 pt-2">
                <span>Net Total:</span>
                <span>₨{netTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div className="mt-6 pt-6 border-t-2 border-gray-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Details</h3>

            {/* Quick Payment Options */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Type</label>
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPaidAmount(Math.round(netTotal));
                    setPaymentStatus('full');
                  }}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${paymentStatus === 'full'
                    ? 'bg-green-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-green-50 border-2 border-gray-300'
                    }`}
                >
                  Full Payment
                  <div className="text-xs mt-1">₨{Math.round(netTotal).toLocaleString()}</div>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPaidAmount(0);
                    setPaymentStatus('unpaid');
                  }}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${paymentStatus === 'unpaid'
                    ? 'bg-red-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-red-50 border-2 border-gray-300'
                    }`}
                >
                  No Payment
                  <div className="text-xs mt-1">Full Credit</div>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPaymentStatus('partial');
                    setPaidAmount(0);
                  }}
                  className={`px-4 py-3 rounded-lg font-semibold transition-all ${paymentStatus === 'partial'
                    ? 'bg-orange-600 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-orange-50 border-2 border-gray-300'
                    }`}
                >
                  Partial Payment
                  <div className="text-xs mt-1">Custom Amount</div>
                </button>
              </div>
            </div>

            {/* Manual Payment Input */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Amount Paid (₨)</label>
                <input
                  type="number"
                  value={paidAmount}
                  onChange={(e) => {
                    const amount = parseInt(e.target.value) || 0;
                    setPaidAmount(amount);
                    if (amount === 0) setPaymentStatus('unpaid');
                    else if (amount >= Math.round(netTotal)) setPaymentStatus('full');
                    else setPaymentStatus('partial');
                  }}
                  max={Math.round(netTotal)}
                  min="0"
                  step="1"
                  className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Enter amount paid"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Remaining Amount</label>
                <div className="px-4 py-2 bg-gray-100 rounded-lg border-2 border-gray-300 flex items-center h-[42px]">
                  <span className="font-bold text-lg text-gray-900">₨{(Math.round(netTotal) - paidAmount).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Status Indicator */}
            <div className={`mt-4 p-4 rounded-lg ${paidAmount >= netTotal ? 'bg-green-50 border-2 border-green-300' :
              paidAmount === 0 ? 'bg-red-50 border-2 border-red-300' :
                'bg-orange-50 border-2 border-orange-300'
              }`}>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-700">Status:</span>
                <span className={`font-bold ${paidAmount >= netTotal ? 'text-green-700' :
                  paidAmount === 0 ? 'text-red-700' :
                    'text-orange-700'
                  }`}>
                  {paidAmount >= netTotal ? '✓ Fully Paid' :
                    paidAmount === 0 ? '⚠ Unpaid - Full Credit' :
                      `⚠ Partially Paid - ₨${(netTotal - paidAmount).toFixed(2)} Pending`}
                </span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={() => {
                generatePurchase();
                setShowInvoiceModal(true);
              }}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all text-lg"
            >
              Complete Purchase
            </button>
            {currentInvoice && (
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all text-lg"
              >
                📄 View Invoice
              </button>
            )}
          </div>
        </div>
      )}

      {/* Add New Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Add New Item to Inventory</h2>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Article Code *</label>
                    <input
                      type="text"
                      value={newItemData.articleCode || ''}
                      onChange={(e) => setNewItemData({ ...newItemData, articleCode: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="LED-JK-9100BS"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Name *</label>
                    <input
                      type="text"
                      value={newItemData.name || ''}
                      onChange={(e) => setNewItemData({ ...newItemData, name: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="LED Light JK-9100BS"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    value={newItemData.description || ''}
                    onChange={(e) => setNewItemData({ ...newItemData, description: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    rows={3}
                    placeholder="Enter item description"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                    <input
                      type="text"
                      value={newItemData.category || ''}
                      onChange={(e) => setNewItemData({ ...newItemData, category: e.target.value })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="Sewing Machine Parts"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Unit</label>
                    <select
                      value={newItemData.unit || 'Pieces'}
                      onChange={(e) => setNewItemData({ ...newItemData, unit: e.target.value })}
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Purchase Rate (₨) *</label>
                    <input
                      type="number"
                      value={newItemData.rate || ''}
                      onChange={(e) => setNewItemData({ ...newItemData, rate: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="475.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Sale Price (₨)</label>
                    <input
                      type="number"
                      value={newItemData.salePrice || ''}
                      onChange={(e) => setNewItemData({ ...newItemData, salePrice: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="650.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Minimum Sale Price (₨)</label>
                    <input
                      type="number"
                      value={newItemData.minSalePrice || ''}
                      onChange={(e) => setNewItemData({ ...newItemData, minSalePrice: parseFloat(e.target.value) })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="500.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Min Stock Level</label>
                    <input
                      type="number"
                      value={newItemData.minStock || 10}
                      onChange={(e) => setNewItemData({ ...newItemData, minStock: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                      placeholder="10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Supplier</label>
                  <input
                    type="text"
                    value={newItemData.supplier || supplierName}
                    onChange={(e) => setNewItemData({ ...newItemData, supplier: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="Supplier name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Storage Location</label>
                  <input
                    type="text"
                    value={newItemData.location || ''}
                    onChange={(e) => setNewItemData({ ...newItemData, location: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    placeholder="e.g., Warehouse A - Shelf 3"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 mt-6">
                <button
                  onClick={() => {
                    setShowAddItemModal(false);
                    setNewItemData({
                      unit: 'Pieces',
                      category: 'Sewing Machine Parts',
                      minStock: 10,
                      currentStock: 0,
                    });
                  }}
                  className="bg-white hover:bg-gray-100 text-gray-700 border-2 border-gray-300 px-6 py-3 rounded-lg font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveNewItem}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
                >
                  Save & Use Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add New Supplier Modal */}
      {showAddSupplierModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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

      {/* Purchase Invoice Modal */}
      {showInvoiceModal && currentInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Invoice Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Purchase Invoice</h2>
                  <p className="text-blue-100">{company}</p>
                </div>
                <button
                  onClick={() => setShowInvoiceModal(false)}
                  className="text-white hover:text-gray-200 text-3xl font-bold leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Invoice Body */}
            <div className="p-8 space-y-6">
              {/* Invoice Info */}
              <div className="grid grid-cols-2 gap-6 pb-6 border-b-2 border-gray-200">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">SUPPLIER DETAILS</h3>
                  <p className="text-lg font-bold text-gray-900">{currentInvoice.customerName || 'Cash Purchase'}</p>
                  <p className="text-sm text-gray-600 mt-1">Term: {currentInvoice.termOfSale}</p>
                </div>
                <div className="text-right">
                  <h3 className="text-sm font-semibold text-gray-600 mb-3">INVOICE INFO</h3>
                  <p className="text-sm text-gray-900"><span className="font-semibold">Invoice No:</span> {currentInvoice.invoiceNo}</p>
                  <p className="text-sm text-gray-900 mt-1"><span className="font-semibold">Date:</span> {new Date(currentInvoice.invoiceDate).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-900 mt-1"><span className="font-semibold">Time:</span> {new Date(currentInvoice.invoiceDate).toLocaleTimeString()}</p>
                </div>
              </div>

              {/* Items Table */}
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-3">ITEMS PURCHASED</h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">S.No</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Article Code</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Description</th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">Unit</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Quantity</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Rate</th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentInvoice.items.map((item, index) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900">{item.articleCode}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{item.description}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{item.unit}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-900">₨{item.rate.toFixed(2)}</td>
                          <td className="px-4 py-3 text-sm text-right font-bold text-blue-600">₨{item.totalAmount.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="bg-gray-50 rounded-lg p-6 space-y-3">
                <div className="flex justify-between text-gray-700">
                  <span className="font-semibold">Subtotal:</span>
                  <span className="font-semibold">₨{currentInvoice.total.toFixed(2)}</span>
                </div>
                {currentInvoice.discount > 0 && (
                  <div className="flex justify-between text-gray-700">
                    <span className="font-semibold">Discount:</span>
                    <span className="font-semibold text-red-600">- ₨{currentInvoice.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xl font-bold text-blue-600 border-t-2 border-gray-300 pt-3">
                  <span>Net Total:</span>
                  <span>₨{currentInvoice.netTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment Details */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border-2 border-green-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">PAYMENT DETAILS</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Amount Paid:</span>
                    <span className="text-xl font-bold text-green-600">₨{currentInvoice.cashReceived.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-gray-700">Remaining Amount:</span>
                    <span className="text-xl font-bold text-red-600">₨{(currentInvoice.netTotal - currentInvoice.cashReceived).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-3 border-t border-gray-300">
                    <span className="font-semibold text-gray-700">Payment Status:</span>
                    <span className={`px-4 py-2 rounded-full text-sm font-bold ${currentInvoice.cashReceived >= currentInvoice.netTotal
                      ? 'bg-green-100 text-green-700'
                      : currentInvoice.cashReceived === 0
                        ? 'bg-red-100 text-red-700'
                        : 'bg-orange-100 text-orange-700'
                      }`}>
                      {currentInvoice.cashReceived >= currentInvoice.netTotal
                        ? '✓ Fully Paid'
                        : currentInvoice.cashReceived === 0
                          ? '⚠ Unpaid'
                          : '⚠ Partially Paid'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Footer Info */}
              <div className="flex justify-between items-end pt-6 border-t-2 border-gray-200">
                <div>
                  <p className="text-sm text-gray-600">Prepared By:</p>
                  <p className="text-lg font-bold text-gray-900">{currentInvoice.preparedBy}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">6-ALLAMA IQBAL ROAD, BOHAR WALA CHOWK LAHORE</p>
                  <p className="text-xs text-gray-500">TEL: +92-42-36291732-33-34-35</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="bg-gray-50 px-8 py-4 flex gap-4 border-t border-gray-200">
              <button
                onClick={() => {
                  generateInvoicePDF(currentInvoice, 'purchase', company);
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
              >
                📥 Download PDF
              </button>
              <button
                onClick={() => window.print()}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
              >
                🖨️ Print Invoice
              </button>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
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
