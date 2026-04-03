import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  SquaresFour, Scroll, FileText, CloudWarning, Wallet, 
  Bank, User, Gear, Bell, MagnifyingGlass, ShieldCheck, 
  CaretDown, MapPin, X
} from '@phosphor-icons/react';

export const DashboardLayout = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar Navigation */}
      <aside className={`dashboard-sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo flex items-center gap-2">
            <ShieldCheck weight="fill" size={28} color="#4F6EF7" />
            <span className="font-bold text-lg">KuberaAI</span>
          </div>
          <button className="mobile-close md:hidden" onClick={toggleMobileMenu}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <NavLink to="/dashboard" end className="nav-item">
            <SquaresFour size={22} weight="duotone" />
            <span>Dashboard</span>
          </NavLink>
          <NavLink to="/dashboard/policy" className="nav-item">
            <Scroll size={22} weight="duotone" />
            <span>My Policy</span>
          </NavLink>
          <NavLink to="/dashboard/claims" className="nav-item">
            <FileText size={22} weight="duotone" />
            <span>Claims</span>
          </NavLink>
          <NavLink to="/dashboard/alerts" className="nav-item">
            <CloudWarning size={22} weight="duotone" />
            <span>Alerts</span>
            <span className="badge">1</span>
          </NavLink>
          <NavLink to="/dashboard/piggybank" className="nav-item">
            <Wallet size={22} weight="duotone" />
            <span>Piggybank</span>
          </NavLink>
          <NavLink to="/dashboard/transactions" className="nav-item">
            <Bank size={22} weight="duotone" />
            <span>Transactions</span>
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <NavLink to="/dashboard/profile" className="nav-item">
            <User size={22} weight="duotone" />
            <span>Profile</span>
          </NavLink>
          <a href="#" className="nav-item">
            <Gear size={22} weight="duotone" />
            <span>Admin</span>
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-main">
        {/* Top Header */}
        <header className="dashboard-header shadow-sm">
          <div className="header-left">
            <button className="mobile-menu-trigger md:hidden" onClick={toggleMobileMenu}>
              <SquaresFour size={24} />
            </button>
            <div className="zone-indicator hidden sm:flex">
              <MapPin size={18} weight="fill" color="#FF7A00" />
              <span>Chennai Zone 3</span>
              <CaretDown size={14} />
            </div>
          </div>

          <div className="header-right">
            <div className="search-bar hidden md:flex">
              <MagnifyingGlass size={18} color="#9CA3AF" />
              <input type="text" placeholder="Search..." />
            </div>
            <button className="bell-btn relative">
              <Bell size={24} />
              <span className="notification-dot"></span>
            </button>
            <div className="user-avatar">
              <img src="https://i.pravatar.cc/150?img=11" alt="User Profile" />
            </div>
          </div>
        </header>

        {/* Dashboard Content Grid / Nested Routes */}
        <div className="dashboard-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
