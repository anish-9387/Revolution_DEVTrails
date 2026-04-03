import React from 'react';
import '../trips.css';
import { MagicWand, Clock, Heart, Microphone, SpeakerSlash, Users, CheckCircle, Checks, Brain, Broadcast } from '@phosphor-icons/react';

export const TripsFeatures = () => {
  return (
    <section className="trips-section" id="trips">
      <div className="container">
        
        {/* First Section */}
        <div className="trips-header">
          <h3 className="trips-subtitle">ZERO FRICTION EXPERIENCES</h3>
          <h2 className="trips-title">PARAMETRIC INSURANCE FOR GIG WORKERS</h2>
          <p className="trips-desc">
            Unlike traditional insurance, KuberaAI protects your income with fully automated instant payouts when disruptions hit.
          </p>
        </div>

        <div className="trips-grid-3">
          {/* Card 1 */}
          <div className="t-card t-card-light-purple">
            <div className="t-graphic t-graphic-circles">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <circle cx="100" cy="20" r="30" />
                <circle cx="100" cy="20" r="55" />
                <circle cx="100" cy="20" r="80" />
              </svg>
            </div>
            <div className="t-card-icon">
              <MagicWand weight="fill" color="#634af5" size={20} />
            </div>
            <div className="t-card-content">
              <h4 className="t-card-title">Zero Paperwork<br/>Claims</h4>
              <p className="t-card-desc">No manual filing. Payouts trigger automatically when measured thresholds are crossed.</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="t-card t-card-dark-purple">
            <div className="t-graphic t-graphic-u">
              <svg width="80" height="120" viewBox="0 0 80 120">
                <path d="M 10 0 L 10 60 A 30 30 0 0 0 70 60 L 70 0" />
              </svg>
            </div>
            <div className="t-card-icon">
              <Brain weight="fill" color="#634af5" size={20} />
            </div>
            <div className="t-card-content">
              <h4 className="t-card-title">AI Risk Pricing<br/>Engine</h4>
              <p className="t-card-desc">Personalized micro-premiums calculated using historical weather, activity data, and zone risk.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="t-card t-card-yellow">
            <div className="t-graphic t-graphic-grid">
              <svg width="120" height="120" viewBox="0 0 120 120">
                <rect x="20" y="20" width="40" height="40" fill="rgba(0,0,0,0.05)" />
                <rect x="80" y="20" width="40" height="40" fill="rgba(0,0,0,0.05)" />
                <rect x="20" y="80" width="40" height="40" fill="rgba(0,0,0,0.05)" />
                <rect x="80" y="80" width="40" height="40" fill="rgba(0,0,0,0.05)" />
              </svg>
            </div>
            <div className="t-card-icon">
              <Broadcast weight="fill" color="#c48b11" size={20} />
            </div>
            <div className="t-card-content">
              <h4 className="t-card-title">Always-On<br/>Monitoring</h4>
              <p className="t-card-desc">Continuous synchronization with verified weather oracles, AQI databases, and traffic APIs.</p>
            </div>
          </div>
        </div>

        {/* Second Section */}
        <div className="trips-header trips-header-2">
          <h2 className="trips-title trips-subtitle-2">ENGINEERED AGAINST</h2>
          <h2 className="trips-title trips-title-orange mb-4">COORDINATED GPS SPOOFING</h2>
          <p className="trips-desc">
            Transforming fraud from a low-cost exploit into a high-complexity, economically unviable attack.
          </p>
        </div>

        <div className="trips-grid-2">
          {/* Card 4 */}
          <div className="t-card t-card-coral t-card-large pl-6 pr-6 pt-6 pb-0">
             <div className="t-card-content p-4">
              <h4 className="t-card-title">Cross-Sensor<br/>Fusion Validation</h4>
              <p className="t-card-desc mb-8">Spoofing GPS is easy. Faking physical motion sensors and network triangulation simultaneously is exponentially harder.</p>
            </div>
            
            <div className="mockup-audio">
              <div className="audio-btn border-r">
                <div className="audio-icon-wrapper audio-icon-blue">
                  <Broadcast weight="fill" size={24} />
                </div>
                <div className="audio-label">GPS Verified</div>
                <div className="audio-sub">Zone Match</div>
              </div>
              <div className="audio-btn">
                <div className="audio-icon-wrapper audio-icon-red" style={{backgroundColor: '#e0f2fe', color: '#0ea5e9'}}>
                  <MagicWand weight="fill" size={24} />
                </div>
                <div className="audio-label">Accel Active</div>
                <div className="audio-sub">Motion Valid</div>
              </div>
            </div>
          </div>

          {/* Card 5 */}
          <div className="t-card t-card-yellow t-card-large pl-6 pr-6 pt-6 pb-0">
             <div className="t-card-content p-4">
              <h4 className="t-card-title">Platform Behavior<br/>Anchoring</h4>
              <p className="t-card-desc">Claims require alignment with actual platform delivery behavior, shift coherency, and network data.</p>
            </div>

            <div className="mockup-notion">
              <div className="notion-header">
                <span className="active flex items-center gap-1"><Checks size={14}/> Zomato/Swiggy Logs</span>
                <span>Timeline</span>
                <span>Activity</span>
              </div>
              <div className="notion-cols">
                <div className="notion-col">
                  <div className="n-tag n-tag-planning" style={{backgroundColor: '#e0f2fe', color: '#0369a1'}}>● Active Orders</div>
                  <div className="n-card">
                    <div className="n-card-title">📝 Order #492 Delivered</div>
                    <div className="n-badges">
                      <span className="n-badge">Bandra West</span>
                      <span className="n-badge" style={{color: '#16a34a', backgroundColor: '#f0fdf4'}}>Verified</span>
                    </div>
                  </div>
                </div>
                <div className="notion-col">
                  <div className="n-tag n-tag-progress">● Network</div>
                  <div className="n-card">
                     <div className="n-card-title">📡 Network Anchoring</div>
                     <div className="n-badges">
                      <span className="n-badge">IP Geo-Match</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Third Section */}
        <div className="trips-grid-1">
          {/* Card 6 */}
          <div className="t-card t-card-blue t-card-wide">
            
            <div className="t-wide-visual">
               <div className="mockup-users">
                  <div className="u-item" style={{marginLeft: '-10px', opacity: 0.9}}>
                    <div className="u-info">
                      <div className="u-avatar" style={{background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <CheckCircle size={24} color="#0f0"/>
                      </div>
                      <div className="u-details">
                        <h5>Hash: 0x8f2a...</h5>
                        <span>Claim Immutably Logged</span>
                      </div>
                    </div>
                    <button className="btn-add">Polygon Scan</button>
                  </div>
                  
                  <div className="u-item" style={{transform: 'scale(1.05)', zIndex: 10, position: 'relative'}}>
                    <div className="u-info">
                      <div className="u-avatar" style={{background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <CheckCircle size={24} color="#0f0"/>
                      </div>
                      <div className="u-details">
                        <h5>Hash: 0x3d9c...</h5>
                        <span>Instant Payout Triggered</span>
                      </div>
                    </div>
                    <button className="btn-add font-bold" style={{padding: '0.4rem 0.8rem'}}>Polygon Scan</button>
                  </div>

                  <div className="u-item" style={{marginLeft: '-5px', opacity: 0.9}}>
                    <div className="u-info">
                      <div className="u-avatar" style={{background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <CheckCircle size={24} color="#0f0"/>
                      </div>
                      <div className="u-details">
                        <h5>Hash: 0x1a4b...</h5>
                        <span>Claim Immutably Logged</span>
                      </div>
                    </div>
                    <button className="btn-add">Polygon Scan</button>
                  </div>
               </div>
            </div>

            <div className="t-wide-content">
              <h4 className="t-card-title text-3xl mb-4">Immutable Claim<br/>Logging</h4>
              <p className="t-card-desc text-base">Off-chain intelligence handles complex fraud detection, while on-chain smart contracts trigger trustless payouts with non-repudiable claim histories via Polygon.</p>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
