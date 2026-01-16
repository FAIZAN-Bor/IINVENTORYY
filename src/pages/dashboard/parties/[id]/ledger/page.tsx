import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Party } from '../../../../../types';
import QasimSewingLogo from '../../../../../images/Qasim.jpeg';
import ArfaTradingLogo from '../../../../../images/ArfaTrading.jpg';
import QasimSonsLogo from '../../../../../images/Qasim&sons.jpg';

export default function PartyLedgerPage() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [party, setParty] = useState<Party | null>(null);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [filteredTransactions, setFilteredTransactions] = useState<any[]>([]);
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [currentCompany, setCurrentCompany] = useState('');

    const companyLogos: { [key: string]: string } = {
        'QASIM SEWING MACHINE': QasimSewingLogo,
        'ARFA TRADING': ArfaTradingLogo,
        'Arfa Trading': ArfaTradingLogo,
        'QASIM & SONS': QasimSonsLogo,
        'Qasim & Sons': QasimSonsLogo
    };

    useEffect(() => {
        const savedCompany = localStorage.getItem('selectedCompany') || 'QASIM SEWING MACHINE';
        setCurrentCompany(savedCompany);

        if (id) {
            loadParty();
            loadTransactions(savedCompany);
        }
    }, [id]);

    useEffect(() => {
        filterTransactions();
    }, [transactions, fromDate, toDate]);

    const loadParty = () => {
        const savedParties = localStorage.getItem('parties');
        if (savedParties) {
            const parties: Party[] = JSON.parse(savedParties);
            const foundParty = parties.find(p => p.id === id);
            if (foundParty) {
                setParty(foundParty);
            }
        }
    };

    const loadTransactions = (company: string) => {
        const savedParties = localStorage.getItem('parties');
        if (savedParties) {
            const parties: Party[] = JSON.parse(savedParties);
            const foundParty = parties.find(p => p.id === id);
            if (foundParty && foundParty.transactions) {
                const companyTransactions = foundParty.transactions.filter((t: any) =>
                    t.companyName === company
                );
                const sorted = companyTransactions.sort((a: any, b: any) =>
                    new Date(a.date).getTime() - new Date(b.date).getTime()
                );
                setTransactions(sorted);
            }
        }
    };

    const filterTransactions = () => {
        let filtered = [...transactions];
        if (fromDate) {
            filtered = filtered.filter(t => new Date(t.date) >= new Date(fromDate));
        }
        if (toDate) {
            filtered = filtered.filter(t => new Date(t.date) <= new Date(toDate));
        }
        setFilteredTransactions(filtered);
    };

    const calculateRunningBalance = () => {
        let initialBalance = party?.openingBalance || 0;

        // Calculate effect of previous transactions if fromDate is set
        if (fromDate) {
            const priorTransactions = transactions.filter(t => new Date(t.date) < new Date(fromDate));
            priorTransactions.forEach(txn => {
                if (txn.type === 'sale') {
                    // For sales: add the unpaid amount (debit)
                    const unpaidAmount = (txn.amount || 0) - (txn.paymentReceived || 0);
                    initialBalance += unpaidAmount;
                } else if (txn.type === 'payment') {
                    initialBalance -= (txn.amount || 0); // Payment decreases balance (Credit)
                }
            });
        }

        let runningBalance = initialBalance;
        const entries: { txn: any; balance: number; debit: number; credit: number; description: string }[] = [];

        filteredTransactions.forEach(txn => {
            let debit = 0;
            let credit = 0;
            let description = '';

            if (txn.type === 'sale') {
                // For sales: debit is the unpaid amount
                const unpaidAmount = (txn.amount || 0) - (txn.paymentReceived || 0);
                debit = unpaidAmount;
                runningBalance += debit;
                description = 'Sales Bill';
            } else if (txn.type === 'payment') {
                credit = txn.amount || 0; // Payment is Credit
                runningBalance -= credit;
                description = txn.description || 'Payment Received';
            }

            entries.push({ txn, balance: runningBalance, debit, credit, description });
        });

        return { entries, closingBalance: runningBalance, effectiveOpeningBalance: initialBalance };
    };

    if (!party) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading ledger...</p>
                </div>
            </div>
        );
    }

    const { entries, closingBalance, effectiveOpeningBalance } = calculateRunningBalance();
    const totalDebit = entries.reduce((sum, e) => sum + e.debit, 0);
    const totalCredit = entries.reduce((sum, e) => sum + e.credit, 0);
    const selectedLogo = companyLogos[currentCompany] || companyLogos[Object.keys(companyLogos).find(k => k.toUpperCase() === currentCompany.toUpperCase()) || ''];

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }); // dd/mm/yyyy
    };


    return (
        <>
            {/* Print Styles */}
            <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #ledger-print-area, #ledger-print-area * {
            visibility: visible;
          }
          #ledger-print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 5mm 10mm;
          }
          .no-print {
            display: none !important;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10pt;
            margin-top: 10px;
          }
          th, td, .totals-row td {
            border: 1px solid #000 !important;
            padding: 4px 6px;
          }
          th {
             text-align: center;
             font-weight: bold;
             background: transparent !important;
          }
          .header-label {
              font-weight: bold;
              display: inline-block;
              width: 80px;
          }
           .header-value {
              display: inline-block;
              border-bottom: 1px solid #000;
              min-width: 150px;
              text-align: center;
           }
        }
      `}</style>

            <div className="space-y-4">
                {/* No Print: Action Header */}
                <div className="no-print flex justify-between items-center">
                    <button
                        onClick={() => navigate(`/dashboard/parties/${id}`)}
                        className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition"
                    >
                        ← Back to Party
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                        🖨️ Print Ledger
                    </button>
                </div>

                {/* Printable Area */}
                <div id="ledger-print-area" className="bg-white p-8">

                    {/* 1. Header with Logo (Preserved from previous request) */}
                    {selectedLogo && (
                        <div className="print-header hidden print:flex justify-center mb-1">
                            <img src={selectedLogo} alt={currentCompany} className="w-32 h-auto" />
                        </div>
                    )}
                    <div className="hidden print:block text-center mb-1">
                        <h2 className="text-2xl font-bold uppercase mb-1">{currentCompany}</h2>
                        {currentCompany === 'QASIM SEWING MACHINE' ? (
                            <>
                                <div className="text-sm">Sales Tax Reg # <strong>08-00-8452-002-46</strong></div>
                                <div className="text-sm">NTN# <strong>2725463-1</strong></div>
                            </>
                        ) : null}
                    </div>


                    {/* 2. Ledger Report Sub-Header (Based on User Image) */}
                    <div className="text-center font-serif mb-6 print:mb-2">
                        <h1 className="text-2xl font-bold italic underline mb-2">Ledger Report</h1>

                        {/* Info Grid similar to image */}
                        <div className="flex flex-col items-center gap-1 mb-2 text-sm font-serif">
                            <div className="flex gap-8">
                                <div>
                                    <span className="font-bold">A/c No.</span>
                                    <span className="border-b border-black inline-block w-20 text-center ml-2">{party.partyNumber || '-'}</span>
                                </div>
                                <div>
                                    <span className="font-bold">Name</span>
                                    <span className="border-b border-black inline-block min-w-[200px] text-center ml-2">{party.name}</span>
                                </div>
                            </div>
                            <div className="flex gap-8">
                                <div>
                                    <span className="font-bold">From Date</span>
                                    <span className="border-b border-black inline-block w-24 text-center ml-2">{formatDate(fromDate)}</span>
                                </div>
                                <div className="font-bold">To Date</div>
                                <div>
                                    <span className="border-b border-black inline-block w-24 text-center">{formatDate(toDate)}</span>
                                </div>
                            </div>

                            <div className="w-full flex justify-end mt-2">
                                <div className="font-bold">
                                    <div className="font-bold">
                                        Opening Balance: <span className="ml-4">{effectiveOpeningBalance.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Screen Only Header (Simplified for screen) */}
                    <div className="no-print bg-blue-50 border border-blue-200 p-4 rounded mb-4">
                        <h2 className="text-lg font-bold">{party.name}</h2>
                        <div className="flex gap-4 mt-2">
                            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="border p-1 text-sm rounded" />
                            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="border p-1 text-sm rounded" />
                        </div>
                    </div>


                    {/* Ledger Table */}
                    <table className="w-full border-collapse border border-black text-sm font-serif">
                        <thead>
                            <tr className="bg-gray-100 print:bg-transparent">
                                <th className="border border-black px-2 py-1 text-center w-24">Date</th>
                                <th className="border border-black px-2 py-1 text-center w-24">Voucher</th>
                                <th className="border border-black px-2 py-1 text-left">Description</th>
                                <th className="border border-black px-2 py-1 text-right w-24">Debit</th>
                                <th className="border border-black px-2 py-1 text-right w-24">Credit</th>
                                <th className="border border-black px-2 py-1 text-right w-28">Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            {entries.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-4">No transactions found</td></tr>
                            ) : (
                                entries.map((entry) => (
                                    <tr key={entry.txn.id}>
                                        <td className="border border-black px-2 py-1 text-center">
                                            {new Date(entry.txn.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                        </td>
                                        <td className="border border-black px-2 py-1 text-center font-mono text-xs">
                                            {entry.txn.invoiceNo || (entry.txn.description && entry.txn.description.match(/Invoice\s+([\w-]+)/)?.[1]) || '-'}
                                        </td>
                                        <td className="border border-black px-2 py-1">
                                            {entry.description}
                                        </td>
                                        <td className="border border-black px-2 py-1 text-right">
                                            {entry.debit > 0 ? entry.debit.toLocaleString() : '0'}
                                        </td>
                                        <td className="border border-black px-2 py-1 text-right">
                                            {entry.credit > 0 ? entry.credit.toLocaleString() : '0'}
                                        </td>
                                        <td className="border border-black px-2 py-1 text-right font-semibold">
                                            {entry.balance.toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}

                            {/* Total Row */}
                            <tr className="font-bold">
                                <td colSpan={3} className="border border-black px-2 py-1 text-right">Total:</td>
                                <td className="border border-black px-2 py-1 text-right">{totalDebit.toLocaleString()}</td>
                                <td className="border border-black px-2 py-1 text-right">{totalCredit.toLocaleString()}</td>
                                <td className="border border-black px-2 py-1 text-right bg-gray-100 print:bg-transparent">
                                    {/* This cell is usually empty in standard ledgers for run balance, but image has logic. Image shows separate total. Table foot is footer. */}
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    {/* Footer: Closing Balance */}
                    <div className="flex justify-end mt-2 font-serif font-bold text-lg">
                        <div>
                            Closing Balance: <span className="underline ml-2">{closingBalance.toLocaleString()}</span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
