import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

interface QuotationItem {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  rate: number | string;
  brand?: string;
  remarks?: string;
  action?: string;
}

interface Quotation {
  id: string;
  quotationNo: string;
  partyName: string;
  date: string;
  items: QuotationItem[];
  companyName: string;
  status: string;
}

export default function ViewQuotationPage() {
  const params = useParams();
  const navigate = useNavigate();
  const [quotation, setQuotation] = useState<Quotation | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem('quotations');
    if (saved) {
      const quotations = JSON.parse(saved);
      const found = quotations.find((q: Quotation) => q.id === params.id);
      if (found) {
        setQuotation(found);
      }
    }
  }, [params.id]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!quotation) return;
    const { generateQuotationPDF } = await import('../../../../utils/pdfGenerator');
    generateQuotationPDF(quotation);
  };

  if (!quotation) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="text-gray-400 text-5xl mb-4">📄</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Quotation not found</h3>
          <button
            onClick={() => navigate(-1)}
            className="text-blue-600 hover:text-blue-800"
          >
            ← Go back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <style>{`
          @media print {
            @page {
              size: A4;
              margin: 0;
            }
            /* Hide everything globally */
            body * {
              visibility: hidden;
              box-sizing: border-box;
            }

            /* Make the printable container and its children visible - STRICT A4 SIZING */
            #printable-quotation, #printable-quotation * {
              visibility: visible;
              box-sizing: border-box;
            }

            /* Positioning to cover the page */
            #printable-quotation {
              position: fixed;
              left: 0;
              top: 0;
              width: 210mm; /* A4 Width */
              height: 297mm; /* A4 Height */
              margin: 0 !important;
              padding: 15mm !important; /* Safe margin inside the page */
              background: white !important;
              z-index: 9999;
              overflow: hidden; /* Prevent spillover */
            }
            
            /* Hide headers/footers if possible */
            body {
              margin: 0;
              padding: 0;
            }
            /* Table styling for print */
            table {
              width: 100% !important;
              border-collapse: collapse !important;
              table-layout: fixed !important;
              font-size: 10pt !important;
            }
            th, td {
              border: 1px solid black !important;
              padding: 3px 4px !important;
              vertical-align: top !important;
              word-wrap: break-word !important;
              overflow-wrap: break-word !important;
            }
            th {
              background-color: #f0f0f0 !important;
              -webkit-print-color-adjust: exact;
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

      {/* Action Buttons */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <button
          onClick={() => navigate(-1)}
          className="bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-300 px-6 py-3 rounded-lg font-semibold transition-all"
        >
          ← Back
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleDownloadPDF}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all"
          >
            Download PDF
          </button>
          <button
            onClick={handlePrint}
            className="bg-white hover:bg-blue-50 text-blue-600 border-2 border-blue-300 px-6 py-3 rounded-lg font-semibold transition-all"
          >
            Print
          </button>
        </div>
      </div>

      {/* Quotation Content */}
      <div
        id="printable-quotation"
        className="bg-white p-8 shadow-lg mx-auto print:shadow-none print:w-full"
        style={{ width: '210mm', minHeight: '297mm' }}
      >
        {/* Company Name Header */}
        <div className="text-center mb-6">
          <h1 className="text-4xl font-extrabold text-black tracking-tight uppercase">{quotation.companyName}</h1>
          <div className="mt-2 h-0.5 w-full bg-black"></div>
        </div>

        {/* Party and Date Row */}
        <div className="flex justify-between items-end mb-6">
          <div className="text-base font-bold text-black">
            <span className="block text-gray-600 text-sm font-normal mb-1">Customer / Party:</span>
            <span className="text-lg">{quotation.partyName}</span>
          </div>
          <div className="text-right">
            <span className="block text-gray-600 text-sm font-normal mb-1">Date:</span>
            <span className="font-bold">{new Date(quotation.date).toLocaleDateString('en-GB')}</span>
          </div>
        </div>

        {/* QUOTATION Title */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-black border-b-2 border-black inline-block px-4 pb-1">QUOTATION</h2>
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
            {quotation.items.map((item, index) => (
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
    </div>
  );
}
