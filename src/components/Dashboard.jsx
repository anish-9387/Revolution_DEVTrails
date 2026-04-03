import React, { useState } from 'react';
import {
  SquaresFour, Scroll, FileText, CloudWarning, Wallet,
  Bank, User, Gear, Bell, MagnifyingGlass, ShieldCheck,
  Warning, CaretDown, MapPin, Drop, Leaf, Thermometer,
  CheckCircle, ArrowRight, X
} from '@phosphor-icons/react';

export const Dashboard = () => {

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (

    <div className="dashboard-layout">

      {/* ================= SIDEBAR ================= */}

      <aside className={`dashboard-sidebar ${mobileMenuOpen ? 'open' : ''}`}>

        <div className="sidebar-header">

          <div className="logo flex items-center gap-2">
            <ShieldCheck weight="fill" size={28} color="#4F6EF7" />
            <span className="font-bold text-lg">KuberaAI</span>
          </div>

          <button
            className="mobile-close md:hidden"
            onClick={toggleMobileMenu}
          >
            <X size={24} />
          </button>

        </div>


        <nav className="sidebar-nav">

          <a href="#" className="nav-item active">
            <SquaresFour size={22} weight="duotone" />
            <span>Dashboard</span>
          </a>

          <a href="#" className="nav-item">
            <Scroll size={22} weight="duotone" />
            <span>My Policy</span>
          </a>

          <a href="#" className="nav-item">
            <FileText size={22} weight="duotone" />
            <span>Claims</span>
          </a>

          <a href="#" className="nav-item">
            <CloudWarning size={22} weight="duotone" />
            <span>Alerts</span>
            <span className="badge">1</span>
          </a>

          <a href="#" className="nav-item">
            <Wallet size={22} weight="duotone" />
            <span>Piggybank</span>
          </a>

          <a href="#" className="nav-item">
            <Bank size={22} weight="duotone" />
            <span>Transactions</span>
          </a>

        </nav>


        <div className="sidebar-footer">

          <a href="#" className="nav-item">
            <User size={22} weight="duotone" />
            <span>Profile</span>
          </a>

          <a href="#" className="nav-item">
            <Gear size={22} weight="duotone" />
            <span>Admin</span>
          </a>

        </div>

      </aside>


      {/* ================= MAIN ================= */}

      <main className="dashboard-main">


        {/* HEADER */}

        <header className="dashboard-header">

          <div className="header-left">

            <button
              className="mobile-menu-trigger md:hidden"
              onClick={toggleMobileMenu}
            >
              <SquaresFour size={24} />
            </button>

            <div className="zone-indicator hidden sm:flex">

              <MapPin
                size={18}
                weight="fill"
                color="#FF7A00"
              />

              <span>Chennai Zone 3</span>

              <CaretDown size={14} />

            </div>

          </div>


          <div className="header-right">

            <div className="search-bar hidden md:flex">

              <MagnifyingGlass
                size={18}
                color="#9CA3AF"
              />

              <input
                type="text"
                placeholder="Search..."
              />

            </div>

            <button className="bell-btn relative">

              <Bell size={24} />

              <span className="notification-dot"></span>

            </button>

            <div className="user-avatar">

              <img
                src="https://i.pravatar.cc/150?img=11"
                alt="User"
              />

            </div>

          </div>

        </header>


        {/* ================= CONTENT ================= */}

        <div className="dashboard-content">

          <h1 className="dashboard-page-title">
            Overview
          </h1>



          {/* ================= TOP CARDS ================= */}

          <div className="bento-grid-3 mb-8">


            {/* Coverage */}

            <div className="bento-card bento-card-blue">

              <div className="card-header">

                <div
                  className="icon-wrap"
                  style={{
                    background:
                      'rgba(255,255,255,0.2)'
                  }}
                >
                  <ShieldCheck
                    size={28}
                    weight="fill"
                    color="#fff"
                  />
                </div>

                <div
                  className="tag"
                  style={{
                    background:
                      'rgba(255,255,255,0.2)',
                    color: '#fff'
                  }}
                >
                  Active
                </div>

              </div>


              <h3 className="card-title">
                Coverage Status
              </h3>


              <div className="card-data mt-4">

                <div className="data-row">
                  <span className="opacity-80">
                    Weekly Premium
                  </span>
                  <span className="font-bold">
                    ₹42
                  </span>
                </div>

                <div className="data-row">
                  <span className="opacity-80">
                    Next Billing
                  </span>
                  <span className="font-bold">
                    April 8
                  </span>
                </div>

                <div className="data-row">
                  <span className="opacity-80">
                    Active Zone
                  </span>
                  <span className="font-bold">
                    Chennai Z3
                  </span>
                </div>

              </div>

            </div>



            {/* Risk */}

            <div className="bento-card bento-card-orange">

              <div className="card-header">

                <div
                  className="icon-wrap"
                  style={{
                    background:
                      'rgba(255,255,255,0.2)'
                  }}
                >
                  <Warning
                    size={28}
                    weight="fill"
                    color="#fff"
                  />
                </div>

                <div
                  className="tag"
                  style={{
                    background: '#fff',
                    color: '#FF7A00'
                  }}
                >
                  High Risk
                </div>

              </div>


              <h3 className="card-title">
                Risk Monitor
              </h3>


              <div className="card-data-grid mt-4">

                <div className="data-box">
                  <Leaf size={20} />
                  <span className="box-val">
                    290
                  </span>
                  <span className="box-lbl">
                    AQI
                  </span>
                </div>

                <div className="data-box">
                  <Drop size={20} />
                  <span className="box-val">
                    48mm
                  </span>
                  <span className="box-lbl">
                    Rain/hr
                  </span>
                </div>

                <div className="data-box">
                  <Thermometer size={20} />
                  <span className="box-val">
                    40°C
                  </span>
                  <span className="box-lbl">
                    Temp
                  </span>
                </div>

              </div>

            </div>



            {/* Wallet */}

            <div className="bento-card bento-card-green">

              <div className="card-header">

                <div
                  className="icon-wrap"
                  style={{
                    background:
                      'rgba(255,255,255,0.2)'
                  }}
                >
                  <Wallet
                    size={28}
                    weight="fill"
                    color="#fff"
                  />
                </div>

                <span className="opacity-80">
                  Piggybank
                </span>

              </div>


              <h2 className="text-4xl font-black text-white mt-2">
                ₹1,250
              </h2>

              <p className="text-sm opacity-90">
                Saved this week:
                <strong> ₹50</strong>
              </p>


              <div className="mt-6">

                <button className="btn-withdraw w-full">
                  Withdraw
                </button>

              </div>

            </div>

          </div>



          {/* ================= MAIN GRID ================= */}

          <div className="bento-grid-uneven gap-6">


            {/* LEFT */}

            <div className="left-column">


              {/* Telemetry */}

              <div className="bento-card bento-card-light weather-card mb-6">

                <div className="flex justify-between items-start mb-6">

                  <div>

                    <h3 className="text-lg font-bold text-gray-800">
                      Live Telemetry
                    </h3>

                    <p className="text-sm text-gray-500">
                      Official Oracle Data Sync
                    </p>

                  </div>


                  <div className="flex items-center gap-2 bg-red-100 text-red-600 px-3 py-1 rounded-full text-xs font-bold">

                    <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></div>

                    Trigger Active

                  </div>

                </div>


                {/* Graph */}

                <div className="mt-8 h-32 w-full relative">

                  <svg
                    className="absolute bottom-0 w-full h-full"
                    viewBox="0 0 100 40"
                  >

                    <path
                      d="M0 30 Q 15 20, 30 25 T 60 15 T 100 5"
                      fill="none"
                      stroke="#FF7A00"
                      strokeWidth="2"
                    />

                  </svg>

                </div>

              </div>



              {/* Alert */}

              <div className="bento-card bento-card-red alert-card mt-4">

                <div className="flex items-center gap-3 mb-4">

                  <div className="bg-white/20 p-2 rounded-full text-white">

                    <CloudWarning
                      weight="fill"
                      size={24}
                    />

                  </div>

                  <h3 className="text-white font-bold text-lg">
                    Zone Alert
                  </h3>

                </div>


                <div className="flex justify-between items-end">

                  <div>

                    <p className="text-white/80 text-sm">
                      Zone:
                      <strong> Chennai Z3</strong>
                    </p>

                    <p className="text-white/80 text-sm">
                      Rainfall:
                      <strong> 60mm/hr</strong>
                    </p>

                  </div>


                  <div className="bg-white text-red-500 px-3 py-1 rounded-md text-sm font-bold">

                    Triggered

                  </div>

                </div>

              </div>

            </div>



            {/* RIGHT */}

            <div className="right-column">


              {/* Quick Actions */}

              <div className="bento-card bento-card-purple mb-6">

                <h3 className="text-white font-bold mb-4">
                  Quick Actions
                </h3>


                <div className="quick-actions-grid">

                  <button className="qa-btn">
                    <FileText size={20} />
                    <span>View Policy</span>
                  </button>

                  <button className="qa-btn">
                    <ShieldCheck size={20} />
                    <span>File Claim</span>
                  </button>

                  <button className="qa-btn">
                    <Bank size={20} />
                    <span>Withdraw Funds</span>
                  </button>

                  <button className="qa-btn">
                    <MapPin size={20} />
                    <span>Update Zones</span>
                  </button>

                </div>

              </div>



              {/* Recent Activity */}

              <div className="bento-card bg-white border border-gray-100">

                <div className="flex justify-between items-center mb-4">

                  <h3 className="font-bold text-gray-800">
                    Recent Activity
                  </h3>

                  <a
                    href="#"
                    className="text-sm font-bold text-blue-500 flex items-center gap-1"
                  >

                    View All
                    <ArrowRight size={14} />

                  </a>

                </div>


                <div className="timeline-container">

                  <div className="timeline-item">

                    <div className="t-icon bg-green-100 text-green-500">
                      <CheckCircle weight="fill" size={20} />
                    </div>

                    <div>
                      <h5 className="font-bold text-sm">
                        ₹850 Payout Released
                      </h5>

                      <p className="text-xs text-gray-500">
                        Credited to primary account
                      </p>

                    </div>

                    <span className="t-time">
                      Just now
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

      </main>

    </div>

  );

};