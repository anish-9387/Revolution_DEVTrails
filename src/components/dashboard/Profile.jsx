import React from 'react';
import { User, IdentificationCard, Phone, Path, ShieldCheck, MapPin } from '@phosphor-icons/react';

export const Profile = () => {
  return (
    <>
      <h1 className="dashboard-page-title">Profile Settings</h1>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Profile Identity Card */}
        <div className="bento-card bg-white shadow-sm border border-gray-100 flex-1">
          <div className="flex flex-col items-center text-center">
            <div className="w-24 h-24 rounded-full border-4 border-gray-50 overflow-hidden mb-4 shadow-sm">
              <img src="https://i.pravatar.cc/150?img=11" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Rahul Dev</h2>
            <p className="text-sm text-gray-500 font-bold flex items-center gap-1 justify-center mt-1">
              <ShieldCheck className="text-green-500" /> Account Verified
            </p>
          </div>

          <div className="border-t border-gray-100 mt-6 pt-6 flex flex-col gap-4">
            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="bg-white p-2 rounded-lg text-blue-500 shadow-sm"><IdentificationCard size={24} /></div>
              <div>
                <span className="text-xs text-gray-400 font-bold block">Delivery Platform</span>
                <span className="text-sm font-bold text-gray-800">Swiggy Delivery Partner</span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="bg-white p-2 rounded-lg text-orange-500 shadow-sm"><Phone size={24} /></div>
              <div>
                <span className="text-xs text-gray-400 font-bold block">Phone Number</span>
                <span className="text-sm font-bold text-gray-800">+91 98765 43210</span>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
              <div className="bg-white p-2 rounded-lg text-purple-500 shadow-sm"><Path size={24} /></div>
              <div>
                <span className="text-xs text-gray-400 font-bold block">Device Status</span>
                <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> GPS Telemetry Active
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Zones & Activity */}
        <div className="flex-1 flex flex-col gap-6">
          <div className="bento-card bento-card-blue shadow-sm">
            <h3 className="text-white-primary font-bold mb-4 flex items-center gap-2 border-b border-white/20 pb-3">
              <MapPin size={20} /> Active Zones
            </h3>
            
            <ul className="flex flex-col gap-3">
              <li className="flex justify-between items-center bg-black/10 p-3 rounded-xl">
                 <div className="flex items-center gap-2 text-white-primary font-bold text-sm">
                   <MapPin weight="fill" /> Chennai Z3
                 </div>
                 <span className="text-white-label">Primary</span>
              </li>
              <li className="flex justify-between items-center bg-black/10 p-3 rounded-xl">
                 <div className="flex items-center gap-2 text-white-primary font-bold text-sm">
                   <MapPin weight="fill" /> Chennai Z5
                 </div>
                 <span className="text-white-label">Secondary</span>
              </li>
              <li className="flex justify-between items-center bg-black/10 p-3 rounded-xl">
                 <div className="flex items-center gap-2 text-white-primary font-bold text-sm">
                   <MapPin weight="fill" /> Chennai Z7
                 </div>
                 <span className="text-white-label">Secondary</span>
              </li>
            </ul>
          </div>

          <div className="bento-card border border-gray-100 shadow-sm bg-white p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-bold text-gray-800">Support & Legal</h3>
                <p className="text-xs text-gray-500 mt-1">Need help with your Oracle syncs?</p>
              </div>
              <button className="bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100">
                Contact Support
              </button>
            </div>
            <div className="flex gap-4 mt-6">
              <a href="#" className="flex-1 text-center bg-blue-50 text-blue-600 py-2 rounded-lg text-xs font-bold hover:bg-blue-100">Privacy Policy</a>
              <a href="#" className="flex-1 text-center bg-blue-50 text-blue-600 py-2 rounded-lg text-xs font-bold hover:bg-blue-100">Terms of Service</a>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};
