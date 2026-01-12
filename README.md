# Inventory Management System - React Frontend

This is a React + TypeScript + Vite version of the Inventory Management System, converted from the Next.js project.

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
npm run preview
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── pages/
│   │   ├── Home.tsx                 # Landing page
│   │   ├── Login.tsx                # Login page
│   │   └── dashboard/
│   │       ├── Layout.tsx           # Dashboard layout with sidebar & nav
│   │       ├── Dashboard.tsx        # Main dashboard page
│   │       ├── Inventory.tsx        # Inventory management
│   │       ├── Pricing.tsx          # Pricing management
│   │       ├── LowStock.tsx         # Low stock alerts
│   │       ├── Categories.tsx       # Categories management
│   │       ├── Quotations.tsx       # Quotations list
│   │       ├── QuotationNew.tsx     # Create new quotation
│   │       ├── QuotationView.tsx    # View quotation details
│   │       ├── Sales.tsx            # Sales invoice
│   │       ├── Purchases.tsx        # Purchase invoice
│   │       ├── Reports.tsx          # Reports & analytics
│   │       └── Transactions.tsx     # Transaction history
│   ├── types/
│   │   └── index.ts                 # TypeScript type definitions
│   ├── data/
│   │   └── mockData.ts              # Mock data for development
│   ├── utils/
│   │   ├── pdfGenerator.ts          # PDF generation utilities
│   │   └── companyHelper.ts         # Company-related helper functions
│   ├── App.tsx                      # Main app component with routes
│   ├── main.tsx                     # App entry point
│   └── index.css                    # Global styles
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## 🔧 Key Features Implemented

### ✅ Completed
- Project structure and configuration (Vite, React Router, TypeScript, Tailwind CSS)
- Type definitions and mock data
- Home/Landing page with full UI
- Login page with authentication
- Dashboard layout with sidebar navigation and company selector
- Main dashboard page with statistics and charts
- Utility functions (PDF generator, company helper)
- All dashboard route placeholders

### 📝 To Be Completed

The following pages need full implementation (logic available in Next.js version):

1. **Inventory Management** (`src/pages/dashboard/Inventory.tsx`)
   - Add/Edit/Delete items
   - Search and filter
   - Image upload
   - Stock management
   - Reference: `app/dashboard/inventory/page.tsx`

2. **Pricing Management** (`src/pages/dashboard/Pricing.tsx`)
   - Set pack rates, retail prices, trade prices
   - Manage minimum sale prices
   - Reference: `app/dashboard/pricing/page.tsx`

3. **Low Stock Alerts** (`src/pages/dashboard/LowStock.tsx`)
   - Display items below minimum stock
   - Reorder suggestions
   - PDF export
   - Reference: `app/dashboard/low-stock/page.tsx`

4. **Categories** (`src/pages/dashboard/Categories.tsx`)
   - CRUD operations for categories
   - Reference: `app/dashboard/categories/page.tsx`

5. **Quotations** (`src/pages/dashboard/Quotations.tsx`, `QuotationNew.tsx`, `QuotationView.tsx`)
   - Create quotation requests
   - Compare supplier quotes
   - Award orders
   - Reference: `app/dashboard/quotations/` folder

6. **Sales Invoice** (`src/pages/dashboard/Sales.tsx`)
   - Create sales invoices
   - Add items with pricing
   - Generate PDF invoices
   - Reference: `app/dashboard/sales/page.tsx` (1563 lines - comprehensive)

7. **Purchase Invoice** (`src/pages/dashboard/Purchases.tsx`)
   - Create purchase invoices
   - Supplier management
   - Reference: `app/dashboard/purchases/page.tsx`

8. **Reports** (`src/pages/dashboard/Reports.tsx`)
   - Various reports (sales, purchases, inventory)
   - PDF export
   - Reference: `app/dashboard/reports/page.tsx`

9. **Transactions** (`src/pages/dashboard/Transactions.tsx`)
   - Transaction history
   - Filters and search
   - Reference: `app/dashboard/transactions/page.tsx`

## 🔄 Migration Guide

To migrate functionality from Next.js to React:

### 1. Component Conversion
**Next.js:**
```tsx
'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
```

**React:**
```tsx
import { Link, useNavigate } from 'react-router-dom';
// Replace useRouter() with useNavigate()
// Replace router.push() with navigate()
```

### 2. Navigation
- Change `<Link href="/path">` to `<Link to="/path">`
- Replace `router.push('/path')` with `navigate('/path')`
- Replace `usePathname()` with `useLocation()`

### 3. State Management
- Both use React hooks (useState, useEffect, etc.)
- LocalStorage works the same way
- No changes needed for state management logic

### 4. Image Handling
- Next.js `<Image>` → React `<img>` tag
- Remove Next.js-specific image optimization props

### 5. Styling
- Tailwind CSS works identically
- All class names remain the same

## 📋 Implementation Checklist

For each page to be implemented:

1. Open the corresponding Next.js page file
2. Copy the component logic
3. Replace Next.js imports with React Router imports
4. Update navigation (Link, useNavigate)
5. Test functionality
6. Verify responsiveness
7. Test all CRUD operations

## 🎨 Styling

The project uses:
- **Tailwind CSS** for utility-first styling
- **Custom animations** defined in `index.css`
- **Gradient backgrounds** and modern UI elements
- **Responsive design** for mobile, tablet, and desktop

## 🔐 Authentication

Currently using simple localStorage-based authentication:
- Login with any email/password
- User data stored in localStorage
- Protected routes check for `isAuthenticated` flag

For production, implement:
- JWT tokens
- Secure API authentication
- Password hashing
- Session management

## 📦 Dependencies

### Core
- `react` - UI library
- `react-dom` - DOM rendering
- `react-router-dom` - Routing
- `typescript` - Type safety

### UI & Styling
- `tailwindcss` - Utility-first CSS
- `postcss` - CSS processing
- `autoprefixer` - CSS vendor prefixes

### Utilities
- `jspdf` - PDF generation
- `jspdf-autotable` - Tables in PDF
- `lucide-react` - Icons
- `recharts` - Charts (if needed)

### Build Tools
- `vite` - Fast build tool
- `@vitejs/plugin-react` - React plugin for Vite

## 🚀 Deployment

### Build
```bash
npm run build
```

### Preview Build
```bash
npm run preview
```

### Deploy Options
- **Vercel**: Connect GitHub repo
- **Netlify**: Drag and drop `dist` folder
- **GitHub Pages**: Use gh-pages package
- **AWS S3 + CloudFront**: Static hosting

## 🐛 Known Issues & TODOs

1. ⚠️ Most dashboard pages are placeholders - need full implementation
2. ⚠️ Authentication is basic - needs proper security
3. ⚠️ No API integration - currently using mock data
4. ⚠️ PDF generation needs testing
5. ⚠️ Form validation needs enhancement

## 📖 Next Steps

1. **Complete Core Pages**: Implement Inventory, Sales, and Purchases first
2. **API Integration**: Connect to backend API
3. **Authentication**: Implement JWT-based auth
4. **Testing**: Add unit and integration tests
5. **Error Handling**: Implement proper error boundaries
6. **Loading States**: Add loading skeletons
7. **Optimization**: Code splitting, lazy loading

## 💡 Tips

- All complex logic is already written in the Next.js version
- Focus on adapting navigation and imports
- Test each page after migration
- Keep the UI consistent with the Next.js version
- Use the mock data for development

## 📞 Support

For issues or questions about the original Next.js implementation, refer to:
- Original project structure
- Component files in the Next.js version
- Type definitions in `types/index.ts`
- Mock data in `data/mockData.ts`

---

**Note**: This is a foundation project. Full implementation of all dashboard pages requires copying and adapting logic from the Next.js version files located in the parent directory's `app/dashboard` folder.
