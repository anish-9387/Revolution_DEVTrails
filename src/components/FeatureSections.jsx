import React from 'react';
import GlassPanel from './GlassPanel';
import { Cpu, CurrencyEth, Check, SpinnerGap, Crosshair, Heartbeat, ShareNetwork, ShieldCheck, Database, PiggyBank, TrendUp } from '@phosphor-icons/react';

export const Tech = () => {
  return (
    <section id="tech" className="tech-section">
      <div className="container">
        <div className="split-layout">
          <div className="tech-content">
            <h2 className="section-title">Smart Risk Detection.<br /><span className="text-gradient-violet">Trustless Payouts.</span></h2>
            <p className="section-desc mb-6">Our dual-engine architecture combines the predictive power of Artificial Intelligence with the unalterable execution of Blockchain.</p>
            
            <ul className="feature-list">
              <li>
                <Check weight="fill" style={{ color: "var(--secondary)", fontSize: "1.5rem" }} />
                <div>
                  <strong>Predictive Oracles</strong>
                  <p>Ingesting 10,000+ localized data points via Python backend APIs.</p>
                </div>
              </li>
              <li>
                <Check weight="fill" style={{ color: "var(--secondary)", fontSize: "1.5rem" }} />
                <div>
                  <strong>Automated Smart Contracts</strong>
                  <p>Polygon Solidity contracts execute automated payouts instantly.</p>
                </div>
              </li>
              <li>
                <Check weight="fill" style={{ color: "var(--secondary)", fontSize: "1.5rem" }} />
                <div>
                  <strong>Immutable Claim Ledger</strong>
                  <p>Valid claims and payouts perfectly logged on-chain for complete transparency.</p>
                </div>
              </li>
            </ul>
          </div>
          <div className="tech-visuals">
            <GlassPanel className="tech-glass AI">
              <div className="tech-header">
                <Cpu /> Neural Risk Engine
              </div>
              <div className="data-stream">
                 <div className="bar bar-1"></div>
                 <div className="bar bar-2"></div>
                 <div className="bar bar-3"></div>
                 <div className="bar bar-4"></div>
                 <div className="bar bar-5"></div>
              </div>
              <div className="signal-chart">
                 <svg viewBox="0 0 100 30" preserveAspectRatio="none">
                   <path d="M0,15 Q10,5 20,15 T40,15 T60,5 T80,20 T100,10" className="neon-path" fill="none" stroke="#3b82f6" strokeWidth="2"/>
                 </svg>
              </div>
            </GlassPanel>
            
            <GlassPanel className="tech-glass blockchain">
              <div className="tech-header">
                <CurrencyEth /> Base L2 Chain
              </div>
              <div className="chain-nodes">
                <div className="node executed"><Check /> TX_A9X</div>
                <div className="chain-link"></div>
                <div className="node pending"><SpinnerGap className="animate-spin" /> Oracle Verify</div>
              </div>
            </GlassPanel>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Fraud = () => {
  return (
    <section id="fraud" className="fraud-section">
      <div className="container text-center">
        <h2 className="section-title">Built to Defeat <span className="text-gradient">Fraud at Scale</span></h2>
        <p className="section-desc mx-auto max-w-2xl mb-12">Combatting GPS spoofing syndicates with multi-layered adversarial defense, ensuring funds reach real gig workers.</p>
        
        <div className="fraud-grid">
          <GlassPanel className="fraud-card">
            <div className="fraud-icon"><Crosshair /></div>
            <h4>Location Cross-Validation</h4>
            <p>GPS and network triangulation via WiFi & IP verify the rider is actually within the impacted zone before payout.</p>
          </GlassPanel>
          <GlassPanel className="fraud-card">
            <div className="fraud-icon"><Heartbeat /></div>
            <h4>Multi-Sensor Fusion</h4>
            <p>Cross-referencing accelerometer and gyroscope data to validate realistic driving patterns and motion consistency.</p>
          </GlassPanel>
          <GlassPanel className="fraud-card">
            <div className="fraud-icon"><ShareNetwork /></div>
            <h4>Behavioral DBSCAN</h4>
            <p>Clustering algorithms detect synchronized anomaly patterns to flag organized API/spoofing syndicates.</p>
          </GlassPanel>
          <GlassPanel className="fraud-card">
            <div className="fraud-icon"><ShieldCheck /></div>
            <h4 style={{ fontSize: '1rem' }}>Device Integrity & Fairness</h4>
            <p>Root/emulator detection. Suspicious claims aren't auto-rejected but queued for transparent manual/SMS review.</p>
          </GlassPanel>
          <GlassPanel className="fraud-card">
            <div className="fraud-icon"><Database /></div>
            <h4 style={{ fontSize: '1rem' }}>Public Data Overlays</h4>
            <p>Verifying claims against 3rd party traffic, weather API feeds, and public incident intelligence in real-time.</p>
          </GlassPanel>
          <GlassPanel className="fraud-card">
            <div className="fraud-icon"><Cpu /></div>
            <h4 style={{ fontSize: '1rem' }}>Sustained Liquidity Defense</h4>
            <p>Geo-cluster throttling and dynamic payout rate limiting halts liquidity drain under mass coordinated attack.</p>
          </GlassPanel>
        </div>
      </div>
    </section>
  );
};

export const Piggybank = () => {
  return (
    <section id="piggybank" className="tech-section" style={{ backgroundColor: 'rgba(15, 17, 23, 0.4)' }}>
      <div className="container">
        <div className="split-layout" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="tech-visuals" style={{ height: 'auto', display: 'flex', justifyContent: 'center' }}>
             <GlassPanel className="p-8 w-full max-w-sm text-center">
                <PiggyBank size={80} style={{ color: 'var(--highlight)', margin: '0 auto', marginBottom: '1rem' }} />
                <h3 className="text-2xl font-bold mb-2">Micro-Savings Vault</h3>
                <p className="text-gray mb-6">Your personal economic safety net, auto-funded during operational weeks.</p>
                <div className="bg-black/50 p-4 rounded-xl border border-gray-800 text-left">
                   <div className="flex justify-between items-center mb-2">
                     <span className="text-sm text-gray">Current Balance</span>
                     <TrendUp style={{ color: 'var(--secondary)' }} />
                   </div>
                   <div className="text-3xl font-bold text-white">₹4,250</div>
                   <div className="text-xs text-secondary mt-1">+₹50 this week</div>
                </div>
             </GlassPanel>
          </div>
          <div className="tech-content">
            <h2 className="section-title">Introducing <span className="text-gradient-gold">Piggybank</span></h2>
            <p className="section-desc mb-6">Insurance covers disasters. Piggybank covers the everyday variability. A micro-savings innovation specifically for the gig economy.</p>
            
            <ul className="feature-list">
              <li>
                <Check weight="fill" style={{ color: "var(--highlight)", fontSize: "1.5rem" }} />
                <div>
                  <strong>Automated Micro-Savings</strong>
                  <p>Smart auto-accumulation of small fractions of earnings during high-income normal weeks.</p>
                </div>
              </li>
              <li>
                <Check weight="fill" style={{ color: "var(--highlight)", fontSize: "1.5rem" }} />
                <div>
                  <strong>Worker Controlled</strong>
                  <p>Transparent transaction history and zero-fee worker-controlled withdrawals anytime.</p>
                </div>
              </li>
              <li>
                <Check weight="fill" style={{ color: "var(--highlight)", fontSize: "1.5rem" }} />
                <div>
                  <strong>Smart Pause</strong>
                  <p>Auto-pauses contributions during active disruption periods to preserve your immediate cash flow.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};
