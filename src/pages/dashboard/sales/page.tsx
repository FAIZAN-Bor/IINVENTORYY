import { useState, useEffect } from 'react';
import { inventoryItems as initialItems, parties as mockParties } from '../../../data/mockData';
import { InventoryItem, Invoice, InvoiceItem, Party } from '../../../types';
import { generateInvoicePDF } from '../../../utils/pdfGenerator';

export default function SalesPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [parties, setParties] = useState<Party[]>([]);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState('');

  // Customer Type Selection
  const [customerType, setCustomerType] = useState<'party' | 'non-party'>('non-party');

  // Non-Party Customer Fields
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');

  // Party Customer Fields
  const [selectedParty, setSelectedParty] = useState<Party | null>(null);
  const [partySearchTerm, setPartySearchTerm] = useState('');
  const [filteredParties, setFilteredParties] = useState<Party[]>([]);
  const [showPartyDropdown, setShowPartyDropdown] = useState(false);

  // Payment Fields
  const [paymentOption, setPaymentOption] = useState<'cash' | 'later' | 'partial'>('cash');
  const [partialPayment, setPartialPayment] = useState(0);
  const [dueDays, setDueDays] = useState(0);

  const [termOfSale] = useState('Credit');
  const [company, setCompany] = useState('QASIM SEWING MACHINE');
  const [invoiceType, setInvoiceType] = useState('Credit');
  const [fromLocation, setFromLocation] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [discount, setDiscount] = useState(0);
  const [taxPercentage, setTaxPercentage] = useState(0);
  const [tcsCharges, setTcsCharges] = useState(0);
  const [netAmount, setNetAmount] = useState(0);
  const [balance, setBalance] = useState(0);
  const [balanceNetAmount, setBalanceNetAmount] = useState(0);
  const [lastPrice, setLastPrice] = useState(0);
  const [inTime, setInTime] = useState(new Date().toLocaleTimeString());
  const [activeTab, setActiveTab] = useState<'sales' | 'expense' | 'cash'>('sales');
  const [selectedItem, setSelectedItem] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [itemRate, setItemRate] = useState(0);
  const [itemUnit, setItemUnit] = useState('Pieces');
  const [showPreview, setShowPreview] = useState(false);
  const [showEditablePreview, setShowEditablePreview] = useState(false);
  const [showChallanPreview, setShowChallanPreview] = useState(false);
  const [showEditableChallan, setShowEditableChallan] = useState(false);
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null);
  const [relatedItems, setRelatedItems] = useState<InventoryItem[]>([]);
  const [challanNumber, setChallanNumber] = useState('');

  // Editable invoice fields
  const [editableCustomerName, setEditableCustomerName] = useState('');
  const [editableInvoiceNo, setEditableInvoiceNo] = useState('');
  const [editableItems, setEditableItems] = useState<InvoiceItem[]>([]);

  // Editable challan fields
  const [editableChallanCompany, setEditableChallanCompany] = useState('QASIM SEWING MACHINE');
  const [editableChallanCustomerName, setEditableChallanCustomerName] = useState('');
  const [editableChallanAddress, setEditableChallanAddress] = useState('');
  const [editableChallanCourier, setEditableChallanCourier] = useState('');
  const [editableChallanNo, setEditableChallanNo] = useState('');
  const [editableChallanItems, setEditableChallanItems] = useState<InvoiceItem[]>([]);

  useEffect(() => {
    const savedItems = localStorage.getItem('inventoryItems');
    setItems(savedItems ? JSON.parse(savedItems) : initialItems);

    // Load parties
    const savedParties = localStorage.getItem('parties');
    setParties(savedParties ? JSON.parse(savedParties) : mockParties);

    // Load selected company from localStorage
    const savedCompany = localStorage.getItem('selectedCompany');
    if (savedCompany) {
      setCompany(savedCompany);
    }

    // Listen for company changes
    const handleCompanyChange = () => {
      const newCompany = localStorage.getItem('selectedCompany') || 'QASIM SEWING MACHINE';
      setCompany(newCompany);
    };
    window.addEventListener('companyChanged', handleCompanyChange);

    // Listen for party data changes
    const handlePartyDataChange = () => {
      const savedParties = localStorage.getItem('parties');
      if (savedParties) {
        const updatedParties = JSON.parse(savedParties);
        setParties(updatedParties);
        // Update selected party if it exists
        if (selectedParty) {
          const updatedSelectedParty = updatedParties.find((p: Party) => p.partyNumber === selectedParty.partyNumber);
          if (updatedSelectedParty) {
            setSelectedParty(updatedSelectedParty);
            setBalance(updatedSelectedParty.currentBalance);
          }
        }
      }
    };
    window.addEventListener('partyDataChanged', handlePartyDataChange);

    // Set current time
    const updateTime = () => {
      const now = new Date();
      setInTime(now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => {
      clearInterval(interval);
      window.removeEventListener('companyChanged', handleCompanyChange);
      window.removeEventListener('partyDataChanged', handlePartyDataChange);
    };
  }, []);

  useEffect(() => {
    // Calculate balance + net amount
    setBalanceNetAmount(balance + netAmount);
  }, [balance, netAmount]);

  useEffect(() => {
    // Calculate net amount from invoice items
    const total = invoiceItems.reduce((sum, item) => sum + item.totalAmount, 0);
    setNetAmount(total - discount + tcsCharges);
  }, [invoiceItems, discount, tcsCharges]);

  // Party search functionality
  const handlePartySearch = (term: string) => {
    setPartySearchTerm(term);
    if (term.length > 0) {
      const searchLower = term.toLowerCase();
      const filtered = parties.filter(party =>
        party.name.toLowerCase().includes(searchLower) ||
        party.partyNumber.toString().includes(term) ||
        (party.phone && party.phone.includes(term)) ||
        (party.contactPerson && party.contactPerson.toLowerCase().includes(searchLower)) ||
        (party.city && party.city.toLowerCase().includes(searchLower))
      );
      setFilteredParties(filtered);
      setShowPartyDropdown(true);
    } else {
      setFilteredParties([]);
      setShowPartyDropdown(false);
    }
  };

  const selectParty = (party: Party) => {
    setSelectedParty(party);
    setPartySearchTerm(`${party.partyNumber} - ${party.name}`);
    setBalance(party.currentBalance);
    setShowPartyDropdown(false);
  };

  const handleClearParty = () => {
    setSelectedParty(null);
    setPartySearchTerm('');
    setBalance(0);
    setPaymentOption('cash');
    setPartialPayment(0);
    setDueDays(0);
  };

  const resetCustomerSelection = () => {
    setCustomerName('');
    setCustomerPhone('');
    setCustomerAddress('');
    setSelectedParty(null);
    setPartySearchTerm('');
    setBalance(0);
    setPaymentOption('cash');
    setPartialPayment(0);
    setDueDays(0);
  };

  useEffect(() => {
    // Reset customer fields when customer type changes
    resetCustomerSelection();
  }, [customerType]);

  const handleSearchItem = (term: string) => {
    // Enforce party selection
    if (customerType === 'party' && !selectedParty) {
      alert('Please select a party first before searching for items.');
      return;
    }

    setSearchTerm(term);
    if (term.length > 0) {
      const searchLower = term.toLowerCase();
      const filtered = items.filter(item => {
        return (
          item.articleCode.toLowerCase().includes(searchLower) ||
          item.name.toLowerCase().includes(searchLower) ||
          (item.description && item.description.toLowerCase().includes(searchLower)) ||
          (item.category && item.category.toLowerCase().includes(searchLower)) ||
          (item.supplier && item.supplier.toLowerCase().includes(searchLower)) ||
          (item.location && item.location.toLowerCase().includes(searchLower))
        );
      });
      setRelatedItems(filtered.slice(0, 10));
    } else {
      setRelatedItems([]);
    }
  };

  // Get last price for selected item and party
  const getLastPartyPrice = (itemId: string, party: Party | null) => {
    if (!party || !itemId) return 0;

    const selectedInventoryItem = items.find(i => i.id === itemId);
    if (!selectedInventoryItem) return 0;

    const savedInvoices = localStorage.getItem('invoices');
    if (savedInvoices) {
      const allInvoices: Invoice[] = JSON.parse(savedInvoices);

      // Filter invoices for this party and company
      const partyInvoices = allInvoices.filter(inv =>
        inv.customerName === party.name &&
        inv.companyName === company &&
        inv.items.some(item => item.articleCode === selectedInventoryItem.articleCode)
      );

      // Sort by date descending
      partyInvoices.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());

      if (partyInvoices.length > 0) {
        // Find the item in the latest invoice
        const latestInvoice = partyInvoices[0];
        const itemInInvoice = latestInvoice.items.find(item => item.articleCode === selectedInventoryItem.articleCode);
        return itemInInvoice ? itemInInvoice.rate : 0;
      }
    }
    return 0;
  };

  useEffect(() => {
    if (customerType === 'party' && selectedParty && selectedItem) {
      const price = getLastPartyPrice(selectedItem, selectedParty);
      setLastPrice(price);
    } else {
      setLastPrice(0);
    }
  }, [selectedItem, selectedParty, customerType, company]);

  const selectItemFromRelated = (item: InventoryItem) => {
    if (customerType === 'party' && !selectedParty) {
      alert('Please select a party first.');
      return;
    }
    setSelectedItem(item.id);
    setSearchTerm(`${item.articleCode} - ${item.name}`);
    setItemRate(item.rate);
    setItemUnit(item.unit);
    setFromLocation(item.location || '');
    // lastPrice is handled by useEffect
    setRelatedItems([]);
  };

  const addInvoiceItem = () => {
    const item = items.find(i => i.id === selectedItem);
    if (!item) {
      alert('Please select an item');
      return;
    }

    if (quantity > item.currentStock) {
      alert(`Only ${item.currentStock} ${item.unit} available in stock`);
      return;
    }

    const finalRate = itemRate || item.rate;
    const totalAmount = quantity * finalRate;

    // Apply tax
    const taxAmount = (totalAmount * taxPercentage) / 100;
    const netTotal = totalAmount + taxAmount;

    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      articleCode: item.articleCode,
      description: item.description,
      unit: itemUnit,
      quantity: quantity,
      rate: finalRate,
      totalAmount: netTotal,
      pdp: 1,
      taxPercentage,
    };

    setInvoiceItems([...invoiceItems, newItem]);
    // Reset form
    setSelectedItem('');
    setSearchTerm('');
    setQuantity(1);
    setItemRate(0);
    setItemUnit('Pieces');
    setTaxPercentage(0);
    setLastPrice(0);
  };

  const removeItem = (id: string) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== id));
  };

  const calculateTotals = () => {
    const total = invoiceItems.reduce((sum, item) => sum + item.totalAmount, 0);
    const netTotal = total;
    const totalQuantity = invoiceItems.reduce((sum, item) => sum + item.quantity, 0);

    return { total, netTotal, totalQuantity };
  };

  const generateInvoice = () => {
    if (invoiceItems.length === 0) {
      alert('Please add at least one item');
      return;
    }

    // Get customer name based on customer type
    let invoiceCustomerName = '';

    if (customerType === 'party') {
      if (!selectedParty) {
        alert('Please select a party');
        return;
      }
      invoiceCustomerName = selectedParty.name;

      // Validate payment option fields for party customers
      if (paymentOption === 'later') {
        if (!dueDays || dueDays <= 0) {
          alert('Please enter due days for Pay Later option');
          return;
        }
      } else if (paymentOption === 'partial') {
        if (!partialPayment || partialPayment <= 0) {
          alert('Please enter partial payment amount');
          return;
        }
        if (!dueDays || dueDays <= 0) {
          alert('Please enter due days for remaining balance');
          return;
        }
      }
    } else {
      // For walk-in customers
      if (!customerName) {
        alert('Please enter customer name');
        return;
      }
      invoiceCustomerName = customerName;
    }

    calculateTotals();
    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = String(today.getFullYear()).slice(-2);
    const random = Math.floor(1000 + Math.random() * 9000);
    const generatedInvoiceNo = invoiceNumber || `SI-${month}${year}-${random}`;

    // Set editable fields
    setEditableCustomerName(invoiceCustomerName);
    setEditableInvoiceNo(generatedInvoiceNo);
    setEditableItems([...invoiceItems]);

    // Set default term of sale for walk-in customers
    if (customerType === 'non-party') {
      setInvoiceType('Cash');
    }

    // Show editable preview instead of final preview
    setShowEditablePreview(true);
  };

  const generateDeliveryChallan = () => {
    if (invoiceItems.length === 0) {
      alert('Please add at least one item');
      return;
    }

    // For party customers, use party information
    let challanCustomerName = '';
    let challanCustomerAddress = '';

    if (customerType === 'party') {
      if (!selectedParty) {
        alert('Please select a party');
        return;
      }
      challanCustomerName = selectedParty.name;
      challanCustomerAddress = selectedParty.address || '';

      if (!challanCustomerAddress) {
        alert('Selected party does not have an address. Please update party information.');
        return;
      }
    } else {
      // For walk-in customers
      if (!customerName) {
        alert('Please enter customer name');
        return;
      }
      if (!customerAddress) {
        alert('Please enter customer address for delivery challan');
        return;
      }
      challanCustomerName = customerName;
      challanCustomerAddress = customerAddress;
    }

    const today = new Date();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    const generatedChallanNo = challanNumber || `DC-${month}${day}-${random}`;

    // Set editable challan fields
    setEditableChallanCompany(company);
    setEditableChallanCustomerName(challanCustomerName);
    setEditableChallanAddress(challanCustomerAddress);
    setEditableChallanCourier('');
    setEditableChallanNo(generatedChallanNo);
    setEditableChallanItems([...invoiceItems]);

    // Show editable preview
    setShowEditableChallan(true);
  };

  const finalizeChallan = () => {
    setChallanNumber(editableChallanNo);
    setShowEditableChallan(false);
    setShowChallanPreview(true);
  };

  const finalizeInvoice = () => {
    // Calculate totals from editableItems (to ensure preview edits are reflected)
    const total = editableItems.reduce((sum, item) => sum + item.totalAmount, 0);
    const finalNetTotal = total - discount + tcsCharges;


    // Calculate payment details based on customer type and payment option
    let cashReceived = 0;
    let remainingBalance = 0;
    let paymentOpt: 'cash' | 'partial' | 'later' | undefined;
    let dueDaysValue: number | undefined;
    let dueDate: string | undefined;

    if (customerType === 'party') {
      // Simplifed Party Logic: Based purely on Invoice Type (Cash vs Credit)
      if (invoiceType === 'Cash') {
        // Full Payment
        paymentOpt = 'cash';
        cashReceived = finalNetTotal;
        remainingBalance = 0;
      } else {
        // Credit - No Payment
        paymentOpt = 'later';
        cashReceived = 0;
        remainingBalance = finalNetTotal;
      }
    } else {
      // Walk-in customer - always full payment
      cashReceived = finalNetTotal;
      remainingBalance = 0;
    }

    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNo: editableInvoiceNo,
      type: 'sale',
      customerType: customerType,
      customerName: editableCustomerName,
      companyName: company,
      termOfSale: invoiceType,
      invoiceDate: new Date().toLocaleString(),
      items: editableItems,
      total,
      tcsCharges,
      discount,
      netTotal: finalNetTotal,
      cashReceived,
      remainingBalance,
      paymentOption: paymentOpt,
      dueDays: dueDaysValue,
      dueDate,
      preparedBy: '',
    };

    setCurrentInvoice(invoice);
    setInvoiceNumber(editableInvoiceNo);

    // Save invoice
    const savedInvoices = localStorage.getItem('invoices');
    const invoices = savedInvoices ? JSON.parse(savedInvoices) : [];
    invoices.push(invoice);
    localStorage.setItem('invoices', JSON.stringify(invoices));

    // Update inventory
    const updatedItems = items.map(item => {
      const invoiceItem = editableItems.find(ii => ii.articleCode === item.articleCode);
      if (invoiceItem) {
        return {
          ...item,
          currentStock: item.currentStock - invoiceItem.quantity,
        };
      }
      return item;
    });
    setItems(updatedItems);
    localStorage.setItem('inventoryItems', JSON.stringify(updatedItems));

    // Save transaction
    const savedTransactions = localStorage.getItem('transactions');
    const transactions = savedTransactions ? JSON.parse(savedTransactions) : [];
    const newTransaction = {
      id: Date.now().toString(),
      type: 'sale',
      invoiceNo: editableInvoiceNo,
      customerName: editableCustomerName,
      companyName: company,
      amount: finalNetTotal,
      date: new Date().toISOString().split('T')[0],
      items: editableItems.length,
    };
    transactions.push(newTransaction);
    localStorage.setItem('transactions', JSON.stringify(transactions));

    // Update party balance if party customer
    if (customerType === 'party' && selectedParty) {
      const savedParties = localStorage.getItem('parties');
      const allParties = savedParties ? JSON.parse(savedParties) : [];

      const updatedParties = allParties.map((party: Party) => {
        if (party.partyNumber === selectedParty.partyNumber) {
          // Calculate balance change based on Invoice Type
          let balanceChange = 0;

          if (invoiceType === 'Credit') {
            // Credit Sale: Increase balance by full amount
            balanceChange = finalNetTotal;
          } else {
            // Cash Sale: No balance change (Full Payment)
            balanceChange = 0;
          }

          const newBalance = (party.currentBalance || 0) + balanceChange;

          // Add transaction to party history
          const partyTransactions = party.transactions || [];

          // Only add transaction if it's a CREDIT sale
          if (invoiceType === 'Credit') {
            const transactionDescription = `Invoice ${editableInvoiceNo} - Credit Sale`;

            partyTransactions.push({
              id: newTransaction.id,
              date: new Date().toISOString().split('T')[0],
              type: 'sale',
              companyName: company,
              description: transactionDescription,
              amount: finalNetTotal,
              paymentReceived: 0,
              balance: newBalance,
              dueDays: 0, // No due days logic for basic credit now
              dueDate: undefined,
            });
          }

          return {
            ...party,
            currentBalance: newBalance,
            transactions: partyTransactions,
          };
        }
        return party;
      });

      localStorage.setItem('parties', JSON.stringify(updatedParties));
      setParties(updatedParties);

      // Dispatch event to notify other components
      window.dispatchEvent(new Event('partyDataChanged'));

      // Update selected party in state
      const updatedParty = updatedParties.find((p: Party) => p.partyNumber === selectedParty.partyNumber);
      if (updatedParty) {
        setSelectedParty(updatedParty);
        setBalance(updatedParty.currentBalance);
      }
    }

    setShowEditablePreview(false);
    setShowPreview(true);
  };

  const { total, netTotal, totalQuantity } = calculateTotals();

  const convertNumberToWords = (num: number): string => {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];

    if (num === 0) return 'zero';

    const numStr = Math.floor(num).toString();
    let words = '';

    if (numStr.length > 5) {
      const lakhs = parseInt(numStr.slice(0, -5));
      words += ones[lakhs] + ' lakh ';
    }

    if (numStr.length > 3) {
      const thousands = parseInt(numStr.slice(-5, -3));
      if (thousands > 0) {
        if (thousands < 10) words += ones[thousands];
        else if (thousands < 20) words += teens[thousands - 10];
        else words += tens[Math.floor(thousands / 10)] + ' ' + ones[thousands % 10];
        words += ' thousand ';
      }
    }

    const hundreds = parseInt(numStr.slice(-3, -2));
    if (hundreds > 0) words += ones[hundreds] + ' hundred ';

    const last = parseInt(numStr.slice(-2));
    if (last > 0) {
      if (last < 10) words += ones[last];
      else if (last < 20) words += teens[last - 10];
      else words += tens[Math.floor(last / 10)] + ' ' + ones[last % 10];
    }

    return 'Rupees ' + words.trim() + ' only';
  };

  return (
    <div className="space-y-4">
      {!showPreview && !showEditablePreview && !showChallanPreview && !showEditableChallan ? (
        <>
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-4 rounded-lg shadow-lg">
            <h1 className="text-2xl font-bold">Sale Bill - ERP System</h1>
            <p className="text-blue-100 text-sm mt-1">Professional Invoice Management System</p>
          </div>

          {/* Main Form */}
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Customer Type Selection */}
            <div className="mb-6 bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
              <label className="block text-sm font-bold text-gray-800 mb-3">Select Customer Type:</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer bg-white px-6 py-3 rounded-lg border-2 border-gray-300 hover:border-blue-500 transition">
                  <input
                    type="radio"
                    name="customerType"
                    value="non-party"
                    checked={customerType === 'non-party'}
                    onChange={(e) => setCustomerType(e.target.value as 'non-party')}
                    className="w-5 h-5"
                  />
                  <span className="text-base font-semibold text-gray-700">Walk-in Customer</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer bg-white px-6 py-3 rounded-lg border-2 border-gray-300 hover:border-blue-500 transition">
                  <input
                    type="radio"
                    name="customerType"
                    value="party"
                    checked={customerType === 'party'}
                    onChange={(e) => setCustomerType(e.target.value as 'party')}
                    className="w-5 h-5"
                  />
                  <span className="text-base font-semibold text-gray-700">Party Customer</span>
                </label>
              </div>
            </div>

            {/* Top Section - Customer Details Based on Type */}
            <div className="grid grid-cols-12 gap-4 mb-4">
              {/* Customer Information Section */}
              <div className="col-span-4 space-y-3">
                {customerType === 'non-party' ? (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Customer Name: <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Enter customer name"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Phone:</label>
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Phone Number (Optional)"
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Address:</label>
                      <textarea
                        value={customerAddress}
                        onChange={(e) => setCustomerAddress(e.target.value)}
                        placeholder="Address (Optional)"
                        rows={2}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Company:</label>
                      <input
                        type="text"
                        value={company}
                        readOnly
                        className="w-full px-3 py-1.5 border border-gray-200 rounded text-sm bg-gray-50 text-gray-700 cursor-not-allowed"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">
                        Search Party: <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={partySearchTerm}
                            onChange={(e) => handlePartySearch(e.target.value)}
                            placeholder="Search by name, number, phone, city..."
                            className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                          {showPartyDropdown && filteredParties.length > 0 && (
                            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                              {filteredParties.map((party) => (
                                <div
                                  key={party.id}
                                  onClick={() => selectParty(party)}
                                  className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm border-b border-gray-100"
                                >
                                  <div className="font-semibold text-gray-900">
                                    {party.partyNumber} - {party.name}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {party.city && <span className="mr-2">📍 {party.city}</span>}
                                    {party.phone && <span>📞 {party.phone}</span>}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        {selectedParty && (
                          <button
                            onClick={handleClearParty}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm font-bold transition shadow-sm"
                            title="Clear Party Selection"
                          >
                            ✕ Clear
                          </button>
                        )}
                      </div>
                    </div>

                    {selectedParty && (
                      <>
                        <div className="bg-green-50 p-3 rounded border border-green-200">
                          <div className="text-xs font-semibold text-gray-700 mb-1">Party Info:</div>
                          <div className="text-sm">
                            <div className="font-bold text-gray-900">{selectedParty.name}</div>
                            {selectedParty.contactPerson && (
                              <div className="text-xs text-gray-600">Contact: {selectedParty.contactPerson}</div>
                            )}
                            {selectedParty.phone && (
                              <div className="text-xs text-gray-600">Phone: {selectedParty.phone}</div>
                            )}
                            <div className={`text-sm font-bold mt-1 ${selectedParty.currentBalance > 0 ? 'text-red-600' :
                              selectedParty.currentBalance < 0 ? 'text-green-600' :
                                'text-gray-600'
                              }`}>
                              Previous Due: Rs. {selectedParty.currentBalance.toLocaleString()}
                            </div>
                          </div>
                        </div>

                        {/* Payment Options Removed for Party - handled by Inv Type now */}


                      </>
                    )}

                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Company:</label>
                      <input
                        type="text"
                        value={company}
                        readOnly
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-gray-100 font-semibold text-gray-700"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Middle Column */}
              <div className="col-span-4 space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Invoice No:</label>
                  <input
                    type="text"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    placeholder="Auto-generated"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-blue-50 font-bold text-blue-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Issue Date & Time:</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={new Date().toLocaleDateString('en-GB')}
                      readOnly
                      className="flex-1 px-3 py-1.5 border border-gray-300 rounded text-sm bg-gray-50"
                    />
                    <input
                      type="text"
                      value={inTime}
                      readOnly
                      className="w-28 px-3 py-1.5 border border-gray-300 rounded text-sm bg-gray-50"
                    />
                  </div>
                </div>

                {customerType === 'party' && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Inv Type:</label>
                      <select
                        value={invoiceType}
                        onChange={(e) => setInvoiceType(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                      >
                        <option>Credit</option>
                        <option>Cash</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Right Column */}
              <div className="col-span-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Discount:</label>
                    <input
                      type="number"
                      value={discount}
                      onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">TCS Charges:</label>
                    <input
                      type="number"
                      value={tcsCharges}
                      onChange={(e) => setTcsCharges(parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Net Amount:</label>
                  <input
                    type="text"
                    value={netAmount.toFixed(2)}
                    readOnly
                    className="w-full px-3 py-1.5 border border-gray-300 rounded bg-green-50 font-bold text-green-900 text-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Balance + Net Amount:</label>
                  <input
                    type="text"
                    value={balanceNetAmount.toFixed(2)}
                    readOnly
                    className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-orange-50 font-bold text-orange-900"
                  />
                </div>

              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-300 mb-4">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('sales')}
                  className={`px-6 py-2 font-semibold transition ${activeTab === 'sales'
                    ? 'bg-blue-100 text-blue-900 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  Sales Detail
                </button>
                <button
                  onClick={() => setActiveTab('expense')}
                  className={`px-6 py-2 font-semibold transition ${activeTab === 'expense'
                    ? 'bg-blue-100 text-blue-900 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  Expense
                </button>
                <button
                  onClick={() => setActiveTab('cash')}
                  className={`px-6 py-2 font-semibold transition ${activeTab === 'cash'
                    ? 'bg-blue-100 text-blue-900 border-b-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-100'
                    }`}
                >
                  Cash Receipt
                </button>
              </div>
            </div>

            {/* Tab Content - Sales Detail */}
            {activeTab === 'sales' && (
              <div className="space-y-4">
                {/* Item Selection Section */}
                <div className="grid grid-cols-12 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="col-span-3">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">From Location:</label>
                    <input
                      type="text"
                      value={fromLocation}
                      onChange={(e) => setFromLocation(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm bg-white"
                      placeholder="Enter Location"
                    />
                  </div>

                  <div className="col-span-5">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Search Item:</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => handleSearchItem(e.target.value)}
                          placeholder="Search by Code, Name, Description, Category, Supplier, or Location"
                          className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                        />
                        {relatedItems.length > 0 && (
                          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                            {relatedItems.map((item) => (
                              <div
                                key={item.id}
                                onClick={() => selectItemFromRelated(item)}
                                className="px-3 py-2 hover:bg-blue-100 cursor-pointer text-sm border-b border-gray-100"
                              >
                                <div className="font-semibold">{item.articleCode} - {item.name}</div>
                                <div className="text-xs text-gray-600">
                                  {item.category && <span className="mr-2">📁 {item.category}</span>}
                                  <span className="text-green-600 font-semibold">Stock: {item.currentStock}</span>
                                  {item.location && <span className="ml-2">📍 {item.location}</span>}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => {
                          setSelectedItem('');
                          setSearchTerm('');
                          setQuantity(1);
                          setItemRate(0);
                          setItemUnit('Pieces');
                          setTaxPercentage(0);
                        }}
                        className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-5 py-1.5 rounded-lg text-sm font-bold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap"
                      >
                        ✨ Clear
                      </button>
                    </div>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Stock:</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={selectedItem ? items.find(i => i.id === selectedItem)?.currentStock || 0 : 0}
                        readOnly
                        className="w-16 px-2 py-1.5 border border-gray-300 rounded text-sm text-center bg-gray-100 font-semibold"
                      />
                      <div className="flex-1">
                        <label className="text-xs font-semibold text-gray-700">Unit:</label>
                        <select
                          value={itemUnit}
                          onChange={(e) => setItemUnit(e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm"
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
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Qty:</label>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm text-center font-semibold"
                    />
                  </div>
                </div>

                {/* Pricing Details Row */}
                <div className="grid grid-cols-12 gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="col-span-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Rate:</label>
                    <input
                      type="number"
                      value={itemRate}
                      onChange={(e) => setItemRate(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm font-semibold"
                      step="1"
                    />
                  </div>

                  {/* Last Price Field - Only for Party */}
                  {customerType === 'party' && (
                    <div className="col-span-4">
                      <label className="block text-xs font-semibold text-gray-700 mb-1">Last Price (for this party):</label>
                      <input
                        type="number"
                        value={lastPrice}
                        readOnly
                        className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm font-semibold bg-blue-50 text-blue-800"
                      />
                    </div>
                  )}

                  <div className="col-span-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Tax %:</label>
                    <input
                      type="number"
                      value={taxPercentage}
                      onChange={(e) => setTaxPercentage(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 border border-gray-300 rounded text-sm"
                      step="0.1"
                    />
                  </div>

                  <div className="col-span-4">
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Item Total:</label>
                    <input
                      type="text"
                      value={(quantity * itemRate).toFixed(2)}
                      readOnly
                      className="w-full px-3 py-1.5 border border-gray-300 rounded bg-green-100 font-bold text-green-900 text-lg"
                    />
                  </div>
                </div>

                {/* Add Button */}
                <div className="flex justify-end">
                  <button
                    onClick={addInvoiceItem}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded font-semibold transition shadow-md"
                  >
                    + Add Item
                  </button>
                </div>

                {/* Invoice Items Table */}
                {invoiceItems.length > 0 && (
                  <div className="border border-gray-300 rounded-lg overflow-hidden mt-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-blue-600 text-white">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-semibold">Location</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold">Code</th>
                            <th className="px-3 py-2 text-left text-xs font-semibold">Item</th>
                            <th className="px-3 py-2 text-center text-xs font-semibold">Qty</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold">Rate</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold">Tax %</th>
                            <th className="px-3 py-2 text-right text-xs font-semibold">Total (PKR)</th>
                            <th className="px-3 py-2 text-center text-xs font-semibold">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                          {invoiceItems.map((item, _index) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                              <td className="px-3 py-2 text-xs">{fromLocation}</td>
                              <td className="px-3 py-2 text-xs font-semibold">{item.articleCode}</td>
                              <td className="px-3 py-2 text-xs">{item.description}</td>
                              <td className="px-3 py-2 text-center text-xs font-semibold">{item.quantity}.00</td>
                              <td className="px-3 py-2 text-right text-xs font-semibold">{item.rate.toFixed(2)}</td>
                              <td className="px-3 py-2 text-right text-xs">{item.taxPercentage || 0}%</td>
                              <td className="px-3 py-2 text-right text-xs font-bold text-green-600">{item.totalAmount.toFixed(2)}</td>
                              <td className="px-3 py-2 text-center">
                                <button
                                  onClick={() => removeItem(item.id)}
                                  className="text-red-600 hover:text-red-800 font-semibold text-xs"
                                >
                                  Delete
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {invoiceItems.length > 0 && (
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      onClick={generateInvoice}
                      className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition shadow-lg"
                    >
                      💾 Save & Generate Invoice
                    </button>
                    <button
                      onClick={generateDeliveryChallan}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition shadow-lg"
                    >
                      📦 Generate Delivery Challan
                    </button>
                    <button
                      onClick={() => {
                        setInvoiceItems([]);
                        setNetAmount(0);
                        setSelectedItem('');
                        setSearchTerm('');
                        setQuantity(1);
                        setItemRate(0);
                        setTaxPercentage(0);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-lg font-bold text-lg transition shadow-lg"
                    >
                      🗑️ Clear All Items
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Expense Tab */}
            {activeTab === 'expense' && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Expense management coming soon...</p>
              </div>
            )}

            {/* Cash Receipt Tab */}
            {activeTab === 'cash' && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">Cash receipt management coming soon...</p>
              </div>
            )}
          </div>
        </>
      ) : showEditablePreview ? (
        /* Editable Invoice Preview */
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-5xl mx-auto">
          <div className="mb-6 flex justify-between items-center border-b-2 pb-4">
            <h2 className="text-2xl font-bold text-gray-900">📝 Edit Invoice Before Finalizing</h2>
            <button
              onClick={() => setShowEditablePreview(false)}
              className="text-gray-500 hover:text-gray-700 font-semibold no-print"
            >
              ✕ Cancel
            </button>
          </div>

          {/* Editable Fields */}
          <div className="grid grid-cols-2 gap-6 mb-6 p-4 bg-blue-50 rounded-lg">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Company Name:</label>
              <input
                type="text"
                value={company}
                readOnly
                className="w-full px-4 py-2 border border-gray-200 rounded-lg text-sm font-semibold bg-gray-100 text-gray-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Invoice Number:</label>
              <input
                type="text"
                value={editableInvoiceNo}
                onChange={(e) => setEditableInvoiceNo(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Customer Name:</label>
              <input
                type="text"
                value={editableCustomerName}
                onChange={(e) => setEditableCustomerName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Term Of Sale:</label>
              <select
                value={invoiceType}
                onChange={(e) => setInvoiceType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="Credit">Credit</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          {/* Editable Items Table */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Invoice Items:</h3>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-blue-600 text-white">
                  <tr>
                    <th className="px-3 py-2 text-left text-xs">Code</th>
                    <th className="px-3 py-2 text-left text-xs">Description</th>
                    <th className="px-3 py-2 text-center text-xs">Qty</th>
                    <th className="px-3 py-2 text-right text-xs">Rate</th>
                    <th className="px-3 py-2 text-right text-xs">Total</th>
                    <th className="px-3 py-2 text-center text-xs">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {editableItems.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 font-semibold">{item.articleCode}</td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...editableItems];
                            updated[index].description = e.target.value;
                            setEditableItems(updated);
                          }}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-xs"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...editableItems];
                            updated[index].quantity = parseInt(e.target.value) || 0;
                            updated[index].totalAmount = updated[index].quantity * updated[index].rate;
                            setEditableItems(updated);
                          }}
                          className="w-20 px-2 py-1 border border-gray-200 rounded text-xs text-center"
                        />
                      </td>
                      <td className="px-3 py-2 text-right">
                        <input
                          type="number"
                          value={item.rate}
                          onChange={(e) => {
                            const updated = [...editableItems];
                            updated[index].rate = parseFloat(e.target.value) || 0;
                            updated[index].totalAmount = updated[index].quantity * updated[index].rate;
                            setEditableItems(updated);
                          }}
                          className="w-24 px-2 py-1 border border-gray-200 rounded text-xs text-right"
                          step="0.01"
                        />
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-green-600">
                        {item.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => {
                            const updated = editableItems.filter((_, i) => i !== index);
                            setEditableItems(updated);
                          }}
                          className="text-red-600 hover:text-red-800 text-xs font-semibold"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Total Summary */}
          <div className="flex justify-end mb-6">
            <div className="bg-gray-100 p-4 rounded-lg min-w-[300px]">
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Subtotal:</span>
                <span className="font-bold">₨{editableItems.reduce((sum, item) => sum + item.totalAmount, 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">Discount:</span>
                <span className="font-bold">₨{discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="font-semibold">TCS Charges:</span>
                <span className="font-bold">₨{tcsCharges.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t-2 pt-2">
                <span className="font-bold text-lg">Net Total:</span>
                <span className="font-bold text-lg text-green-600">₨{(editableItems.reduce((sum, item) => sum + item.totalAmount, 0) - discount + tcsCharges).toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 no-print">
            <button
              onClick={() => setShowEditablePreview(false)}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition"
            >
              ⬅️ Go Back & Edit More
            </button>
            <button
              onClick={finalizeInvoice}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-bold transition"
            >
              ✅ Finalize & Generate Invoice
            </button>
          </div>
        </div>
      ) : showEditableChallan ? (
        /* Editable Challan Preview */
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-6xl mx-auto border-2 border-black">
          <div className="mb-6 flex justify-between items-center border-b-2 border-black pb-4">
            <h2 className="text-2xl font-bold text-gray-900">📝 Edit Delivery Challan Before Finalizing</h2>
            <button
              onClick={() => setShowEditableChallan(false)}
              className="text-gray-500 hover:text-gray-700 font-semibold no-print"
            >
              ✕ Cancel
            </button>
          </div>

          {/* Header Section */}
          <div className="border-2 border-black p-4 mb-6">
            <div className="text-center mb-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Company Name:</label>
              <input
                type="text"
                value={editableChallanCompany}
                onChange={(e) => setEditableChallanCompany(e.target.value)}
                className="w-full px-4 py-2 border-2 border-black text-center text-xl font-bold focus:ring-2 focus:ring-gray-500"
                placeholder="Enter Company Name"
              />
            </div>

            {/* Date and Challan Number Row */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Date:</label>
                <input
                  type="text"
                  value={new Date().toLocaleDateString('en-GB')}
                  readOnly
                  className="w-full px-3 py-2 border-b-2 border-black bg-gray-50 focus:ring-2 focus:ring-gray-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Challan #:</label>
                <input
                  type="text"
                  value={editableChallanNo}
                  onChange={(e) => setEditableChallanNo(e.target.value)}
                  className="w-full px-3 py-2 border-b-2 border-black focus:ring-2 focus:ring-gray-500"
                />
              </div>
            </div>

            {/* Party Name Row */}
            <div className="mb-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Party Name:</label>
              <input
                type="text"
                value={editableChallanCustomerName}
                onChange={(e) => setEditableChallanCustomerName(e.target.value)}
                className="w-full px-3 py-2 border-b-2 border-black focus:ring-2 focus:ring-gray-500"
              />
            </div>

            {/* Address and Courier Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Address:</label>
                <input
                  type="text"
                  value={editableChallanAddress}
                  onChange={(e) => setEditableChallanAddress(e.target.value)}
                  className="w-full px-3 py-2 border-b-2 border-black focus:ring-2 focus:ring-gray-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Courier's Name:</label>
                <input
                  type="text"
                  value={editableChallanCourier}
                  onChange={(e) => setEditableChallanCourier(e.target.value)}
                  className="w-full px-3 py-2 border-b-2 border-black focus:ring-2 focus:ring-gray-500"
                  placeholder="Enter Courier/Transporter Name"
                />
              </div>
            </div>
          </div>

          {/* Editable Items Table */}
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3">Challan Items:</h3>
            <div className="border-2 border-black overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-white border-b-2 border-black">
                  <tr>
                    <th className="border-r border-black px-2 py-2 text-center text-xs font-bold">Sr #</th>
                    <th className="border-r border-black px-2 py-2 text-center text-xs font-bold">P.O #</th>
                    <th className="border-r border-black px-2 py-2 text-center text-xs font-bold">Demand #</th>
                    <th className="border-r border-black px-3 py-2 text-left text-xs font-bold">Description</th>
                    <th className="border-r border-black px-3 py-2 text-center text-xs font-bold">Quantity</th>
                    <th className="border-r border-black px-2 py-2 text-center text-xs font-bold">UOM</th>
                    <th className="px-2 py-2 text-center text-xs font-bold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {editableChallanItems.map((item, index) => (
                    <tr key={item.id} className="border-b border-black hover:bg-gray-50">
                      <td className="border-r border-black px-2 py-2 text-center font-semibold">{index + 1}</td>
                      <td className="border-r border-black px-2 py-2 text-center">
                        <input
                          type="text"
                          value={item.poNumber || ''}
                          onChange={(e) => {
                            const updated = [...editableChallanItems];
                            updated[index].poNumber = e.target.value;
                            setEditableChallanItems(updated);
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-center"
                          placeholder="P.O #"
                        />
                      </td>
                      <td className="border-r border-black px-2 py-2 text-center">
                        <input
                          type="text"
                          value={item.demandNumber || ''}
                          onChange={(e) => {
                            const updated = [...editableChallanItems];
                            updated[index].demandNumber = e.target.value;
                            setEditableChallanItems(updated);
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs text-center"
                          placeholder="Demand #"
                        />
                      </td>
                      <td className="border-r border-black px-3 py-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...editableChallanItems];
                            updated[index].description = e.target.value;
                            setEditableChallanItems(updated);
                          }}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-xs"
                        />
                      </td>
                      <td className="border-r border-black px-3 py-2 text-center">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => {
                            const updated = [...editableChallanItems];
                            updated[index].quantity = parseInt(e.target.value) || 0;
                            setEditableChallanItems(updated);
                          }}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-xs text-center"
                        />
                      </td>
                      <td className="border-r border-black px-2 py-2 text-center">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => {
                            const updated = [...editableChallanItems];
                            updated[index].unit = e.target.value;
                            setEditableChallanItems(updated);
                          }}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-xs text-center"
                        />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <button
                          onClick={() => {
                            const updated = editableChallanItems.filter((_, i) => i !== index);
                            setEditableChallanItems(updated);
                          }}
                          className="text-red-600 hover:text-red-800 text-xs font-semibold"
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                  {/* Total Row */}
                  <tr className="font-bold bg-gray-100">
                    <td colSpan={4} className="border-r border-black px-3 py-2 text-right">Total:</td>
                    <td className="border-r border-black px-3 py-2 text-center">{editableChallanItems.reduce((sum, item) => sum + item.quantity, 0)}</td>
                    <td colSpan={2} className="px-2 py-2"></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 no-print">
            <button
              onClick={() => setShowEditableChallan(false)}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-bold transition"
            >
              ⬅️ Go Back & Edit More
            </button>
            <button
              onClick={finalizeChallan}
              className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-lg font-bold transition"
            >
              ✅ Finalize & Generate Challan
            </button>
          </div>
        </div>
      ) : showChallanPreview ? (
        /* Delivery Challan Preview */
        <div className="bg-white rounded-xl shadow-2xl p-8 max-w-5xl mx-auto border-2 border-black">
          {/* Header */}
          <div className="border-b-2 border-black pb-3 mb-4">
            <div className="text-center mb-2">
              <div className="inline-block border-2 border-black px-6 py-2">
                <h1 className="text-2xl font-bold text-black" style={{ fontFamily: 'Arial Black, sans-serif' }}>
                  {editableChallanCompany}
                </h1>
              </div>
              <p className="text-xs text-gray-800 mt-2 italic">
                Deals in All kinds of industrial sewing machines and parts.
              </p>
              <p className="text-xs text-gray-700 font-semibold">
                P-608, BISMILLAH CENTER, JINNAH COLONY, FAISALABAD
              </p>
            </div>

            <div className="text-center my-3">
              <div className="inline-block border-2 border-black px-8 py-1">
                <h2 className="text-xl font-bold text-black">DELIVERY CHALLAN</h2>
              </div>
            </div>

            {/* Date and Challan Number Row */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-black">Date:</span>
                <span className="border-b border-black flex-1 text-gray-800">{new Date().toLocaleDateString('en-GB')}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-black">Challan #:</span>
                <span className="border-b border-black flex-1 text-gray-800">{editableChallanNo}</span>
              </div>
            </div>

            {/* Party Name Row */}
            <div className="flex items-center gap-2 mb-3">
              <span className="font-bold text-black whitespace-nowrap">Party Name:</span>
              <span className="border-b border-black flex-1 text-gray-800">{editableChallanCustomerName}</span>
            </div>

            {/* Address and Courier Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-black whitespace-nowrap">Address:</span>
                <span className="border-b border-black flex-1 text-gray-800">{editableChallanAddress}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-black whitespace-nowrap">Courier's Name:</span>
                <span className="border-b border-black flex-1 text-gray-800">{editableChallanCourier || 'N/A'}</span>
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <table className="w-full border-2 border-black">
              <thead>
                <tr className="bg-white">
                  <th className="border border-black px-2 py-2 text-center text-sm font-bold">Sr #</th>
                  <th className="border border-black px-2 py-2 text-center text-sm font-bold">P.O #</th>
                  <th className="border border-black px-2 py-2 text-center text-sm font-bold">Demand #</th>
                  <th className="border border-black px-3 py-2 text-left text-sm font-bold">Description</th>
                  <th className="border border-black px-3 py-2 text-center text-sm font-bold">Quantity</th>
                  <th className="border border-black px-2 py-2 text-center text-sm font-bold">UOM</th>
                </tr>
              </thead>
              <tbody>
                {editableChallanItems.map((item, index) => (
                  <tr key={item.id}>
                    <td className="border border-black px-2 py-2 text-center text-sm">{index + 1}</td>
                    <td className="border border-black px-2 py-2 text-center text-sm">{item.poNumber || ''}</td>
                    <td className="border border-black px-2 py-2 text-center text-sm">{item.demandNumber || ''}</td>
                    <td className="border border-black px-3 py-2 text-sm">{item.description}</td>
                    <td className="border border-black px-3 py-2 text-center text-sm font-semibold">{item.quantity}</td>
                    <td className="border border-black px-2 py-2 text-center text-sm">{item.unit}</td>
                  </tr>
                ))}

                {/* Total Row */}
                <tr className="font-bold">
                  <td colSpan={4} className="border border-black px-3 py-2 text-right text-sm">Total:</td>
                  <td className="border border-black px-3 py-2 text-center text-sm">
                    {editableChallanItems.reduce((sum, item) => sum + item.quantity, 0)}
                  </td>
                  <td className="border border-black px-2 py-2"></td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Signatures */}
          <div className="flex justify-between items-end mt-12 mb-6">
            <div>
              <div className="border-b-2 border-black mt-6 mb-1" style={{ width: '180px' }}></div>
              <p className="text-sm font-bold text-black">Prepared By</p>
            </div>
            <div>
              <div className="border-b-2 border-black mt-6 mb-1" style={{ width: '180px' }}></div>
              <p className="text-sm font-bold text-black">Received By</p>
            </div>
            <div>
              <div className="border-b-2 border-black mt-6 mb-1" style={{ width: '180px' }}></div>
              <p className="text-sm font-bold text-black">Authorized Signature</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 mt-8 no-print">
            <button
              onClick={() => window.print()}
              className="flex-1 bg-gray-800 hover:bg-gray-900 text-white py-3 rounded-lg font-semibold transition"
            >
              🖨️ Print Challan
            </button>
            <button
              onClick={() => {
                setShowChallanPreview(false);
                setInvoiceItems([]);
                setCustomerName('');
                setCustomerAddress('');
                setChallanNumber('');
              }}
              className="flex-1 bg-gray-700 hover:bg-gray-800 text-white py-3 rounded-lg font-semibold transition"
            >
              ✅ New Challan
            </button>
            <button
              onClick={() => setShowChallanPreview(false)}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition"
            >
              ⬅️ Go Back
            </button>
          </div>
        </div>
      ) : (
        /* Invoice Preview */
        <>
          <style>{`
          @media print {
            @page {
              size: ${customerType === 'non-party' ? 'A3' : 'A4'};
              margin: 0;
            }
            body * {
              visibility: hidden;
            }
            #printable-sales-invoice, #printable-sales-invoice * {
              visibility: visible;
              box-sizing: border-box;
            }
            #printable-sales-invoice {
              position: fixed;
              left: 0;
              top: 0;
              width: ${customerType === 'non-party' ? '297mm' : '210mm'};
              height: ${customerType === 'non-party' ? '420mm' : '297mm'};
              max-width: none !important; /* Override Tailwind max-w-4xl */
              padding: 10mm 5mm !important;
              margin: 0 !important;
              background: white !important;
              z-index: 9999;
              overflow: hidden;
            }
            .no-print {
              display: none !important;
            }
            /* Ensure table fits */
            table {
              width: 100% !important;
              table-layout: fixed !important;
              font-size: 10px !important;
              border-collapse: collapse !important;
            }
            th, td {
              padding: 4px 2px !important;
              word-wrap: break-word !important; 
              overflow-wrap: break-word !important;
              vertical-align: top !important;
            }
            
            /* Column Widths */
            .col-sno { width: 5%; }
            .col-code { width: 15%; }
            .col-desc { width: 35%; }
            .col-unit { width: 8%; }
            .col-qty { width: 8%; }
            .col-rate { width: 12%; }
            .col-total { width: 17%; }
          }
        `}</style>
          <div id="printable-sales-invoice" className="bg-white rounded-xl shadow-2xl p-8 max-w-4xl mx-auto">

            {/* Header */}
            <div className="border-b-2 border-black pb-3 mb-3">
              <div className="flex items-start justify-between mb-2">
                {/* Logo Box */}
                <div className="border-2 border-black px-2 py-1.5 rounded flex items-center justify-center" style={{ width: '80px', height: '40px' }}>
                  <p className="text-[10px] font-bold text-center">
                    {company === 'Q.S TRADERS' ? 'QST' :
                      company === 'ARFA TRADING COMPANY' ? 'ATC' :
                        company === 'QASIM & SONS' ? 'Q&S' : 'QSM'}
                  </p>
                </div>

                {/* Company Name - Centered */}
                <div className="flex-1 text-center">
                  <h1 className="text-2xl font-bold text-black">
                    {company}
                  </h1>
                </div>

                {/* Empty space for balance */}
                <div style={{ width: '80px' }}></div>
              </div>

              {/* Address and Contact - Full width below */}
              <div className="flex justify-between text-[9px] text-black">
                <span>6-ALLAMA IQBAL ROAD, BOHAR WALA CHOWK LAHORE</span>
                <span>TEL: +92-42-36291732-33-34-35</span>
                <span>{company === 'Q.S TRADERS' ? 'info@qstraders.com' :
                  company === 'ARFA TRADING COMPANY' ? 'info@arfatrading.com' :
                    company === 'QASIM & SONS' ? 'info@qasimsons.com' : 'info@qasimsewing.com'}</span>
              </div>
            </div>

            {/* SALES INVOICE Title */}
            <div className="text-center mb-3">
              <div className="inline-block border-2 border-black px-12 py-1.5">
                <h2 className="text-base font-bold">SALES INVOICE</h2>
              </div>
            </div>

            {/* Customer and Invoice Details Box - Borders Removed */}
            <div className="rounded-lg mb-3">
              <div className="flex justify-between mb-1.5">
                <div>
                  <span className="text-[10px] font-bold">Customer Name:</span>
                  <span className="text-[10px] ml-1">{customerName}</span>
                </div>
                <div className="flex gap-8">
                  <span className="text-[10px] font-bold">DC No:</span>
                  <span className="text-[10px] font-bold">DC Date:</span>
                </div>
              </div>
              <div className="mb-1.5">
                <span className="text-[10px] font-bold">Remarks:</span>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <div>
                    <span className="text-[10px] font-bold">Invoice No:</span>
                    <span className="text-[10px] ml-1">{currentInvoice?.invoiceNo}</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold">Term Of Sale:</span>
                    <span className="text-[10px] ml-1">{termOfSale}</span>
                  </div>
                </div>
                <div className="border border-black px-2 py-0.5">
                  <span className="text-[10px] font-bold">Invoice Date:</span>
                  <span className="text-[10px] ml-1">{currentInvoice?.invoiceDate}</span>
                </div>
              </div>
            </div>

            {/* Items Table */}
            <table className="w-full border border-black mb-3" style={{ borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <thead>
                <tr className="border-b border-black">
                  <th className="col-sno border-r border-black px-1 py-1.5 text-[9px] text-left font-bold">S.No</th>
                  <th className="col-code border-r border-black px-1 py-1.5 text-[9px] text-left font-bold">Article Code</th>
                  <th className="col-desc border-r border-black px-1 py-1.5 text-[9px] text-left font-bold">Description</th>
                  <th className="col-unit border-r border-black px-1 py-1.5 text-[9px] text-center font-bold">Unit</th>
                  <th className="col-qty border-r border-black px-1 py-1.5 text-[9px] text-center font-bold">Qty</th>
                  <th className="col-rate border-r border-black px-1 py-1.5 text-[9px] text-center font-bold">Rate</th>
                  <th className="col-total px-1 py-1.5 text-[9px] text-center font-bold">Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {invoiceItems.map((item, index) => (
                  <tr key={item.id} className="border-b border-black">
                    <td className="border-r border-black px-1 py-1.5 text-[10px] text-center">{index + 1}</td>
                    <td className="border-r border-black px-1 py-1.5 text-[10px] font-bold overflow-hidden">{item.articleCode}</td>
                    <td className="border-r border-black px-1 py-1.5 text-[9px] whitespace-pre-wrap">{item.description}</td>
                    <td className="border-r border-black px-1 py-1.5 text-[10px] text-center">{item.unit}</td>
                    <td className="border-r border-black px-1 py-1.5 text-[10px] text-right">{item.quantity}</td>
                    <td className="border-r border-black px-1 py-1.5 text-[10px] text-right">{item.rate.toFixed(2)}</td>
                    <td className="px-1 py-1.5 text-[10px] text-right font-bold">{item.totalAmount.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals Section */}
            <div className="flex justify-between mb-3">
              <div className="flex-1">
                <p className="font-bold text-[10px] mb-1">Amount in words:</p>
                <p className="text-[9px] capitalize">{convertNumberToWords(netTotal)}</p>
              </div>
              <div className="text-right" style={{ minWidth: '200px' }}>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="font-bold">Total:</span>
                  <span className="ml-8">{totalQuantity}</span>
                  <span className="ml-auto">{total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] mb-1">
                  <span className="font-bold">TCS Charges:</span>
                  <span className="ml-8">0.00</span>
                  <span className="font-bold ml-4">Discount:</span>
                  <span className="ml-auto">{discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px] font-bold mb-1">
                  <span>Net Total Rs:</span>
                  <span className="ml-auto">{netTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="font-bold">Cash Received:</span>
                  <span className="ml-auto">{(currentInvoice?.cashReceived ?? 0).toFixed(2)}</span>
                </div>
                {currentInvoice && currentInvoice.remainingBalance !== undefined && currentInvoice.remainingBalance > 0 && (
                  <>
                    <div className="flex justify-between text-[10px] text-red-600 font-bold">
                      <span>Remaining Balance:</span>
                      <span className="ml-auto">{currentInvoice.remainingBalance.toFixed(2)}</span>
                    </div>
                    {currentInvoice.dueDate && (
                      <div className="flex justify-between text-[10px] text-orange-600">
                        <span>Due Date:</span>
                        <span className="ml-auto">{new Date(currentInvoice.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </>
                )}
                {currentInvoice?.paymentOption === 'later' && (
                  <div className="flex justify-between text-[10px] text-red-600 font-bold mt-1">
                    <span>Payment Status:</span>
                    <span className="ml-auto">PAY LATER</span>
                  </div>
                )}
                {currentInvoice?.paymentOption === 'partial' && (
                  <div className="flex justify-between text-[10px] text-orange-600 font-bold mt-1">
                    <span>Payment Status:</span>
                    <span className="ml-auto">PARTIAL PAYMENT</span>
                  </div>
                )}
              </div>
            </div>

            {/* Signature Section */}
            <div className="flex justify-between items-end mb-3">
              <div className="flex-1">
                <p className="text-[10px]"></p>
                <div className="border-b border-black mt-6 mb-1" style={{ width: '150px' }}></div>
                <p className="text-[10px] font-bold">Prepared By :</p>
              </div>
              <div className="flex-1 ml-8">
                <div className="border-b border-black mt-12 mb-1" style={{ width: '150px' }}></div>
                <p className="text-[10px] font-bold">Verified By :</p>
              </div>
              <div className="text-center">
                <p className="text-lg font-bold italic">ACCEPTED</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center text-[8px] pt-2">
              <p>Goods can be Exchanged within 14 days by presenting original invoice. Thank you for your Business.</p>
              <p>Page 1 of 1</p>
            </div>

            {/* Actions */}
            <div className="flex gap-4 mt-8 no-print">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition"
              >
                🖨️ Print Invoice
              </button>
              <button
                onClick={() => currentInvoice && generateInvoicePDF(currentInvoice, 'sale', company)}
                className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-lg font-semibold transition"
              >
                📄 Download PDF
              </button>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setInvoiceItems([]);
                  setCustomerName('');
                  setDiscount(0);
                  setCurrentInvoice(null);
                }}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition"
              >
                ✅ New Invoice
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
