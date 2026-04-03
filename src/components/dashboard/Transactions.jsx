import React from 'react';
import { Bank, DownloadSimple, ArrowUpRight, ArrowDownLeft } from '@phosphor-icons/react';

export const Transactions = () => {
  const transactions = [
    { date: 'Apr 4', type: 'Premium', amount: '₹42', status: 'Paid', isOutgoing: true },
    { date: 'Apr 3', type: 'Payout', amount: '₹850', status: 'Success', isOutgoing: false },
    { date: 'Apr 2', type: 'Savings', amount: '₹50', status: 'Saved', isOutgoing: true },
    { date: 'Mar 28', type: 'Premium', amount: '₹42', status: 'Paid', isOutgoing: true },
    { date: 'Mar 21', type: 'Savings', amount: '₹50', status: 'Saved', isOutgoing: true },
    { date: 'Mar 18', type: 'Payout', amount: '₹300', status: 'Success', isOutgoing: false },
  ];

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Paid': return 'bg-blue-50 text-blue-600 border border-blue-100';
      case 'Success': return 'bg-green-50 text-green-600 border border-green-100';
      case 'Saved': return 'bg-orange-50 text-orange-600 border border-orange-100';
      default: return 'bg-gray-50 text-gray-600 border border-gray-100';
    }
  };

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="dashboard-page-title m-0">Transactions</h1>
        
        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-lg text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50">
            Export <DownloadSimple size={16} />
          </button>
        </div>
      </div>

      <div className="bento-card bg-white shadow-sm border border-gray-100 p-0 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs uppercase text-gray-500">
              <th className="p-4 font-bold">Transaction Type</th>
              <th className="p-4 font-bold">Date</th>
              <th className="p-4 font-bold">Status</th>
              <th className="p-4 font-bold text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="p-4">
                   <div className="flex items-center gap-3">
                     <span className={`p-2 rounded-xl ${tx.isOutgoing ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'}`}>
                       {tx.isOutgoing ? <ArrowUpRight size={18} weight="bold"/> : <ArrowDownLeft size={18} weight="bold"/>}
                     </span>
                     <span className="font-bold text-gray-800">{tx.type}</span>
                   </div>
                </td>
                <td className="p-4 text-sm text-gray-500 font-medium">{tx.date}</td>
                <td className="p-4">
                  <span className={`px-3 py-1 rounded text-xs font-bold ${getStatusStyle(tx.status)}`}>
                    {tx.status}
                  </span>
                </td>
                <td className={`p-4 text-right font-bold ${tx.isOutgoing ? 'text-gray-800' : 'text-green-600'}`}>
                  {tx.isOutgoing ? '-' : '+'}{tx.amount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
};
