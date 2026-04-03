import React, { useState, useEffect } from 'react';
import GlassPanel from './GlassPanel';
import { ArrowRight, PlayCircle, CloudRain, Lightning, Thermometer, Moped, UserPlus, Brain, Broadcast, Warning, Coins } from '@phosphor-icons/react';

const AnimatedNumber = ({ end, suffix = "" }) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    let startTime = null;
    const duration = 2000;
    
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      setCount(Math.floor(progress * end));
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [end]);
  
  return <>{count}{suffix}</>;
};

export const Hero = () => {
  return (
    <header className="hero-section">
      <div className="container hero-container">
        <div className="hero-content">
          <div className="badge-pill mb-6">
            <span className="pulse-dot"></span>
            <span>Parametric Insurance 2.0</span>
          </div>
          <h1 className="hero-title">
            Income Protection for <br />
            <span className="text-gradient">India’s Gig Workforce</span>
          </h1>
          <p className="hero-subtitle">
            AI + Blockchain powered parametric insurance that pays instantly when disruptions hit. Zero paperwork. Zero delays. Protecting the backbone of our cities.
          </p>
          <div className="hero-cta">
            <a href="#join" className="btn btn-primary btn-large btn-glow">
              Get Protected
              <ArrowRight weight="bold" />
            </a>
            <a href="#how-it-works" className="btn btn-secondary btn-large">
              <PlayCircle weight="bold" />
              See How It Works
            </a>
          </div>
        </div>
        
        <div className="hero-visuals">
          <GlassPanel className="floating-card card-1">
            <div className="card-icon blue"><CloudRain weight="bold" /></div>
            <div className="card-info">
              <h4>Rainfall Trigger Detected</h4>
              <p>Bandra West, Mumbai • &gt;50mm/hr</p>
            </div>
            <div className="card-status status-active">Active</div>
          </GlassPanel>

          <GlassPanel className="floating-card card-2">
            <div className="card-icon gold"><Lightning weight="fill" /></div>
            <div className="card-info">
              <h4>₹1200 Payout Released</h4>
              <p>Smart Contract Executed</p>
            </div>
            <div className="card-status status-success">Instant</div>
          </GlassPanel>

          <GlassPanel className="floating-card card-3">
            <div className="card-icon red"><Thermometer weight="bold" /></div>
            <div className="card-info">
              <h4>Heatwave Emergency</h4>
              <p>Temperature &gt; 42°C • Delhi</p>
            </div>
            <div className="card-status status-alert">Activated</div>
          </GlassPanel>

          <div className="hero-globe">
            <div className="globe-ring ring-1"></div>
            <div className="globe-ring ring-2"></div>
            <div className="globe-ring ring-3"></div>
            <div className="globe-core"></div>
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
          <h2 className="section-title">The Hidden Risk Behind <span className="text-gradient-red">Every Delivery</span></h2>
          <p className="section-desc max-w-2xl mx-auto">When the city stops, they still ride. Extreme weather and disruptions mean lost income and unsafe conditions for millions.</p>
        </div>

        <div className="problem-grid flex justify-center">
          <GlassPanel className="problem-visual w-full max-w-4xl">
            <div className="weather-overlay rain"></div>
            <div className="rider-silhouette">
              <Moped weight="fill" />
            </div>
            <div className="stats-counter-container flex flex-col md:flex-row">
              <div className="stat-box mt-auto">
                <h3 className="stat-number">
                  <AnimatedNumber end={30} suffix="%" />
                </h3>
                <p className="stat-label">Income lost during harsh weather</p>
              </div>
              <div className="stat-box mt-auto">
                <h3 className="stat-number">
                  <AnimatedNumber end={15} suffix="M+" />
                </h3>
                <p className="stat-label">Gig workers highly vulnerable</p>
              </div>
            </div>
          </GlassPanel>
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
          <p className="section-desc max-w-2xl mx-auto">Traditional insurance is broken. We replaced claims, agents, and paperwork with smart contracts and weather oracles.</p>
        </div>

        <div className="steps-container">
          <div className="step-card">
            <div className="step-icon-wrapper">
              <UserPlus weight="bold" />
            </div>
            <h3>1. Worker Registers</h3>
            <p>Links wallet and platform ID instantly.</p>
          </div>
          
          <div className="step-connector"></div>
          
          <div className="step-card">
            <div className="step-icon-wrapper">
              <Brain weight="bold" />
            </div>
            <h3>2. AI Prices Risk</h3>
            <p>Personalized micro-premiums calculated in real-time.</p>
          </div>
          
          <div className="step-connector"></div>
          
          <div className="step-card">
            <div className="step-icon-wrapper pulse-ring">
              <Broadcast weight="bold" />
            </div>
            <h3>3. System Monitors</h3>
            <p>24/7 API integration with weather stations & traffic.</p>
          </div>
          
          <div className="step-connector"></div>
          
          <div className="step-card">
            <div className="step-icon-wrapper warning">
              <Warning weight="bold" />
            </div>
            <h3>4. Event Detected</h3>
            <p>Disruption threshold matched exactly.</p>
          </div>
          
          <div className="step-connector"></div>
          
          <div className="step-card">
            <div className="step-icon-wrapper success">
              <Coins weight="fill" />
            </div>
            <h3>5. Instant Payout</h3>
            <p>Smart contract on Polygon pays wallet in seconds.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
