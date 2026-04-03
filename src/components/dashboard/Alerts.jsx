import React from 'react';
import { CloudWarning, MapPin, Wind, Drop } from '@phosphor-icons/react';

export const Alerts = () => {
  return (
    <>
      <h1 className="dashboard-page-title">Active Alerts</h1>

      <div className="bento-grid-uneven">
        {/* Red Alert Card */}
        <div className="bento-card bento-card-red mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 p-3 rounded-2xl text-white">
              <CloudWarning weight="fill" size={32} />
            </div>
            <div>
              <h3 className="text-white-primary font-bold text-xl">SEVERE ZONE ALERT</h3>
              <span className="text-white-label">Oracle Trigger Engaged</span>
            </div>
          </div>

          <div className="bg-black/20 rounded-2xl p-6">
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-white-label mb-1">Impacted Area</p>
                <p className="text-white-primary text-2xl flex items-center gap-2"><MapPin weight="fill" /> Chennai Z3</p>
              </div>
              <div className="bg-white text-red-500 px-4 py-2 rounded-xl text-sm font-black shadow-lg uppercase tracking-wider">
                Payout Triggered
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 border-t border-white/20 pt-4 mt-2">
              <div className="flex items-center gap-3">
                <Drop size={24} className="text-white-primary" weight="fill" />
                <div>
                  <span className="text-white-label block">Live Rainfall</span>
                  <span className="text-white-primary font-bold">60mm/hr</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Wind size={24} className="text-white-primary" weight="fill" />
                <div>
                  <span className="text-white-label block">Wind Speed</span>
                  <span className="text-white-primary font-bold">45 km/h</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Informational Maps / History */}
        <div className="flex flex-col gap-6">
          <div className="bento-card border border-gray-200 shadow-sm bg-gray-50 flex items-center justify-center p-0 overflow-hidden relative" style={{ minHeight: '200px' }}>
            {/* Fake Map SVG */}
            <svg className="w-full h-full absolute inset-0 opacity-40" viewBox="0 0 100 100" preserveAspectRatio="none">
              <path d="M 10 10 Q 30 20 50 10 T 90 30 T 70 80 T 20 60 Z" fill="#CBD5E1" />
              <path d="M 40 40 Q 60 30 70 50 T 50 70 Z" fill="#EF4444" opacity="0.6" />
              <circle cx="55" cy="50" r="4" fill="#EF4444" className="animate-pulse" />
            </svg>
            <div className="bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-sm z-10 border border-gray-100 flex items-center gap-2">
              <MapPin weight="fill" className="text-red-500" />
              <span className="text-sm font-bold text-gray-800">Zone 3 Heatmap</span>
            </div>
          </div>

          <div className="bento-card bg-white border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 text-sm mb-3">Past 24H Triggers</h3>
            <div className="bg-orange-50 border border-orange-100 p-3 rounded-lg flex justify-between items-center mb-2">
              <span className="text-orange-800 text-xs font-bold">AQI &gt; 250 Alert</span>
              <span className="text-orange-600 text-xs text-right">Mar 21<br />Cleared</span>
            </div>
            <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg flex justify-between items-center">
              <span className="text-gray-500 text-xs font-bold">Heat Index Warning</span>
              <span className="text-gray-400 text-xs text-right">Mar 19<br />Preventative</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
