import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Navbar, Footer } from './components/LayoutSections';
import { Hero, Problem, HowItWorks } from './components/CoreSections';
import { TripsFeatures } from './components/TripsFeatures';
import { FinalCTA } from './components/ClosingSections';
import { Auth } from './components/Auth';
import { DashboardLayout } from './components/DashboardLayout';
import { Overview } from './components/dashboard/Overview';
import { Policy } from './components/dashboard/Policy';
import { Claims } from './components/dashboard/Claims';
import { Alerts } from './components/dashboard/Alerts';
import { Piggybank } from './components/dashboard/Piggybank';
import { Transactions } from './components/dashboard/Transactions';
import { Profile } from './components/dashboard/Profile';
import './utilities.css';
import './index.css';

const Landing = () => (
  <>
    <Navbar />
    <main>
      <Hero />
      <Problem />
      <HowItWorks />
      <TripsFeatures />
      <FinalCTA />
    </main>
    <Footer />
  </>
);

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/auth" element={<Auth />} />
      
      <Route path="/dashboard" element={<DashboardLayout />}>
        <Route index element={<Overview />} />
        <Route path="policy" element={<Policy />} />
        <Route path="claims" element={<Claims />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="piggybank" element={<Piggybank />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="profile" element={<Profile />} />
      </Route>
    </Routes>
  );
}

export default App;
