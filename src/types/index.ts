export interface InventoryItem {
  id: string;
  articleCode: string;
  name: string;
  description: string;
  category: string;
  unit: string;
  location?: string;
  picture?: string;
  image?: string; // Added for image upload
  rate: number;
  salePrice?: number;
  currentStock: number;
  minStock: number;
  minSalePrice?: number;
  lastRestocked: string;
  supplier?: string;
}

export interface ItemPricing {
  id: string;
  itemId: string;
  articleCode: string;
  itemName: string;
  packRate?: number;
  retailPrice?: number;
  tradePrice?: number;
  minSalePrice?: number;
  lastUpdated: string;
}

export interface InvoiceItem {
  id: string;
  articleCode: string;
  description: string;
  unit: string;
  quantity: number;
  rate: number;
  totalAmount: number;
  pdp?: number;
  discountType?: 'Percentage' | 'Flat';
  discountFactor?: number;
  discountValue?: number;
  packRate?: number;
  retailPrice?: number;
  tradePrice?: number;
  taxCategory?: string;
  taxPercentage?: number;
  poNumber?: string;
  demandNumber?: string;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  type: 'sale' | 'purchase';
  customerType?: 'party' | 'non-party';
  customerName: string;
  companyName?: string;
  dcNo?: string;
  dcDate?: string;
  termOfSale: string;
  invoiceDate: string;
  items: InvoiceItem[];
  total: number;
  tcsCharges: number;
  discount: number;
  netTotal: number;
  cashReceived: number;
  remainingBalance?: number;
  paymentOption?: 'cash' | 'partial' | 'later';
  dueDays?: number;
  dueDate?: string;
  remarks?: string;
  preparedBy: string;
  verifiedBy?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  itemCount: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'staff';
}

export interface DashboardStats {
  totalItems: number;
  lowStockItems: number;
  totalSales: number;
  totalPurchases: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface Party {
  id: string;
  partyNumber: number;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  cnic?: string;
  ntn?: string;
  strn?: string;
  creditLimit: number;
  openingBalance: number;
  currentBalance: number;
  totalPurchases: number;
  totalPayments: number;
  status: 'active' | 'inactive';
  createdDate: string;
  lastTransactionDate?: string;
  notes?: string;
  transactions?: PartyTransaction[];
}

export interface PartyTransaction {
  id: string;
  partyId?: string;
  partyName?: string;
  companyName?: string; // Added for company filtering
  type: 'sale' | 'payment' | 'return' | 'purchase';
  invoiceNo?: string;
  amount: number;
  paidAmount?: number; // Added
  remainingAmount?: number; // Added
  paymentStatus?: string; // Added
  previousBalance?: number;
  newBalance?: number;
  balance?: number; // Added to match usage
  paymentReceived?: number; // Added for sales
  dueDays?: number; // Added for sales
  dueDate?: string; // Added for sales
  date: string;
  description: string;
  paymentMethod?: 'cash' | 'bank' | 'cheque';
  chequeNo?: string;
  bankName?: string;
  items?: any[]; // Added for purchase items
}

export interface Transaction {
  id: string;
  type: 'sale' | 'purchase';
  invoiceNo: string;
  customerName: string;
  amount: number;
  date: string;
  items: number;
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  rating?: number;
  totalOrders?: number;
}

export interface QuotationItem {
  id: string;
  articleCode: string;
  itemName: string;
  description: string;
  unit: string;
  quantity: number;
}

export interface SupplierQuote {
  supplierId: string;
  supplierName: string;
  itemQuotes: {
    itemId: string;
    rate: number;
    deliveryDays: number;
    available: boolean;
  }[];
  totalAmount: number;
  taxPercentage: number;
  discount: number;
  finalAmount: number;
  remarks?: string;
  submittedDate?: string;
}

export interface Quotation {
  id: string;
  quotationNo: string;
  title: string;
  description: string;
  requestDate: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'received' | 'comparison' | 'awarded' | 'closed';
  items: QuotationItem[];
  suppliers: string[];
  quotes: SupplierQuote[];
  selectedSupplierId?: string;
  createdBy: string;
}

// Sales Tax Invoice types (Qasim Sewing Machine only)
export interface SalesTaxInvoiceItem {
  id: string;
  itemName: string;
  hsCode: string;
  poNumber: string;
  demandNumber: string;
  weightKgs: number;
  quantity: number;
  unit: string;
  rate: number;
  amtExclTax: number;
  stPercent: number;
  salesTax: number;
  valIncTax: number;
}

export interface SalesTaxInvoice {
  id: string;
  voucherNo: string;
  partyCode: string;
  partyName: string;
  partyAddress?: string;
  partyNTN?: string;
  partyGST?: string;
  date: string;
  items: SalesTaxInvoiceItem[];
  totalQuantity: number;
  totalWeight: number;
  totalAmtExclTax: number;
  totalSalesTax: number;
  grandTotal: number;
  createdBy: string;
  companyName: string;
}
