import React, { useState } from 'react';
import { ShieldCheck, CaretLeft, GoogleLogo } from '@phosphor-icons/react';
import { Link, useNavigate } from 'react-router-dom';

export const Auth = () => {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [loginMethod, setLoginMethod] = useState('otp'); // 'otp' or 'password'
  const navigate = useNavigate();

  const handleAuth = (e) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="auth-layout">
      {/* Vibrant Background */}
      <div className="auth-gradient-bg"></div>
      
      {/* Back button */}
      <Link to="/" className="auth-back-btn">
        <CaretLeft size={20} />
        <span>Back to Home</span>
      </Link>

      {/* Main Card */}
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <ShieldCheck weight="fill" size={36} color="#000" />
            <span>KuberaAI</span>
          </div>
          <h2 className="auth-title">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'login' 
              ? 'Enter your details to access your dashboard' 
              : 'Join the next generation of gig protection'}
          </p>
        </div>

        {mode === 'login' ? (
          <div className="auth-form">
            <div className="auth-tabs">
              <button 
                className={`auth-tab ${loginMethod === 'otp' ? 'active' : ''}`}
                onClick={() => setLoginMethod('otp')}
              >
                Phone + OTP
              </button>
              <button 
                className={`auth-tab ${loginMethod === 'password' ? 'active' : ''}`}
                onClick={() => setLoginMethod('password')}
              >
                Password
              </button>
            </div>

            {loginMethod === 'otp' ? (
              <div className="auth-field">
                <label>Phone Number</label>
                <div className="auth-phone-input">
                  <span className="phone-prefix">+91</span>
                  <input type="tel" placeholder="Enter 10-digit number" className="auth-input pl-14" />
                </div>
              </div>
            ) : (
              <>
                <div className="auth-field">
                  <label>Email / Phone</label>
                  <input type="text" placeholder="Enter email or phone" className="auth-input" />
                </div>
                <div className="auth-field">
                  <label>Password</label>
                  <input type="password" placeholder="••••••••" className="auth-input" />
                  <a href="#" className="auth-forgot">Forgot Password?</a>
                </div>
              </>
            )}

            <button className="auth-btn-primary" onClick={handleAuth}>
              {loginMethod === 'otp' ? 'Send OTP' : 'Login'}
            </button>
            
            <div className="auth-divider">
              <span>OR</span>
            </div>
            
            <button className="auth-btn-google">
              <GoogleLogo size={20} weight="bold" />
              Continue with Google
            </button>

            <p className="auth-footer-text">
              New user? <span onClick={() => setMode('signup')} className="auth-link">Create Account</span>
            </p>
          </div>
        ) : (
          <div className="auth-form">
            <div className="auth-field">
              <label>Full Name</label>
              <input type="text" placeholder="John Doe" className="auth-input" />
            </div>
            
            <div className="auth-row">
              <div className="auth-field">
                <label>Phone Number</label>
                <input type="tel" placeholder="+91" className="auth-input" />
              </div>
              <div className="auth-field">
                <label>City</label>
                <input type="text" placeholder="e.g. Mumbai" className="auth-input" />
              </div>
            </div>

            <div className="auth-field">
              <label>Delivery Platform primary</label>
              <div className="auth-select-wrapper">
                <select className="auth-input auth-select" defaultValue="">
                  <option value="" disabled>Select active platform</option>
                  <option value="zomato">Zomato</option>
                  <option value="swiggy">Swiggy</option>
                  <option value="zepto">Zepto</option>
                  <option value="amazon">Amazon Flex</option>
                  <option value="blinkit">Blinkit</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <button className="auth-btn-primary mt-4" onClick={handleAuth}>
              Create Account
            </button>
            
            <p className="auth-footer-text">
              Already have an account? <span onClick={() => setMode('login')} className="auth-link">Login</span>
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
