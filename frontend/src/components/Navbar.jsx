// Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { IoGlobeOutline, IoMoonOutline, IoSearchOutline } from 'react-icons/io5';
import { IoIosArrowDown } from 'react-icons/io';
import { navStyles as s } from './NavbarStyles';
import LogoWebp from '../assets/kucoin-logo.webp'; 

const Navbar = () => {
  const [activeTab, setActiveTab] = useState('exchange');

  return (
    <nav className={s.nav}>
      <div className={s.container}>
        
        <div className={s.leftSection}>
          <div className={s.logoSwitcherGroup}>
            <Link to="/" className={s.logoLink}>
              <img src={LogoWebp} alt="Logo" className={s.logoImg} />
            </Link>

            <div className={s.switcherContainer}>
              <button 
                onClick={() => setActiveTab('exchange')}
                className={activeTab === 'exchange' ? s.switcherActive : s.switcherInactive}
              >
                Exchange
              </button>
              <button 
                onClick={() => setActiveTab('web3')}
                className={activeTab === 'web3' ? s.switcherActive : s.switcherInactive}
              >
                Web3
              </button>
            </div>
          </div>

          {/* EQUAL SPACING APPLIED HERE */}
          <div className={s.mainNav}>
            <NavMenuItem label="Buy Crypto" hasArrow />
            <NavMenuItem label="Markets" />
            <NavMenuItem label="Trade" hasArrow />
          </div>
        </div>

        <div className={s.rightSection}>
          <div className={s.authGroup}>
            <Link to="/login" className={s.loginBtn}>Log In</Link>
            <Link to="/signup" className={s.signUpBtn}>Sign Up</Link>
          </div>

          <div className={s.divider} />

          <div className="flex items-center gap-1">
            <IconButton icon={<IoSearchOutline size={20} />} />
            <IconButton icon={<IoGlobeOutline size={20} />} />
            <IconButton icon={<IoMoonOutline size={20} />} />
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavMenuItem = ({ label, hasArrow }) => (
  <button className={s.navMenuItem}>
    <span>{label}</span>
    {hasArrow && <IoIosArrowDown className={s.navMenuArrow} size={12} />}
    <div className={s.navMenuIndicator} />
  </button>
);

const IconButton = ({ icon }) => (
  <button className={s.iconBtn}>{icon}</button>
);

export default Navbar;