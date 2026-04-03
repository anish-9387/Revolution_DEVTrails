import React, { useState, useEffect } from 'react';
import { Hexagon, List } from '@phosphor-icons/react';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container flex items-center justify-between">
        <div className="logo flex items-center gap-2">
          <Hexagon weight="fill" size={28} style={{ color: "var(--primary)" }} />
          <span>KuberaAI</span>
        </div>
        <div className={`nav-links ${menuOpen ? 'flex' : 'hidden'} md:flex gap-8`}>
          <a href="#problem">The Risk</a>
          <a href="#how-it-works">How It Works</a>
          <a href="#tech">Tech</a>
          <a href="#triggers">Triggers</a>
          <a href="#piggybank">Piggybank</a>
        </div>
        <div className="nav-actions hidden md:block">
          <a href="#join" className="btn btn-primary btn-glow">Get Protected</a>
        </div>
        <button className="mobile-menu-btn md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
          <List size={24} />
        </button>
      </div>
    </nav>
  );
};

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-container">
        <div className="footer-brand">
          <div className="logo flex items-center gap-2 text-white font-bold text-xl">
            <Hexagon weight="fill" size={28} style={{ color: "var(--primary)" }} />
            <span>KuberaAI</span>
          </div>
          <p>Trustless parametric insurance for India's gig economy.</p>
        </div>
        <div className="footer-links">
          <div className="link-group">
            <h4>Product</h4>
            <a href="#">Workers</a>
            <a href="#">Platforms</a>
            <a href="#">Whitepaper</a>
            <a href="#">Piggybank API</a>
          </div>
          <div className="link-group">
            <h4>Legal</h4>
            <a href="#">Terms</a>
            <a href="#">Privacy</a>
            <a href="#">Licenses</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom text-center mt-10">
        <p>© 2026 KuberaAI. All rights reserved.</p>
      </div>
    </footer>
  );
};
