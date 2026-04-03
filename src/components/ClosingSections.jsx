import React from 'react';
import { ArrowRight } from '@phosphor-icons/react';

export const FinalCTA = () => {
  return (
    <section id="join" className="cta-section">
      <div className="container">
        <div className="cta-box max-w-4xl mx-auto">
          <h2>Ready for Real Protection?</h2>
          <p>Join thousands of gig workers already securing their daily incomes against extreme disruptions.</p>
          <a href="#" className="btn btn-white btn-large" style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem" }}>
            Get Started For Free
            <ArrowRight weight="bold" />
          </a>
        </div>
      </div>
    </section>
  );
};
