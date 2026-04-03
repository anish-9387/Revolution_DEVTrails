import React from 'react';
import Background from './components/Background';
import { Navbar, Footer } from './components/LayoutSections';
import { Hero, Problem, HowItWorks } from './components/CoreSections';
import { Tech, Fraud, Piggybank } from './components/FeatureSections';
import { Triggers, Impact, Join } from './components/ClosingSections';
import './utilities.css';

function App() {
  return (
    <>
      <Background />
      <Navbar />
      <main>
        <Hero />
        <Problem />
        <HowItWorks />
        <Tech />
        <Fraud />
        <Piggybank />
        <Triggers />
        <Impact />
        <Join />
      </main>
      <Footer />
    </>
  );
}

export default App;
