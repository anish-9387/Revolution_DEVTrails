import React, { useState } from 'react';
import { 
  FileText, MagnifyingGlass, CalendarBlank, CaretLeft, CaretRight, 
  CheckCircle, Warning, XCircle, ListNumbers 
} from '@phosphor-icons/react';

export const Claims = () => {
  const [selectedClaim, setSelectedClaim] = useState(null);

  const claimsData = [
    { id: 'CLM-102', trigger: 'AQI', zone: 'Zone 3', status: 'Approved', amount: '₹850', date: 'Apr 02', hash: 'TX_1A2B3C' },
    { id: 'CLM-103', trigger: 'Rain', zone: 'Zone 5', status: 'Pending', amount: '₹920', date: 'Apr 01', hash: 'PENDING' },
    { id: 'CLM-098', trigger: 'Heat', zone: 'Zone 3', status: 'Rejected', amount: '₹0', date: 'Mar 29', hash: 'N/A' },
    { id: 'CLM-104', trigger: 'Rain', zone: 'Zone 7', status: 'Pending', amount: '₹1,200', date: 'Mar 28', hash: 'PENDING' },
    { id: 'CLM-105', trigger: 'AQI', zone: 'Zone 5', status: 'Approved', amount: '₹1,400', date: 'Mar 25', hash: 'TX_9X8Y7Z' },
  ];

  const getStatusPill = (status) => {
    switch (status) {
      case 'Approved': return <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold border border-green-200">Approved</span>;
      case 'Pending': return <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold border border-orange-200">Pending</span>;
      case 'Rejected': return <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold border border-red-200">Rejected</span>;
      default: return null;
    }
  };

  const getTriggerIcon = (trigger) => {
    switch (trigger) {
      case 'AQI': return <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500"></span>{trigger}</div>;
      case 'Rain': return <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-blue-500"></span>{trigger}</div>;
      case 'Heat': return <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span>{trigger}</div>;
      default: return trigger;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Claims History</h1>
      </div>

      {/* TOP SECTION - SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="absolute top-0 right-0 p-4 opacity-5"><ListNumbers size={64} /></div>
          <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider relative z-10">Total Claims</span>
          <span className="text-4xl font-extrabold text-purple-600 relative z-10">12</span>
        </div>
        
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-green-600"><CheckCircle size={64} weight="fill" /></div>
          <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider relative z-10">Approved</span>
          <span className="text-4xl font-extrabold text-green-600 relative z-10">8</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-orange-500"><Warning size={64} weight="fill" /></div>
          <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider relative z-10">Pending</span>
          <span className="text-4xl font-extrabold text-orange-500 relative z-10">3</span>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-2 relative overflow-hidden transition-all hover:-translate-y-1 hover:shadow-md">
          <div className="absolute top-0 right-0 p-4 opacity-5 text-red-600"><XCircle size={64} weight="fill" /></div>
          <span className="text-gray-500 text-sm font-semibold uppercase tracking-wider relative z-10">Rejected</span>
          <span className="text-4xl font-extrabold text-red-600 relative z-10">1</span>
        </div>
      </div>

      {/* FILTERS SECTION */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-3 flex-1">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search claims..." 
              className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium text-gray-700" 
            />
          </div>
          
          <select className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-white transition-all">
            <option>All Triggers</option>
            <option>AQI</option>
            <option>Rain</option>
            <option>Heat</option>
          </select>

          <select className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-white transition-all">
            <option>All Statuses</option>
            <option>Approved</option>
            <option>Pending</option>
            <option>Rejected</option>
          </select>

          <select className="bg-gray-50 border border-gray-200 text-gray-700 py-2 px-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer hover:bg-white transition-all">
            <option>All Zones</option>
            <option>Zone 3</option>
            <option>Zone 5</option>
            <option>Zone 7</option>
          </select>
        </div>

        <button className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-4 py-2 rounded-lg text-sm font-bold text-gray-700 hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all shadow-sm">
          <CalendarBlank size={18} /> Date Range
        </button>
      </div>

      {/* TABLE SECTION */}
      <div className="flex gap-6 relative items-start">
        <div className={`transition-all duration-300 ${selectedClaim ? 'w-full lg:w-2/3' : 'w-full'}`}>
          <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-100">
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-gray-500">Claim ID</th>
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-gray-500">Trigger</th>
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-gray-500 hidden sm:table-cell">Zone</th>
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-gray-500 hidden md:table-cell">Date</th>
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-gray-500 text-right">Amount</th>
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-gray-500">Status</th>
                    <th className="p-4 font-semibold text-xs uppercase tracking-wider text-gray-500 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {claimsData.map((claim, idx) => (
                    <tr 
                      key={idx} 
                      className={`hover:bg-slate-50 transition-colors group cursor-pointer ${selectedClaim?.id === claim.id ? 'bg-blue-50/50' : 'bg-white'}`}
                      onClick={() => setSelectedClaim(claim)}
                    >
                      <td className="p-4 font-bold text-blue-600">{claim.id}</td>
                      <td className="p-4 text-sm font-bold text-gray-800">{getTriggerIcon(claim.trigger)}</td>
                      <td className="p-4 text-sm font-medium text-gray-600 hidden sm:table-cell">{claim.zone}</td>
                      <td className="p-4 text-sm font-medium text-gray-500 hidden md:table-cell">{claim.date}</td>
                      <td className="p-4 font-bold text-gray-800 text-right">{claim.amount}</td>
                      <td className="p-4">{getStatusPill(claim.status)}</td>
                      <td className="p-4 text-center">
                        <button 
                          className="px-4 py-1.5 bg-white border border-gray-200 text-gray-600 font-bold text-xs rounded-lg transition-all group-hover:bg-blue-600 group-hover:border-blue-600 group-hover:text-white shadow-sm"
                          onClick={(e) => { e.stopPropagation(); setSelectedClaim(claim); }}
                          title="View Details"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* PAGINATION */}
            <div className="border-t border-gray-100 p-4 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-4">
              <span className="text-sm text-gray-500 font-medium">Showing <strong className="text-gray-900">1</strong> to <strong className="text-gray-900">5</strong> of <strong className="text-gray-900">12</strong> claims</span>
              <div className="flex gap-2">
                <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50">
                  <CaretLeft /> Prev
                </button>
                <div className="hidden sm:flex items-center gap-1">
                  <button className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white font-bold rounded-lg shadow-sm">1</button>
                  <button className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition-colors">2</button>
                  <button className="w-8 h-8 flex items-center justify-center bg-white border border-gray-200 text-gray-600 font-bold rounded-lg hover:bg-gray-50 transition-colors">3</button>
                </div>
                <button className="flex items-center gap-1 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
                  Next <CaretRight />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Claim Detail Drawer - Made better with Tailwind */}
        {selectedClaim && (
          <div className="w-1/3 hidden lg:block relative transition-all duration-300">
            <div className="bg-white shadow-xl border border-gray-100 rounded-2xl sticky top-24 overflow-hidden mt-0">
              <div className="bg-gradient-to-r from-slate-50 to-white p-5 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-800 flex items-center gap-2">
                  <FileText className="text-blue-600" size={20} weight="fill" /> Claim Tracker
                </h3>
                <button 
                  onClick={() => setSelectedClaim(null)} 
                  className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors shadow-sm"
                >
                  ✕
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-1">Claim ID</span>
                  <span className="text-2xl font-black text-gray-900">{selectedClaim.id}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-2">Status</span>
                    {getStatusPill(selectedClaim.status)}
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold tracking-widest block mb-2">Date Logged</span>
                    <span className="font-bold text-gray-800 text-sm">{selectedClaim.date} (10:42 AM)</span>
                  </div>
                </div>

                <div className="bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                  <span className="text-[10px] text-orange-600 uppercase font-bold tracking-widest block mb-2 flex items-center gap-1">
                    <Warning size={12} weight="fill" /> Oracle Trigger Data
                  </span>
                  <p className="text-sm text-gray-800 mb-1 font-medium">Condition: <strong className="text-orange-700">{selectedClaim.trigger} Alert Threshold</strong></p>
                  <p className="text-sm text-gray-800 font-medium">Zone Grid: <strong className="text-orange-700">{selectedClaim.zone}</strong></p>
                </div>

                <div className="pt-2">
                  <span className="text-[11px] text-gray-400 uppercase font-bold tracking-widest block mb-2">Blockchain Verification Hash</span>
                  <p className="text-[11px] font-mono bg-slate-50 p-3 rounded-lg text-slate-600 break-all border border-slate-200 shadow-inner">
                    {selectedClaim.hash}
                  </p>
                </div>

                {selectedClaim.status !== 'Rejected' && (
                  <button className="w-full mt-4 bg-gray-900 text-white font-bold py-3 rounded-xl hover:bg-gray-800 transition-colors shadow-md">
                    Download Report
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
