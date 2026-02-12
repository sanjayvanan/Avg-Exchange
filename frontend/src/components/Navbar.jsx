// temp/frontend/src/components/Navbar.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';
import { IoGlobeOutline, IoMoonOutline, IoSearchOutline } from 'react-icons/io5';
import { IoIosArrowDown } from 'react-icons/io';
import { navStyles as s } from './NavbarStyles';
import LogoWebp from '../assets/kucoin-logo.webp'; 

const Navbar = () => {
  const [activeTab, setActiveTab] = useState('exchange');
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();

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

          <div className={s.mainNav}>
            <NavMenuItem label="Buy Crypto" hasArrow />
            <NavMenuItem label="Markets" />
            <NavMenuItem label="Trade" hasArrow />
            <NavMenuItem label="Earn" hasArrow />
          </div>
        </div>

        <div className={s.rightSection}>
          <div className="flex items-center gap-2">
            <IconButton icon={<IoSearchOutline size={18} />} />
          </div>

          <div className={s.divider} />

          {!user ? (
            <div className={s.authGroup}>
              <Link to="/login" className={s.loginBtn}>Log In</Link>
              <Link to="/signup" className={s.signUpBtn}>Sign Up</Link>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-[13px] text-gray-400 font-medium">{user.email}</span>
              <button 
                onClick={() => dispatch(logout())}
                className="text-white hover:text-[#00D68F] text-sm transition-colors"
              >
                Logout
              </button>
              <button className={s.signUpBtn}>Assets</button>
            </div>
          )}

          <div className="flex items-center gap-1 ml-2">
            <IconButton icon={<IoGlobeOutline size={18} />} />
            <IconButton icon={<IoMoonOutline size={18} />} />
          </div>
        </div>
      </div>
    </nav>
  );
};

const NavMenuItem = ({ label, hasArrow }) => (
  <button className={s.navMenuItem}>
    <span>{label}</span>
    {hasArrow && <IoIosArrowDown className={s.navMenuArrow} size={11} />}
    <div className={s.navMenuIndicator} />
  </button>
);

const IconButton = ({ icon }) => (
  <button className={s.iconBtn}>{icon}</button>
);

export default Navbar;