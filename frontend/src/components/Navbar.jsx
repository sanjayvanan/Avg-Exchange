// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../features/authSlice';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  IoMenu, IoClose, IoSearchOutline, IoGlobeOutline, 
  IoChevronForward, IoWalletOutline, IoBarChartOutline, IoSwapHorizontal
} from 'react-icons/io5';
import { navStyles as s } from './NavbarStyles';
import LogoWebp from '../assets/kucoin-logo.webp';

// Animation Variants
const menuVariants = {
  closed: { x: "100%", transition: { type: "spring", stiffness: 300, damping: 30 } },
  open: { 
    x: 0, 
    transition: { type: "spring", stiffness: 300, damping: 30, staggerChildren: 0.1, delayChildren: 0.2 } 
  }
};

const linkVariants = {
  closed: { opacity: 0, x: 50 },
  open: { opacity: 1, x: 0 }
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('exchange');
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Prevent scrolling when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const handleNav = (path) => {
    setIsOpen(false);
    if (path) navigate(path);
  };

  const handleLogout = () => {
    dispatch(logout());
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <>
      <nav className={s.nav}>
        <div className={s.container}>
          
          {/* --- LEFT SECTION --- */}
          <div className={s.leftSection}>
            <Link to="/" className={s.logoLink} onClick={() => setIsOpen(false)}>
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

            <div className={s.mainNav}>
              <Link to="/buy-crypto" className={s.navMenuItem}>Buy Crypto</Link>
              <Link to="/markets" className={s.navMenuItem}>Markets</Link>
              <Link to="/trade" className={s.navMenuItem}>Trade</Link>
            </div>
          </div>

          {/* --- RIGHT SECTION (DESKTOP) --- */}
          <div className={s.rightSection}>
            <button className={s.iconBtn}><IoSearchOutline size={20} /></button>
            
            {!user ? (
              <div className={s.authGroup}>
                <Link to="/login" className={s.loginBtn}>Log In</Link>
                <Link to="/signup" className={s.signUpBtn}>Sign Up</Link>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-white">{user.email}</span>
                {/* Referral Code Displayed Here */}
                <span>{user.referralCode}</span>
                <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-[#00D68F] transition-colors">Logout</button>
              </div>
            )}
            
            <button className={s.iconBtn}><IoGlobeOutline size={20} /></button>
          </div>

          {/* --- MOBILE HAMBURGER TOGGLE --- */}
          <button className={s.mobileToggle} onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <IoClose /> : <IoMenu />}
          </button>
        </div>
      </nav>

      {/* --- MOBILE MENU --- */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={s.mobileMenuOverlay}
              onClick={() => setIsOpen(false)}
            />
            
            {/* Drawer */}
            <motion.div 
              initial="closed"
              animate="open"
              exit="closed"
              variants={menuVariants}
              className={s.mobileMenuContainer}
            >
              <div className={s.mobileContent}>
                
                {/* User Profile Section (Mobile) */}
                {user && (
                  <motion.div variants={linkVariants} className={s.mobileProfile}>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00D68F] to-[#00bd7e] flex items-center justify-center text-black font-bold text-lg">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className={s.mobileProfileText}>
                      <span className={s.mobileEmail}>{user.email}</span>
                      {/* Referral Code Displayed Here */}
                      <span>{user.referralCode}</span>
                      <span className={s.mobileStatus}>Verified User</span>
                    </div>
                  </motion.div>
                )}

                {/* Navigation Links */}
                <div className="flex flex-col">
                  <MobileLink 
                    onClick={() => handleNav('/buy-crypto')} 
                    label="Buy Crypto" 
                    icon={<IoWalletOutline />} 
                  />
                  <MobileLink 
                    onClick={() => handleNav('/markets')} 
                    label="Markets" 
                    icon={<IoBarChartOutline />} 
                  />
                  <MobileLink 
                    onClick={() => handleNav('/trade')} 
                    label="Trade" 
                    icon={<IoSwapHorizontal />} 
                  />
                </div>

                {/* Bottom Buttons */}
                <motion.div variants={linkVariants} className={s.mobileAuthSection}>
                  {!user ? (
                    <>
                      <button onClick={() => handleNav('/signup')} className={s.mobileSignUpBtn}>
                        Sign Up Now
                      </button>
                      <button onClick={() => handleNav('/login')} className={s.mobileLoginBtn}>
                        Log In
                      </button>
                    </>
                  ) : (
                    <button onClick={handleLogout} className={s.mobileLoginBtn}>
                      Log Out
                    </button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

// Helper Component for Mobile Links
const MobileLink = ({ onClick, label, icon }) => (
  <motion.button 
    variants={linkVariants}
    onClick={onClick} 
    className={s.mobileLink}
  >
    <div className="flex items-center gap-4">
      {icon && <span className="text-[#00D68F] text-xl">{icon}</span>}
      <span className={s.mobileLinkText}>{label}</span>
    </div>
    <IoChevronForward className={s.mobileLinkIcon} />
  </motion.button>
);

export default Navbar;