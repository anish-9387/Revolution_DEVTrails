import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowRight, PlayCircle, CloudRain, ShieldCheck, Thermometer, Warning, Broadcast, Coins, UserPlus, Brain,
  EnvelopeSimple, Coin, Sparkle, Receipt, Bank, CheckCircle 
} from '@phosphor-icons/react';

export const Hero = () => {
  return (
    <header className="fintech-hero">
      <div className="container fintech-hero-container">
        
        {/* Top Text Content */}
        <div className="fintech-hero-content text-center">
          <h1 className="fintech-hero-title">
            The Future of <br/> Gig Protection
          </h1>
          <p className="fintech-hero-subtitle">
            AI-powered instant payouts when disruptions hit. Zero paperwork.<br/>Protecting the backbone of our cities.
          </p>
          
          <div className="fintech-hero-form">
            <div className="fintech-input-wrapper">
              <EnvelopeSimple size={20} className="input-icon" />
              <input 
                type="email" 
                placeholder="Your Email Address" 
                className="fintech-input"
              />
              <Link to="/auth" className="btn-get-protected" style={{textDecoration: 'none'}}>
                Get Protected
              </Link>
            </div>
            <p className="fintech-disclaimer">
              *Zero paperwork. Zero delays. Automated instant payouts.
            </p>
          </div>
        </div>
        
        {/* Visual Content: Phone & Popups */}
        <div className="fintech-hero-visual">
          
          {/* Decorative Gradient Blob */}
          <div className="fintech-blob"></div>
          <div className="fintech-blob-2"></div>

          {/* SVG Connector Lines */}
          <svg className="connector-lines" style={{ minWidth: '1000px', left: '50%', transform: 'translateX(-50%)' }}>
            <path d="M 300 220 Q 380 220 400 300" stroke="#ccc" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
            <path d="M 700 200 Q 600 180 580 250" stroke="#ccc" strokeWidth="1.5" fill="none" strokeDasharray="4 4" />
          </svg>

          {/* Phone Frame */}
          <div className="fintech-phone">
             <div className="dynamic-island"></div>
             
             {/* Phone Content Inner */}
             <div className="phone-screen">
                <div className="phone-header-custom">
                   <div className="close-btn-wrapper">
                       <span className="close-x">x</span>
                   </div>
                   <span className="phone-header-title">Protection Dashboard</span>
                   <div style={{width: '24px'}}></div>
                </div>

                {/* Main Card inside Phone */}
                <div className="credit-card-mockup">
                   <div className="card-shine"></div>
                   <div className="card-top-row">
                      <div className="card-logo">
                        <ShieldCheck weight="fill" /> KIA
                      </div>
                   </div>
                   <div className="card-number">
                     1253 5432 3521 3090
                   </div>
                   <div className="card-bottom-row">
                     <div>
                       <p className="card-label">Gig Platform ID</p>
                       <p className="card-value">UBER-XYZ-92</p>
                     </div>
                     <div className="mastercard-circles">
                       <div className="mc-circle"></div>
                     </div>
                   </div>
                </div>
                
                {/* Secondary Phone Dashboard visual */}
                <div className="dashboard-alert">
                   <div className="alert-icon-wrapper">
                       <CloudRain weight="fill" />
                   </div>
                   <div className="alert-text">
                       <p className="alert-title">Heavy Rain Expected</p>
                       <p className="alert-subtitle">Bandra West</p>
                   </div>
                </div>
             </div>
          </div>

          {/* Floating Cards */}
          <div className="floating-card popup-yellow">
             <Sparkle className="popup-icon" size={24} weight="fill" />
             <p className="popup-text">Zero Friction.<br/>Just Link ID.</p>
          </div>

          <div className="floating-card popup-orange">
             <div className="popup-orange-icon">
               <Receipt size={18} weight="bold" />
             </div>
             <h2 className="popup-orange-title">₹1,200</h2>
             <div className="popup-pill">
               Payout Ready
             </div>
          </div>

          <div className="floating-card popup-green">
             <div className="popup-green-icon"><Bank size={24} weight="regular" /></div>
             <p className="popup-green-text">
               We monitor weather & traffic matters seriously so that you don't have to.
             </p>
          </div>

          <div className="floating-card popup-black cursor-pointer group">
             <span className="popup-black-text">See Demo</span>
             <ArrowRight size={16} className="popup-black-arrow" />
          </div>

        </div>
        
      </div>
    </header>
  );
};

export const Problem = () => {
  return (
    <section id="problem" className="problem-section">
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">The Real Cost of <span className="text-gradient">Disruptions</span></h2>
          <p className="section-desc max-w-2xl mx-auto">When extreme weather hits, incomes freeze. We believe every gig worker deserves a safety net.</p>
        </div>

        <div className="problem-grid">
          <div className="card stat-card">
            <h3 className="stat-number text-gradient-teal">30%</h3>
            <p className="stat-label">Income Lost During Extreme Weather</p>
          </div>
          <div className="card stat-card">
            <h3 className="stat-number">15M+</h3>
            <p className="stat-label">Gig Workers Highly Vulnerable</p>
          </div>
          <div className="card stat-card">
            <h3 className="stat-number" style={{ color: "var(--highlight)" }}>0</h3>
            <p className="stat-label">Instant Support Available Today</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export const HowItWorks = () => {
  return (
    <section id="how-it-works" className="flow-section">
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">Zero Friction. <span className="text-gradient-teal">Instant Payouts.</span></h2>
          <p className="section-desc max-w-2xl mx-auto">Forget claims and 30-day waiting periods. We process risk data in real-time to pay you the minute you need it.</p>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-icon-wrapper">
              <UserPlus weight="bold" />
            </div>
            <h3>1. Register</h3>
            <p>Link your gig platform ID securely.</p>
          </div>
          
          <div className="step-connector"></div>
          
          <div className="step-card">
            <div className="step-icon-wrapper">
              <Brain weight="bold" />
            </div>
            <h3>2. AI Pricing</h3>
            <p>Micro-premiums matched to your personalized risk.</p>
          </div>
          
          <div className="step-connector"></div>
          
          <div className="step-card">
            <div className="step-icon-wrapper">
              <Broadcast weight="bold" />
            </div>
            <h3>3. Monitoring</h3>
            <p>24/7 API sync with weather & traffic networks.</p>
          </div>
          
          <div className="step-connector"></div>
          
          <div className="step-card">
            <div className="step-icon-wrapper" style={{ color: "var(--highlight)" }}>
              <Warning weight="bold" />
            </div>
            <h3>4. Trigger</h3>
            <p>Disruption threshold algorithmically met.</p>
          </div>
          
          <div className="step-connector"></div>
          
          <div className="step-card">
            <div className="step-icon-wrapper" style={{ color: "var(--secondary)" }}>
              <Coins weight="fill" />
            </div>
            <h3>5. Instant Payout</h3>
            <p>Funds transferred to your account instantly.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
