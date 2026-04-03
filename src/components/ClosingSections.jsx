import React from 'react';
import GlassPanel from './GlassPanel';
import { CloudRain, ThermometerHot, Wind, MapPin } from '@phosphor-icons/react';

export const Triggers = () => {
  return (
    <section id="triggers" className="triggers-section">
      <div className="container">
        <div className="section-header text-center">
          <h2 className="section-title">Conditions We Cover</h2>
          <p className="section-desc">Dynamic parametric triggers tailored for extreme urban environmental risks.</p>
        </div>

        <div className="trigger-cards">
          <GlassPanel className="trigger-card trigger-rain">
            <CloudRain className="icon-large" />
            <h3 className="trigger-value">Rainfall &gt; 50mm/hr</h3>
            <p>Severe Monsoon Disruptions & Urban Flooding</p>
            <div className="trigger-alert bg-blue-glow">Coverage Active</div>
          </GlassPanel>
          
          <GlassPanel className="trigger-card trigger-heat">
            <ThermometerHot className="icon-large" />
            <h3 className="trigger-value">Heatwave &gt; 42°C</h3>
            <p>Extreme Summer Heat Alerts</p>
            <div className="trigger-alert bg-red-glow">Monitoring</div>
          </GlassPanel>
          
          <GlassPanel className="trigger-card trigger-aqi">
            <Wind className="icon-large" />
            <h3 className="trigger-value">AQI &gt; 300</h3>
            <p>Hazardous Environment & Zone Curfews</p>
            <div className="trigger-alert bg-purple-glow">Triggered Today</div>
          </GlassPanel>
        </div>
      </div>
    </section>
  );
};

export const Impact = () => {
  return (
    <section id="impact" className="impact-section pb-20">
      <div className="container impact-container">
        <div className="impact-content">
          <h2 className="impact-stat text-gradient-gold">15M+ Gig Workers.</h2>
          <h3 className="impact-sub">Zero safety net. <br />Until now.</h3>
          <p className="mt-4 text-gray text-lg">
            KuberaAI covers delivery partners (Zomato, Swiggy, Amazon), ride-hailing drivers, and quick-commerce professionals across India's top tier 1 and tier 2 cities.
          </p>
          <div className="mt-8 flex gap-4">
             <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-3">
                <MapPin size={24} style={{ color: 'var(--primary)' }} />
               <span>Tier 1 Metro Grid Active</span>
             </div>
          </div>
        </div>
        <div className="impact-map">
          <div className="map-container relative h-[400px]">
             <img src="https://upload.wikimedia.org/wikipedia/commons/e/e4/India_map_en.svg" alt="India Map" className="india-map-base object-contain h-full w-full" />
             <div className="glow-point p-mumbai"></div>
             <div className="glow-point p-delhi"></div>
             <div className="glow-point p-blr"></div>
             <div className="glow-point p-hyd"></div>
          </div>
        </div>
      </div>
    </section>
  );
};

export const Join = () => {
  return (
    <section id="join" className="cta-section">
      <div className="container text-center cta-container pb-16 pt-16">
        <GlassPanel className="p-10 md:p-16">
          <h2 className="section-title mb-6">Built to Protect Those Who <br />Deliver for Everyone Else</h2>
          <p className="section-desc max-w-2xl mx-auto mb-10 text-gray-light">
            Join the waitlist to protect your income against extreme weather. Or integrate our AI protection and Piggybank API directly into your gig platform.
          </p>
          <div className="flex justify-center flex-wrap gap-4">
            <a href="#" className="btn btn-primary btn-large btn-glow">Join KuberaAI</a>
            <a href="#" className="btn btn-secondary btn-large">For Platforms</a>
          </div>
        </GlassPanel>
      </div>
    </section>
  );
};
