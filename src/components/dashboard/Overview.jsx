import React from 'react';
import { 
  ShieldCheck, Warning, Wallet, Drop, Leaf, Thermometer, 
  CloudWarning, FileText, Bank, MapPin, CheckCircle, ArrowRight
} from '@phosphor-icons/react';

export const Overview = () => {
  return (
    <>
      <h1 className="dashboard-page-title">Overview</h1>

      {/* SECTION 1: Top Summary Cards (Strong Gradients) */}
      <div className="bento-grig-3">
        
        {/* Card 1: Coverage */}
        <div className="bento-card bento-card-blue">
          <div className="card-header">
            <div className="icon-wrap" style={{background: 'rgba(255,255,255,0.2)'}}>
              <ShieldCheck size={28} weight="fill" color="#fff" />
            </div>
            <div className="tag" style={{background: 'rgba(255,255,255,0.2)', color: '#fff'}}>Active</div>
          </div>
          <h3 className="card-title text-white-primary">Coverage Status</h3>
          <div className="card-data mt-4">
            <div className="data-row">
              <span className="text-white-label">Weekly Premium</span>
              <span className="text-white-primary">₹42</span>
            </div>
            <div className="data-row">
              <span className="text-white-label">Next Billing</span>
              <span className="text-white-primary">April 8</span>
            </div>
            <div className="data-row">
              <span className="text-white-label">Active Zone</span>
              <span className="text-white-primary">Chennai Z3</span>
            </div>
          </div>
        </div>

        {/* Card 2: Risk Monitor */}
        <div className="bento-card bento-card-orange">
          <div className="card-header">
            <div className="icon-wrap" style={{background: 'rgba(255,255,255,0.2)'}}>
              <Warning size={28} weight="fill" color="#fff" />
            </div>
            <div className="tag tag-danger" style={{background: '#fff', color: '#FF7A00'}}>High Risk</div>
          </div>
          <h3 className="card-title text-white-primary">Risk Monitor</h3>
          <div className="card-data-grid mt-4">
            <div className="data-box" style={{background: 'rgba(255,255,255,0.15)'}}>
              <Leaf size={24} className="mb-2 text-white-primary" />
              <span className="box-val text-xl font-bold text-white-primary">290</span>
              <span className="box-lbl text-white-label mt-1">AQI</span>
            </div>
            <div className="data-box" style={{background: 'rgba(255,255,255,0.15)'}}>
              <Drop size={24} className="mb-2 text-white-primary" />
              <span className="box-val text-xl font-bold text-white-primary">48mm</span>
              <span className="box-lbl text-white-label mt-1">Rain/hr</span>
            </div>
            <div className="data-box" style={{background: 'rgba(255,255,255,0.15)'}}>
              <Thermometer size={24} className="mb-2 text-white-primary" />
              <span className="box-val text-xl font-bold text-white-primary">40°C</span>
              <span className="box-lbl text-white-label mt-1">Temp</span>
            </div>
          </div>
        </div>

        {/* Card 3: Piggybank */}
        <div className="bento-card bento-card-green relative overflow-hidden">
          <div className="card-header relative z-10">
            <div className="icon-wrap" style={{background: 'rgba(255,255,255,0.2)'}}>
              <Wallet size={28} weight="fill" color="#fff" />
            </div>
            <span className="text-white-label">Piggybank</span>
          </div>
          <div className="relative z-10 mt-2">
            <h2 className="text-4xl font-black tracking-tight mb-1 text-white-primary">₹1,250</h2>
            <p className="text-white-secondary">Saved this week: <span className="font-bold">₹50</span></p>
          </div>
          <div className="mt-6 relative z-10">
            <button className="btn-withdraw w-full">Withdraw</button>
          </div>
          {/* Graphic element */}
          <div className="absolute -bottom-10 -right-10 opacity-20">
            <svg width="150" height="150" viewBox="0 0 24 24" fill="#FFFFFF">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              <path d="M12.5 7v5.25l4.5 2.67-.75 1.23L11 13V7h1.5z"/>
            </svg>
          </div>
        </div>

      </div>

      <div className="bento-grid-uneven mt-6">
        
        <div className="left-column">
          {/* SECTION 2: Live Telemetry (Neutral Light Background) */}
          <div className="bento-card bento-card-light weather-card mb-6 shadow-sm">
             <div className="flex justify-between items-start mb-6">
               <div>
                 <h3 className="text-lg font-bold text-gray-800">Live Telemetry</h3>
                 <p className="text-sm text-gray-500">Official Oracle Data Sync</p>
               </div>
               <div className="flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">
                 <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>
                 Trigger Active
               </div>
             </div>

             <div className="weather-stats">
               <div className="w-stat border border-gray-100 shadow-sm">
                 <span className="w-icon text-blue-500"><Drop weight="fill" size={24}/></span>
                 <div className="flex flex-col">
                   <span className="w-val">52mm/hr</span>
                   <span className="w-lbl">Rainfall Rate</span>
                 </div>
               </div>
               <div className="w-stat border border-gray-100 shadow-sm">
                 <span className="w-icon text-orange-500"><Leaf weight="fill" size={24}/></span>
                 <div className="flex flex-col">
                   <span className="w-val">310</span>
                   <span className="w-lbl">AQI (Severe)</span>
                 </div>
               </div>
               <div className="w-stat border border-gray-100 shadow-sm">
                 <span className="w-icon text-red-500"><Thermometer weight="fill" size={24}/></span>
                 <div className="flex flex-col">
                   <span className="w-val">42°C</span>
                   <span className="w-lbl">Heat Index</span>
                 </div>
               </div>
             </div>
             
             {/* Multi-line Telemetry Chart Overlay */}
             <div className="mt-8 h-24 w-full relative flex items-end">
                <svg className="absolute bottom-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 40">
                  {/* Heat Index Trend */}
                  <path d="M0 35 Q 15 30, 30 32 T 60 25 T 100 20" fill="none" stroke="#EF4444" strokeWidth="2" strokeOpacity="0.5" />
                  
                  {/* AQI Trend */}
                  <path d="M0 40 L0 30 Q 15 20, 30 25 T 60 15 T 100 5 L100 40 Z" fill="rgba(249, 115, 22, 0.1)" />
                  <path d="M0 30 Q 15 20, 30 25 T 60 15 T 100 5" fill="none" stroke="#F97316" strokeWidth="2" />
                  
                  {/* Rainfall Overlay */}
                  <path d="M0 40 L0 38 Q 20 28, 40 38 T 80 18 T 100 28 L100 40 Z" fill="rgba(59, 130, 246, 0.15)" />
                  <path d="M0 38 Q 20 28, 40 38 T 80 18 T 100 28" fill="none" stroke="#3B82F6" strokeWidth="1.5" strokeOpacity="0.8" />
                </svg>
             </div>
          </div>

          {/* SECTION 4: Alerts Panel (Strong Colors) */}
          <div className="bento-card bento-card-red alert-card shadow-sm">
             <div className="flex items-center gap-3 mb-4">
               <div className="bg-white/20 p-2 rounded-xl text-white">
                  <CloudWarning weight="fill" size={24} />
               </div>
               <h3 className="text-white-primary font-bold text-lg">Zone Alert</h3>
             </div>
             <div className="alert-content">
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-white-secondary text-sm">Zone: <strong className="text-white-primary">Chennai Z3</strong></p>
                    <p className="text-white-secondary text-sm">Rainfall: <strong className="text-white-primary">60mm/hr</strong></p>
                  </div>
                  <div className="bg-white text-red-500 px-3 py-1 rounded-md text-sm font-bold shadow-sm">
                    Triggered
                  </div>
                </div>
             </div>
          </div>
        </div>

        <div className="right-column">
          {/* SECTION 5: Quick Actions Panel */}
          <div className="bento-card bento-card-purple mb-6 shadow-sm">
            <h3 className="text-white-primary font-bold mb-4">Quick Actions</h3>
            <div className="quick-actions-grid">
              <button className="qa-btn hover:bg-white/20">
                <FileText size={20} className="text-white-primary" />
                <span className="text-white-secondary">View Policy</span>
              </button>
              <button className="qa-btn hover:bg-white/20">
                <ShieldCheck size={20} className="text-white-primary" />
                <span className="text-white-secondary">File Claim</span>
              </button>
              <button className="qa-btn hover:bg-white/20">
                <Bank size={20} className="text-white-primary" />
                <span className="text-white-secondary">Withdraw</span>
              </button>
              <button className="qa-btn hover:bg-white/20">
                <MapPin size={20} className="text-white-primary" />
                <span className="text-white-secondary">Zones</span>
              </button>
            </div>
          </div>

          {/* SECTION 3: Recent Activity Timeline */}
          <div className="bento-card bg-white shadow-sm border border-gray-100 h-full">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-gray-800">Recent Activity</h3>
              <a href="#" className="text-sm font-bold text-blue-500 flex items-center gap-1 hover:underline">
                View All <ArrowRight size={14} />
              </a>
            </div>
            
            <div className="timeline-container">
               <div className="timeline-item">
                 <div className="t-icon bg-green-100 text-green-500">
                   <CheckCircle weight="fill" size={20} />
                 </div>
                 <div className="t-content">
                   <h5 className="font-bold text-sm text-gray-800">₹850 Payout Released</h5>
                   <p className="text-xs text-gray-500">Credited to primary account</p>
                 </div>
                 <span className="t-time">Just now</span>
               </div>

               <div className="timeline-item">
                 <div className="t-icon bg-orange-100 text-orange-500">
                   <Warning weight="fill" size={20} />
                 </div>
                 <div className="t-content">
                   <h5 className="font-bold text-sm text-gray-800">AQI Trigger Detected</h5>
                   <p className="text-xs text-gray-500">Zone mapping validated</p>
                 </div>
                 <span className="t-time">2h ago</span>
               </div>

               <div className="timeline-item">
                 <div className="t-icon bg-blue-100 text-blue-500">
                   <Wallet weight="fill" size={20} />
                 </div>
                 <div className="t-content">
                   <h5 className="font-bold text-sm text-gray-800">Premium Paid</h5>
                   <p className="text-xs text-gray-500">Auto-deducted from wallet</p>
                 </div>
                 <span className="t-time">Yesterday</span>
               </div>

               <div className="timeline-item pb-0">
                 <div className="t-icon bg-green-100 text-green-500">
                   <ShieldCheck weight="fill" size={20} />
                 </div>
                 <div className="t-content">
                   <h5 className="font-bold text-sm text-gray-800">Policy Activated</h5>
                   <p className="text-xs text-gray-500">Coverage live for Week 14</p>
                 </div>
                 <span className="t-time">Mon</span>
               </div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};
