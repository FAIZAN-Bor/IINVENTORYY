import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Lazy load components for better error isolation
const Home = lazy(() => import('./pages/Home'));
const Login = lazy(() => import('./pages/Login'));
const DashboardLayout = lazy(() => import('./pages/dashboard/layout'));
const Dashboard = lazy(() => import('./pages/dashboard/page'));
const Inventory = lazy(() => import('./pages/dashboard/inventory/page'));
const Pricing = lazy(() => import('./pages/dashboard/pricing/page'));
const LowStock = lazy(() => import('./pages/dashboard/low-stock/page'));
const Categories = lazy(() => import('./pages/dashboard/categories/page'));
const Quotations = lazy(() => import('./pages/dashboard/quotations/page'));
const QuotationNew = lazy(() => import('./pages/dashboard/quotations/new/page'));
const QuotationView = lazy(() => import('./pages/dashboard/quotations/[id]/page'));
const Sales = lazy(() => import('./pages/dashboard/sales/page'));
const SalesHistory = lazy(() => import('./pages/dashboard/sales-history/page'));
const Purchases = lazy(() => import('./pages/dashboard/purchases/page'));
const PurchaseHistory = lazy(() => import('./pages/dashboard/purchase-history/page'));
const SalesTaxInvoice = lazy(() => import('./pages/dashboard/sales-tax-invoice/page'));
const SalesTaxInvoiceHistory = lazy(() => import('./pages/dashboard/sales-tax-invoice-history/page'));

const Parties = lazy(() => import('./pages/dashboard/parties/page'));
const PartyNew = lazy(() => import('./pages/dashboard/parties/new/page'));
const PartyDetails = lazy(() => import('./pages/dashboard/parties/[id]/page'));
const Suppliers = lazy(() => import('./pages/dashboard/suppliers/page'));
const SupplierNew = lazy(() => import('./pages/dashboard/suppliers/new/page'));
const SupplierDetails = lazy(() => import('./pages/dashboard/suppliers/[id]/page'));

const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '18px',
    color: '#666'
  }}>
    Loading...
  </div>
);

function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="pricing" element={<Pricing />} />
          <Route path="low-stock" element={<LowStock />} />
          <Route path="categories" element={<Categories />} />
          <Route path="quotations" element={<Quotations />} />
          <Route path="quotations/new" element={<QuotationNew />} />
          <Route path="quotations/:id" element={<QuotationView />} />
          <Route path="parties" element={<Parties />} />
          <Route path="parties/new" element={<PartyNew />} />
          <Route path="parties/:id" element={<PartyDetails />} />
          <Route path="suppliers" element={<Suppliers />} />
          <Route path="suppliers/new" element={<SupplierNew />} />
          <Route path="suppliers/:id" element={<SupplierDetails />} />
          <Route path="sales" element={<Sales />} />
          <Route path="sales-history" element={<SalesHistory />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="purchase-history" element={<PurchaseHistory />} />
          <Route path="sales-tax-invoice" element={<SalesTaxInvoice />} />
          <Route path="sales-tax-invoice/:id" element={<SalesTaxInvoice />} />
          <Route path="sales-tax-invoice-history" element={<SalesTaxInvoiceHistory />} />

        </Route>
      </Routes>
    </Suspense>
  );
}

export default App;
