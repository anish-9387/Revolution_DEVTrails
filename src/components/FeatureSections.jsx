import React from 'react';
import { Lightning, Brain, ShieldCheck, PiggyBank } from '@phosphor-icons/react';

export const KeyFeatures = () => {
  return (
    <section id="features" className="features-section">
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">Built for the <span className="text-gradient">Modern Worker</span></h2>
          <p className="section-desc max-w-2xl mx-auto">Everything you need to secure your daily income without the complexity of traditional insurance.</p>
        </div>

        <div className="features-grid">
          <div className="card feature-box">
            <div className="feature-icon" style={{ background: "var(--secondary-light)", color: "var(--secondary)" }}>
              <Lightning weight="fill" />
            </div>
            <h4>Instant Smart Payouts</h4>
            <p>Our autonomous engine triggers payouts the moment thresholds are met. No claim filing, no agent interviews. Just instant liquidity when it matters.</p>
          </div>

          <div className="card feature-box">
            <div className="feature-icon" style={{ background: "var(--primary-light)", color: "var(--primary)" }}>
              <Brain weight="fill" />
            </div>
            <h4>AI Risk Pricing</h4>
            <p>We analyze thousands of data points to offer you personalized, ultra-low micro-premiums. You only pay for your exact risk zone on any given shift.</p>
          </div>

          <div className="card feature-box">
            <div className="feature-icon" style={{ background: "var(--highlight-light)", color: "var(--highlight)" }}>
              <ShieldCheck weight="fill" />
            </div>
            <h4>Fraud-Proof System</h4>
            <p>Our parametric design relies entirely on objective oracle data (like regional weather APIs) preventing generalized fraud and ensuring the pool stays solvent.</p>
          </div>

          <div className="card feature-box">
            <div className="feature-icon" style={{ background: "rgba(139, 92, 246, 0.1)", color: "#8b5cf6" }}>
              <PiggyBank weight="fill" />
            </div>
            <h4>Zero-Loss Piggybank</h4>
            <p>Didn't need to claim this month? We return 80% of your premium into a savings wallet that accrues APY yield automatically. A win-win for everyone.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
