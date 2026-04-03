import React from 'react';
import { ShieldCheck, MapPin, ChartPieSlice } from '@phosphor-icons/react';

export const Policy = () => {
  return (
    <>
      <h1 className="dashboard-page-title">
        My Policy
      </h1>

      {/* TOP GRID */}
      <div className="bento-grid-uneven">

        {/* POLICY CARD */}
        <div className="bento-card policy-main-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="policy-icon">
              <ShieldCheck weight="fill" size={26} />
            </div>
            <div>
              <h3 className="policy-id">
                Policy ID: KBR-1024
              </h3>
              <span className="policy-status">
                ACTIVE
              </span>
            </div>
          </div>

          {/* GRID MINI CARDS */}
          <div className="policy-mini-grid">
            <div className="policy-mini-card">
              <span className="mini-label">Coverage Amount</span>
              <span className="mini-value">₹3,000/week</span>
            </div>
            <div className="policy-mini-card">
              <span className="mini-label">Weekly Premium</span>
              <span className="mini-value">₹42</span>
            </div>
            <div className="policy-mini-card">
              <span className="mini-label">Start Date</span>
              <span className="mini-value">March 21</span>
            </div>
            <div className="policy-mini-card">
              <span className="mini-label">Next Billing</span>
              <span className="mini-value">April 8</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="flex flex-col gap-6">
          {/* RISK CARD */}
          <div className="bento-card risk-card">
            <h3 className="section-title">
              Current Risk Score
            </h3>
            <div className="risk-gauge">
              <svg viewBox="0 0 100 50">
                <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#FFE7D6" strokeWidth="12" strokeLinecap="round" />
                <path d="M 10 50 A 40 40 0 0 1 70 20" fill="none" stroke="#F97316" strokeWidth="12" strokeLinecap="round" />
              </svg>
            </div>
            <span className="risk-score">55</span>
            <div className="mt-2">
              <span className="risk-pill">Moderate</span>
            </div>
          </div>

          {/* ZONES */}
          <div className="bento-card zone-card">
            <h3 className="section-title flex items-center gap-2">
              <MapPin size={18} /> Covered Zones
            </h3>
            <div className="zone-tags">
              <span>Chennai Zone 3</span>
              <span>Chennai Zone 5</span>
              <span>Chennai Zone 7</span>
            </div>
          </div>
        </div>
      </div>

      {/* PREMIUM SECTION */}
      <div className="premium-section-container mt-6">
        <div className="bento-card premium-card">
          <div>
            <h3 className="section-title flex items-center gap-2">
              <ChartPieSlice size={22} /> Premium Breakdown
            </h3>
            <p className="premium-desc">
              Your premium is dynamically calculated based on historical disruption data.
            </p>
            <ul className="premium-legend">
              <li>
                <span className="dot-blue"></span>
                Weather Risk: 40%
              </li>
              <li>
                <span className="dot-red"></span>
                Heat Risk: 30%
              </li>
              <li>
                <span className="dot-orange"></span>
                AQI Risk: 30%
              </li>
            </ul>
          </div>

          {/* DONUT */}
          <div className="donut-chart">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" stroke="#6366F1" strokeWidth="18" fill="transparent" strokeDasharray="100 151" />
              <circle cx="50" cy="50" r="40" stroke="#EF4444" strokeWidth="18" fill="transparent" strokeDasharray="75 176" strokeDashoffset="-100" />
              <circle cx="50" cy="50" r="40" stroke="#F97316" strokeWidth="18" fill="transparent" strokeDasharray="75 176" strokeDashoffset="-175" />
            </svg>
          </div>
        </div>
      </div>
    </>
  );
};