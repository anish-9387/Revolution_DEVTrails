import React, { useState, useEffect } from 'react';
import { ShieldCheck, List } from '@phosphor-icons/react';
import { Link } from 'react-router-dom';

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="container nav-container flex items-center justify-between">
        <Link to="/" className="logo flex items-center gap-2" style={{textDecoration: 'none'}}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 0C5.372 0 0 5.372 0 12c0 6.627 5.372 12 12 12V0z" fill="#000"/>
          </svg>
          <span className="navbar-logo-text">/ hello@kuberaai.io</span>
        </Link>
        <div className={`nav-links-wrap ${menuOpen ? 'mobile-open' : ''}`}>
          <a href="#how-it-works" className="nav-link">How It Works</a>
          <span className="nav-dot">•</span>
          <a href="#trips" className="nav-link">Features</a>
          <span className="nav-dot">•</span>
          <a href="#pricing" className="nav-link">Pricing</a>
        </div>
        <div className="nav-actions hidden md:flex items-center gap-3">
          <Link to="/auth" className="btn btn-login">Log In</Link>
          <Link to="/auth" className="btn btn-get-started">Get Started</Link>
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
        <div className="footer-brand flex flex-col items-start">
          <div className="logo flex items-center gap-2 font-bold text-xl mb-4">
            <ShieldCheck weight="fill" size={32} style={{ color: "var(--primary)" }} />
            <span>KuberaAI</span>
          </div>
          <p className="max-w-sm">Trustless income protection for India's gig economy. Get paid instantly when disruptions hit.</p>
        </div>
        <div className="footer-links">
          <div className="link-group">
            <h4>Product</h4>
            <a href="#">For Workers</a>
            <a href="#">For Platforms</a>
            <a href="#">Features</a>
            <a href="#">Pricing</a>
          </div>
          <div className="link-group">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Blog</a>
            <a href="#">Contact</a>
          </div>
          <div className="link-group">
            <h4>Legal</h4>
            <a href="#">Terms of Service</a>
            <a href="#">Privacy Policy</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>© 2026 KuberaAI. All rights reserved.</p>
      </div>
    </footer>
  );
};
