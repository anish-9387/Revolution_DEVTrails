import React from 'react';
import { Wallet, ChartLineUp, Repeat, ArrowDownLeft, ArrowUpRight } from '@phosphor-icons/react';

export const Piggybank = () => {
  return (
    <>
      <h1 className="dashboard-page-title">Piggybank</h1>

      <div className="bento-grig-3">
        {/* Balance Card */}
        <div className="bento-card bento-card-green relative overflow-hidden shadow-sm md:col-span-1">
          <div className="card-header relative z-10">
            <div className="icon-wrap" style={{background: 'rgba(255,255,255,0.2)'}}>
              <Wallet size={32} weight="fill" color="#fff" />
            </div>
            <span className="text-white-label">Piggybank Balance</span>
          </div>
          <div className="relative z-10 mt-6 mb-8">
            <h2 className="text-5xl font-black tracking-tight mb-2 text-white-primary">₹4,250</h2>
          </div>
          
          <div className="card-data border-t border-white/20 pt-4 relative z-10">
            <div className="data-row items-center">
              <span className="text-white-label">Saved This Week</span>
              <span className="text-white-primary font-bold text-lg bg-black/10 px-2 py-0.5 rounded">₹50</span>
            </div>
            <div className="data-row items-center">
              <span className="text-white-label">Saved This Month</span>
              <span className="text-white-primary font-bold text-lg">₹200</span>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 opacity-10">
            <svg width="200" height="200" viewBox="0 0 24 24" fill="#FFFFFF">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
            </svg>
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col gap-6">
          {/* Savings Graph */}
          <div className="bento-card bg-white border border-gray-100 shadow-sm flex-1 flex flex-col">
            <h3 className="font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ChartLineUp className="text-green-500" size={24} weight="fill" /> Weekly Savings Trend
            </h3>
            
            <div className="flex-1 w-full bg-gray-50 rounded-xl border border-gray-100 relative flex items-end px-6 pt-10 pb-4 justify-between gap-4">
              
              {/* Fake Bar Chart */}
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => {
                const heights = ['20%', '40%', '60%', '30%', '50%', '80%', '100%'];
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 w-full">
                    <div className="w-full bg-green-100 rounded-t-sm relative group overflow-hidden" style={{height: heights[idx]}}>
                      <div className="absolute inset-x-0 bottom-0 bg-green-500 rounded-t-sm transition-all duration-300 group-hover:bg-green-400" style={{height: '100%'}}></div>
                    </div>
                    <span className="text-xs text-gray-400 font-bold">{day}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            {/* Auto-save Settings */}
            <div className="bento-card bg-white border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Repeat className="text-blue-500" /> Auto-save Settings
              </h3>
              
              <div className="flex justify-between items-center mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm font-bold text-gray-700">Auto-save</span>
                <div className="bg-green-500 w-10 h-6 rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 bg-white w-4 h-4 rounded-full shadow-sm"></div>
                </div>
              </div>

              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-sm font-bold text-gray-700">Weekly Target</span>
                <span className="font-bold text-gray-800 text-lg">₹50</span>
              </div>
            </div>

            {/* Recent Mini TX */}
            <div className="bento-card bg-white border border-gray-100 shadow-sm overflow-hidden p-0 h-full">
               <div className="p-4 border-b border-gray-100">
                 <h3 className="font-bold text-gray-800 text-sm">Recent Transfers</h3>
               </div>
               <div className="flex flex-col">
                 <div className="p-3 border-b border-gray-50 flex justify-between items-center hover:bg-gray-50 cursor-pointer">
                   <div className="flex items-center gap-2">
                     <span className="bg-green-100 p-1.5 rounded-full text-green-600"><ArrowDownLeft size={14} /></span>
                     <div><p className="text-xs font-bold text-gray-800">Auto-save</p><p className="text-[10px] text-gray-400">Apr 4</p></div>
                   </div>
                   <span className="text-sm font-bold text-green-600">+₹50</span>
                 </div>
                 <div className="p-3 border-b border-gray-50 flex justify-between items-center hover:bg-gray-50 cursor-pointer">
                   <div className="flex items-center gap-2">
                     <span className="bg-orange-100 p-1.5 rounded-full text-orange-600"><ArrowUpRight size={14} /></span>
                     <div><p className="text-xs font-bold text-gray-800">Withdrawal</p><p className="text-[10px] text-gray-400">Mar 28</p></div>
                   </div>
                   <span className="text-sm font-bold text-gray-800">-₹500</span>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
